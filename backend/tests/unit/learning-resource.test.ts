import mongoose from 'mongoose';
import { LearningResourceModel } from '../../src/modules/academic/models/learning-resource.model';
import { LearningResourceService } from '../../src/modules/academic/services/academic.service';

mongoose.set('bufferCommands', false);

describe('Phase 7C.1 — LearningResource Unit Tests', () => {
  const dummyTopicId = new mongoose.Types.ObjectId();
  const dummyChapterId = new mongoose.Types.ObjectId();
  const dummySubjectId = new mongoose.Types.ObjectId();

  describe('LearningResource Model Schema & Enum Validation', () => {
    it('1. should validate LearningResource with resourceType=FormulaSheet', () => {
      const doc = new LearningResourceModel({
        topicId: dummyTopicId,
        chapterId: dummyChapterId,
        subjectId: dummySubjectId,
        title: 'Formula Sheet Sample',
        resourceType: 'FormulaSheet',
        textContent: 'F = m * a',
        order: 1,
        isActive: true,
      });

      const err = doc.validateSync();
      expect(err).toBeUndefined();
      expect(doc.resourceType).toBe('FormulaSheet');
      expect(doc.order).toBe(1);
      expect(doc.isActive).toBe(true);
    });

    it('2. should reject invalid resourceType', () => {
      const doc = new LearningResourceModel({
        topicId: dummyTopicId,
        chapterId: dummyChapterId,
        subjectId: dummySubjectId,
        title: 'Invalid Sample',
        resourceType: 'AudioPodcast' as any,
      });

      const err = doc.validateSync();
      expect(err).toBeDefined();
      expect(err?.errors['resourceType']).toBeDefined();
    });

    it('3. should reject missing required fields', () => {
      const doc = new LearningResourceModel({
        title: 'Incomplete Resource',
      });

      const err = doc.validateSync();
      expect(err).toBeDefined();
      expect(err?.errors['topicId']).toBeDefined();
      expect(err?.errors['resourceType']).toBeDefined();
    });
  });

  describe('LearningResourceService Operations & Active Filtering', () => {
    let service: LearningResourceService;
    const dummyUserId = new mongoose.Types.ObjectId().toString();

    beforeEach(() => {
      service = new LearningResourceService();
      jest.spyOn((service as any).subjectSvc, 'resolveUserTargetExam').mockResolvedValue({
        examId: new mongoose.Types.ObjectId().toString(),
        examCode: 'JEE',
      });
      jest.spyOn((service as any).subjectRepo, 'find').mockResolvedValue([{ _id: dummySubjectId }]);
    });

    it('4. should filter isActive=true for Student role in getResources', async () => {
      const activeRes = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Active Notes',
        resourceType: 'Text',
        order: 1,
        isActive: true,
      };

      const repoSpy = jest.spyOn((service as any).resourceRepo, 'find').mockResolvedValueOnce([activeRes]);
      const countSpy = jest.spyOn((service as any).resourceRepo, 'count').mockResolvedValueOnce(1);

      const result = await service.getResources(
        { topicId: dummyTopicId.toString() },
        { userId: dummyUserId, role: 'Student' }
      );

      expect(result.items.length).toBe(1);
      expect(repoSpy).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true, topicId: dummyTopicId.toString() }),
        expect.anything()
      );

      repoSpy.mockRestore();
      countSpy.mockRestore();
    });

    it('5. should allow Admin role to view all resources including inactive', async () => {
      const inactiveRes = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Draft Notes',
        resourceType: 'Text',
        order: 2,
        isActive: false,
      };

      const repoSpy = jest.spyOn((service as any).resourceRepo, 'find').mockResolvedValueOnce([inactiveRes]);
      const countSpy = jest.spyOn((service as any).resourceRepo, 'count').mockResolvedValueOnce(1);

      const result = await service.getResources(
        { topicId: dummyTopicId.toString() },
        { userId: dummyUserId, role: 'Admin' }
      );

      expect(result.items.length).toBe(1);
      expect(repoSpy).toHaveBeenCalledWith(
        expect.not.objectContaining({ isActive: true }),
        expect.anything()
      );

      repoSpy.mockRestore();
      countSpy.mockRestore();
    });

    it('6. should query resources by resourceType=FormulaSheet', async () => {
      const formulaRes = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Physics Formula Sheet',
        resourceType: 'FormulaSheet',
        order: 1,
        isActive: true,
      };

      const repoSpy = jest.spyOn((service as any).resourceRepo, 'find').mockResolvedValueOnce([formulaRes]);
      const countSpy = jest.spyOn((service as any).resourceRepo, 'count').mockResolvedValueOnce(1);

      const result = await service.getResources(
        { resourceType: 'FormulaSheet' },
        { userId: dummyUserId, role: 'Student' }
      );

      expect(result.items.length).toBe(1);
      expect(result.items[0].resourceType).toBe('FormulaSheet');
      expect(repoSpy).toHaveBeenCalledWith(
        expect.objectContaining({ resourceType: 'FormulaSheet' }),
        expect.anything()
      );

      repoSpy.mockRestore();
      countSpy.mockRestore();
    });
  });

  describe('Exam-Scoped Access Validation for Resources', () => {
    it('7. getResourceById should reject cross-exam access with 403 FORBIDDEN_EXAM_CURRICULUM', async () => {
      const service = new LearningResourceService();

      const neetSubjectId = new mongoose.Types.ObjectId();
      const mockResource = {
        _id: new mongoose.Types.ObjectId(),
        subjectId: neetSubjectId,
        title: 'NEET Biology Resource',
        resourceType: 'Text',
      };

      const mockNeetSubject = {
        _id: neetSubjectId,
        name: 'Biology',
        code: 'NEET_BIO',
        examType: 'NEET',
        examId: new mongoose.Types.ObjectId(),
      };

      jest.spyOn((service as any).resourceRepo, 'findById').mockResolvedValue(mockResource);
      jest.spyOn((service as any).subjectRepo, 'findById').mockResolvedValue(mockNeetSubject);
      jest.spyOn((service as any).subjectSvc, 'resolveUserTargetExam').mockResolvedValue({
        examId: new mongoose.Types.ObjectId().toString(),
        examCode: 'JEE',
      });

      try {
        await service.getResourceById(mockResource._id.toString(), { userId: new mongoose.Types.ObjectId().toString(), role: 'Student' });
        fail('Should have thrown FORBIDDEN_EXAM_CURRICULUM error');
      } catch (err: any) {
        expect(err.statusCode).toBe(403);
        expect(err.errorCode).toBe('FORBIDDEN_EXAM_CURRICULUM');
      }
    });
  });
});
