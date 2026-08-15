import { LearningResourceModel } from '../../academic/models/learning-resource.model';
import { embeddingRepository } from '../repositories/ai.repository';
import { geminiEmbeddingProviderService } from './gemini-embedding-provider.service';
import { AppError } from '../../../utils/app-error';

export interface IIngestResult {
  resourceId: string;
  chunkCount: number;
  status: 'COMPLETED' | 'FAILED';
  error?: string;
}

export class DocumentIngestionService {
  /**
   * Normalizes raw text input by cleaning whitespace and control characters while preserving math formulas.
   */
  public cleanText(rawText: string): string {
    if (!rawText) return '';
    let cleaned = rawText.replace(/[\r\f\v]/g, '\n');
    cleaned = cleaned.replace(/[^\S\n]+/g, ' ');
    cleaned = cleaned
      .split('\n')
      .map((line) => line.trim())
      .join('\n');
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    return cleaned.trim();
  }

  /**
   * Performs semantic chunking (~500 tokens / 2000 chars) with overlap (~50 tokens / 200 chars).
   */
  public chunkText(text: string, chunkSize: number = 2000, overlap: number = 200): string[] {
    const cleaned = this.cleanText(text);
    if (!cleaned) return [];

    if (cleaned.length <= chunkSize) {
      return [cleaned];
    }

    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < cleaned.length) {
      let endIndex = startIndex + chunkSize;

      if (endIndex >= cleaned.length) {
        chunks.push(cleaned.slice(startIndex).trim());
        break;
      }

      // Try splitting at double newline (paragraph boundary)
      let breakIndex = cleaned.lastIndexOf('\n\n', endIndex);
      if (breakIndex <= startIndex + overlap) {
        // Fall back to single newline
        breakIndex = cleaned.lastIndexOf('\n', endIndex);
      }
      if (breakIndex <= startIndex + overlap) {
        // Fall back to sentence boundary
        breakIndex = cleaned.lastIndexOf('. ', endIndex);
        if (breakIndex !== -1) breakIndex += 1; // Include the period
      }
      if (breakIndex <= startIndex + overlap) {
        // Hard boundary fallback
        breakIndex = endIndex;
      }

      const chunk = cleaned.slice(startIndex, breakIndex).trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }

      startIndex = Math.max(startIndex + 1, breakIndex - overlap);
    }

    return chunks;
  }

  /**
   * Ingests a Learning Resource into the RAG vector store.
   */
  public async ingestResource(resourceId: string): Promise<IIngestResult> {
    const resource = await LearningResourceModel.findById(resourceId).exec();
    if (!resource) {
      throw new AppError(`Learning Resource not found with ID: ${resourceId}`, 404, 'NOT_FOUND');
    }

    const rawText = resource.textContent || resource.title || '';
    if (!rawText || rawText.trim() === '') {
      await LearningResourceModel.findByIdAndUpdate(resourceId, {
        processingStatus: 'FAILED',
        processingError: 'Resource contains no readable text content.',
      });
      throw new AppError('Cannot ingest resource with empty text content.', 400, 'VALIDATION_ERROR');
    }

    try {
      await LearningResourceModel.findByIdAndUpdate(resourceId, {
        processingStatus: 'PROCESSING',
      });

      const chunks = this.chunkText(rawText);
      const vectors = await geminiEmbeddingProviderService.generateBatchEmbeddings(chunks);

      // Clean existing embeddings for this resource
      await embeddingRepository.deleteByResourceId(resourceId);

      // Prepare embedding documents
      const embeddingDocs = chunks.map((chunk, index) => ({
        resourceId: resource._id,
        chunkIndex: index,
        chunkText: chunk,
        vector: vectors[index] || new Array(768).fill(0),
        modelName: 'text-embedding-004',
        dimensions: 768,
        tokenLength: Math.ceil(chunk.length / 4),
        metadata: {
          title: resource.title,
          subjectId: resource.subjectId.toString(),
          chapterId: resource.chapterId.toString(),
          topicId: resource.topicId.toString(),
          resourceType: resource.resourceType,
        },
      }));

      await embeddingRepository.insertMany(embeddingDocs as any);

      await LearningResourceModel.findByIdAndUpdate(resourceId, {
        processingStatus: 'COMPLETED',
        chunkCount: chunks.length,
        processingError: '',
      });

      return {
        resourceId,
        chunkCount: chunks.length,
        status: 'COMPLETED',
      };
    } catch (error: any) {
      await LearningResourceModel.findByIdAndUpdate(resourceId, {
        processingStatus: 'FAILED',
        processingError: error.message,
      });
      throw new AppError(`Resource ingestion failed: ${error.message}`, 500, 'INGESTION_ERROR');
    }
  }
}

export const documentIngestionService = new DocumentIngestionService();
