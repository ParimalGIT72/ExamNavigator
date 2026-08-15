import { Request, Response, NextFunction } from 'express';
import { ragEngineService } from '../services/rag-engine.service';
import { documentIngestionService } from '../services/document-ingestion.service';
import { ragQuerySchema, ingestResourceSchema } from '../validations/rag.validation';
import { ApiResponse } from '../../../utils/api-response';

export class RagController {
  public async query(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = ragQuerySchema.parse(req.body);
      const userId = (req as any).user.userId;

      const result = await ragEngineService.processRagQuery({
        userId,
        query: validated.query,
        subjectId: validated.subjectId,
        chapterId: validated.chapterId,
        topicId: validated.topicId,
        topK: validated.topK,
        minScore: validated.minScore,
      });

      ApiResponse.success(res, 'RAG query processed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  public async ingest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = ingestResourceSchema.parse({ resourceId: req.params.resourceId });

      const result = await documentIngestionService.ingestResource(validated.resourceId);

      ApiResponse.success(res, 'Document ingestion completed successfully', result);
    } catch (error) {
      next(error);
    }
  }
}

export const ragController = new RagController();
