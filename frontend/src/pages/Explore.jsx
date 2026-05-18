import { useState, useEffect } from 'react';
import CategoryTabs from '../components/CategoryTabs.jsx';
import TaskCard from '../components/TaskCard.jsx';
import LoadingSession from '../components/LoadingSession.jsx';
import MoodSelector from '../components/MoodSelector.jsx';
import { exploreCategory } from '../services/api.js';

const styles = {
  page: { padding: '24px 16px 16px' },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 },
  controls: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  label: { fontSize: 13, color: 'var(--text-secondary)' },
  error: { color: 'var(--danger)', fontSize: 13, padding: '12px 0' }
};

export default function Explore() {
  const [category, setCategory] = useState('exercise');
  const [mood, setMood] = useState('neutral');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    exploreCategory({ category, mood })
      .then(data => setTasks(data.tasks || []))
      .catch(() => setError('Could not load tasks. Check your connection.'))
      .finally(() => setLoading(false));
  }, [category, mood]);

  return (
    <div style={styles.page}>
      <div style={styles.title}>Explore</div>
      <div style={styles.subtitle}>Browse task ideas by category</div>
      <div style={{ marginBottom: 16 }}>
        <CategoryTabs active={category} onChange={setCategory} />
      </div>
      <div style={styles.controls}>
        <span style={styles.label}>Mood filter:</span>
        <MoodSelector value={mood} onChange={setMood} />
      </div>
      {loading && <LoadingSession />}
      {error && <div style={styles.error}>{error}</div>}
      {!loading && !error && tasks.map((task, i) => (
        <TaskCard key={i} task={task} completed={false} onComplete={() => {}} />
      ))}
    </div>
  );
}
