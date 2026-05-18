const tasks = require('../data/fallback-tasks.json');

function getFallbackSession({ timeAvailable = 10, categories, mood } = {}) {
  const cats = categories?.length ? categories : Object.keys(tasks);
  const selected = [];
  let remainingMins = timeAvailable;

  const shuffled = [...cats].sort(() => Math.random() - 0.5);

  for (const cat of shuffled) {
    if (remainingMins <= 0) break;
    const pool = tasks[cat];
    if (!pool?.length) continue;
    const task = pool[Math.floor(Math.random() * pool.length)];
    if (task.duration_mins <= remainingMins) {
      selected.push(task);
      remainingMins -= task.duration_mins;
    }
  }

  if (selected.length === 0 && cats.length > 0) {
    const firstCat = cats[0];
    const pool = tasks[firstCat];
    if (pool?.length) selected.push(pool[0]);
  }

  return {
    session: 'morning',
    total_duration_mins: selected.reduce((s, t) => s + t.duration_mins, 0),
    tasks: selected,
    fallback: true
  };
}

function getFallbackExplore({ category, limit = 5 } = {}) {
  const pool = tasks[category] || [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return {
    category,
    tasks: shuffled.slice(0, limit)
  };
}

module.exports = { getFallbackSession, getFallbackExplore };
