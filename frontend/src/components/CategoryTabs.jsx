const CATEGORIES = [
  { id: 'exercise', label: 'Exercise', icon: '💪' },
  { id: 'mental', label: 'Mental', icon: '🧠' },
  { id: 'reading', label: 'Reading', icon: '📚' },
  { id: 'hanging', label: 'Social', icon: '📞' },
  { id: 'supplements', label: 'Supplements', icon: '💊' },
  { id: 'neck_shoulder', label: 'Neck/Shoulder', icon: '🧘' },
  { id: 'workout', label: 'Workout', icon: '🏋️' }
];

const styles = {
  container: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    paddingBottom: 4,
    scrollbarWidth: 'none'
  },
  tab: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 20,
    background: active ? 'var(--accent)' : 'var(--bg-elevated)',
    color: active ? '#fff' : 'var(--text-secondary)',
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transition: 'all 0.15s'
  })
};

export default function CategoryTabs({ active, onChange }) {
  return (
    <div style={styles.container}>
      {CATEGORIES.map(cat => (
        <button
          key={cat.id}
          style={styles.tab(active === cat.id)}
          onClick={() => onChange(cat.id)}
        >
          {cat.icon} {cat.label}
        </button>
      ))}
    </div>
  );
}

export { CATEGORIES };
