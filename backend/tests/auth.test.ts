import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { userRepository } from '../src/modules/user/repositories/user.repository';
import { userProfileRepository } from '../src/modules/user/repositories/user-profile.repository';

// Disable Mongoose buffering during unit tests without live DB
mongoose.set('bufferCommands', false);

describe('Authentication Module Integration Tests', () => {
  const testUser = {
    fullName: 'Test Student',
    email: 'student.test@examnavigator.com',
    password: 'Password123!',
    targetExam: 'JEE',
  };

  let createdUserId = '660f1b2c3d4e5f6a7b8c9d0e';
  let mockHashedPassword = '';

  beforeAll(async () => {
    const bcrypt = require('bcrypt');
    mockHashedPassword = await bcrypt.hash(testUser.password, 10);
  });

  beforeEach(() => {
    const mockUserDoc: any = {
      _id: createdUserId,
      fullName: testUser.fullName,
      email: testUser.email,
      password: mockHashedPassword,
      role: 'Student',
      accountStatus: 'Active',
      emailVerified: false,
      verificationToken: 'valid_verify_token',
      resetPasswordToken: 'valid_reset_token',
      resetPasswordExpires: new Date(Date.now() + 3600000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(userRepository, 'findByEmail').mockImplementation(async (email: string) => {
      if (email.toLowerCase() === testUser.email.toLowerCase()) {
        return mockUserDoc;
      }
      return null;
    });

    jest.spyOn(userRepository, 'findById').mockImplementation(async (id: string) => {
      if (id === createdUserId) return mockUserDoc;
      return null;
    });

    jest.spyOn(userRepository, 'findByVerificationToken').mockImplementation(async (token: string) => {
      if (token === 'valid_verify_token') return mockUserDoc;
      return null;
    });

    jest.spyOn(userRepository, 'findByResetToken').mockImplementation(async (token: string) => {
      if (token === 'valid_reset_token') return mockUserDoc;
      return null;
    });

    jest.spyOn(userRepository, 'create').mockImplementation(async (data: any) => {
      return {
        ...mockUserDoc,
        ...data,
        _id: createdUserId,
      };
    });

    jest.spyOn(userRepository, 'updateById').mockImplementation(async (id: string, update: any) => {
      return {
        ...mockUserDoc,
        ...update,
        _id: id,
      };
    });

    jest.spyOn(userProfileRepository, 'create').mockImplementation(async (data: any) => {
      return {
        _id: '660f1b2c3d4e5f6a7b8c9d0f',
        userId: data.userId,
        targetExam: data.targetExam || 'JEE',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
    });

    jest.spyOn(userProfileRepository, 'findByUserId').mockImplementation(async (userId: string) => {
      return {
        _id: '660f1b2c3d4e5f6a7b8c9d0f',
        userId,
        targetExam: 'JEE',
      } as any;
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('POST /api/v1/auth/register - should register a new student', async () => {
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);

    const res = await request(app).post('/api/v1/auth/register').send({
      fullName: 'New Student',
      email: 'new.student@examnavigator.com',
      password: 'Password123!',
      targetExam: 'NEET',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Registration successful');
  });

  it('POST /api/v1/auth/login - should authenticate student and return access token', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it('POST /api/v1/auth/login - should reject invalid credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword123!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('AUTH_INVALID_CREDENTIALS');
  });

  it('GET /api/v1/auth/me - should reject unauthenticated requests', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/auth/me - should return user profile for valid JWT token', async () => {
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    const token = loginRes.body.data.token;

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.user.email).toBe(testUser.email);
  });

  it('POST /api/v1/auth/forgot-password - should trigger password reset', async () => {
    const res = await request(app).post('/api/v1/auth/forgot-password').send({
      email: testUser.email,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Password reset instructions sent');
  });
});
