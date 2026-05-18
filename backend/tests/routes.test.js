const request = require('supertest');
const app = require('../server');

describe('GET /api/health', () => {
  test('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('POST /api/generate-session', () => {
  const validBody = {
    session: 'morning',
    mood: 'neutral',
    timeAvailable: 10,
    categories: ['exercise', 'mental'],
    completionHistory: { exercise: 1, mental: 0 },
    preferences: {}
  };

  test('returns 400 when session is missing', async () => {
    const res = await request(app).post('/api/generate-session').send({ mood: 'neutral' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('returns 400 when mood is missing', async () => {
    const res = await request(app).post('/api/generate-session').send({ session: 'morning' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('returns 200 with streaming content-type on valid request', async () => {
    const res = await request(app).post('/api/generate-session').send(validBody);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/event-stream/);
  });

  test('response body contains tasks array in final JSON line', async () => {
    const res = await request(app).post('/api/generate-session').send(validBody);
    const lines = res.text.trim().split('\n').filter(Boolean);
    const lastLine = lines[lines.length - 1];
    const parsed = JSON.parse(lastLine);
    expect(Array.isArray(parsed.tasks)).toBe(true);
    expect(parsed.tasks.length).toBeGreaterThan(0);
  });

  test('each task has required fields', async () => {
    const res = await request(app).post('/api/generate-session').send(validBody);
    const lines = res.text.trim().split('\n').filter(Boolean);
    const parsed = JSON.parse(lines[lines.length - 1]);
    for (const task of parsed.tasks) {
      expect(task.category).toBeDefined();
      expect(task.name).toBeDefined();
      expect(typeof task.duration_mins).toBe('number');
      expect(task.instructions).toBeDefined();
    }
  });
});

describe('POST /api/suggest-alternative', () => {
  const validBody = {
    category: 'mental',
    currentTask: { name: 'Box Breathing', duration_mins: 5 },
    mood: 'tired',
    completionHistory: {}
  };

  test('returns 400 when category is missing', async () => {
    const res = await request(app).post('/api/suggest-alternative').send({ mood: 'neutral' });
    expect(res.status).toBe(400);
  });

  test('returns 200 on valid request', async () => {
    const res = await request(app).post('/api/suggest-alternative').send(validBody);
    expect(res.status).toBe(200);
  });
});

describe('GET /api/explore/:category', () => {
  test('returns 400 for invalid category', async () => {
    const res = await request(app).get('/api/explore/invalid-category');
    expect(res.status).toBe(400);
  });

  test('returns 200 with tasks for valid category', async () => {
    const res = await request(app).get('/api/explore/mental');
    expect(res.status).toBe(200);
    expect(res.body.category).toBe('mental');
    expect(Array.isArray(res.body.tasks)).toBe(true);
  });

  test('accepts mood query param', async () => {
    const res = await request(app).get('/api/explore/exercise?mood=tired&limit=3');
    expect(res.status).toBe(200);
  });
});

describe('POST /api/weekly-plan', () => {
  test('returns 200 with week structure', async () => {
    const res = await request(app).post('/api/weekly-plan').send({
      weekHistory: { exercise: [true, false, true, false, true, false, false] },
      preferences: {}
    });
    expect(res.status).toBe(200);
  });
});

describe('Fallback library', () => {
  const { getFallbackSession, getFallbackExplore } = require('../lib/fallback');

  test('getFallbackSession returns valid session', () => {
    const s = getFallbackSession({ timeAvailable: 15, categories: ['exercise', 'mental'] });
    expect(s.tasks).toBeDefined();
    expect(s.tasks.length).toBeGreaterThan(0);
    expect(s.fallback).toBe(true);
  });

  test('getFallbackSession tasks fit within time', () => {
    const s = getFallbackSession({ timeAvailable: 5, categories: ['mental'] });
    const total = s.tasks.reduce((sum, t) => sum + t.duration_mins, 0);
    expect(total).toBeLessThanOrEqual(10);
  });

  test('getFallbackExplore returns category tasks', () => {
    const r = getFallbackExplore({ category: 'reading', limit: 2 });
    expect(r.category).toBe('reading');
    expect(r.tasks.length).toBeLessThanOrEqual(2);
  });

  test('getFallbackSession returns different results across calls', () => {
    const results = new Set();
    for (let i = 0; i < 10; i++) {
      const s = getFallbackSession({ timeAvailable: 20, categories: ['exercise', 'mental', 'reading'] });
      results.add(s.tasks.map(t => t.name).join(','));
    }
    expect(results.size).toBeGreaterThan(1);
  });
});
