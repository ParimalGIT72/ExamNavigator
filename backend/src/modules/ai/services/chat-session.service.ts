import { Types } from 'mongoose';
import { chatSessionRepository, chatMessageRepository, embeddingRepository } from '../repositories/ai.repository';
import { conversationMemoryService } from './conversation-memory.service';
import { ragEngineService, ICitationMetadata } from './rag-engine.service';
import { geminiEmbeddingProviderService } from './gemini-embedding-provider.service';
import { aiGatewayService } from './ai-gateway.service';
import { tokenManagerService } from './token-manager.service';
import { IChatSessionDocument } from '../models/chat-session.model';
import { IChatMessageDocument } from '../models/chat-message.model';
import { AppError } from '../../../utils/app-error';

export interface IProcessChatTurnRequest {
  userId: string;
  message: string;
  sessionId?: string;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
}

export interface IProcessChatTurnResponse {
  sessionId: string;
  answer: string;
  citations: ICitationMetadata[];
  tokensUsed: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  modelUsed: string;
  latencyMs: number;
}

export class ChatSessionService {
  /**
   * Processes a full chat turn: session creation/lookup, user message persistence,
   * sliding window memory build, RAG context retrieval, AI Gateway execution,
   * assistant message persistence, session metadata update, and non-blocking summarization trigger.
   */
  public async processChatTurn(request: IProcessChatTurnRequest): Promise<IProcessChatTurnResponse> {
    const startTime = Date.now();

    // 0. AI Quota Check
    const quota = await tokenManagerService.checkQuota(request.userId);
    if (!quota.allowed) {
      const quotaReason = quota.reason || 'AI Daily Quota Exceeded';
      await tokenManagerService.logUsage({
        userId: request.userId,
        requestType: 'Chat_Session',
        promptTokens: 0,
        completionTokens: 0,
        modelUsed: 'gemini-2.5-pro',
        latencyMs: Date.now() - startTime,
        status: 'Quota_Exceeded',
        errorMessage: quotaReason,
      });
      throw new AppError(quotaReason, 429, 'TOO_MANY_REQUESTS');
    }

    let session: IChatSessionDocument | null = null;

    // 1. Session Lookup or Creation
    if (request.sessionId) {
      session = await chatSessionRepository.findByIdAndUserId(request.sessionId, request.userId, 'Active');
      if (!session) {
        // Enforce strict 404 NOT_FOUND for non-existent, archived, or unowned session
        throw new AppError('Session not found.', 404, 'NOT_FOUND');
      }
    } else {
      const defaultTitle =
        request.message.slice(0, 40).trim() || 'New Doubts Session';
      session = await chatSessionRepository.create({
        userId: new Types.ObjectId(request.userId),
        title: defaultTitle,
        subjectId: request.subjectId && Types.ObjectId.isValid(request.subjectId) ? new Types.ObjectId(request.subjectId) : undefined,
        chapterId: request.chapterId && Types.ObjectId.isValid(request.chapterId) ? new Types.ObjectId(request.chapterId) : undefined,
        topicId: request.topicId && Types.ObjectId.isValid(request.topicId) ? new Types.ObjectId(request.topicId) : undefined,
        status: 'Active',
        messageCount: 0,
        lastMessageAt: new Date(),
      });
    }

    const sessionIdStr = session._id.toString();

    // 2. Persist User Message
    await chatMessageRepository.create({
      sessionId: session._id,
      sender: 'User',
      content: request.message,
      isIncludedInSummary: false,
      ragContextUsed: false,
    });

    // Update Session metadata
    const updatedCount = (session.messageCount || 0) + 1;
    await chatSessionRepository.update(sessionIdStr, {
      messageCount: updatedCount,
      lastMessageAt: new Date(),
    });

    // 3. Build Conversation Memory Block (Sliding Window + Summary)
    const memoryResult = await conversationMemoryService.buildMemoryBlock(sessionIdStr);

    // 4. Retrieve Phase 6B RAG Context
    let ragContextBlock = '';
    let citations: ICitationMetadata[] = [];

    const queryVector = await geminiEmbeddingProviderService.generateEmbedding(request.message);
    const candidateChunks = await embeddingRepository.findCandidatesByMetadata({
      subjectId: request.subjectId || session.subjectId?.toString(),
      chapterId: request.chapterId || session.chapterId?.toString(),
      topicId: request.topicId || session.topicId?.toString(),
    });

    const topItems = ragEngineService.rankCandidates(queryVector, candidateChunks, 5, 0.55);
    ragContextBlock = ragEngineService.buildContextBlock(topItems);

    citations = topItems.map((item) => {
      const meta = item.chunk.metadata as any;
      const title = meta?.get ? meta.get('title') : meta?.title || 'Study Material';
      const resourceType = meta?.get ? meta.get('resourceType') : meta?.resourceType || 'Resource';
      return {
        resourceId: item.chunk.resourceId.toString(),
        title,
        resourceType,
        similarityScore: Math.round(item.score * 1000) / 1000,
        chunkIndex: item.chunk.chunkIndex,
      };
    });

    // 5. Build Final Augmented Prompt for AI Gateway
    let combinedPrompt = '';
    if (memoryResult.memoryBlock) {
      combinedPrompt += memoryResult.memoryBlock + '\n';
    }
    if (ragContextBlock) {
      combinedPrompt += ragContextBlock + '\n\n';
    }
    combinedPrompt += `${request.message}`;

    // 6. Delegate Execution to Phase 6A AI Gateway
    const gatewayResult = await aiGatewayService.processDirectChat({
      userId: request.userId,
      prompt: combinedPrompt,
      subjectId: request.subjectId || session.subjectId?.toString(),
      topicId: request.topicId || session.topicId?.toString(),
    });

    const latencyMs = Date.now() - startTime;

    // 7. Persist Assistant Message
    const formattedCitations = citations.map((c) => ({
      resourceId: new Types.ObjectId(c.resourceId),
      chunkText: c.title,
      score: c.similarityScore,
    }));

    await chatMessageRepository.create({
      sessionId: session._id,
      sender: 'Assistant',
      content: gatewayResult.answer,
      citations: formattedCitations as any,
      tokenCount: gatewayResult.tokensUsed.completionTokens,
      latencyMs,
      ragContextUsed: citations.length > 0,
      isIncludedInSummary: false,
    });

    // Update Session message count to include assistant turn
    await chatSessionRepository.update(sessionIdStr, {
      messageCount: updatedCount + 1,
      lastMessageAt: new Date(),
    });

    // 8. Trigger Non-blocking Conversation Summarization (Single Authoritative Trigger)
    if (memoryResult.shouldSummarize && memoryResult.session) {
      // Fire and forget — do not block client response
      conversationMemoryService
        .triggerSummarization(sessionIdStr, memoryResult.session, memoryResult.oldestIncludedDate)
        .catch(() => {});
    }

    return {
      sessionId: sessionIdStr,
      answer: gatewayResult.answer,
      citations,
      tokensUsed: gatewayResult.tokensUsed,
      modelUsed: gatewayResult.modelUsed,
      latencyMs,
    };
  }

