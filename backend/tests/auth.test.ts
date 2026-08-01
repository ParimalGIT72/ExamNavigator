import request from 'supertest';
import app from '../src/app';
import { UserModel } from '../src/modules/user/models/user.model';
import { UserProfileModel } from '../src/modules/user/models/user-profile.model';

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

    jest.spyOn(UserModel.prototype, 'save').mockImplementation(function (this: any) {
      this._id = this._id || createdUserId;
      return Promise.resolve(this);
    });

    jest.spyOn(UserProfileModel.prototype, 'save').mockImplementation(function (this: any) {
      this._id = this._id || '660f1b2c3d4e5f6a7b8c9d0f';
      return Promise.resolve(this);
    });

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
      save: jest.fn().mockResolvedValue(true),
    };

    // Mock Mongoose Model queries directly
    jest.spyOn(UserModel, 'findOne').mockImplementation((query: any) => {
      const execMock = () => {
        if (query.email === testUser.email.toLowerCase() || query.email === testUser.email) {
          return Promise.resolve(mockUserDoc);
        }
        if (query.verificationToken === 'valid_verify_token') {
          return Promise.resolve(mockUserDoc);
        }
        if (query.resetPasswordToken === 'valid_reset_token') {
          return Promise.resolve(mockUserDoc);
        }
        return Promise.resolve(null);
      };

      return {
        select: () => ({
          exec: execMock,
        }),
        exec: execMock,
      } as any;
    });

    jest.spyOn(UserModel, 'findById').mockImplementation((id: any) => {
      const execMock = () => {
        if (id.toString() === createdUserId) {
          return Promise.resolve(mockUserDoc);
        }
        return Promise.resolve(null);
      };

      return {
        select: () => ({
          exec: execMock,
        }),
        exec: execMock,
      } as any;
    });

    jest.spyOn(UserModel, 'findByIdAndUpdate').mockImplementation((id: any, updateData: any) => {
      return {
        exec: () => Promise.resolve({ ...mockUserDoc, ...updateData, _id: id }),
      } as any;
    });

    jest.spyOn(UserProfileModel, 'findOne').mockImplementation(() => {
      return {
        exec: () =>
          Promise.resolve({
            _id: '660f1b2c3d4e5f6a7b8c9d0f',
            userId: createdUserId,
            targetExam: 'JEE',
          }),
      } as any;
    });

    jest.spyOn(UserProfileModel, 'findOneAndUpdate').mockImplementation((_query: any, updateData: any) => {
      return {
        exec: () =>
          Promise.resolve({
            _id: '660f1b2c3d4e5f6a7b8c9d0f',
            userId: createdUserId,
            ...updateData,
          }),
      } as any;
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('POST /api/v1/auth/register - should register a new student', async () => {
    // For registration of a new user, findByEmail must return null
    jest.spyOn(UserModel, 'findOne').mockImplementationOnce((_query: any) => {
      const execMock = () => Promise.resolve(null);
      return {
        select: () => ({ exec: execMock }),
        exec: execMock,
      } as any;
    });

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
