import { useState, useEffect } from 'react';

const BASE = import.meta.env.VITE_API_URL ?? '';
const today = () => new Date().toISOString().split('T')[0];

export function useCompletionHistory() {
  const [history, setHistory] = useState({});

  useEffect(() => {
    fetch(`${BASE}/api/history`)
      .then(r => r.json())
      .then(data => setHistory(data))
      .catch(() => {});
  }, []);

  const markComplete = (category) => {
    const date = today();
    const value = true;
    setHistory(prev => ({ ...prev, [date]: { ...(prev[date] || {}), [category]: value } }));
    fetch(`${BASE}/api/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, category, value })
    });
  };

  const toggleComplete = (date, category) => {
    const newValue = !(history[date]?.[category]);
    setHistory(prev => ({ ...prev, [date]: { ...(prev[date] || {}), [category]: newValue } }));
    fetch(`${BASE}/api/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, category, value: newValue })
    });
  };

  const getWeekCounts = () => {
    const counts = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const day = history[dateStr] || {};
      Object.entries(day).forEach(([cat, done]) => {
        if (done) counts[cat] = (counts[cat] || 0) + 1;
      });
    }
    return counts;
  };

  const getLast7Days = () => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({ date: dateStr, completions: history[dateStr] || {} });
    }
    return days;
  };

  return { history, markComplete, toggleComplete, getWeekCounts, getLast7Days };
}
