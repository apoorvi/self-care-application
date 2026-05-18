const express = require('express');
const router = express.Router();
const { streamSession } = require('../lib/claude');
const { getFallbackSession } = require('../lib/fallback');
const { buildAlternativePrompt } = require('../lib/prompts');

router.post('/', async (req, res) => {
  const { category, currentTask, mood, completionHistory } = req.body;

  if (!category) {
    return res.status(400).json({ error: 'category is required' });
  }

  const userMessage = buildAlternativePrompt({ category, currentTask, mood: mood || 'neutral', completionHistory });

  try {
    await streamSession(res, userMessage, 512);
  } catch (err) {
    if (!res.headersSent) {
      const fallback = getFallbackSession({ categories: [category], timeAvailable: 10 });
      return res.json(fallback.tasks[0] || { category, name: 'Rest', duration_mins: 5, instructions: 'Take a short break.', why: null });
    }
  }
});

module.exports = router;
