import { useState } from 'react';

const styles = {
  card: {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius)',
    padding: 16,
    marginBottom: 20,
    borderLeft: '3px solid var(--accent-soft)'
  },
  label: { fontSize: 13, fontWeight: 600, marginBottom: 10 },
  textarea: {
    width: '100%',
    background: 'var(--bg-elevated)',
    border: 'none',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 14,
    color: 'var(--text-primary)',
    resize: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },
  row: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 },
  btnDismiss: {
    background: 'none',
    border: 'none',
    fontSize: 13,
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '6px 10px'
  },
  btnSave: {
    background: 'var(--accent-soft)',
    border: 'none',
    borderRadius: 8,
    padding: '6px 16px',
    fontSize: 13,
    fontWeight: 600,
    color: '#fff',
    cursor: 'pointer'
  },
  saved: { fontSize: 13, color: 'var(--success)', padding: '4px 0' }
};

export default function ArticleNotePrompt({ onSave }) {
  const [text, setText] = useState('');
  const [dismissed, setDismissed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  if (dismissed) return null;

  async function handleSave() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await onSave(text.trim());
      setSaved(true);
      setTimeout(() => setDismissed(true), 1200);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.card}>
      <div style={styles.label}>📖 What's one article worth remembering today?</div>
      {saved ? (
        <div style={styles.saved}>Saved!</div>
      ) : (
        <>
          <textarea
            style={styles.textarea}
            rows={3}
            placeholder="Article title or key takeaway..."
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <div style={styles.row}>
            <button style={styles.btnDismiss} onClick={() => setDismissed(true)}>Skip</button>
            <button style={styles.btnSave} onClick={handleSave} disabled={saving || !text.trim()}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
