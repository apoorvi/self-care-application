import { useCompletionHistory } from '../hooks/useCompletionHistory.js';
import { useArticleNotes } from '../hooks/useArticleNotes.js';
import SessionGenerator from '../components/SessionGenerator.jsx';
import ArticleNotePrompt from '../components/ArticleNotePrompt.jsx';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = ['midnight', 'night', 'night', 'night', 'night', 'morning', 'morning', 'morning', 'morning',
  'morning', 'morning', 'morning', 'afternoon', 'afternoon', 'afternoon', 'afternoon', 'afternoon',
  'afternoon', 'evening', 'evening', 'evening', 'evening', 'night', 'night'];

const styles = {
  page: { padding: '24px 16px 16px' },
  header: { marginBottom: 24 },
  greeting: { fontSize: 22, fontWeight: 700, marginBottom: 4 },
  date: { fontSize: 14, color: 'var(--text-secondary)' }
};

export default function Home() {
  const { markComplete, getWeekCounts } = useCompletionHistory();
  const { addNote, hasNoteToday, loading: notesLoading } = useArticleNotes();
  const now = new Date();
  const hour = now.getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dayName = DAYS[now.getDay()];
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.greeting}>{greet} {hour < 12 ? '☀️' : hour < 17 ? '🌤️' : '🌙'}</div>
        <div style={styles.date}>{dayName}, {dateStr}</div>
      </div>
      {!notesLoading && !hasNoteToday() && (
        <ArticleNotePrompt onSave={addNote} />
      )}
      <SessionGenerator
        completionHistory={getWeekCounts()}
        onTaskComplete={markComplete}
      />
    </div>
  );
}
