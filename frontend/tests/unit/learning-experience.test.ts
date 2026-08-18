import { AcademicService } from '../../src/services/academic.service';
import { IChapter, ITopic, ILearningResource } from '../../src/types';

describe('Phase 7B — Subject / Chapter / Topic Learning Experience Unit Tests', () => {
  it('1. Subject page loads & chapter list renders correctly', async () => {
    const subjectId = '507f1f77bcf86cd799439001';
    const chapters: IChapter[] = [
      { _id: 'c1', subjectId, title: 'Electrostatics', chapterNumber: 1, weightage: 12, estimatedHours: 8, isActive: true, topicCount: 5 },
      { _id: 'c2', subjectId, title: 'Current Electricity', chapterNumber: 2, weightage: 10, estimatedHours: 6, isActive: true, topicCount: 4 },
    ];

    const spyChapters = jest.spyOn(AcademicService, 'getChapters').mockResolvedValueOnce({
      success: true,
      message: 'Chapters retrieved',
      data: {
        items: chapters,
        pagination: { total: 2, page: 1, limit: 10, totalPages: 1 },
      },
    });

    const res = await AcademicService.getChapters(subjectId);
    expect(res.success).toBe(true);
    expect(res.data?.items.length).toBe(2);
    expect(res.data?.items[0].title).toBe('Electrostatics');
    expect(res.data?.items[1].title).toBe('Current Electricity');
    spyChapters.mockRestore();
  });

  it('2. Chapter page loads & topic list renders correctly', async () => {
    const chapterId = '507f1f77bcf86cd799439002';
    const topics: ITopic[] = [
      { _id: 't1', chapterId, subjectId: 's1', title: 'Electric Charge & Coulomb Law', topicNumber: 1, difficultyLevel: 'Easy', summary: 'Charge properties and Coulomb law derivations.', resourceCount: 3 },
      { _id: 't2', chapterId, subjectId: 's1', title: 'Electric Field & Flux', topicNumber: 2, difficultyLevel: 'Medium', summary: 'Field vectors and Gauss law applications.', resourceCount: 4 },
    ];

    const spyTopics = jest.spyOn(AcademicService, 'getTopics').mockResolvedValueOnce({
      success: true,
      message: 'Topics retrieved',
      data: {
        items: topics,
        pagination: { total: 2, page: 1, limit: 10, totalPages: 1 },
      },
    });

    const res = await AcademicService.getTopics(chapterId);
    expect(res.success).toBe(true);
    expect(res.data?.items.length).toBe(2);
    expect(res.data?.items[0].title).toBe('Electric Charge & Coulomb Law');
    expect(res.data?.items[1].difficultyLevel).toBe('Medium');
    spyTopics.mockRestore();
  });

  it('3. Topic page loads & learning resources render correctly', async () => {
    const topicId = '507f1f77bcf86cd799439003';
    const resources: ILearningResource[] = [
      { _id: 'r1', topicId, chapterId: 'c1', subjectId: 's1', title: 'Gauss Law Notes PDF', resourceType: 'PDF', contentUrl: 'https://cdn.example.com/gauss.pdf', author: 'Prof. Sharma' },
      { _id: 'r2', topicId, chapterId: 'c1', subjectId: 's1', title: 'Electric Flux Video Lecture', resourceType: 'Video', contentUrl: 'https://youtube.com/watch?v=12345', author: 'Dr. Verma' },
      { _id: 'r3', topicId, chapterId: 'c1', subjectId: 's1', title: 'Electrostatics Formulas', resourceType: 'FormulaSheet', textContent: 'E = F/q, Phi = E * A * cos(theta)' },
    ];

    const spyResources = jest.spyOn(AcademicService, 'getResources').mockResolvedValueOnce({
      success: true,
      message: 'Resources retrieved',
      data: {
        items: resources,
        pagination: { total: 3, page: 1, limit: 10, totalPages: 1 },
      },
    });

    const res = await AcademicService.getResources(topicId);
    expect(res.success).toBe(true);
    expect(res.data?.items.length).toBe(3);
    expect(res.data?.items[0].resourceType).toBe('PDF');
    expect(res.data?.items[1].resourceType).toBe('Video');
    expect(res.data?.items[2].resourceType).toBe('FormulaSheet');
    spyResources.mockRestore();
  });

  it('4. Resource detail page fetches single resource by ID', async () => {
    const resourceId = '507f1f77bcf86cd799439004';
    const spyResource = jest.spyOn(AcademicService, 'getResourceById').mockResolvedValueOnce({
      success: true,
      message: 'Resource retrieved',
      data: {
        resource: {
          _id: resourceId,
          topicId: 't1',
          chapterId: 'c1',
          subjectId: 's1',
          title: 'Quantum Physics Notes',
          resourceType: 'Text',
          textContent: 'Wave-particle duality notes...',
          author: 'Dr. H.C. Verma',
        },
      },
    });

    const res = await AcademicService.getResourceById(resourceId);
    expect(res.success).toBe(true);
    expect(res.data?.resource.title).toBe('Quantum Physics Notes');
    expect(res.data?.resource.author).toBe('Dr. H.C. Verma');
    expect(res.data?.resource.resourceType).toBe('Text');
    spyResource.mockRestore();
  });

  it('5. Breadcrumb items hierarchy is properly formatted across all 5 levels', () => {
    const subjectName = 'Physics';
    const chapterName = 'Electrostatics';
    const topicName = 'Electric Field';
    const resourceTitle = 'Gauss Law Derivation Notes';

    const items = [
      { label: 'My Subjects', href: '/subjects' },
      { label: subjectName, href: '/subjects/sub123' },
      { label: chapterName, href: '/chapters/chap123' },
      { label: topicName, href: '/topics/top123' },
      { label: resourceTitle },
    ];

    expect(items.length).toBe(5);
    expect(items[0].href).toBe('/subjects');
    expect(items[1].label).toBe('Physics');
    expect(items[2].label).toBe('Electrostatics');
    expect(items[3].label).toBe('Electric Field');
    expect(items[4].label).toBe('Gauss Law Derivation Notes');
    expect(items[4].href).toBeUndefined();
  });

  it('6. Handles empty items array gracefully for chapters, topics, and resources', async () => {
    const spyChapters = jest.spyOn(AcademicService, 'getChapters').mockResolvedValueOnce({
      success: true,
      message: 'No chapters',
      data: { items: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } },
    });

    const res = await AcademicService.getChapters('emptySub');
    expect(res.data?.items.length).toBe(0);
    spyChapters.mockRestore();
  });

  it('7. Handles API error responses gracefully', async () => {
    const spyTopics = jest.spyOn(AcademicService, 'getTopics').mockResolvedValueOnce({
      success: false,
      message: 'Access denied to this curriculum resource.',
      errorCode: 'FORBIDDEN_EXAM_CURRICULUM',
    });

    const res = await AcademicService.getTopics('forbiddenChap');
    expect(res.success).toBe(false);
    expect(res.errorCode).toBe('FORBIDDEN_EXAM_CURRICULUM');
    spyTopics.mockRestore();
  });
});
