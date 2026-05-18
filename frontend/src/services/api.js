const BASE = import.meta.env.VITE_API_URL ?? '';

export async function exploreCategory({ category, mood, limit = 5 }) {
  const params = new URLSearchParams({ limit });
  if (mood) params.set('mood', mood);
  const res = await fetch(`${BASE}/api/explore/${category}?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function generateWeeklyPlan({ weekHistory, preferences }) {
  const res = await fetch(`${BASE}/api/weekly-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weekHistory, preferences })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
