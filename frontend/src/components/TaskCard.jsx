const CATEGORY_EMOJI = {
  exercise: '💪', mental: '🧠', reading: '📚', hanging: '📞',
  supplements: '💊', neck_shoulder: '🧘', workout: '🏋️'
};

const styles = {
  card: (completed) => ({
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius)',
    padding: '16px 20px',
    marginBottom: 12,
    opacity: completed ? 0.6 : 1,
    transition: 'opacity 0.2s',
    border: completed ? '1px solid var(--success)' : '1px solid transparent'
  }),
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8
  },
  emoji: { fontSize: 20, flexShrink: 0, marginTop: 2 },
  titleRow: { flex: 1 },
  name: { fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 },
  duration: {
    display: 'inline-block',
    fontSize: 11,
    color: 'var(--accent-soft)',
    background: 'var(--bg-elevated)',
    borderRadius: 4,
    padding: '2px 8px'
  },
  instructions: { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 },
  why: { fontSize: 12, color: 'var(--accent-soft)', fontStyle: 'italic', marginBottom: 12 },
  actions: { display: 'flex', gap: 8, alignItems: 'center' },
  checkBtn: (done) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    borderRadius: 8,
    background: done ? 'var(--success)' : 'var(--bg-elevated)',
    color: done ? '#fff' : 'var(--text-secondary)',
    fontSize: 13,
    fontWeight: 500,
    transition: 'all 0.15s'
  }),
  swapBtn: {
    padding: '6px 14px',
    borderRadius: 8,
    background: 'transparent',
    border: '1px solid var(--bg-elevated)',
    color: 'var(--text-secondary)',
    fontSize: 13,
    marginLeft: 'auto'
  }
};

export default function TaskCard({ task, completed, onComplete, onSwap }) {
  const { category, name, duration_mins, instructions, why } = task;
  return (
    <div style={styles.card(completed)}>
      <div style={styles.header}>
        <span style={styles.emoji}>{CATEGORY_EMOJI[category] || '✨'}</span>
        <div style={styles.titleRow}>
          <div style={styles.name}>{name}</div>
          <span style={styles.duration}>{duration_mins} min</span>
        </div>
      </div>
      <div style={styles.instructions}>{instructions}</div>
      {why && <div style={styles.why}>"{why}"</div>}
      <div style={styles.actions}>
        <button style={styles.checkBtn(completed)} onClick={onComplete}>
          {completed ? '✓ Done' : 'Mark done'}
        </button>
        {onSwap && (
          <button style={styles.swapBtn} onClick={onSwap}>Swap ↻</button>
        )}
      </div>
    </div>
  );
}
