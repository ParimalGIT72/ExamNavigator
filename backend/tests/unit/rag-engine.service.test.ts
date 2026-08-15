import { GeminiEmbeddingProviderService } from '../../src/modules/ai/services/gemini-embedding-provider.service';
import { DocumentIngestionService } from '../../src/modules/ai/services/document-ingestion.service';
import { RagEngineService } from '../../src/modules/ai/services/rag-engine.service';
import { IEmbeddingDocument } from '../../src/modules/ai/models/embedding.model';

describe('Phase 6B - Unit Tests (RAG Engine & Document Ingestion)', () => {
  let embeddingProvider: GeminiEmbeddingProviderService;
  let ingestionService: DocumentIngestionService;
  let ragEngine: RagEngineService;

  beforeEach(() => {
    embeddingProvider = new GeminiEmbeddingProviderService();
    ingestionService = new DocumentIngestionService();
    ragEngine = new RagEngineService();
  });

  describe('GeminiEmbeddingProviderService', () => {
    it('should generate a 768-dimensional normalized unit vector', async () => {
      const vector = await embeddingProvider.generateEmbedding('Newton laws of motion');
      expect(Array.isArray(vector)).toBe(true);
      expect(vector.length).toBe(768);

      // Verify unit length magnitude approx 1.0
      const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
      expect(magnitude).toBeCloseTo(1.0, 4);
    });

    it('should return zero vector for empty text', async () => {
      const vector = await embeddingProvider.generateEmbedding('');
      expect(vector.length).toBe(768);
      expect(vector.every((v) => v === 0)).toBe(true);
    });

    it('should batch generate embeddings for multiple texts', async () => {
      const vectors = await embeddingProvider.generateBatchEmbeddings(['Text A', 'Text B']);
      expect(vectors.length).toBe(2);
      expect(vectors[0].length).toBe(768);
      expect(vectors[1].length).toBe(768);
    });
  });

  describe('DocumentIngestionService', () => {
    it('should clean raw text by removing invalid control chars and extra whitespace', () => {
      const raw = "  Hello \r\f world!  \n\n\n\n  Newton's \t Second Law.  ";
      const cleaned = ingestionService.cleanText(raw);
      expect(cleaned).toBe("Hello\n\nworld!\n\nNewton's Second Law.");
    });

    it('should chunk long text into semantic pieces with overlap', () => {
      const paragraph = 'Paragraph line text for testing semantic chunking logic in ExamNavigator RAG ingestion. '.repeat(40);
      const chunks = ingestionService.chunkText(paragraph, 500, 50);

      expect(chunks.length).toBeGreaterThan(1);
      expect(chunks[0].length).toBeLessThanOrEqual(500 + 50);
    });
  });

  describe('RagEngineService', () => {
    it('should correctly compute Cosine Similarity between vectors', () => {
      const vecA = [1, 0, 0];
      const vecB = [1, 0, 0];
      const vecC = [0, 1, 0];

      expect(ragEngine.calculateCosineSimilarity(vecA, vecB)).toBeCloseTo(1.0, 5);
      expect(ragEngine.calculateCosineSimilarity(vecA, vecC)).toBeCloseTo(0.0, 5);
    });

    it('should rank candidates by score and filter out scores below minScore', () => {
      const queryVec = [1, 0, 0];

      const mockCandidate1 = {
        chunkText: 'Relevant Physics Laws',
        vector: [0.9, 0.1, 0],
        resourceId: 'res1',
        chunkIndex: 0,
        metadata: { title: 'Physics Notes', resourceType: 'Notes' },
      } as unknown as IEmbeddingDocument;

      const mockCandidate2 = {
        chunkText: 'Irrelevant Botany Info',
        vector: [0.1, 0.9, 0],
        resourceId: 'res2',
        chunkIndex: 0,
        metadata: { title: 'Botany Notes', resourceType: 'PDF' },
      } as unknown as IEmbeddingDocument;

      const ranked = ragEngine.rankCandidates(queryVec, [mockCandidate1, mockCandidate2], 5, 0.55);

      expect(ranked.length).toBe(1);
      expect(ranked[0].chunk.chunkText).toBe('Relevant Physics Laws');
      expect(ranked[0].score).toBeGreaterThan(0.55);
    });

    it('should construct XML context block with injection protection tags', () => {
      const mockItem = {
        chunk: {
          chunkText: 'Action and reaction are equal and opposite.',
          metadata: { title: 'Laws of Motion', resourceType: 'PDF' },
        } as unknown as IEmbeddingDocument,
        score: 0.92,
      };

      const contextBlock = ragEngine.buildContextBlock([mockItem]);
      expect(contextBlock).toContain('<retrieved_context>');
      expect(contextBlock).toContain('</retrieved_context>');
      expect(contextBlock).toContain('Laws of Motion');
      expect(contextBlock).toContain('Action and reaction');
    });

    it('should construct graceful notice context block when no chunks are retrieved', () => {
      const contextBlock = ragEngine.buildContextBlock([]);
      expect(contextBlock).toContain('<retrieved_context>');
      expect(contextBlock).toContain('No relevant educational reference documents were retrieved');
    });
  });
});
