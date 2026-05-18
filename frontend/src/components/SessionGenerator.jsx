import { useState } from 'react';
import MoodSelector from './MoodSelector.jsx';
import LoadingSession from './LoadingSession.jsx';
import TaskCard from './TaskCard.jsx';

const TIME_OPTIONS = [5, 10, 15, 20, 30];
const ALL_CATEGORIES = ['exercise', 'mental', 'reading', 'hanging', 'supplements', 'neck_shoulder', 'workout'];

const styles = {
  box: {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius)',
    padding: 20,
    marginBottom: 16
  },
  title: { fontSize: 15, fontWeight: 600, marginBottom: 16, color: 'var(--accent-soft)' },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  label: { fontSize: 13, color: 'var(--text-secondary)' },
  btn: {
    width: '100%',
    padding: '14px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    marginTop: 4
  },
  offline: {
    fontSize: 12,
    color: 'var(--warning)',
    textAlign: 'center',
    padding: '6px 0',
    marginBottom: 8
  },
  regenBtn: {
    width: '100%',
    padding: 10,
    borderRadius: 'var(--radius-sm)',
    background: 'transparent',
    border: '1px solid var(--bg-elevated)',
    color: 'var(--text-secondary)',
    fontSize: 13,
    marginTop: 8
  }
};

export default function SessionGenerator({ completionHistory, onTaskComplete }) {
  const [mood, setMood] = useState('neutral');
  const [timeAvailable, setTimeAvailable] = useState(10);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [completedTasks, setCompletedTasks] = useState({});

  const generate = async () => {
    setLoading(true);
    setIsOffline(false);
    setCompletedTasks({});
    try {
      const response = await fetch('/api/generate-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: new Date().getHours() < 12 ? 'morning' : 'evening',
          mood,
          timeAvailable,
          categories: ALL_CATEGORIES,
          completionHistory: completionHistory || {},
          preferences: {}
        })
      });
      if (!response.ok) throw new Error('Request failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let lastSession = null;

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
            if (parsed.tasks) lastSession = parsed;
          } catch {}
        }
      }
      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer);
          if (parsed.tasks) lastSession = parsed;
        } catch {}
      }
      if (lastSession) {
        setSession(lastSession);
        try { localStorage.setItem('lastSession', JSON.stringify(lastSession)); } catch {}
      }
    } catch {
      try {
        const cached = JSON.parse(localStorage.getItem('lastSession'));
        if (cached) { setSession(cached); setIsOffline(true); }
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  const swapTask = async (index, task) => {
    try {
      const res = await fetch('/api/suggest-alternative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: task.category, currentTask: task, mood, completionHistory })
      });
      const reader = res.body.getReader();
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
          try { const p = JSON.parse(line); if (p.name) replacement = p; } catch {}
        }
      }
      if (replacement) {
        setSession(prev => {
          const tasks = [...prev.tasks];
          tasks[index] = replacement;
          return { ...prev, tasks };
        });
      }
    } catch {}
  };

  const handleComplete = (index, category) => {
    setCompletedTasks(prev => ({ ...prev, [index]: !prev[index] }));
    if (!completedTasks[index] && onTaskComplete) onTaskComplete(category);
  };

  return (
    <div>
      <div style={styles.box}>
        <div style={styles.title}>✨ Ask Claude for suggestions</div>
        <div style={styles.row}>
          <span style={styles.label}>I'm feeling:</span>
          <MoodSelector value={mood} onChange={setMood} />
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Time available:</span>
          <select value={timeAvailable} onChange={e => setTimeAvailable(Number(e.target.value))}>
            {TIME_OPTIONS.map(t => (
              <option key={t} value={t}>{t} mins</option>
            ))}
          </select>
        </div>
        <button style={styles.btn} onClick={generate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate My Session'}
        </button>
      </div>

      {isOffline && <div style={styles.offline}>Offline — showing cached session</div>}

      {loading && <LoadingSession />}

      {!loading && session && (
        <div>
          {session.tasks.map((task, i) => (
            <TaskCard
              key={i}
              task={task}
              completed={!!completedTasks[i]}
              onComplete={() => handleComplete(i, task.category)}
              onSwap={() => swapTask(i, task)}
            />
          ))}
          <button style={styles.regenBtn} onClick={generate}>Regenerate all ↻</button>
        </div>
      )}
    </div>
  );
}
