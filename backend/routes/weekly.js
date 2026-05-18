const express = require('express');
const router = express.Router();
const { streamSession } = require('../lib/claude');
const { buildWeeklyPrompt } = require('../lib/prompts');

router.post('/', async (req, res) => {
  const { weekHistory, preferences } = req.body;

  const userMessage = buildWeeklyPrompt({ weekHistory: weekHistory || {}, preferences: preferences || {} });

  try {
    await streamSession(res, userMessage, 2048);
  } catch (err) {
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to generate weekly plan', fallback: true });
    }
  }
});

module.exports = router;
