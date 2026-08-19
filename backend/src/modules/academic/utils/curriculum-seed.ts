import { ExamModel } from '../models/exam.model';
import { SubjectModel } from '../models/subject.model';
import { ChapterModel } from '../models/chapter.model';
import { TopicModel } from '../models/topic.model';
import { LearningResourceModel } from '../models/learning-resource.model';
import { seedExams } from './exam-seed';

/**
 * Idempotent seed function for minimal development curriculum dataset.
 * Populates a small sample dataset under JEE Physics for testing Quick Revision, Formula Sheets, and Study Resources.
 */
export async function seedCurriculumData() {
  await seedExams();

  const jeeExam = await ExamModel.findOne({ code: 'JEE' }).exec();
  if (!jeeExam) {
    throw new Error('JEE exam must be present before seeding curriculum.');
  }

  // 1. Seed Subject: Physics
  const subject = await SubjectModel.findOneAndUpdate(
    { code: 'JEE_PHY' },
    {
      $set: {
        examId: jeeExam._id,
        examType: 'JEE',
        name: 'Physics',
        code: 'JEE_PHY',
        description: 'Comprehensive physics syllabus covering mechanics, electrodynamics, optics, and modern physics.',
        order: 1,
        isActive: true,
      },
    },
    { upsert: true, new: true, runValidators: true }
  ).exec();

  // 2. Seed Chapter: Electrostatics
  const chapter = await ChapterModel.findOneAndUpdate(
    { subjectId: subject._id, chapterNumber: 1 },
    {
      $set: {
        subjectId: subject._id,
        title: 'Electrostatics',
        chapterNumber: 1,
        description: 'Fundamental principles of electric charges, Coulomb law, electric field, flux, and Gauss law.',
        weightage: 12,
        estimatedHours: 8,
        isActive: true,
      },
    },
    { upsert: true, new: true, runValidators: true }
  ).exec();

  // 3. Seed Topic 1: Electric Charges & Coulomb Law
  const topic1 = await TopicModel.findOneAndUpdate(
    { chapterId: chapter._id, topicNumber: 1 },
    {
      $set: {
        chapterId: chapter._id,
        subjectId: subject._id,
        title: 'Electric Charges & Coulomb Law',
        topicNumber: 1,
        summary: 'Properties of charge, charge quantization, conservation of charge, and Coulomb law vector form.',
        difficultyLevel: 'Easy',
        importanceScore: 8,
        tags: ['charge', 'coulomb-law', 'electrostatics'],
      },
    },
    { upsert: true, new: true, runValidators: true }
  ).exec();

  // 4. Seed Topic 2: Electric Field & Flux
  const topic2 = await TopicModel.findOneAndUpdate(
    { chapterId: chapter._id, topicNumber: 2 },
    {
      $set: {
        chapterId: chapter._id,
        subjectId: subject._id,
        title: 'Electric Field & Flux',
        topicNumber: 2,
        summary: 'Electric field lines, dipole moment, electric flux, and Gauss law applications.',
        difficultyLevel: 'Medium',
        importanceScore: 9,
        tags: ['electric-field', 'gauss-law', 'flux'],
      },
    },
    { upsert: true, new: true, runValidators: true }
  ).exec();

  // 5. Seed Resources under Topic 1
  await LearningResourceModel.findOneAndUpdate(
    { topicId: topic1._id, title: 'Electrostatics Formula Sheet' },
    {
      $set: {
        topicId: topic1._id,
        chapterId: chapter._id,
        subjectId: subject._id,
        title: 'Electrostatics Formula Sheet',
        resourceType: 'FormulaSheet',
        textContent: '1. Coulomb Law: F = (1 / 4*pi*eps0) * (q1 * q2 / r^2)\n2. Electric Field: E = F / q0\n3. Dipole Moment: p = q * 2a',
        author: 'ExamNavigator Physics Faculty',
        order: 1,
        isActive: true,
      },
    },
    { upsert: true, new: true, runValidators: true }
  ).exec();

  await LearningResourceModel.findOneAndUpdate(
    { topicId: topic1._id, title: 'Electric Charges Concept Notes' },
    {
      $set: {
        topicId: topic1._id,
        chapterId: chapter._id,
        subjectId: subject._id,
        title: 'Electric Charges Concept Notes',
        resourceType: 'Text',
        textContent: 'Electric charge is an intrinsic property of elementary particles. Quantization of charge: Q = n*e.',
        author: 'ExamNavigator Physics Faculty',
        order: 2,
        isActive: true,
      },
    },
    { upsert: true, new: true, runValidators: true }
  ).exec();

  // 6. Seed Resource under Topic 2
  await LearningResourceModel.findOneAndUpdate(
    { topicId: topic2._id, title: 'Electric Field & Gauss Law Quick Formula Sheet' },
    {
      $set: {
        topicId: topic2._id,
        chapterId: chapter._id,
        subjectId: subject._id,
        title: 'Electric Field & Gauss Law Quick Formula Sheet',
        resourceType: 'FormulaSheet',
        textContent: '1. Gauss Law: Integral(E . dA) = Q_enclosed / eps0\n2. Field of point charge: E = k * q / r^2\n3. Field inside conductor: E = 0',
        author: 'ExamNavigator Physics Faculty',
        order: 1,
        isActive: true,
      },
    },
    { upsert: true, new: true, runValidators: true }
  ).exec();

  return { subject, chapter, topic1, topic2 };
}
