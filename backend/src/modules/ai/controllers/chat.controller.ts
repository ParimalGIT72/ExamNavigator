import { Request, Response, NextFunction } from 'express';
import { chatSessionService } from '../services/chat-session.service';
import {
  startChatSchema,
  continueChatSchema,
  getSessionsQuerySchema,
  getMessagesQuerySchema,
} from '../validations/chat.validation';
import { ApiResponse } from '../../../utils/api-response';

export class ChatController {
  /**
   * Starts a new chat session and processes the initial turn.
   */
  public async startChat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = startChatSchema.parse(req.body);
      const userId = (req as any).user.userId;

      const result = await chatSessionService.processChatTurn({
        userId,
        message: validated.message,
        subjectId: validated.subjectId,
        chapterId: validated.chapterId,
        topicId: validated.topicId,
      });

      ApiResponse.success(res, 'Chat response generated successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Continues an existing chat session.
   */
  public async continueChat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = continueChatSchema.parse(req.body);
      const userId = (req as any).user.userId;
      const sessionId = req.params.sessionId;

      const result = await chatSessionService.processChatTurn({
        userId,
        sessionId,
        message: validated.message,
        subjectId: validated.subjectId,
        chapterId: validated.chapterId,
        topicId: validated.topicId,
      });

      ApiResponse.success(res, 'Chat response generated successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves paginated chat sessions for the authenticated user.
   */
  public async getSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = getSessionsQuerySchema.parse(req.query);
      const userId = (req as any).user.userId;

      const result = await chatSessionService.getUserSessions(
        userId,
        query.page,
        query.limit,
        query.status
      );

      ApiResponse.success(res, 'Chat sessions retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves paginated messages for a chat session.
   */
  public async getSessionMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = getMessagesQuerySchema.parse(req.query);
      const userId = (req as any).user.userId;
      const sessionId = req.params.sessionId;

      const result = await chatSessionService.getSessionMessages(
        sessionId,
        userId,
        query.page,
        query.limit
      );

      ApiResponse.success(res, 'Session messages retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Archives (soft-deletes) a chat session.
   */
  public async archiveSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const sessionId = req.params.sessionId;

      await chatSessionService.archiveSession(sessionId, userId);

      ApiResponse.success(res, 'Chat session archived successfully', { sessionId });
    } catch (error) {
      next(error);
    }
  }
}

export const chatController = new ChatController();