  public async processStreamChatTurn(
    request: IProcessChatTurnRequest,
    onToken: (token: string) => void,
    onCitations?: (citations: ICitationMetadata[]) => void,
    options?: { signal?: AbortSignal }
  ): Promise<IProcessChatTurnResponse> {
    const startTime = Date.now();

    // 0. AI Quota Check
    const quota = await tokenManagerService.checkQuota(request.userId);
    if (!quota.allowed) {
      const quotaReason = quota.reason || 'AI Daily Quota Exceeded';
      await tokenManagerService.logUsage({
        userId: request.userId,
        requestType: 'Chat_Session',
        promptTokens: 0,
        completionTokens: 0,
        modelUsed: 'gemini-2.5-pro',
        latencyMs: Date.now() - startTime,
        status: 'Quota_Exceeded',
        errorMessage: quotaReason,
      });
      throw new AppError(quotaReason, 429, 'TOO_MANY_REQUESTS');
    }

    let session: IChatSessionDocument | null = null;

    // 1. Session Lookup or Creation
    if (request.sessionId) {
      session = await chatSessionRepository.findByIdAndUserId(request.sessionId, request.userId, 'Active');
      if (!session) {
        throw new AppError('Session not found.', 404, 'NOT_FOUND');
      }
    } else {
      const defaultTitle = request.message.slice(0, 40).trim() || 'New Doubts Session';
      session = await chatSessionRepository.create({
        userId: new Types.ObjectId(request.userId),
        title: defaultTitle,
        subjectId: request.subjectId && Types.ObjectId.isValid(request.subjectId) ? new Types.ObjectId(request.subjectId) : undefined,
        chapterId: request.chapterId && Types.ObjectId.isValid(request.chapterId) ? new Types.ObjectId(request.chapterId) : undefined,
        topicId: request.topicId && Types.ObjectId.isValid(request.topicId) ? new Types.ObjectId(request.topicId) : undefined,
        status: 'Active',
        messageCount: 0,
        lastMessageAt: new Date(),
      });
    }

    const sessionIdStr = session._id.toString();

    // 2. Persist User Message
    await chatMessageRepository.create({
      sessionId: session._id,
      sender: 'User',
      content: request.message,
      isIncludedInSummary: false,
      ragContextUsed: false,
    });

    const updatedCount = (session.messageCount || 0) + 1;
    await chatSessionRepository.update(sessionIdStr, {
      messageCount: updatedCount,
      lastMessageAt: new Date(),
    });

    // 3. Build Conversation Memory Block & RAG Context
    const memoryResult = await conversationMemoryService.buildMemoryBlock(sessionIdStr);

    const queryVector = await geminiEmbeddingProviderService.generateEmbedding(request.message);
    const candidateChunks = await embeddingRepository.findCandidatesByMetadata({
      subjectId: request.subjectId || session.subjectId?.toString(),
      chapterId: request.chapterId || session.chapterId?.toString(),
      topicId: request.topicId || session.topicId?.toString(),
    });

    const topItems = ragEngineService.rankCandidates(queryVector, candidateChunks, 5, 0.55);
    const ragContextBlock = ragEngineService.buildContextBlock(topItems);

    const citations: ICitationMetadata[] = topItems.map((item) => {
      const meta = item.chunk.metadata as any;
      const title = meta?.get ? meta.get('title') : meta?.title || 'Study Material';
      const resourceType = meta?.get ? meta.get('resourceType') : meta?.resourceType || 'Resource';
      return {
        resourceId: item.chunk.resourceId.toString(),
        title,
        resourceType,
        similarityScore: Math.round(item.score * 1000) / 1000,
        chunkIndex: item.chunk.chunkIndex,
      };
    });

    if (onCitations && citations.length > 0) {
      onCitations(citations);
    }

    // 4. Build Final Augmented Prompt
    let combinedPrompt = '';
    if (memoryResult.memoryBlock) {
      combinedPrompt += memoryResult.memoryBlock + '\n';
    }
    if (ragContextBlock) {
      combinedPrompt += ragContextBlock + '\n\n';
    }
    combinedPrompt += `${request.message}`;

    // 5. Delegate Streaming Execution to Phase 6A AI Gateway
    const gatewayResult = await aiGatewayService.processStreamChat(
      {
        userId: request.userId,
        prompt: combinedPrompt,
        subjectId: request.subjectId || session.subjectId?.toString(),
        topicId: request.topicId || session.topicId?.toString(),
      },
      onToken,
      { signal: options?.signal }
    );

    const latencyMs = Date.now() - startTime;

    // 6. Persist Assistant Message & Update Session Metadata
    const formattedCitations = citations.map((c) => ({
      resourceId: new Types.ObjectId(c.resourceId),
      chunkText: c.title,
      score: c.similarityScore,
    }));

    await chatMessageRepository.create({
      sessionId: session._id,
      sender: 'Assistant',
      content: gatewayResult.answer,
      citations: formattedCitations as any,
      tokenCount: gatewayResult.tokensUsed.completionTokens,
      latencyMs,
      ragContextUsed: citations.length > 0,
      isIncludedInSummary: false,
    });

    await chatSessionRepository.update(sessionIdStr, {
      messageCount: updatedCount + 1,
      lastMessageAt: new Date(),
    });

    if (memoryResult.shouldSummarize && memoryResult.session) {
      conversationMemoryService
        .triggerSummarization(sessionIdStr, memoryResult.session, memoryResult.oldestIncludedDate)
        .catch(() => {});
    }

    return {
      sessionId: sessionIdStr,
      answer: gatewayResult.answer,
      citations,
      tokensUsed: gatewayResult.tokensUsed,
      modelUsed: gatewayResult.modelUsed,
      latencyMs,
    };
  }

