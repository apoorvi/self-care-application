import { useLocalStorage } from './useLocalStorage.js';

const today = () => new Date().toISOString().split('T')[0];

export function useCompletionHistory() {
  const [history, setHistory] = useLocalStorage('completionHistory', {});

  const markComplete = (category) => {
    setHistory(prev => ({
      ...prev,
      [today()]: { ...(prev[today()] || {}), [category]: true }
    }));
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

  return { history, markComplete, getWeekCounts, getLast7Days };
}
