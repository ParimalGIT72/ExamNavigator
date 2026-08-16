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
   * Processes streaming chat turn emitting Server-Sent Events (SSE).
   */
  public async streamChat(req: Request, res: Response, next: NextFunction): Promise<void> {
    const abortController = new AbortController();
    res.on('close', () => {
      if (!res.writableEnded) {
        abortController.abort();
      }
    });

    try {
      const validated = startChatSchema.parse(req.body);
      const userId = (req as any).user.userId;

      // Emit SSE helper
      const sendEvent = (event: string, data: any) => {
        if (abortController.signal.aborted || res.writableEnded) return;
        if (!res.headersSent) {
          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          if (process.env.NODE_ENV !== 'test') {
            res.setHeader('Connection', 'keep-alive');
          }
          if (res.flushHeaders) res.flushHeaders();
        }
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      const result = await chatSessionService.processStreamChatTurn(
        {
          userId,
          sessionId: req.body.sessionId,
          message: validated.message,
          subjectId: validated.subjectId,
          chapterId: validated.chapterId,
          topicId: validated.topicId,
        },
        (token: string) => {
          sendEvent('token', { token });
        },
        (citations) => {
          sendEvent('citations', { citations });
        },
        { signal: abortController.signal }
      );

      sendEvent('start', { sessionId: result.sessionId });
      sendEvent('done', {
        sessionId: result.sessionId,
        tokensUsed: result.tokensUsed,
        latencyMs: result.latencyMs,
      });

      if (!res.writableEnded) res.end();
    } catch (error: any) {
      if (abortController.signal.aborted || error.name === 'AbortError') {
        if (!res.writableEnded) res.end();
        return;
      }
      if (res.headersSent) {
        res.write(`event: error\ndata: ${JSON.stringify({ message: error.message || 'Stream error', errorCode: error.errorCode || 'INTERNAL_ERROR' })}\n\n`);
        res.end();
      } else {
        next(error);
      }
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
