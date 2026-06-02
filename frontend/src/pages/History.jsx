import { useCompletionHistory } from '../hooks/useCompletionHistory.js';
import { useArticleNotes } from '../hooks/useArticleNotes.js';

const BASE = import.meta.env.VITE_API_URL ?? '';

const CATEGORIES = ['exercise', 'mental', 'reading', 'hanging', 'supplements', 'neck_shoulder', 'workout'];
const CATEGORY_EMOJI = {
  exercise: '💪', mental: '🧠', reading: '📚', hanging: '📞',
  supplements: '💊', neck_shoulder: '🧘', workout: '🏋️'
};
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const styles = {
  page: { padding: '24px 16px 16px' },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 },
  grid: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 320 },
  th: { fontSize: 11, color: 'var(--text-secondary)', padding: '4px 6px', textAlign: 'center', fontWeight: 400 },
  tdCat: { fontSize: 13, padding: '8px 6px', whiteSpace: 'nowrap' },
  dot: (done) => ({
    width: 24, height: 24,
    borderRadius: 6,
    background: done ? 'var(--success)' : 'var(--bg-elevated)',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    cursor: 'pointer',
    userSelect: 'none'
  }),
  summary: {
    marginTop: 24,
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius)',
    padding: 20
  },
  summaryTitle: { fontSize: 14, fontWeight: 600, marginBottom: 12 },
  statRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 },
  statLabel: { color: 'var(--text-secondary)' },
  statVal: { color: 'var(--accent-soft)', fontWeight: 600 },
  notesSection: { marginTop: 24 },
  notesSectionTitle: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  notesSectionSub: { fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 },
  noteCard: {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius)',
    padding: '12px 16px',
    marginBottom: 10,
    borderLeft: '3px solid var(--accent-soft)'
  },
  noteDate: { fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 },
  noteText: { fontSize: 14, lineHeight: 1.5 },
  exportBtn: {
    display: 'inline-block',
    marginTop: 12,
    background: 'var(--bg-elevated)',
    border: 'none',
    borderRadius: 8,
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-primary)',
    cursor: 'pointer',
    textDecoration: 'none'
  },
  empty: { fontSize: 13, color: 'var(--text-secondary)' }
};

export default function History() {
  const { getLast7Days, getWeekCounts, toggleComplete } = useCompletionHistory();
  const { notes } = useArticleNotes();
  const days = getLast7Days();
  const counts = getWeekCounts();
  const total = Object.values(counts).reduce((s, v) => s + v, 0);

  return (
    <div style={styles.page}>
      <div style={styles.title}>History</div>
      <div style={styles.subtitle}>Last 7 days</div>

      <div style={styles.grid}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, textAlign: 'left' }}>Category</th>
              {days.map(({ date }) => {
                const d = new Date(date + 'T12:00:00');
                return <th key={date} style={styles.th}>{DAYS_SHORT[d.getDay()]}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map(cat => (
              <tr key={cat}>
                <td style={styles.tdCat}>{CATEGORY_EMOJI[cat]} {cat}</td>
                {days.map(({ date, completions }) => (
                  <td key={date} style={{ padding: '4px 6px' }}>
                    <div
                      style={styles.dot(!!completions[cat])}
                      onClick={() => toggleComplete(date, cat)}
                      data-testid={`dot-${cat}-${date}`}
                      title={`${completions[cat] ? 'Unmark' : 'Mark'} ${cat} for ${date}`}
                      role="button"
                      aria-pressed={!!completions[cat]}
                      aria-label={`${completions[cat] ? 'Unmark' : 'Mark'} ${cat} complete for ${date}`}
                    >
                      {completions[cat] ? '✓' : ''}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.summary}>
        <div style={styles.summaryTitle}>This week</div>
        {CATEGORIES.filter(cat => counts[cat]).map(cat => (
          <div key={cat} style={styles.statRow}>
            <span style={styles.statLabel}>{CATEGORY_EMOJI[cat]} {cat}</span>
            <span style={styles.statVal}>{counts[cat]}x</span>
          </div>
        ))}
        <div style={{ ...styles.statRow, borderTop: '1px solid var(--bg-elevated)', paddingTop: 8, marginTop: 4 }}>
          <span style={styles.statLabel}>Total completions</span>
          <span style={styles.statVal}>{total}</span>
        </div>
      </div>
      <div style={styles.notesSection}>
        <div style={styles.notesSectionTitle}>Reading Notes</div>
        <div style={styles.notesSectionSub}>Articles worth remembering</div>
        {notes.length === 0 ? (
          <div style={styles.empty}>No notes yet — save one from the Home tab.</div>
        ) : (
          notes.map((note, i) => (
            <div key={i} style={styles.noteCard}>
              <div style={styles.noteDate}>{note.date}</div>
              <div style={styles.noteText}>{note.text}</div>
            </div>
          ))
        )}
        {notes.length > 0 && (
          <a href={`${BASE}/api/notes/export`} download="reading-notes.txt" style={styles.exportBtn}>
            Download as .txt
          </a>
        )}
      </div>
    </div>
  );
}
