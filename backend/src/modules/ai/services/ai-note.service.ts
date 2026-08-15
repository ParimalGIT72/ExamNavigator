import { Types } from 'mongoose';
import { TopicModel } from '../../academic/models/topic.model';
import { aiNoteRepository, embeddingRepository } from '../repositories/ai.repository';
import { promptTemplateService } from './prompt-template.service';
import { ragEngineService } from './rag-engine.service';
import { geminiEmbeddingProviderService } from './gemini-embedding-provider.service';
import { aiGatewayService } from './ai-gateway.service';
import { tokenManagerService } from './token-manager.service';
import { IAiNoteDocument } from '../models/ai-note.model';
import { AppError } from '../../../utils/app-error';

export interface IGenerateNotesRequest {
  userId: string;
  topicId: string;
  customPrompt?: string;
  maxTokens?: number;
}

export interface IGenerateNotesResponse {
  noteId: string;
  topicId: string;
  title: string;
  content: string;
  summary: string;
  keyTakeaways: string[];
  tags: string[];
  tokensUsed: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  createdAt: Date;
}

export class AiNoteService {
  /**
   * Generates AI study notes for a specific topic grounded in Phase 6B RAG chunks.
   * Validates daily token quota and persists output to AiNoteModel.
   */
  public async generateNotes(request: IGenerateNotesRequest): Promise<IGenerateNotesResponse> {
    const startTime = Date.now();

    // 1. Quota Check
    const quota = await tokenManagerService.checkQuota(request.userId);
    if (!quota.allowed) {
      const quotaReason = quota.reason || 'AI Daily Quota Exceeded';
      await tokenManagerService.logUsage({
        userId: request.userId,
        requestType: 'Notes_Generate',
        promptTokens: 0,
        completionTokens: 0,
        modelUsed: 'gemini-2.5-pro',
        latencyMs: Date.now() - startTime,
        status: 'Quota_Exceeded',
        errorMessage: quotaReason,
      });
      throw new AppError(quotaReason, 429, 'TOO_MANY_REQUESTS');
    }

    // 2. Validate Topic Existence
    if (!Types.ObjectId.isValid(request.topicId)) {
      throw new AppError('Topic not found.', 404, 'NOT_FOUND');
    }
    const topic = await TopicModel.findById(request.topicId).exec();
    if (!topic) {
      throw new AppError('Topic not found.', 404, 'NOT_FOUND');
    }

    // 3. Retrieve Phase 6B RAG Context Chunks
    const queryVector = await geminiEmbeddingProviderService.generateEmbedding(topic.title);
    const candidateChunks = await embeddingRepository.findCandidatesByMetadata({
      topicId: request.topicId,
      subjectId: topic.subjectId ? topic.subjectId.toString() : undefined,
    });

    const topItems = ragEngineService.rankCandidates(queryVector, candidateChunks, 5, 0.5);
    const contextBlock = ragEngineService.buildContextBlock(topItems);

    // 4. Render Prompt Template
    const template = promptTemplateService.NOTES_GENERATE_V1;
    const userPrompt = template.renderUserPrompt({
      topicName: topic.title,
      customPrompt: request.customPrompt,
      context: contextBlock,
    });

    // 5. Delegate Execution to Phase 6A AI Gateway
    const gatewayResult = await aiGatewayService.processDirectChat({
      userId: request.userId,
      prompt: userPrompt,
      topicId: request.topicId,
      maxTokens: request.maxTokens || 2048,
    });

    // 6. Extract Structured Fields from Markdown
    const markdownText = gatewayResult.answer;
    const titleMatch = markdownText.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : `${topic.title} - Study Notes`;

    const summaryMatch = markdownText.match(/##\s+Executive Summary\s+\n([\s\S]*?)(?=\n##|$)/i);
    const summary = summaryMatch ? summaryMatch[1].trim() : `${topic.title} comprehensive study guide.`;

    const keyTakeawaysMatch = markdownText.match(/##\s+Key Concepts & Takeaways\s+\n([\s\S]*?)(?=\n##|$)/i);
    const keyTakeaways: string[] = [];
    if (keyTakeawaysMatch) {
      const lines = keyTakeawaysMatch[1].split('\n');
      for (const line of lines) {
        const cleaned = line.replace(/^[-*•\d.]+\s*/, '').trim();
        if (cleaned) keyTakeaways.push(cleaned);
      }
    }

    const tags = [topic.title, 'AI Note', 'Study Guide'];

    // 7. Persist to AiNoteModel
    const note = await aiNoteRepository.create({
      userId: new Types.ObjectId(request.userId),
      topicId: new Types.ObjectId(request.topicId),
      title,
      content: markdownText,
      summary,
      keyTakeaways,
      tags,
      isPinned: false,
      isArchived: false,
      isDeleted: false,
    });

    // 8. Log Token Usage as Notes_Generate
    await tokenManagerService.logUsage({
      userId: request.userId,
      requestType: 'Notes_Generate',
      promptTokens: gatewayResult.tokensUsed.promptTokens,
      completionTokens: gatewayResult.tokensUsed.completionTokens,
      modelUsed: gatewayResult.modelUsed,
      latencyMs: Date.now() - startTime,
      status: 'Success',
    });

    return {
      noteId: note._id.toString(),
      topicId: request.topicId,
      title: note.title,
      content: note.content,
      summary: note.summary || '',
      keyTakeaways: note.keyTakeaways || [],
      tags: note.tags || [],
      tokensUsed: gatewayResult.tokensUsed,
      createdAt: note.createdAt,
    };
  }

  /**
   * Retrieves paginated study notes owned by the authenticated user.
   */
  public async getUserNotes(
    userId: string,
    page: number = 1,
    limit: number = 20,
    topicId?: string
  ): Promise<{ notes: IAiNoteDocument[]; total: number; page: number; limit: number }> {
    const { notes, total } = await aiNoteRepository.getPaginatedByUserId(
      userId,
      page,
      limit,
      topicId
    );
    return { notes, total, page, limit };
  }

  /**
   * Retrieves a single note owned by the authenticated user.
   * Enforces strict 404 NOT_FOUND for unauthorized note access.
   */
  public async getNoteById(noteId: string, userId: string): Promise<IAiNoteDocument> {
    const note = await aiNoteRepository.findByIdAndUserId(noteId, userId);
    if (!note) {
      throw new AppError('Note not found.', 404, 'NOT_FOUND');
    }
    return note;
  }

  /**
   * Updates a note owned by the authenticated user.
   * Enforces strict 404 NOT_FOUND for unauthorized note access.
   */
  public async updateNote(
    noteId: string,
    userId: string,
    data: Partial<Pick<IAiNoteDocument, 'title' | 'content' | 'summary' | 'keyTakeaways' | 'tags' | 'isPinned' | 'isArchived'>>
  ): Promise<IAiNoteDocument> {
    const updated = await aiNoteRepository.updateNote(noteId, userId, data);
    if (!updated) {
      throw new AppError('Note not found.', 404, 'NOT_FOUND');
    }
    return updated;
  }

  /**
   * Soft-deletes a note owned by the authenticated user.
   * Enforces strict 404 NOT_FOUND for unauthorized note access.
   */
  public async deleteNote(noteId: string, userId: string): Promise<void> {
    const deleted = await aiNoteRepository.softDelete(noteId, userId);
    if (!deleted) {
      throw new AppError('Note not found.', 404, 'NOT_FOUND');
    }
  }
}

export const aiNoteService = new AiNoteService();
