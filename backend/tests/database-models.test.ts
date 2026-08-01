import mongoose from 'mongoose';
import { SubjectModel } from '../src/modules/academic/models/subject.model';
import { ChapterModel } from '../src/modules/academic/models/chapter.model';
import { TopicModel } from '../src/modules/academic/models/topic.model';
import { LearningResourceModel } from '../src/modules/academic/models/learning-resource.model';
import { QuestionBankModel } from '../src/modules/assessment/models/question-bank.model';
import { MockTestModel } from '../src/modules/assessment/models/mock-test.model';
import { TestAttemptModel } from '../src/modules/assessment/models/test-attempt.model';
import { AnalyticsModel } from '../src/modules/analytics/models/analytics.model';
import { ChatSessionModel } from '../src/modules/ai/models/chat-session.model';
import { ChatMessageModel } from '../src/modules/ai/models/chat-message.model';
import { EmbeddingModel } from '../src/modules/ai/models/embedding.model';
import { AiNoteModel } from '../src/modules/ai/models/ai-note.model';
import { FlashcardModel } from '../src/modules/ai/models/flashcard.model';
import { StudyPlanModel } from '../src/modules/planner/models/study-plan.model';
import { NotificationModel } from '../src/modules/notification/models/notification.model';
import { AuditLogModel } from '../src/modules/system/models/audit-log.model';

mongoose.set('bufferCommands', false);

describe('Phase 3 - Database Models Verification Suite', () => {
  it('Academic Models - should validate Subject, Chapter, Topic, and LearningResource schemas', () => {
    const subject = new SubjectModel({
      name: 'Physics',
      code: 'PHY',
      examType: 'JEE',
    });
    expect(subject.name).toBe('Physics');
    expect(subject.code).toBe('PHY');

    const chapter = new ChapterModel({
      subjectId: new mongoose.Types.ObjectId(),
      title: 'Laws of Motion',
      chapterNumber: 1,
    });
    expect(chapter.chapterNumber).toBe(1);

    const topic = new TopicModel({
      chapterId: chapter._id,
      subjectId: subject._id,
      title: "Newton's Laws",
      topicNumber: 1,
    });
    expect(topic.difficultyLevel).toBe('Medium');

    const resource = new LearningResourceModel({
      topicId: topic._id,
      chapterId: chapter._id,
      subjectId: subject._id,
      title: 'Mechanics Notes PDF',
      resourceType: 'PDF',
    });
    expect(resource.resourceType).toBe('PDF');
  });

  it('Assessment Models - should validate QuestionBank, MockTest, and TestAttempt schemas', () => {
    const question = new QuestionBankModel({
      subjectId: new mongoose.Types.ObjectId(),
      chapterId: new mongoose.Types.ObjectId(),
      topicId: new mongoose.Types.ObjectId(),
      questionText: 'What is force?',
      options: [{ optionId: 'A', optionText: 'Mass x Acceleration', isCorrect: true }],
      correctOptionId: 'A',
      examType: 'JEE',
    });
    expect(question.marks).toBe(4);

    const mockTest = new MockTestModel({
      title: 'Full JEE Physics Test 1',
      examType: 'JEE',
      totalDurationMinutes: 180,
      totalMarks: 300,
      passingMarks: 120,
      createdBy: new mongoose.Types.ObjectId(),
    });
    expect(mockTest.totalDurationMinutes).toBe(180);

    const attempt = new TestAttemptModel({
      userId: new mongoose.Types.ObjectId(),
      mockTestId: mockTest._id,
      status: 'In_Progress',
    });
    expect(attempt.status).toBe('In_Progress');
  });

  it('AI & RAG Models - should validate ChatSession, ChatMessage, Embedding, AiNote, and Flashcard schemas', () => {
    const session = new ChatSessionModel({
      userId: new mongoose.Types.ObjectId(),
      title: 'Physics Doubts',
    });
    expect(session.status).toBe('Active');

    const message = new ChatMessageModel({
      sessionId: session._id,
      sender: 'User',
      content: 'Explain inertia.',
    });
    expect(message.sender).toBe('User');

    const embedding = new EmbeddingModel({
      resourceId: new mongoose.Types.ObjectId(),
      chunkIndex: 0,
      chunkText: 'Sample text chunk',
      vector: [0.1, 0.2, 0.3],
      dimensions: 768,
    });
    expect(embedding.dimensions).toBe(768);

    const note = new AiNoteModel({
      userId: new mongoose.Types.ObjectId(),
      topicId: new mongoose.Types.ObjectId(),
      title: 'Mechanics Summary',
      content: 'Inertia is property of mass.',
    });
    expect(note.isPinned).toBe(false);

    const flashcard = new FlashcardModel({
      userId: new mongoose.Types.ObjectId(),
      topicId: new mongoose.Types.ObjectId(),
      front: 'F = ?',
      back: 'm * a',
    });
    expect(flashcard.easeFactor).toBe(2.5);
  });

  it('Planner, Analytics, Notification & System Models - should validate remaining database schemas', () => {
    const analytics = new AnalyticsModel({
      userId: new mongoose.Types.ObjectId(),
      readinessScore: 85,
    });
    expect(analytics.readinessScore).toBe(85);

    const plan = new StudyPlanModel({
      userId: new mongoose.Types.ObjectId(),
      title: '90-Day JEE Sprint',
      targetEndDate: new Date(),
    });
    expect(plan.dailyGoalMinutes).toBe(120);

    const notification = new NotificationModel({
      userId: new mongoose.Types.ObjectId(),
      title: 'Test Available',
      message: 'New mock test published.',
      type: 'Test_Result',
    });
    expect(notification.type).toBe('Test_Result');

    const auditLog = new AuditLogModel({
      action: 'USER_LOGIN',
      entity: 'User',
    });
    expect(auditLog.action).toBe('USER_LOGIN');
  });
});