  /**
   * Retrieves paginated list of chat sessions owned by the authenticated user.
   */
  public async getUserSessions(
    userId: string,
    page: number = 1,
    limit: number = 20,
    status?: 'Active' | 'Archived'
  ): Promise<{ sessions: IChatSessionDocument[]; total: number; page: number; limit: number }> {
    const { sessions, total } = await chatSessionRepository.getPaginatedByUserId(
      userId,
      page,
      limit,
      status
    );
    return { sessions, total, page, limit };
  }

  /**
   * Retrieves paginated message history for a specific session.
   * Enforces strict 404 NOT_FOUND for unauthorized session access.
   */
  public async getSessionMessages(
    sessionId: string,
    userId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ messages: IChatMessageDocument[]; total: number; page: number; limit: number }> {
    const session = await chatSessionRepository.findByIdAndUserId(sessionId, userId);
    if (!session) {
      throw new AppError('Session not found.', 404, 'NOT_FOUND');
    }

    const allMessages = await chatMessageRepository.findBySessionId(sessionId);
    const total = allMessages.length;
    const skip = (page - 1) * limit;
    const paginated = allMessages.slice(skip, skip + limit);

    return { messages: paginated, total, page, limit };
  }

  /**
   * Archives (soft-deletes) a session owned by the authenticated user.
   * Enforces strict 404 NOT_FOUND for unauthorized session access.
   */
  public async archiveSession(sessionId: string, userId: string): Promise<IChatSessionDocument> {
    const archived = await chatSessionRepository.archiveSession(sessionId, userId);
    if (!archived) {
      throw new AppError('Session not found.', 404, 'NOT_FOUND');
    }
    return archived;
  }
}

export const chatSessionService = new ChatSessionService();
