import { geminiEmbeddingProviderService } from './gemini-embedding-provider.service';
import { embeddingRepository } from '../repositories/ai.repository';
import { aiGatewayService } from './ai-gateway.service';
import { IEmbeddingDocument } from '../models/embedding.model';

export interface IRagQueryRequest {
  userId: string;
  query: string;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  topK?: number;
  minScore?: number;
}

export interface ICitationMetadata {
  resourceId: string;
  title: string;
  resourceType: string;
  similarityScore: number;
  chunkIndex: number;
}

export interface IRagQueryResponse {
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

export class RagEngineService {
  /**
   * Computes Cosine Similarity between two vector arrays.
   */
  public calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Ranks candidate chunks using Cosine Similarity and filters by minScore threshold.
   */
  public rankCandidates(
    queryVector: number[],
    candidates: IEmbeddingDocument[],
    topK: number = 5,
    minScore: number = 0.55
  ): { chunk: IEmbeddingDocument; score: number }[] {
    if (!candidates || candidates.length === 0) return [];

    const scored = candidates.map((chunk) => ({
      chunk,
      score: this.calculateCosineSimilarity(queryVector, chunk.vector),
    }));

    return scored
      .filter((item) => item.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  /**
   * Builds structured context block with strict prompt-injection protection tags.
   */
  public buildContextBlock(rankedItems: { chunk: IEmbeddingDocument; score: number }[]): string {
    if (!rankedItems || rankedItems.length === 0) {
      return `<retrieved_context>\n[Notice: No relevant educational reference documents were retrieved from the knowledge base above similarity threshold.]\n</retrieved_context>`;
    }

    const contextParts = rankedItems.map((item, index) => {
      const meta = item.chunk.metadata as any;
      const title = meta?.get ? meta.get('title') : meta?.title || 'Study Material';
      const resourceType = meta?.get ? meta.get('resourceType') : meta?.resourceType || 'Resource';
      return `[Source ${index + 1}: ${title} (${resourceType}) | Relevance: ${(item.score * 100).toFixed(1)}%]\n${item.chunk.chunkText}`;
    });

    return `<retrieved_context>\n${contextParts.join('\n\n')}\n</retrieved_context>`;
  }

  /**
   * Processes a complete RAG query through vector retrieval, context building, and AI Gateway execution.
   */
  public async processRagQuery(request: IRagQueryRequest): Promise<IRagQueryResponse> {
    const startTime = Date.now();
    const topK = request.topK || 5;
    const minScore = request.minScore ?? 0.55;

    // 1. Generate query vector embedding
    const queryVector = await geminiEmbeddingProviderService.generateEmbedding(request.query);

    // 2. Pre-filtered metadata retrieval
    const candidateChunks = await embeddingRepository.findCandidatesByMetadata({
      subjectId: request.subjectId,
      chapterId: request.chapterId,
      topicId: request.topicId,
    });

    // 3. Rank top-k chunks by Cosine Similarity
    const topItems = this.rankCandidates(queryVector, candidateChunks, topK, minScore);

    // 4. Build context block
    const contextBlock = this.buildContextBlock(topItems);

    // 5. Construct augmented prompt
    const augmentedPrompt = `${request.query}\n\nReference Material:\n${contextBlock}`;

    // 6. Delegate final execution to existing AI Gateway
    const gatewayResult = await aiGatewayService.processDirectChat({
      userId: request.userId,
      prompt: augmentedPrompt,
      subjectId: request.subjectId,
      topicId: request.topicId,
    });

    // 7. Extract citations
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

    const latencyMs = Date.now() - startTime;

    return {
      answer: gatewayResult.answer,
      citations,
      tokensUsed: gatewayResult.tokensUsed,
      modelUsed: gatewayResult.modelUsed,
      latencyMs,
    };
  }
}

export const ragEngineService = new RagEngineService();
