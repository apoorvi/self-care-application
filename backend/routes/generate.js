const express = require('express');
const router = express.Router();
const { streamSession } = require('../lib/claude');
const { getFallbackSession } = require('../lib/fallback');
const { buildSessionPrompt } = require('../lib/prompts');

router.post('/', async (req, res) => {
  const { session, mood, timeAvailable, categories, completionHistory, preferences } = req.body;

  if (!session || !mood) {
    return res.status(400).json({ error: 'session and mood are required' });
  }

  const userMessage = buildSessionPrompt({
    session, mood,
    timeAvailable: timeAvailable || 10,
    categories: categories || ['exercise', 'mental', 'reading'],
    completionHistory: completionHistory || {},
    preferences: preferences || {}
  });

  try {
    await streamSession(res, userMessage, 1024);
  } catch (err) {
    if (!res.headersSent) {
      const fallback = getFallbackSession({ timeAvailable, categories, mood });
      return res.json(fallback);
    }
  }
});

module.exports = router;
