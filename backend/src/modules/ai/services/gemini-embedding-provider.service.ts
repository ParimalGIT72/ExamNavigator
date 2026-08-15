export interface IGeminiEmbeddingOptions {
  model?: string;
}

export class GeminiEmbeddingProviderService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;
  public readonly dimensions: number = 768;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    this.model = process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';
  }

  /**
   * Generates a deterministic mock 768-dim unit vector for testing/dev fallback.
   */
  private generateMockVector(text: string): number[] {
    const vector: number[] = new Array(this.dimensions).fill(0);
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    for (let i = 0; i < this.dimensions; i++) {
      const val = Math.sin(hash + i);
      vector[i] = val;
    }

    // Normalize vector to unit length
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map((val) => (magnitude > 0 ? val / magnitude : 0));
  }

  public async generateEmbedding(text: string): Promise<number[]> {
    if (!text || text.trim() === '') {
      return new Array(this.dimensions).fill(0);
    }

    if (!this.apiKey || this.apiKey === 'mock-key' || process.env.NODE_ENV === 'test') {
      return this.generateMockVector(text);
    }

    try {
      const url = `${this.baseUrl}/${this.model}:embedContent?key=${this.apiKey}`;
      const payload = {
        model: `models/${this.model}`,
        content: {
          parts: [{ text }],
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini Embedding API Error (${response.status}): ${errorText}`);
      }

      const data: any = await response.json();
      const values: number[] = data.embedding?.values;

      if (!values || !Array.isArray(values)) {
        throw new Error('Invalid embedding vector returned from Gemini API');
      }

      return values;
    } catch (error: any) {
      // Fallback gracefully to mock vector if remote call fails in non-prod
      if (process.env.NODE_ENV !== 'production') {
        return this.generateMockVector(text);
      }
      throw new Error(`GeminiEmbeddingProviderService Error: ${error.message}`);
    }
  }

  public async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    if (!texts || texts.length === 0) return [];
    const results: number[][] = [];
    for (const text of texts) {
      const embedding = await this.generateEmbedding(text);
      results.push(embedding);
    }
    return results;
  }
}

export const geminiEmbeddingProviderService = new GeminiEmbeddingProviderService();
