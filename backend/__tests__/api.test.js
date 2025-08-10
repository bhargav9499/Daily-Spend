// backend/__tests__/api.test.js
import request from 'supertest';
import app from '../src/server.js';

describe('DailySpend API', () => {
  test('GET /api/categories returns array', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST+DELETE /api/categories works', async () => {
    const created = await request(app)
      .post('/api/categories')
      .send({ name: 'TestCat', type: 'SPEND' });

    expect(created.status).toBe(201);
    expect(created.body?.id).toBeDefined();

    const del = await request(app).delete(`/api/categories/${created.body.id}`);
    expect(del.status).toBe(200);
  });
});
