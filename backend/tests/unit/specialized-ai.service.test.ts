import { promptTemplateService } from '../../src/modules/ai/services/prompt-template.service';
import { aiNoteService } from '../../src/modules/ai/services/ai-note.service';
import { flashcardService } from '../../src/modules/ai/services/flashcard.service';
import { topicDetectionService } from '../../src/modules/ai/services/topic-detection.service';
import { TopicModel } from '../../src/modules/academic/models/topic.model';
import { aiNoteRepository, flashcardRepository, embeddingRepository } from '../../src/modules/ai/repositories/ai.repository';
import { aiGatewayService } from '../../src/modules/ai/services/ai-gateway.service';
import { tokenManagerService } from '../../src/modules/ai/services/token-manager.service';

describe('Phase 6D - Unit Tests (Specialized AI Services)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(tokenManagerService, 'checkQuota').mockResolvedValue({
      allowed: true,
      dailyTokensUsed: 100,
      dailyTokensLimit: 100000,
      dailyRequestsUsed: 2,
      dailyRequestsLimit: 50,
    });
    jest.spyOn(tokenManagerService, 'logUsage').mockResolvedValue();
    jest.spyOn(embeddingRepository, 'findCandidatesByMetadata').mockResolvedValue([]);
  });

  describe('PromptTemplateService', () => {
    it('should render NOTES_GENERATE_V1 template correctly', () => {
      const template = promptTemplateService.NOTES_GENERATE_V1;
      expect(template.version).toBe('1.0.0');
      const rendered = template.renderUserPrompt({ topicName: 'Kinematics', customPrompt: 'Focus on equations' });
      expect(rendered).toContain('Kinematics');
      expect(rendered).toContain('Focus on equations');
    });

    it('should render FLASHCARDS_GENERATE_V1 template correctly', () => {
      const template = promptTemplateService.FLASHCARDS_GENERATE_V1;
      const rendered = template.renderUserPrompt({ topicName: 'Thermodynamics', count: 5 });
      expect(rendered).toContain('exactly 5 active-recall flashcard pairs');
      expect(rendered).toContain('Thermodynamics');
    });
  });

  describe('TopicDetectionService', () => {
    it('should match topic from database if string match exists', async () => {
      const mockTopic = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Newton Laws of Motion',
        subjectId: '507f1f77bcf86cd799439001',
      };
      jest.spyOn(TopicModel, 'find').mockReturnValue({
        limit: () => ({ exec: jest.fn().mockResolvedValue([mockTopic]) }),
      } as any);

      const result = await topicDetectionService.detectTopic('Explain Newton Laws of Motion in detail');

      expect(result.topicName).toBe('Newton Laws of Motion');
      expect(result.confidenceScore).toBe(0.95);
      expect(result.topicId).toBe('507f1f77bcf86cd799439011');
    });
  });

  describe('AiNoteService', () => {
    it('should generate notes and persist structured fields to AiNoteModel', async () => {
      const mockTopic = { _id: '507f1f77bcf86cd799439011', title: 'Work and Energy', subjectId: '507f1f77bcf86cd799439001' };
      const mockGatewayResult = {
        answer: '# Work and Energy\n\n## Executive Summary\nWork is force times displacement.\n\n## Key Concepts & Takeaways\n- W = F d cos(theta)\n- Energy is scalar',
        tokensUsed: { promptTokens: 300, completionTokens: 150, totalTokens: 450 },
        modelUsed: 'gemini-2.5-pro',
        latencyMs: 120,
      };

      jest.spyOn(TopicModel, 'findById').mockReturnValue({ exec: jest.fn().mockResolvedValue(mockTopic) } as any);
      jest.spyOn(aiGatewayService, 'processDirectChat').mockResolvedValue(mockGatewayResult);
      jest.spyOn(aiNoteRepository, 'create').mockResolvedValue({
        _id: '507f1f77bcf86cd799439099',
        title: 'Work and Energy',
        content: mockGatewayResult.answer,
        summary: 'Work is force times displacement.',
        keyTakeaways: ['W = F d cos(theta)', 'Energy is scalar'],
        tags: ['Work and Energy'],
        createdAt: new Date(),
      } as any);

      const result = await aiNoteService.generateNotes({
        userId: '507f1f77bcf86cd799439011',
        topicId: '507f1f77bcf86cd799439011',
      });

      expect(result.title).toBe('Work and Energy');
      expect(result.summary).toContain('Work is force times displacement.');
      expect(result.keyTakeaways).toContain('W = F d cos(theta)');
    });

    it('should throw 429 AppError when quota is exceeded', async () => {
      jest.spyOn(tokenManagerService, 'checkQuota').mockResolvedValue({
        allowed: false,
        reason: 'Daily quota exceeded',
        dailyTokensUsed: 100000,
        dailyTokensLimit: 100000,
        dailyRequestsUsed: 50,
        dailyRequestsLimit: 50,
      });

      await expect(
        aiNoteService.generateNotes({
          userId: '507f1f77bcf86cd799439011',
          topicId: '507f1f77bcf86cd799439011',
        })
      ).rejects.toThrow('Daily quota exceeded');
    });
  });

  describe('FlashcardService', () => {
    it('should generate flashcards and bulk-persist to FlashcardModel', async () => {
      const mockTopic = { _id: '507f1f77bcf86cd799439011', title: 'Optics' };
      const mockGatewayResult = {
        answer: '```json\n[\n{"front": "What is Snell Law?", "back": "n1 sin(theta1) = n2 sin(theta2)"}\n]\n```',
        tokensUsed: { promptTokens: 200, completionTokens: 80, totalTokens: 280 },
        modelUsed: 'gemini-2.5-pro',
        latencyMs: 100,
      };

      jest.spyOn(TopicModel, 'findById').mockReturnValue({ exec: jest.fn().mockResolvedValue(mockTopic) } as any);
      jest.spyOn(aiGatewayService, 'processDirectChat').mockResolvedValue(mockGatewayResult);
      jest.spyOn(flashcardRepository, 'insertMany').mockResolvedValue([
        {
          _id: '507f1f77bcf86cd799439088',
          front: 'What is Snell Law?',
          back: 'n1 sin(theta1) = n2 sin(theta2)',
          masteryState: 'New',
          nextReviewDate: new Date(),
        },
      ] as any);

      const result = await flashcardService.generateFlashcards({
        userId: '507f1f77bcf86cd799439011',
        topicId: '507f1f77bcf86cd799439011',
        count: 1,
      });

      expect(result.count).toBe(1);
      expect(result.flashcards[0].front).toBe('What is Snell Law?');
      expect(result.flashcards[0].back).toBe('n1 sin(theta1) = n2 sin(theta2)');
    });
  });
});
