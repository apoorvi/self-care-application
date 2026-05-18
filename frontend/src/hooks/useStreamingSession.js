import { useState } from 'react';

export function useStreamingSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  const generate = async (params) => {
    setLoading(true);
    setError(null);
    setIsOffline(false);

    try {
      const response = await fetch('/api/generate-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let lastParsed = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.tasks) {
              lastParsed = parsed;
              setSession(parsed);
            }
          } catch {
            // partial chunk, skip
          }
        }
      }

      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer);
          if (parsed.tasks) { lastParsed = parsed; setSession(parsed); }
        } catch {}
      }
      if (lastParsed) {
        try { localStorage.setItem('lastSession', JSON.stringify(lastParsed)); } catch {}
      }
    } catch (err) {
      const cached = (() => {
        try { return JSON.parse(localStorage.getItem('lastSession')); } catch { return null; }
      })();
      if (cached) {
        setSession(cached);
        setIsOffline(true);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const swapTask = async (index, { category, currentTask, mood, completionHistory }) => {
    try {
      const response = await fetch('/api/suggest-alternative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, currentTask, mood, completionHistory })
      });
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let replacement = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.name) replacement = parsed;
          } catch {}
        }
      }

      if (replacement) {
        setSession(prev => {
          if (!prev) return prev;
          const tasks = [...prev.tasks];
          tasks[index] = replacement;
          return { ...prev, tasks };
        });
      }
    } catch {
      // silent fail on swap
    }
  };

  return { session, loading, error, isOffline, generate, swapTask };
}
