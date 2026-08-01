import request from 'supertest';
import app from '../src/app';

describe('Health Check API', () => {
  it('GET /api/v1/health - should return 200 OK and status UP', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('UP');
    expect(res.body.data.service).toBe('examnavigator-backend');
  });
});
