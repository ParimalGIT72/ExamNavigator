import mongoose from 'mongoose';
import { ExamModel } from '../../src/modules/academic/models/exam.model';
import { SubjectModel } from '../../src/modules/academic/models/subject.model';
import { ChapterModel } from '../../src/modules/academic/models/chapter.model';
import { TopicModel } from '../../src/modules/academic/models/topic.model';
import { LearningResourceModel } from '../../src/modules/academic/models/learning-resource.model';
import { ExamRepository } from '../../src/modules/academic/repositories/exam.repository';
import { SubjectService } from '../../src/modules/academic/services/academic.service';
import { seedExams } from '../../src/modules/academic/utils/exam-seed';

mongoose.set('bufferCommands', false);

describe('Phase 7A.1 — Exam Model & Exam-Scoped Curriculum Unit Tests', () => {
  describe('Exam Model Schema Validation', () => {
    it('should validate Exam document instantiation with required fields', () => {
      const exam = new ExamModel({
        code: 'GATE',
        name: 'Graduate Aptitude Test in Engineering',
        category: 'Engineering',
        description: 'PG Engineering exam',
        order: 1,
        isActive: true,
      });

      expect(exam.code).toBe('GATE');
      expect(exam.name).toBe('Graduate Aptitude Test in Engineering');
      expect(exam.category).toBe('Engineering');
      expect(exam.isActive).toBe(true);
    });

    it('should reject validation when required fields are missing', () => {
      const invalidExam = new ExamModel({
        description: 'Missing code and name',
      });

      const err = invalidExam.validateSync();
      expect(err).toBeDefined();
      expect(err?.errors['code']).toBeDefined();
      expect(err?.errors['name']).toBeDefined();
    });
  });

  describe('ExamRepository Service Unit Operations', () => {
    let repo: ExamRepository;

    beforeEach(() => {
      repo = new ExamRepository();
    });

    it('should create Exam using ExamModel', async () => {
      const spySave = jest.spyOn(ExamModel.prototype, 'save').mockResolvedValueOnce({
        _id: new mongoose.Types.ObjectId(),
        code: 'GATE',
        name: 'Graduate Aptitude Test in Engineering',
        category: 'Engineering',
      } as any);

      const result = await repo.create({
        code: 'GATE',
        name: 'Graduate Aptitude Test in Engineering',
        category: 'Engineering',
      });

      expect(spySave).toHaveBeenCalled();
      expect(result.code).toBe('GATE');
      spySave.mockRestore();
    });
  });

  describe('Idempotent Seed Logic', () => {
    it('should invoke findOneAndUpdate with upsert option for all initial exams', async () => {
      const spyUpsert = jest.spyOn(ExamModel, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockImplementation(function (this: any) {
          return Promise.resolve({
            _id: new mongoose.Types.ObjectId(),
            code: 'JEE',
          });
        }),
      } as any);

      const seeded = await seedExams();
      expect(spyUpsert).toHaveBeenCalledTimes(5);
      expect(seeded.length).toBe(5);

      spyUpsert.mockRestore();
    });
  });

  describe('Exam-Scoped Subject Uniqueness Logic', () => {
    let mockSubjectRepo: any;
    let mockChapterRepo: any;
    let subjectService: SubjectService;

    beforeEach(() => {
      mockSubjectRepo = {
        create: jest.fn(),
        findById: jest.fn(),
        findByName: jest.fn(),
        findByCode: jest.fn(),
        findByNameAndExam: jest.fn(),
        findByCodeAndExam: jest.fn(),
        find: jest.fn(),
        count: jest.fn(),
        updateById: jest.fn(),
        deleteById: jest.fn(),
      };
      mockChapterRepo = {};
      subjectService = new SubjectService(mockSubjectRepo, mockChapterRepo);
    });

    it('should pass uniqueness validation for subjects with same code under DIFFERENT exams', async () => {
      mockSubjectRepo.findByNameAndExam.mockResolvedValue(null);
      mockSubjectRepo.findByCodeAndExam.mockResolvedValue(null);
      mockSubjectRepo.create.mockImplementation(async (data: any) => ({
        _id: new mongoose.Types.ObjectId(),
        ...data,
      }));

      const jeeExamId = new mongoose.Types.ObjectId();
      const neetExamId = new mongoose.Types.ObjectId();

      const jeePhysics = await subjectService.createSubject({
        examId: jeeExamId,
        examType: 'JEE',
        name: 'Physics',
        code: 'PHY',
      });

      const neetPhysics = await subjectService.createSubject({
        examId: neetExamId,
        examType: 'NEET',
        name: 'Physics',
        code: 'PHY',
      });

      expect(jeePhysics.examId).toBe(jeeExamId);
      expect(neetPhysics.examId).toBe(neetExamId);
      expect(mockSubjectRepo.findByCodeAndExam).toHaveBeenCalledWith('PHY', jeeExamId.toString());
      expect(mockSubjectRepo.findByCodeAndExam).toHaveBeenCalledWith('PHY', neetExamId.toString());
    });

    it('should throw AppError 409 if duplicate subject code exists within the SAME exam', async () => {
      const jeeExamId = new mongoose.Types.ObjectId();
      mockSubjectRepo.findByNameAndExam.mockResolvedValue(null);
      mockSubjectRepo.findByCodeAndExam.mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        code: 'PHY',
        examId: jeeExamId,
      });

      await expect(
        subjectService.createSubject({
          examId: jeeExamId,
          examType: 'JEE',
          name: 'Physics 2',
          code: 'PHY',
        })
      ).rejects.toThrow("Subject with code 'PHY' already exists.");
    });
  });

  describe('Curriculum Hierarchy Structure Integrity', () => {
    it('should validate complete Exam -> Subject -> Chapter -> Topic -> Resource schema definitions', () => {
      const examId = new mongoose.Types.ObjectId();
      const subjectId = new mongoose.Types.ObjectId();
      const chapterId = new mongoose.Types.ObjectId();
      const topicId = new mongoose.Types.ObjectId();

      const subject = new SubjectModel({
        _id: subjectId,
        examId,
        name: 'Quantitative Aptitude',
        code: 'QA',
        examType: 'CAT',
      });

      const chapter = new ChapterModel({
        _id: chapterId,
        subjectId,
        title: 'Number Systems',
        chapterNumber: 1,
      });

      const topic = new TopicModel({
        _id: topicId,
        subjectId,
        chapterId,
        title: 'Divisibility Rules',
        topicNumber: 1,
      });

      const resource = new LearningResourceModel({
        subjectId,
        chapterId,
        topicId,
        title: 'Formula Sheet',
        resourceType: 'FormulaSheet',
      });

      expect(subject.examId?.toString()).toBe(examId.toString());
      expect(chapter.subjectId.toString()).toBe(subjectId.toString());
      expect(topic.chapterId.toString()).toBe(chapterId.toString());
      expect(resource.topicId.toString()).toBe(topicId.toString());
    });
  });
});
