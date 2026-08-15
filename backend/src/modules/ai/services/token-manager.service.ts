import { aiLogRepository } from '../repositories/ai.repository';

export interface IQuotaStatus {
  allowed: boolean;
  dailyTokensUsed: number;
  dailyTokensLimit: number;
  dailyRequestsUsed: number;
  dailyRequestsLimit: number;
  reason?: string;
}

export class TokenManagerService {
  private readonly defaultDailyTokenLimit: number;
  private readonly defaultDailyRequestLimit: number;

  constructor() {
    this.defaultDailyTokenLimit = parseInt(process.env.AI_DAILY_TOKEN_LIMIT || '100000', 10);
    this.defaultDailyRequestLimit = parseInt(process.env.AI_DAILY_REQUEST_LIMIT || '50', 10);
  }

  public estimateTokenCount(text: string): number {
    if (!text) return 0;
    return Math.max(1, Math.ceil(text.length / 4));
  }

  public async checkQuota(userId: string): Promise<IQuotaStatus> {
    const dailyTokensUsed = await aiLogRepository.getDailyTokenUsage(userId);
    const dailyRequestsUsed = await aiLogRepository.getDailyRequestCount(userId);

    if (dailyRequestsUsed >= this.defaultDailyRequestLimit) {
      return {
        allowed: false,
        dailyTokensUsed,
        dailyTokensLimit: this.defaultDailyTokenLimit,
        dailyRequestsUsed,
        dailyRequestsLimit: this.defaultDailyRequestLimit,
        reason: `Daily AI request limit reached (${this.defaultDailyRequestLimit} requests/day).`,
      };
    }

    if (dailyTokensUsed >= this.defaultDailyTokenLimit) {
      return {
        allowed: false,
        dailyTokensUsed,
        dailyTokensLimit: this.defaultDailyTokenLimit,
        dailyRequestsUsed,
        dailyRequestsLimit: this.defaultDailyRequestLimit,
        reason: `Daily AI token budget limit reached (${this.defaultDailyTokenLimit} tokens/day).`,
      };
    }

    return {
      allowed: true,
      dailyTokensUsed,
      dailyTokensLimit: this.defaultDailyTokenLimit,
      dailyRequestsUsed,
      dailyRequestsLimit: this.defaultDailyRequestLimit,
    };
  }

  public async logUsage(data: {
    userId: string;
    requestType: 'Chat_Direct' | 'Chat_Stream' | 'Chat_Session' | 'RAG_Query' | 'Notes_Generate' | 'Flashcards_Generate';
    promptTokens: number;
    completionTokens: number;
    modelUsed: string;
    latencyMs: number;
    status: 'Success' | 'Quota_Exceeded' | 'Safety_Blocked' | 'Error';
    errorMessage?: string;
  }): Promise<void> {
    const totalTokens = data.promptTokens + data.completionTokens;
    await aiLogRepository.create({
      userId: data.userId as any,
      requestType: data.requestType,
      promptTokens: data.promptTokens,
      completionTokens: data.completionTokens,
      totalTokens,
      modelUsed: data.modelUsed,
      latencyMs: data.latencyMs,
      status: data.status,
      errorMessage: data.errorMessage,
    });
  }
}

export const tokenManagerService = new TokenManagerService();
