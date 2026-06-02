const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const NOTES_FILE = path.join(__dirname, '../data/notes.txt');

function parseNotes() {
  if (!fs.existsSync(NOTES_FILE)) return [];
  const raw = fs.readFileSync(NOTES_FILE, 'utf8').trim();
  if (!raw) return [];

  return raw.split(/\n\n+/).map(block => {
    const lines = block.trim().split('\n');
    return { date: lines[0], text: lines.slice(1).join('\n') };
  }).filter(n => n.date && n.text);
}

router.get('/', (req, res) => {
  res.json(parseNotes().reverse());
});

router.post('/', (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'text required' });

  const date = new Date().toISOString().slice(0, 10);
  const entry = `${date}\n${text.trim()}\n\n`;
  fs.appendFileSync(NOTES_FILE, entry, 'utf8');
  res.json({ date, text: text.trim() });
});

router.get('/export', (req, res) => {
  if (!fs.existsSync(NOTES_FILE)) return res.status(404).json({ error: 'No notes yet' });
  res.setHeader('Content-Disposition', 'attachment; filename="reading-notes.txt"');
  res.setHeader('Content-Type', 'text/plain');
  res.sendFile(NOTES_FILE);
});

module.exports = router;
