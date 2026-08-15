import { Request, Response, NextFunction } from 'express';
import { aiGatewayService } from '../services/ai-gateway.service';
import { directChatSchema } from '../validations/ai.validation';
import { ApiResponse } from '../../../utils/api-response';

export class AiController {
  public async directChat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = directChatSchema.parse(req.body);
      const userId = (req as any).user.userId;

      const result = await aiGatewayService.processDirectChat({
        userId,
        prompt: validated.prompt,
        subjectId: validated.subjectId,
        topicId: validated.topicId,
        maxTokens: validated.maxTokens,
      });

      ApiResponse.success(res, 'AI query processed successfully', result);
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AiController();
