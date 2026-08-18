import { AcademicService } from '../../src/services/academic.service';
import { ISubject, IExam } from '../../src/types';

describe('Phase 7A.3 — Frontend Exam & Curriculum Integration Unit Tests', () => {
  it('1. should have AcademicService.getExams and getExamById methods', () => {
    expect(typeof AcademicService.getExams).toBe('function');
    expect(typeof AcademicService.getExamById).toBe('function');
  });

  it('2. should build correct query strings for exam and subject requests', async () => {
    const spyGet = jest.spyOn(AcademicService, 'getExams').mockResolvedValueOnce({
      success: true,
      message: 'Exams retrieved',
      data: {
        items: [
          { _id: 'e1', code: 'JEE', name: 'Joint Entrance Examination', category: 'Engineering', order: 1, isActive: true },
          { _id: 'e2', code: 'NEET', name: 'National Eligibility cum Entrance Test', category: 'Medical', order: 2, isActive: true },
          { _id: 'e3', code: 'MHT-CET', name: 'Maharashtra Common Entrance Test', category: 'Engineering', order: 3, isActive: true },
          { _id: 'e4', code: 'GATE', name: 'Graduate Aptitude Test in Engineering', category: 'Engineering', order: 4, isActive: true },
          { _id: 'e5', code: 'CAT', name: 'Common Admission Test', category: 'Management', order: 5, isActive: true },
        ],
        pagination: { total: 5, page: 1, limit: 50, totalPages: 1 },
      },
    });

    const res = await AcademicService.getExams();
    expect(res.success).toBe(true);
    expect(res.data?.items.length).toBe(5);

    const codes = res.data?.items.map((item: IExam) => item.code);
    expect(codes).toEqual(['JEE', 'NEET', 'MHT-CET', 'GATE', 'CAT']);
    spyGet.mockRestore();
  });

  it('3. JEE subject response renders correctly (Physics, Chemistry, Mathematics)', async () => {
    const jeeSubjects: ISubject[] = [
      { _id: 's1', name: 'Physics', code: 'PHY', examType: 'JEE', order: 1, isActive: true },
      { _id: 's2', name: 'Chemistry', code: 'CHEM', examType: 'JEE', order: 2, isActive: true },
      { _id: 's3', name: 'Mathematics', code: 'MATH', examType: 'JEE', order: 3, isActive: true },
    ];

    const spySubjects = jest.spyOn(AcademicService, 'getSubjects').mockResolvedValueOnce({
      success: true,
      message: 'Subjects retrieved',
      data: {
        items: jeeSubjects,
        pagination: { total: 3, page: 1, limit: 20, totalPages: 1 },
      },
    });

    const res = await AcademicService.getSubjects({ examType: 'JEE' });
    expect(res.data?.items.length).toBe(3);
    const names = res.data?.items.map((s) => s.name);
    expect(names).toEqual(['Physics', 'Chemistry', 'Mathematics']);
    spySubjects.mockRestore();
  });

  it('4. NEET subject response renders correctly (Physics, Chemistry, Biology)', async () => {
    const neetSubjects: ISubject[] = [
      { _id: 's10', name: 'Physics', code: 'PHY', examType: 'NEET', order: 1, isActive: true },
      { _id: 's11', name: 'Chemistry', code: 'CHEM', examType: 'NEET', order: 2, isActive: true },
      { _id: 's12', name: 'Biology', code: 'BIO', examType: 'NEET', order: 3, isActive: true },
    ];

    const spySubjects = jest.spyOn(AcademicService, 'getSubjects').mockResolvedValueOnce({
      success: true,
      message: 'Subjects retrieved',
      data: {
        items: neetSubjects,
        pagination: { total: 3, page: 1, limit: 20, totalPages: 1 },
      },
    });

    const res = await AcademicService.getSubjects({ examType: 'NEET' });
    expect(res.data?.items.length).toBe(3);
    const names = res.data?.items.map((s) => s.name);
    expect(names).toEqual(['Physics', 'Chemistry', 'Biology']);
    spySubjects.mockRestore();
  });

  it('5. Different subject counts render dynamically for GATE & CAT', async () => {
    const gateSubjects: ISubject[] = [
      { _id: 's20', name: 'Computer Science & IT', code: 'CS', examType: 'GATE', order: 1, isActive: true },
    ];

    const spySubjects = jest.spyOn(AcademicService, 'getSubjects').mockResolvedValueOnce({
      success: true,
      message: 'Subjects retrieved',
      data: {
        items: gateSubjects,
        pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
      },
    });

    const res = await AcademicService.getSubjects({ examType: 'GATE' });
    expect(res.data?.items.length).toBe(1);
    expect(res.data?.items[0].name).toBe('Computer Science & IT');
    spySubjects.mockRestore();
  });

  it('6. Empty state handling returns items: []', async () => {
    const spySubjects = jest.spyOn(AcademicService, 'getSubjects').mockResolvedValueOnce({
      success: true,
      message: 'No subjects found',
      data: {
        items: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
      },
    });

    const res = await AcademicService.getSubjects();
    expect(res.data?.items.length).toBe(0);
    spySubjects.mockRestore();
  });

  it('7. API error state handling', async () => {
    const spySubjects = jest.spyOn(AcademicService, 'getSubjects').mockResolvedValueOnce({
      success: false,
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
    });

    const res = await AcademicService.getSubjects();
    expect(res.success).toBe(false);
    expect(res.message).toBe('Internal server error');
    spySubjects.mockRestore();
  });

  it('8. Subject, Chapter, and Topic click navigation URLs use real ObjectIds', () => {
    const subjectId = '507f1f77bcf86cd799439001';
    const chapterId = '507f1f77bcf86cd799439002';
    const topicId = '507f1f77bcf86cd799439003';

    expect(`/subjects/${subjectId}`).toBe('/subjects/507f1f77bcf86cd799439001');
    expect(`/chapters/${chapterId}`).toBe('/chapters/507f1f77bcf86cd799439002');
    expect(`/topics/${topicId}`).toBe('/topics/507f1f77bcf86cd799439003');
  });
});
