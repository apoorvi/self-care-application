const request = require('supertest');
const fs = require('fs');
const path = require('path');
const os = require('os');

const TEMP_HISTORY = path.join(os.tmpdir(), `history-test-${Date.now()}.json`);
process.env.HISTORY_FILE = TEMP_HISTORY;

const app = require('../server');

afterEach(() => {
  if (fs.existsSync(TEMP_HISTORY)) fs.unlinkSync(TEMP_HISTORY);
});

afterAll(() => {
  delete process.env.HISTORY_FILE;
});

describe('GET /api/history', () => {
  test('returns {} when no file exists', async () => {
    const res = await request(app).get('/api/history');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({});
  });

  test('returns saved data when file exists', async () => {
    const data = { '2024-06-01': { exercise: true, mental: false } };
    fs.writeFileSync(TEMP_HISTORY, JSON.stringify(data));
    const res = await request(app).get('/api/history');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(data);
  });
});

describe('POST /api/history', () => {
  test('returns 400 when date is missing', async () => {
    const res = await request(app).post('/api/history').send({ category: 'exercise', value: true });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('returns 400 when category is missing', async () => {
    const res = await request(app).post('/api/history').send({ date: '2024-06-01', value: true });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('returns 400 when value is not a boolean', async () => {
    const res = await request(app)
      .post('/api/history')
      .send({ date: '2024-06-01', category: 'exercise', value: 'yes' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('saves entry and returns it', async () => {
    const res = await request(app)
      .post('/api/history')
      .send({ date: '2024-06-01', category: 'exercise', value: true });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ date: '2024-06-01', category: 'exercise', value: true });
    const stored = JSON.parse(fs.readFileSync(TEMP_HISTORY, 'utf8'));
    expect(stored['2024-06-01']['exercise']).toBe(true);
  });

  test('preserves other entries in the file', async () => {
    fs.writeFileSync(TEMP_HISTORY, JSON.stringify({ '2024-06-01': { mental: true } }));
    await request(app)
      .post('/api/history')
      .send({ date: '2024-06-01', category: 'exercise', value: true });
    const stored = JSON.parse(fs.readFileSync(TEMP_HISTORY, 'utf8'));
    expect(stored['2024-06-01']['mental']).toBe(true);
    expect(stored['2024-06-01']['exercise']).toBe(true);
  });
});
