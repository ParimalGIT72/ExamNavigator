import { ConversationMemoryService } from '../../src/modules/ai/services/conversation-memory.service';
import { chatSessionRepository, chatMessageRepository } from '../../src/modules/ai/repositories/ai.repository';
import { geminiProviderService } from '../../src/modules/ai/services/gemini-provider.service';
import { tokenManagerService } from '../../src/modules/ai/services/token-manager.service';

describe('Phase 6C - Unit Tests (ConversationMemoryService)', () => {
  let memoryService: ConversationMemoryService;

  beforeEach(() => {
    memoryService = new ConversationMemoryService();
    jest.clearAllMocks();
  });

  describe('buildMemoryBlock', () => {
    it('should build recent conversation memory block within 1,944 token cap', async () => {
      const mockSession = {
        _id: '507f1f77bcf86cd799439001',
        userId: '507f1f77bcf86cd799439011',
        title: 'Physics Doubts',
        conversationSummary: 'Student learned basic mechanics concepts.',
      } as any;

      const mockMessages = [
        { sender: 'User', content: 'What is Newton first law?', createdAt: new Date(1000) },
        { sender: 'Assistant', content: 'An object remains at rest...', createdAt: new Date(2000) },
      ] as any;

      jest.spyOn(chatSessionRepository, 'findById').mockResolvedValue(mockSession);
      jest.spyOn(chatMessageRepository, 'findWindowMessages').mockResolvedValue(mockMessages);
      jest.spyOn(chatMessageRepository, 'countOutsideWindowUnsummarized').mockResolvedValue(2);

      const result = await memoryService.buildMemoryBlock('507f1f77bcf86cd799439001');

      expect(result.memoryBlock).toContain('<conversation_summary>');
      expect(result.memoryBlock).toContain('Student learned basic mechanics concepts.');
      expect(result.memoryBlock).toContain('<recent_conversation>');
      expect(result.memoryBlock).toContain('[Student]: What is Newton first law?');
      expect(result.memoryBlock).toContain('[Tutor]: An object remains at rest...');
      expect(result.shouldSummarize).toBe(false); // 2 < 10 threshold
    });

    it('should set shouldSummarize = true IF AND ONLY IF outsideWindowUnsummarizedCount >= 10', async () => {
      const mockSession = {
        _id: '507f1f77bcf86cd799439001',
        conversationSummary: '',
      } as any;

      const mockMessages = [
        { sender: 'User', content: 'Query 1', createdAt: new Date(1000) },
      ] as any;

      jest.spyOn(chatSessionRepository, 'findById').mockResolvedValue(mockSession);
      jest.spyOn(chatMessageRepository, 'findWindowMessages').mockResolvedValue(mockMessages);
      jest.spyOn(chatMessageRepository, 'countOutsideWindowUnsummarized').mockResolvedValue(12); // >= 10

      const result = await memoryService.buildMemoryBlock('507f1f77bcf86cd799439001');

      expect(result.shouldSummarize).toBe(true);
    });

    it('should truncate window messages if total content exceeds 1,944 token cap', async () => {
      const mockSession = { _id: '507f1f77bcf86cd799439001' } as any;

      // Create 5 large messages (each 2000 chars ~ 500 tokens)
      const largeContent = 'A'.repeat(2000);
      const mockMessages = [
        { sender: 'User', content: largeContent, createdAt: new Date(1000) },
        { sender: 'Assistant', content: largeContent, createdAt: new Date(2000) },
        { sender: 'User', content: largeContent, createdAt: new Date(3000) },
        { sender: 'Assistant', content: largeContent, createdAt: new Date(4000) },
        { sender: 'User', content: 'Most recent short message', createdAt: new Date(5000) },
      ] as any;

      jest.spyOn(chatSessionRepository, 'findById').mockResolvedValue(mockSession);
      jest.spyOn(chatMessageRepository, 'findWindowMessages').mockResolvedValue(mockMessages);
      jest.spyOn(chatMessageRepository, 'countOutsideWindowUnsummarized').mockResolvedValue(0);

      const result = await memoryService.buildMemoryBlock('507f1f77bcf86cd799439001');

      // Total token limit (1,944 tokens) must truncate older messages
      expect(result.includedMessages.length).toBeLessThan(mockMessages.length);
      expect(result.includedMessages[result.includedMessages.length - 1].content).toBe('Most recent short message');
    });
  });

  describe('triggerSummarization', () => {
    it('should generate summary and perform optimistic conditional update before marking messages as summarized', async () => {
      const mockSession = {
        _id: '507f1f77bcf86cd799439001',
        userId: '507f1f77bcf86cd799439011',
        conversationSummary: 'Old summary',
        summaryUpdatedAt: new Date(1000),
      } as any;

      const mockUnsummarized = Array.from({ length: 11 }, (_, i) => ({
        _id: `msg_${i}`,
        sender: i % 2 === 0 ? 'User' : 'Assistant',
        content: `Content ${i}`,
        createdAt: new Date(1000 + i * 100),
      })) as any;

      jest.spyOn(chatMessageRepository, 'findOutsideWindowUnsummarized').mockResolvedValue(mockUnsummarized);
      jest.spyOn(geminiProviderService, 'generateContent').mockResolvedValue({
        text: 'Updated comprehensive summary of kinematics and dynamics.',
        promptTokens: 150,
        completionTokens: 50,
        totalTokens: 200,
        model: 'gemini-2.5-pro',
      });

      const updateSummarySpy = jest.spyOn(chatSessionRepository, 'updateSummary').mockResolvedValue(mockSession);
      const markSpy = jest.spyOn(chatMessageRepository, 'markAsSummarized').mockResolvedValue();
      jest.spyOn(tokenManagerService, 'logUsage').mockResolvedValue();

      // Pass older session object to test non-stale update
      const sessionForJob = {
        ...mockSession,
        summaryUpdatedAt: new Date(Date.now() - 40000), // > 30s ago
      };

      const result = await memoryService.triggerSummarization(
        '507f1f77bcf86cd799439001',
        sessionForJob,
        new Date(2000)
      );

      expect(result).toBe(true);
      expect(updateSummarySpy).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439001',
        expect.any(Date),
        'Updated comprehensive summary of kinematics and dynamics.'
      );
      expect(markSpy).toHaveBeenCalledWith(expect.arrayContaining(['msg_0', 'msg_10']));
    });

    it('should REJECT stale summarization job if updateSummary returns null (newer summary exists)', async () => {
      const mockSession = {
        _id: '507f1f77bcf86cd799439001',
        userId: '507f1f77bcf86cd799439011',
        conversationSummary: 'Newer summary saved by concurrent turn',
        summaryUpdatedAt: new Date(Date.now() - 40000),
      } as any;

      const mockUnsummarized = Array.from({ length: 11 }, (_, i) => ({
        _id: `msg_${i}`,
        sender: 'User',
        content: `Content ${i}`,
      })) as any;

      jest.spyOn(chatMessageRepository, 'findOutsideWindowUnsummarized').mockResolvedValue(mockUnsummarized);
      jest.spyOn(geminiProviderService, 'generateContent').mockResolvedValue({
        text: 'Stale generated summary text',
        promptTokens: 100,
        completionTokens: 40,
        totalTokens: 140,
        model: 'gemini-2.5-pro',
      });

      // Simulate conditional update failure (matched 0 docs due to timestamp mismatch)
      jest.spyOn(chatSessionRepository, 'updateSummary').mockResolvedValue(null);
      const markSpy = jest.spyOn(chatMessageRepository, 'markAsSummarized');

      const result = await memoryService.triggerSummarization(
        '507f1f77bcf86cd799439001',
        mockSession,
        new Date(2000)
      );

      expect(result).toBe(false); // Stale job rejected
      expect(markSpy).not.toHaveBeenCalled(); // Messages must NOT be marked summarized
    });

    it('should gracefully handle Gemini error without updating summary or marking messages', async () => {
      const mockSession = {
        _id: '507f1f77bcf86cd799439001',
        userId: '507f1f77bcf86cd799439011',
        conversationSummary: 'Old summary intact',
        summaryUpdatedAt: new Date(Date.now() - 40000),
      } as any;

      const mockUnsummarized = Array.from({ length: 11 }, (_, i) => ({
        _id: `msg_${i}`,
        sender: 'User',
        content: `Content ${i}`,
      })) as any;

      jest.spyOn(chatMessageRepository, 'findOutsideWindowUnsummarized').mockResolvedValue(mockUnsummarized);
      jest.spyOn(geminiProviderService, 'generateContent').mockRejectedValue(new Error('API quota exceeded'));

      const updateSummarySpy = jest.spyOn(chatSessionRepository, 'updateSummary');
      const markSpy = jest.spyOn(chatMessageRepository, 'markAsSummarized');

      const result = await memoryService.triggerSummarization(
        '507f1f77bcf86cd799439001',
        mockSession,
        new Date(2000)
      );

      expect(result).toBe(false);
      expect(updateSummarySpy).not.toHaveBeenCalled();
      expect(markSpy).not.toHaveBeenCalled();
    });
  });
});
