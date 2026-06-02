const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function getHistoryFile() {
  return process.env.HISTORY_FILE || path.join(__dirname, '../data/history.json');
}

function readHistory() {
  const file = getHistoryFile();
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function writeHistory(data) {
  fs.writeFileSync(getHistoryFile(), JSON.stringify(data, null, 2), 'utf8');
}

router.get('/', (req, res) => {
  res.json(readHistory());
});

router.post('/', (req, res) => {
  const { date, category, value } = req.body;
  if (!date) return res.status(400).json({ error: 'date is required' });
  if (!category) return res.status(400).json({ error: 'category is required' });
  if (typeof value !== 'boolean') return res.status(400).json({ error: 'value must be a boolean' });

  const history = readHistory();
  history[date] = { ...(history[date] || {}), [category]: value };
  writeHistory(history);
  res.json({ date, category, value });
});

module.exports = router;
