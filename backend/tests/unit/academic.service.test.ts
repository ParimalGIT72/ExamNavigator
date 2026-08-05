import {
  SubjectService,
  ChapterService,
  TopicService,
  LearningResourceService,
} from '../../src/modules/academic/services/academic.service';
import { AppError } from '../../src/utils/app-error';

describe('Academic Module - Service Unit Tests', () => {
  let mockSubjectRepo: any;
  let mockChapterRepo: any;
  let mockTopicRepo: any;
  let mockResourceRepo: any;

  let subjectService: SubjectService;
  let chapterService: ChapterService;
  let topicService: TopicService;
  let resourceService: LearningResourceService;

  beforeEach(() => {
    mockSubjectRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findByCode: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
    };

    mockChapterRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findBySubjectIdAndNumber: jest.fn(),
      findBySubjectId: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
    };

    mockTopicRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByChapterIdAndNumber: jest.fn(),
      findByChapterId: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
    };

    mockResourceRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByTopicId: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
    };

    subjectService = new SubjectService(mockSubjectRepo, mockChapterRepo);
    chapterService = new ChapterService(mockChapterRepo, mockSubjectRepo, mockTopicRepo);
    topicService = new TopicService(mockTopicRepo, mockChapterRepo, mockSubjectRepo, mockResourceRepo);
    resourceService = new LearningResourceService(mockResourceRepo, mockTopicRepo, mockChapterRepo, mockSubjectRepo);
  });

  describe('SubjectService', () => {
    it('should create a subject successfully when name and code are unique', async () => {
      mockSubjectRepo.findByName.mockResolvedValue(null);
      mockSubjectRepo.findByCode.mockResolvedValue(null);
      mockSubjectRepo.create.mockResolvedValue({ _id: 'subj1', name: 'Physics', code: 'PHY' });

      const result = await subjectService.createSubject({ name: 'Physics', code: 'PHY' } as any);
      expect(result.name).toBe('Physics');
      expect(mockSubjectRepo.create).toHaveBeenCalledWith({ name: 'Physics', code: 'PHY' });
    });

    it('should throw 409 if subject name already exists', async () => {
      mockSubjectRepo.findByName.mockResolvedValue({ _id: 'subj1', name: 'Physics' });

      await expect(subjectService.createSubject({ name: 'Physics', code: 'PHY' } as any)).rejects.toThrow(AppError);
    });

    it('should get subject by ID or throw 404', async () => {
      mockSubjectRepo.findById.mockResolvedValue({ _id: 'subj1', name: 'Physics' });
      const found = await subjectService.getSubjectById('subj1');
      expect(found.name).toBe('Physics');

      mockSubjectRepo.findById.mockResolvedValue(null);
      await expect(subjectService.getSubjectById('invalid')).rejects.toThrow(AppError);
    });

    it('should return paginated list of subjects', async () => {
      mockSubjectRepo.find.mockResolvedValue([{ name: 'Physics' }]);
      mockSubjectRepo.count.mockResolvedValue(1);

      const result = await subjectService.getSubjects({ page: 1, limit: 10 });
      expect(result.items.length).toBe(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should prevent subject deletion if chapters exist', async () => {
      mockSubjectRepo.findById.mockResolvedValue({ _id: 'subj1' });
      mockChapterRepo.find.mockResolvedValue([{ _id: 'chap1' }]);

      await expect(subjectService.deleteSubject('subj1')).rejects.toThrow(AppError);
    });
  });

  describe('ChapterService', () => {
    it('should create chapter when subject exists and number is unique', async () => {
      mockSubjectRepo.findById.mockResolvedValue({ _id: '507f1f77bcf86cd799439011' });
      mockChapterRepo.findBySubjectIdAndNumber.mockResolvedValue(null);
      mockChapterRepo.create.mockResolvedValue({ _id: 'chap1', title: 'Kinematics', chapterNumber: 1 });

      const result = await chapterService.createChapter({
        subjectId: '507f1f77bcf86cd799439011' as any,
        title: 'Kinematics',
        chapterNumber: 1,
      });
      expect(result.title).toBe('Kinematics');
    });

    it('should throw 404 when creating chapter for non-existent subject', async () => {
      mockSubjectRepo.findById.mockResolvedValue(null);
      await expect(
        chapterService.createChapter({
          subjectId: '507f1f77bcf86cd799439011' as any,
          title: 'Kinematics',
          chapterNumber: 1,
        })
      ).rejects.toThrow(AppError);
    });

    it('should prevent chapter deletion if topics exist', async () => {
      mockChapterRepo.findById.mockResolvedValue({ _id: 'chap1' });
      mockTopicRepo.find.mockResolvedValue([{ _id: 'top1' }]);

      await expect(chapterService.deleteChapter('chap1')).rejects.toThrow(AppError);
    });
  });

  describe('TopicService', () => {
    it('should create topic when parent chapter and subject exist', async () => {
      mockChapterRepo.findById.mockResolvedValue({ _id: 'chap1' });
      mockSubjectRepo.findById.mockResolvedValue({ _id: 'subj1' });
      mockTopicRepo.findByChapterIdAndNumber.mockResolvedValue(null);
      mockTopicRepo.create.mockResolvedValue({ _id: 'top1', title: 'Velocity' });

      const result = await topicService.createTopic({
        chapterId: 'chap1' as any,
        subjectId: 'subj1' as any,
        title: 'Velocity',
        topicNumber: 1,
      });
      expect(result.title).toBe('Velocity');
    });

    it('should prevent topic deletion if learning resources exist', async () => {
      mockTopicRepo.findById.mockResolvedValue({ _id: 'top1' });
      mockResourceRepo.find.mockResolvedValue([{ _id: 'res1' }]);

      await expect(topicService.deleteTopic('top1')).rejects.toThrow(AppError);
    });
  });

  describe('LearningResourceService', () => {
    it('should create learning resource when topic, chapter, and subject exist', async () => {
      mockTopicRepo.findById.mockResolvedValue({ _id: 'top1' });
      mockChapterRepo.findById.mockResolvedValue({ _id: 'chap1' });
      mockSubjectRepo.findById.mockResolvedValue({ _id: 'subj1' });
      mockResourceRepo.create.mockResolvedValue({ _id: 'res1', title: 'Notes PDF' });

      const result = await resourceService.createResource({
        topicId: 'top1' as any,
        chapterId: 'chap1' as any,
        subjectId: 'subj1' as any,
        title: 'Notes PDF',
        resourceType: 'PDF',
      });
      expect(result.title).toBe('Notes PDF');
    });
  });
});
