import { useState, useEffect } from 'react';

const BASE = import.meta.env.VITE_API_URL ?? '';

export function useArticleNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/api/notes`)
      .then(r => r.json())
      .then(data => { setNotes(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function addNote(text) {
    const res = await fetch(`${BASE}/api/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error('Failed to save note');
    const note = await res.json();
    setNotes(prev => [note, ...prev]);
    return note;
  }

  function hasNoteToday() {
    const today = new Date().toISOString().slice(0, 10);
    return notes.some(n => n.date === today);
  }

  return { notes, loading, addNote, hasNoteToday };
}
