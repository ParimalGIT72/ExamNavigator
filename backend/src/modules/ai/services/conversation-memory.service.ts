import { chatSessionRepository, chatMessageRepository } from '../repositories/ai.repository';
import { geminiProviderService } from './gemini-provider.service';
import { tokenManagerService } from './token-manager.service';
import { IChatMessageDocument } from '../models/chat-message.model';
import { IChatSessionDocument } from '../models/chat-session.model';
import { logger } from '../../../utils/logger';

export interface IMemoryBlockResult {
  memoryBlock: string;
  includedMessages: IChatMessageDocument[];
  shouldSummarize: boolean;
  oldestIncludedDate: Date;
  session: IChatSessionDocument | null;
}

export class ConversationMemoryService {
  public readonly WINDOW_MAX_MESSAGES = 10;
  public readonly WINDOW_MAX_TOKENS = 1944;
  public readonly OUTSIDE_WINDOW_UNSUMMARIZED_THRESHOLD = 10;

  /**
   * Constructs the sliding context window for an active chat session.
   * Respects exact token limits (1,944 tokens max) and single-trigger summarization threshold.
   */
  public async buildMemoryBlock(sessionId: string): Promise<IMemoryBlockResult> {
    const session = await chatSessionRepository.findById(sessionId);

    // 1. Fetch recent window messages (up to WINDOW_MAX_MESSAGES)
    const recentMessages = await chatMessageRepository.findWindowMessages(
      sessionId,
      this.WINDOW_MAX_MESSAGES
    );

    // 2. Apply token cap (1,944 tokens max from newest to oldest)
    let windowTokens = 0;
    const includedMessages: IChatMessageDocument[] = [];

    // Process from newest to oldest to preserve most recent context
    for (let i = recentMessages.length - 1; i >= 0; i--) {
      const msg = recentMessages[i];
      const msgTokens = tokenManagerService.estimateTokenCount(msg.content);
      if (windowTokens + msgTokens <= this.WINDOW_MAX_TOKENS) {
        includedMessages.unshift(msg); // preserve ASC order
        windowTokens += msgTokens;
      } else {
        break;
      }
    }

    // 3. Identify oldest included message date (active window boundary)
    const oldestIncludedDate =
      includedMessages.length > 0 ? includedMessages[0].createdAt : new Date();

    // 4. Check single authoritative trigger rule: unsummarized messages OUTSIDE active window
    const outsideWindowUnsummarizedCount =
      await chatMessageRepository.countOutsideWindowUnsummarized(sessionId, oldestIncludedDate);

    const shouldSummarize =
      outsideWindowUnsummarizedCount >= this.OUTSIDE_WINDOW_UNSUMMARIZED_THRESHOLD;

    // 5. Construct conversation memory block
    let memoryBlock = '';

    if (session?.conversationSummary && session.conversationSummary.trim() !== '') {
      memoryBlock += `<conversation_summary>\n${session.conversationSummary.trim()}\n</conversation_summary>\n\n`;
    }

    if (includedMessages.length > 0) {
      memoryBlock += '<recent_conversation>\n';
      for (const msg of includedMessages) {
        const role = msg.sender === 'User' ? 'Student' : 'Tutor';
        memoryBlock += `[${role}]: ${msg.content}\n`;
      }
      memoryBlock += '</recent_conversation>\n';
    }

    return {
      memoryBlock,
      includedMessages,
      shouldSummarize,
      oldestIncludedDate,
      session,
    };
  }

  /**
   * Executes asynchronous, non-blocking conversation summarization when threshold is met.
   * Updates conversationSummary first, then safely marks messages as summarized.
   */
  public async triggerSummarization(
    sessionId: string,
    session: IChatSessionDocument,
    oldestIncludedDate: Date
  ): Promise<boolean> {
    try {
      // Duplicate-trigger heuristic: skip if summary was updated within last 30 seconds
      if (session.summaryUpdatedAt) {
        const secondsSinceLastUpdate =
          (Date.now() - new Date(session.summaryUpdatedAt).getTime()) / 1000;
        if (secondsSinceLastUpdate < 30) {
          return false;
        }
      }

      // Record expected timestamp BEFORE generating summary for optimistic locking
      const expectedTimestamp = session.summaryUpdatedAt ? new Date(session.summaryUpdatedAt) : null;

      // Fetch outside-window unsummarized messages
      const targetMessages = await chatMessageRepository.findOutsideWindowUnsummarized(
        sessionId,
        oldestIncludedDate
      );

      if (targetMessages.length < this.OUTSIDE_WINDOW_UNSUMMARIZED_THRESHOLD) {
        return false;
      }

      // Build summarization prompt
      let prompt = '';
      if (session.conversationSummary && session.conversationSummary.trim() !== '') {
        prompt += `Existing Summary:\n${session.conversationSummary.trim()}\n\n`;
      }

      prompt += 'New conversation turns to incorporate into summary:\n';
      for (const msg of targetMessages) {
        const role = msg.sender === 'User' ? 'Student' : 'Tutor';
        prompt += `[${role}]: ${msg.content}\n`;
      }

      const systemInstruction =
        'You are ExamNavigator Conversation Summarizer. Update the running conversation summary. ' +
        'Preserve key educational topics, student doubts, formulas discussed, and current learning progress. ' +
        'Keep summary concise (under 400 words). Output ONLY the updated summary text.';

      // Call Gemini provider for summarization
      const geminiResult = await geminiProviderService.generateContent(prompt, {
        systemInstruction,
        maxOutputTokens: 500,
        temperature: 0.1,
      });

      if (geminiResult && geminiResult.text) {
        const updatedSummary = geminiResult.text.trim();

        // 1. Perform optimistic conditional update to prevent stale summary overwrite
        const updatedSession = await chatSessionRepository.updateSummary(
          sessionId,
          expectedTimestamp,
          updatedSummary
        );

        if (!updatedSession) {
          logger.warn(`Stale summarization job rejected for session ${sessionId}. Newer summary exists.`);
          return false; // Stale job: DO NOT mark messages as summarized, DO NOT overwrite summary
        }

        // 2. Mark processed messages as summarized ONLY after successful conditional update
        const messageIds = targetMessages.map((m: IChatMessageDocument) => m._id.toString());
        await chatMessageRepository.markAsSummarized(messageIds);

        // 3. Log usage
        await tokenManagerService.logUsage({
          userId: session.userId.toString(),
          requestType: 'Chat_Session',
          promptTokens: geminiResult.promptTokens,
          completionTokens: geminiResult.completionTokens,
          modelUsed: geminiResult.model,
          latencyMs: 0,
          status: 'Success',
        });

        return true;
      }
      return false;
    } catch (error: any) {
      // Failure recovery: log quietly without interrupting main flow
      logger.error(`Conversation summarization failed for session ${sessionId}: ${error.message}`);
      return false;
    }
  }
}

export const conversationMemoryService = new ConversationMemoryService();
