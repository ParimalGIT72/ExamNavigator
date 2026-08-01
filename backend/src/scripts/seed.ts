import { connectDatabase, disconnectDatabase } from '../config/db.config';
import { SubjectModel } from '../modules/academic/models/subject.model';
import { ChapterModel } from '../modules/academic/models/chapter.model';
import { TopicModel } from '../modules/academic/models/topic.model';
import { QuestionBankModel } from '../modules/assessment/models/question-bank.model';
import { logger } from '../utils/logger';

export const seedDatabase = async (): Promise<void> => {
  try {
    await connectDatabase();
    logger.info('Seeding initial academic data...');

    await SubjectModel.deleteMany({});
    await ChapterModel.deleteMany({});
    await TopicModel.deleteMany({});
    await QuestionBankModel.deleteMany({});

    // Seed Subjects
    const physics = await SubjectModel.create({
      name: 'Physics',
      code: 'PHY',
      examType: 'JEE',
      description: 'Fundamentals of Mechanics, Electromagnetism, and Modern Physics.',
      order: 1,
    });

    await SubjectModel.create({
      name: 'Chemistry',
      code: 'CHEM',
      examType: 'JEE',
      description: 'Physical, Organic, and Inorganic Chemistry concepts.',
      order: 2,
    });

    await SubjectModel.create({
      name: 'Mathematics',
      code: 'MATH',
      examType: 'JEE',
      description: 'Algebra, Calculus, Coordinate Geometry, and Trigonometry.',
      order: 3,
    });

    // Seed Sample Chapter
    const mechanicsChapter = await ChapterModel.create({
      subjectId: physics._id,
      title: 'Laws of Motion & Dynamics',
      chapterNumber: 1,
      description: 'Newtonian mechanics, friction, and circular motion.',
      weightage: 8,
      estimatedHours: 12,
    });

    // Seed Sample Topic
    const newtonsLawsTopic = await TopicModel.create({
      chapterId: mechanicsChapter._id,
      subjectId: physics._id,
      title: "Newton's First and Second Laws",
      topicNumber: 1,
      summary: 'Inertia, momentum, and rate of change of momentum equations.',
      difficultyLevel: 'Medium',
      importanceScore: 9,
      tags: ['Mechanics', 'Force', 'Newton'],
    });

    // Seed Sample Question
    await QuestionBankModel.create({
      subjectId: physics._id,
      chapterId: mechanicsChapter._id,
      topicId: newtonsLawsTopic._id,
      questionText: 'A body of mass 5 kg is acted upon by a constant force of 20 N. Calculate the acceleration produced in m/s².',
      options: [
        { optionId: 'A', optionText: '2 m/s²', isCorrect: false },
        { optionId: 'B', optionText: '4 m/s²', isCorrect: true, explanation: 'F = m * a => a = 20 / 5 = 4 m/s².' },
        { optionId: 'C', optionText: '5 m/s²', isCorrect: false },
        { optionId: 'D', optionText: '10 m/s²', isCorrect: false },
      ],
      correctOptionId: 'B',
      explanation: 'Using Newton second law F = ma, a = F/m = 20 / 5 = 4 m/s².',
      difficultyLevel: 'Easy',
      questionType: 'SingleChoice',
      examType: 'JEE',
      marks: 4,
      negativeMarks: 1,
    });

    logger.info('Database seeding completed successfully.');
  } catch (error) {
    logger.error('Error during database seeding', error);
  } finally {
    await disconnectDatabase();
  }
};

if (require.main === module) {
  seedDatabase();
}
