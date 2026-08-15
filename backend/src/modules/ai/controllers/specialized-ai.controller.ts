import { Request, Response, NextFunction } from 'express';
import { aiNoteService } from '../services/ai-note.service';
import { flashcardService } from '../services/flashcard.service';
import { topicDetectionService } from '../services/topic-detection.service';
import {
  generateNotesSchema,
  updateNoteSchema,
  generateFlashcardsSchema,
  detectTopicSchema,
  getNotesQuerySchema,
  getFlashcardsQuerySchema,
} from '../validations/specialized-ai.validation';
import { ApiResponse } from '../../../utils/api-response';

export class SpecializedAiController {
  /**
   * Generates AI study notes for a topic.
   */
  public async generateNotes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = generateNotesSchema.parse(req.body);
      const userId = (req as any).user.userId;

      const result = await aiNoteService.generateNotes({
        userId,
        topicId: validated.topicId,
        customPrompt: validated.customPrompt,
        maxTokens: validated.maxTokens,
      });

      ApiResponse.success(res, 'AI study note generated successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves paginated notes for the authenticated user.
   */
  public async getUserNotes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = getNotesQuerySchema.parse(req.query);
      const userId = (req as any).user.userId;

      const result = await aiNoteService.getUserNotes(
        userId,
        query.page,
        query.limit,
        query.topicId
      );

      ApiResponse.success(res, 'AI notes retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves a single note by ID.
   */
  public async getNoteById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const noteId = req.params.noteId;

      const result = await aiNoteService.getNoteById(noteId, userId);

      ApiResponse.success(res, 'AI note retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates an existing note.
   */
  public async updateNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateNoteSchema.parse(req.body);
      const userId = (req as any).user.userId;
      const noteId = req.params.noteId;

      const result = await aiNoteService.updateNote(noteId, userId, validated);

      ApiResponse.success(res, 'AI note updated successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Soft-deletes a note.
   */
  public async deleteNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const noteId = req.params.noteId;

      await aiNoteService.deleteNote(noteId, userId);

      ApiResponse.success(res, 'AI note deleted successfully', { noteId });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generates AI flashcards for a topic.
   */
  public async generateFlashcards(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = generateFlashcardsSchema.parse(req.body);
      const userId = (req as any).user.userId;

      const result = await flashcardService.generateFlashcards({
        userId,
        topicId: validated.topicId,
        count: validated.count,
      });

      ApiResponse.success(res, 'AI flashcards generated successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves paginated or due flashcards.
   */
  public async getFlashcards(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = getFlashcardsQuerySchema.parse(req.query);
      const userId = (req as any).user.userId;

      if (query.dueOnly) {
        const due = await flashcardService.getDueFlashcards(userId, query.limit);
        ApiResponse.success(res, 'Due flashcards retrieved successfully', { flashcards: due, total: due.length });
        return;
      }

      const result = await flashcardService.getFlashcardsByTopic(
        userId,
        query.topicId,
        query.page,
        query.limit
      );

      ApiResponse.success(res, 'Flashcards retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deletes a flashcard.
   */
  public async deleteFlashcard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const cardId = req.params.cardId;

      await flashcardService.deleteFlashcard(cardId, userId);

      ApiResponse.success(res, 'Flashcard deleted successfully', { cardId });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Detects topic from freeform text.
   */
  public async detectTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = detectTopicSchema.parse(req.body);

      const result = await topicDetectionService.detectTopic(validated.text, validated.subjectId);

      ApiResponse.success(res, 'Topic detected successfully', result);
    } catch (error) {
      next(error);
    }
  }
}

export const specializedAiController = new SpecializedAiController();
