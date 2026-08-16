import { AcademicService } from '../../src/services/academic.service';

describe('AcademicService Unit Tests', () => {
  it('should have all subject service methods', () => {
    expect(typeof AcademicService.getSubjects).toBe('function');
    expect(typeof AcademicService.getSubjectById).toBe('function');
    expect(typeof AcademicService.createSubject).toBe('function');
    expect(typeof AcademicService.updateSubject).toBe('function');
    expect(typeof AcademicService.deleteSubject).toBe('function');
  });

  it('should have all chapter service methods', () => {
    expect(typeof AcademicService.getChapters).toBe('function');
    expect(typeof AcademicService.getChapterById).toBe('function');
    expect(typeof AcademicService.createChapter).toBe('function');
    expect(typeof AcademicService.updateChapter).toBe('function');
    expect(typeof AcademicService.deleteChapter).toBe('function');
  });

  it('should have all topic service methods', () => {
    expect(typeof AcademicService.getTopics).toBe('function');
    expect(typeof AcademicService.getTopicById).toBe('function');
    expect(typeof AcademicService.createTopic).toBe('function');
    expect(typeof AcademicService.updateTopic).toBe('function');
    expect(typeof AcademicService.deleteTopic).toBe('function');
  });

  it('should have all learning resource service methods', () => {
    expect(typeof AcademicService.getResources).toBe('function');
    expect(typeof AcademicService.getResourceById).toBe('function');
    expect(typeof AcademicService.createResource).toBe('function');
    expect(typeof AcademicService.updateResource).toBe('function');
    expect(typeof AcademicService.deleteResource).toBe('function');
  });
});
