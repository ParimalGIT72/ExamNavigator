import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../../src/app';
import { envConfig } from '../../src/config/env.config';
import { examRepository } from '../../src/modules/academic/repositories/exam.repository';
import { subjectRepository } from '../../src/modules/academic/repositories/academic.repository';
import { userProfileRepository } from '../../src/modules/user/repositories/user-profile.repository';
import { ExamModel } from '../../src/modules/academic/models/exam.model';

mongoose.set('bufferCommands', false);

describe('Phase 7A.2 — Exam APIs & Server-Side Exam Scoping Integration Tests', () => {
  const jeeUserId = '507f1f77bcf86cd799439101';
  const neetUserId = '507f1f77bcf86cd799439102';
  const mhtUserId = '507f1f77bcf86cd799439103';
  const gateUserId = '507f1f77bcf86cd799439104';
  const catUserId = '507f1f77bcf86cd799439105';
  const adminUserId = '507f1f77bcf86cd799439199';

  const jeeToken = jwt.sign(
    { userId: jeeUserId, email: 'jee.student@examnavigator.com', role: 'Student' },
    envConfig.jwtSecret
  );

  const neetToken = jwt.sign(
    { userId: neetUserId, email: 'neet.student@examnavigator.com', role: 'Student' },
    envConfig.jwtSecret
  );

  const mhtToken = jwt.sign(
    { userId: mhtUserId, email: 'mht.student@examnavigator.com', role: 'Student' },
    envConfig.jwtSecret
  );

  const gateToken = jwt.sign(
    { userId: gateUserId, email: 'gate.student@examnavigator.com', role: 'Student' },
    envConfig.jwtSecret
  );

  const catToken = jwt.sign(
    { userId: catUserId, email: 'cat.student@examnavigator.com', role: 'Student' },
    envConfig.jwtSecret
  );

  const adminToken = jwt.sign(
    { userId: adminUserId, email: 'admin@examnavigator.com', role: 'Admin' },
    envConfig.jwtSecret
  );

  const jeeExamId = '507f1f77bcf86cd799439201';
  const neetExamId = '507f1f77bcf86cd799439202';
  const gateExamId = '507f1f77bcf86cd799439203';
  const catExamId = '507f1f77bcf86cd799439204';
  const mhtExamId = '507f1f77bcf86cd799439205';

  const jeeSubjectId = '507f1f77bcf86cd799439301';
  const neetSubjectId = '507f1f77bcf86cd799439302';
  const gateSubjectId = '507f1f77bcf86cd799439303';
  const catSubjectId = '507f1f77bcf86cd799439304';
  const mhtSubjectId = '507f1f77bcf86cd799439305';

  const mockExams: any[] = [
    {
      _id: jeeExamId,
      code: 'JEE',
      name: 'Joint Entrance Examination',
      category: 'Engineering',
      order: 1,
      isActive: true,
    },
    {
      _id: neetExamId,
      code: 'NEET',
      name: 'National Eligibility cum Entrance Test',
      category: 'Medical',
      order: 2,
      isActive: true,
    },
    {
      _id: gateExamId,
      code: 'GATE',
      name: 'Graduate Aptitude Test in Engineering',
      category: 'Engineering',
      order: 3,
      isActive: true,
    },
    {
      _id: catExamId,
      code: 'CAT',
      name: 'Common Admission Test',
      category: 'Management',
      order: 4,
      isActive: true,
    },
    {
      _id: mhtExamId,
      code: 'MHT-CET',
      name: 'Maharashtra Common Entrance Test',
      category: 'Engineering',
      order: 5,
      isActive: true,
    },
    {
      _id: '507f1f77bcf86cd799439299',
      code: 'INACTIVE-EXAM',
      name: 'Inactive Test Exam',
      category: 'General',
      order: 99,
      isActive: false,
    },
  ];

  const mockSubjects: any[] = [
    {
      _id: jeeSubjectId,
      examId: jeeExamId,
      examType: 'JEE',
      name: 'JEE Physics',
      code: 'JEE_PHY',
      isActive: true,
    },
    {
      _id: neetSubjectId,
      examId: neetExamId,
      examType: 'NEET',
      name: 'NEET Biology',
      code: 'NEET_BIO',
      isActive: true,
    },
    {
      _id: gateSubjectId,
      examId: gateExamId,
      examType: 'GATE',
      name: 'Computer Science',
      code: 'GATE_CS',
      isActive: true,
    },
    {
      _id: catSubjectId,
      examId: catExamId,
      examType: 'CAT',
      name: 'Quantitative Aptitude',
      code: 'CAT_QA',
      isActive: true,
    },
    {
      _id: mhtSubjectId,
      examId: mhtExamId,
      examType: 'MHT-CET',
      name: 'MHT Mathematics',
      code: 'MHT_MATH',
      isActive: true,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(ExamModel, 'findOne').mockImplementation((filter: any) => {
      const code = filter?.code;
      const match = mockExams.find((e) => e.code.toUpperCase() === (code || '').toUpperCase() && e.isActive);
      return {
        exec: jest.fn().mockResolvedValue(match || null),
      } as any;
    });

    // Mock Exam Repository Spies
    jest.spyOn(examRepository, 'find').mockImplementation(async (filter: any) => {
      let filtered = [...mockExams];
      if (filter && filter.isActive !== undefined) {
        filtered = filtered.filter((e) => e.isActive === filter.isActive);
      }
      return filtered;
    });

    jest.spyOn(examRepository, 'findById').mockImplementation(async (id: string) => {
      return mockExams.find((e) => e._id === id) || null;
    });

    jest.spyOn(examRepository, 'findByCode').mockImplementation(async (code: string) => {
      return mockExams.find((e) => e.code.toUpperCase() === code.toUpperCase()) || null;
    });

    jest.spyOn(examRepository, 'count').mockImplementation(async (filter: any) => {
      const activeOnly = filter && filter.isActive;
      return activeOnly ? mockExams.filter((e) => e.isActive).length : mockExams.length;
    });

    jest.spyOn(examRepository, 'create').mockImplementation(async (data: any) => ({
      _id: '507f1f77bcf86cd799439288',
      order: 10,
      isActive: true,
      ...data,
    }));

    jest.spyOn(examRepository, 'updateById').mockImplementation(async (id: string, update: any) => {
      const exam = mockExams.find((e) => e._id === id);
      return exam ? { ...exam, ...update } : null;
    });

    jest.spyOn(examRepository, 'deleteById').mockResolvedValue(true);

    // Mock User Profile Spies
    jest.spyOn(userProfileRepository, 'findByUserId').mockImplementation(async (userId: string) => {
      const examMap: Record<string, string> = {
        [jeeUserId]: 'JEE',
        [neetUserId]: 'NEET',
        [mhtUserId]: 'MHT-CET',
        [gateUserId]: 'GATE',
        [catUserId]: 'CAT',
      };
      const targetExam = examMap[userId] || 'JEE';
      return { userId, targetExam } as any;
    });

    // Mock Subject Repository Spies
    jest.spyOn(subjectRepository, 'find').mockImplementation(async (filter: any) => {
      let results = [...mockSubjects];
      if (filter.$or) {
        const examIdClause = filter.$or.find((c: any) => c.examId)?.examId;
        const examTypeClause = filter.$or.find((c: any) => c.examType)?.examType;
        results = results.filter(
          (s) => s.examId === examIdClause || s.examType.toUpperCase() === (examTypeClause || '').toUpperCase()
        );
      } else if (filter.examType) {
        results = results.filter((s) => s.examType.toUpperCase() === filter.examType.toUpperCase());
      }
      return results;
    });

    jest.spyOn(subjectRepository, 'count').mockImplementation(async (filter: any) => {
      let results = [...mockSubjects];
      if (filter.$or) {
        const examIdClause = filter.$or.find((c: any) => c.examId)?.examId;
        const examTypeClause = filter.$or.find((c: any) => c.examType)?.examType;
        results = results.filter(
          (s) => s.examId === examIdClause || s.examType.toUpperCase() === (examTypeClause || '').toUpperCase()
        );
      }
      return results.length;
    });

    jest.spyOn(subjectRepository, 'findById').mockImplementation(async (id: string) => {
      return mockSubjects.find((s) => s._id === id) || null;
    });
  });

  describe('Exam API Endpoints (GET /api/v1/exams)', () => {
    it('GET /api/v1/exams should return active registered exams for authenticated student', async () => {
      const res = await request(app)
        .get('/api/v1/exams')
        .set('Authorization', `Bearer ${jeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(5);
      const codes = res.body.data.map((e: any) => e.code);
      expect(codes).toContain('JEE');
      expect(codes).toContain('NEET');
      expect(codes).not.toContain('INACTIVE-EXAM');
    });

    it('GET /api/v1/exams/:examId should return a single exam details', async () => {
      const res = await request(app)
        .get(`/api/v1/exams/${jeeExamId}`)
        .set('Authorization', `Bearer ${jeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe('JEE');
    });

    it('GET /api/v1/exams/invalid-id should return 400 for invalid ObjectId format', async () => {
      const res = await request(app)
        .get('/api/v1/exams/invalid-id')
        .set('Authorization', `Bearer ${jeeToken}`);

      expect(res.status).toBe(400);
    });
  });

  describe('Admin Exam Operations & Authorization', () => {
    it('POST /api/v1/admin/exams should return 403 Forbidden for Student role', async () => {
      const res = await request(app)
        .post('/api/v1/admin/exams')
        .set('Authorization', `Bearer ${jeeToken}`)
        .send({
          code: 'UPSC',
          name: 'Union Public Service Commission',
          category: 'General',
        });

      expect(res.status).toBe(403);
    });

    it('POST /api/v1/admin/exams should return 401 Unauthorized when unauthenticated', async () => {
      const res = await request(app)
        .post('/api/v1/admin/exams')
        .send({
          code: 'UPSC',
          name: 'Union Public Service Commission',
          category: 'General',
        });

      expect(res.status).toBe(401);
    });

    it('POST /api/v1/admin/exams should create exam for Admin role', async () => {
      const res = await request(app)
        .post('/api/v1/admin/exams')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'UPSC',
          name: 'Union Public Service Commission',
          category: 'General',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe('UPSC');
    });
  });

  describe('Server-Side Student Exam Scoping', () => {
    it('JEE student should only receive JEE subjects', async () => {
      const res = await request(app)
        .get('/api/v1/subjects')
        .set('Authorization', `Bearer ${jeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].code).toBe('JEE_PHY');
    });

    it('NEET student should only receive NEET subjects', async () => {
      const res = await request(app)
        .get('/api/v1/subjects')
        .set('Authorization', `Bearer ${neetToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].code).toBe('NEET_BIO');
    });

    it('MHT-CET student should only receive MHT-CET subjects', async () => {
      const res = await request(app)
        .get('/api/v1/subjects')
        .set('Authorization', `Bearer ${mhtToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].code).toBe('MHT_MATH');
    });

    it('GATE student should only receive GATE subjects', async () => {
      const res = await request(app)
        .get('/api/v1/subjects')
        .set('Authorization', `Bearer ${gateToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].code).toBe('GATE_CS');
    });

    it('CAT student should only receive CAT subjects', async () => {
      const res = await request(app)
        .get('/api/v1/subjects')
        .set('Authorization', `Bearer ${catToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].code).toBe('CAT_QA');
    });

    it('SECURITY CHECK: JEE student requesting ?examType=NEET MUST NOT receive NEET subjects', async () => {
      const res = await request(app)
        .get('/api/v1/subjects?examType=NEET')
        .set('Authorization', `Bearer ${jeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].code).toBe('JEE_PHY');
      expect(res.body.data.items[0].code).not.toBe('NEET_BIO');
    });

    it('DIRECT RESOURCE ACCESS: JEE student accessing NEET subject ID directly must receive 403 Forbidden', async () => {
      const res = await request(app)
        .get(`/api/v1/subjects/${neetSubjectId}`)
        .set('Authorization', `Bearer ${jeeToken}`);

      expect(res.status).toBe(403);
      expect(res.body.errorCode).toBe('FORBIDDEN_EXAM_CURRICULUM');
    });

    it('JEE student accessing own JEE subject ID directly must succeed with 200 OK', async () => {
      const res = await request(app)
        .get(`/api/v1/subjects/${jeeSubjectId}`)
        .set('Authorization', `Bearer ${jeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.code).toBe('JEE_PHY');
    });
  });
});
