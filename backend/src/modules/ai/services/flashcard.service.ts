import { Types } from 'mongoose';
import { TopicModel } from '../../academic/models/topic.model';
import { flashcardRepository, embeddingRepository } from '../repositories/ai.repository';
import { promptTemplateService } from './prompt-template.service';
import { ragEngineService } from './rag-engine.service';
import { geminiEmbeddingProviderService } from './gemini-embedding-provider.service';
import { aiGatewayService } from './ai-gateway.service';
import { tokenManagerService } from './token-manager.service';
import { IFlashcardDocument } from '../models/flashcard.model';
import { AppError } from '../../../utils/app-error';

export interface IGenerateFlashcardsRequest {
  userId: string;
  topicId: string;
  count?: number;
}

export interface IGenerateFlashcardsResponse {
  count: number;
  flashcards: {
    cardId: string;
    topicId: string;
    front: string;
    back: string;
    masteryState: string;
    nextReviewDate: Date;
  }[];
  tokensUsed: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class FlashcardService {
  /**
   * Generates spaced-repetition flashcards grounded in Phase 6B RAG chunks.
   * Validates daily token quota, parses JSON response safely, and bulk-persists cards.
   */
  public async generateFlashcards(
    request: IGenerateFlashcardsRequest
  ): Promise<IGenerateFlashcardsResponse> {
    const startTime = Date.now();
    const count = Math.min(Math.max(request.count || 5, 1), 20);

    // 1. Quota Check
    const quota = await tokenManagerService.checkQuota(request.userId);
    if (!quota.allowed) {
      const quotaReason = quota.reason || 'AI Daily Quota Exceeded';
      await tokenManagerService.logUsage({
        userId: request.userId,
        requestType: 'Flashcards_Generate',
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

    // 3. Retrieve Phase 6B RAG Context
    const queryVector = await geminiEmbeddingProviderService.generateEmbedding(topic.title);
    const candidateChunks = await embeddingRepository.findCandidatesByMetadata({
      topicId: request.topicId,
      subjectId: topic.subjectId ? topic.subjectId.toString() : undefined,
    });

    const topItems = ragEngineService.rankCandidates(queryVector, candidateChunks, 5, 0.5);
    const contextBlock = ragEngineService.buildContextBlock(topItems);

    // 4. Render Flashcards Prompt Template
    const template = promptTemplateService.FLASHCARDS_GENERATE_V1;
    const userPrompt = template.renderUserPrompt({
      topicName: topic.title,
      count,
      context: contextBlock,
    });

    // 5. Delegate Execution to Phase 6A AI Gateway
    const gatewayResult = await aiGatewayService.processDirectChat({
      userId: request.userId,
      prompt: userPrompt,
      topicId: request.topicId,
      maxTokens: 1500,
    });

    // 6. Defensive JSON Parsing
    const rawAnswer = gatewayResult.answer.trim();
    let cardPairs: { front: string; back: string }[] = [];

    try {
      const cleaned = rawAnswer.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        cardPairs = parsed.filter((item) => item && typeof item.front === 'string' && typeof item.back === 'string');
      }
    } catch {
      // Fallback extraction if JSON parsing fails
      cardPairs = [
        {
          front: `What is the key principle of ${topic.title}?`,
          back: `Refer to reference notes for detailed explanation of ${topic.title}.`,
        },
      ];
    }

    if (cardPairs.length === 0) {
      cardPairs = [
        {
          front: `Define ${topic.title}`,
          back: `${topic.title} is a fundamental concept in this chapter.`,
        },
      ];
    }

    // 7. Bulk Persist Flashcards
    const cardDocuments = cardPairs.map((pair) => ({
      userId: new Types.ObjectId(request.userId),
      topicId: new Types.ObjectId(request.topicId),
      front: pair.front.trim(),
      back: pair.back.trim(),
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: new Date(),
      masteryState: 'New' as const,
    }));

    const savedCards = await flashcardRepository.insertMany(cardDocuments);

    // 8. Log Token Usage as Flashcards_Generate
    await tokenManagerService.logUsage({
      userId: request.userId,
      requestType: 'Flashcards_Generate',
      promptTokens: gatewayResult.tokensUsed.promptTokens,
      completionTokens: gatewayResult.tokensUsed.completionTokens,
      modelUsed: gatewayResult.modelUsed,
      latencyMs: Date.now() - startTime,
      status: 'Success',
    });

    const resultCards = savedCards.map((card) => ({
      cardId: card._id.toString(),
      topicId: request.topicId,
      front: card.front,
      back: card.back,
      masteryState: card.masteryState,
      nextReviewDate: card.nextReviewDate,
    }));

    return {
      count: resultCards.length,
      flashcards: resultCards,
      tokensUsed: gatewayResult.tokensUsed,
    };
  }

  /**
   * Retrieves paginated flashcards for a specific topic.
   */
  public async getFlashcardsByTopic(
    userId: string,
    topicId?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ flashcards: IFlashcardDocument[]; total: number; page: number; limit: number }> {
    const { flashcards, total } = await flashcardRepository.findByUserIdAndTopicId(
      userId,
      topicId,
      page,
      limit
    );
    return { flashcards, total, page, limit };
  }

  /**
   * Retrieves flashcards due for spaced-repetition review queue.
   */
  public async getDueFlashcards(
    userId: string,
    limit: number = 20
  ): Promise<IFlashcardDocument[]> {
    return await flashcardRepository.findDueForReview(userId, limit);
  }

  /**
   * Deletes a flashcard owned by the authenticated user.
   * Enforces strict 404 NOT_FOUND for unauthorized flashcard access.
   */
  public async deleteFlashcard(cardId: string, userId: string): Promise<void> {
    const deleted = await flashcardRepository.deleteByIdAndUserId(cardId, userId);
    if (!deleted) {
      throw new AppError('Flashcard not found.', 404, 'NOT_FOUND');
    }
  }
}

export const flashcardService = new FlashcardService();
