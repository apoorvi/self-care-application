const { buildSessionPrompt, buildAlternativePrompt, buildExplorePrompt } = require('../lib/prompts');

describe('buildSessionPrompt', () => {
  const base = {
    session: 'morning',
    mood: 'stressed',
    timeAvailable: 10,
    categories: ['exercise', 'mental'],
    completionHistory: { exercise: 2, mental: 0 },
    preferences: { preferStoicReading: true }
  };

  test('returns a non-empty string', () => {
    expect(buildSessionPrompt(base).length).toBeGreaterThan(0);
  });

  test('includes mood', () => {
    expect(buildSessionPrompt(base)).toContain('stressed');
  });

  test('includes timeAvailable', () => {
    expect(buildSessionPrompt(base)).toContain('10');
  });

  test('includes categories', () => {
    const prompt = buildSessionPrompt(base);
    expect(prompt).toContain('exercise');
    expect(prompt).toContain('mental');
  });

  test('includes completion history counts', () => {
    const prompt = buildSessionPrompt(base);
    expect(prompt).toContain('exercise');
    expect(prompt).toContain('2');
  });

  test('includes preferences', () => {
    expect(buildSessionPrompt(base)).toContain('preferStoicReading');
  });

  test('works with empty history and preferences', () => {
    const prompt = buildSessionPrompt({ session: 'evening', mood: 'neutral', timeAvailable: 5, categories: [], completionHistory: {}, preferences: {} });
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
  });
});

describe('buildAlternativePrompt', () => {
  test('includes category', () => {
    const prompt = buildAlternativePrompt({ category: 'mental', currentTask: { name: 'Box Breathing' }, mood: 'tired', completionHistory: {} });
    expect(prompt).toContain('mental');
  });

  test('includes current task name', () => {
    const prompt = buildAlternativePrompt({ category: 'mental', currentTask: { name: 'Box Breathing' }, mood: 'tired', completionHistory: {} });
    expect(prompt).toContain('Box Breathing');
  });
});

describe('buildExplorePrompt', () => {
  test('includes category and limit', () => {
    const prompt = buildExplorePrompt({ category: 'exercise', mood: 'energized', limit: 5 });
    expect(prompt).toContain('exercise');
    expect(prompt).toContain('5');
  });
});
