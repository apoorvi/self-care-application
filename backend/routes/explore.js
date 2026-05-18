const express = require('express');
const router = express.Router();
const { createCompletion } = require('../lib/claude');
const { getFallbackExplore } = require('../lib/fallback');
const { buildExplorePrompt } = require('../lib/prompts');

const VALID_CATEGORIES = ['exercise', 'mental', 'reading', 'hanging', 'supplements', 'neck_shoulder', 'workout'];

router.get('/:category', async (req, res) => {
  const { category } = req.params;
  const { mood, limit = '5' } = req.query;

  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `Invalid category. Valid: ${VALID_CATEGORIES.join(', ')}` });
  }

  const userMessage = buildExplorePrompt({ category, mood, limit: parseInt(limit, 10) });

  try {
    const result = await createCompletion(userMessage, 1024);
    return res.json(result);
  } catch (err) {
    const fallback = getFallbackExplore({ category, limit: parseInt(limit, 10) });
    return res.json({ ...fallback, fallback: true });
  }
});

module.exports = router;
