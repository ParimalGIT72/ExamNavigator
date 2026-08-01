import { logger } from '../utils/logger';
import { SubjectModel } from '../modules/academic/models/subject.model';
import { ChapterModel } from '../modules/academic/models/chapter.model';
import { TopicModel } from '../modules/academic/models/topic.model';
import { LearningResourceModel } from '../modules/academic/models/learning-resource.model';
import { QuestionBankModel } from '../modules/assessment/models/question-bank.model';
import { MockTestModel } from '../modules/assessment/models/mock-test.model';
import { TestAttemptModel } from '../modules/assessment/models/test-attempt.model';
import { AnalyticsModel } from '../modules/analytics/models/analytics.model';
import { ChatSessionModel } from '../modules/ai/models/chat-session.model';
import { ChatMessageModel } from '../modules/ai/models/chat-message.model';
import { EmbeddingModel } from '../modules/ai/models/embedding.model';
import { AiNoteModel } from '../modules/ai/models/ai-note.model';
import { FlashcardModel } from '../modules/ai/models/flashcard.model';
import { StudyPlanModel } from '../modules/planner/models/study-plan.model';
import { NotificationModel } from '../modules/notification/models/notification.model';
import { AuditLogModel } from '../modules/system/models/audit-log.model';

export const ensureIndexes = async (): Promise<void> => {
  try {
    logger.info('Initializing collection indexes across all modules...');
    await Promise.all([
      SubjectModel.createIndexes(),
      ChapterModel.createIndexes(),
      TopicModel.createIndexes(),
      LearningResourceModel.createIndexes(),
      QuestionBankModel.createIndexes(),
      MockTestModel.createIndexes(),
      TestAttemptModel.createIndexes(),
      AnalyticsModel.createIndexes(),
      ChatSessionModel.createIndexes(),
      ChatMessageModel.createIndexes(),
      EmbeddingModel.createIndexes(),
      AiNoteModel.createIndexes(),
      FlashcardModel.createIndexes(),
      StudyPlanModel.createIndexes(),
      NotificationModel.createIndexes(),
      AuditLogModel.createIndexes(),
    ]);
    logger.info('Collection indexes initialized successfully.');
  } catch (error) {
    logger.error('Failed to initialize database indexes', error);
  }
};
