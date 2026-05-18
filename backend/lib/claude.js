require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `You are a personal self-care coach. You suggest practical, time-boxed self-care tasks across these categories:
- exercise: bodyweight moves, stretches, walks
- mental: meditation, breathing, journaling prompts
- reading: articles, book chapters, podcasts
- hanging: social connection ideas, check-ins
- supplements: hydration, nutrition reminders
- neck_shoulder: targeted neck/shoulder relief exercises
- workout: structured gym/home workout splits

Rules:
1. Tasks must fit within the user's available time.
2. Prioritize categories the user has neglected (low completion count).
3. The "why" field must be personalized to the user's history or mood when possible.
4. Always return valid JSON matching the schema exactly — no extra text, no markdown fences.
5. Keep instructions concise (1-2 sentences max).`;

const CACHED_SYSTEM = [
  {
    type: 'text',
    text: SYSTEM_PROMPT,
    cache_control: { type: 'ephemeral' }
  }
];

async function streamSession(res, userMessage, maxTokens = 1024) {
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: maxTokens,
    system: CACHED_SYSTEM,
    messages: [{ role: 'user', content: userMessage }]
  });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let fullText = '';

  stream.on('text', (text) => {
    fullText += text;
    res.write(JSON.stringify({ partial: text }) + '\n');
  });

  const message = await stream.finalMessage();
  const content = message.content[0]?.text || '';

  try {
    const parsed = JSON.parse(content);
    res.write(JSON.stringify(parsed) + '\n');
    res.end();
    return parsed;
  } catch {
    throw new Error('Claude returned invalid JSON: ' + content.slice(0, 200));
  }
}

async function createCompletion(userMessage, maxTokens = 512) {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: CACHED_SYSTEM,
    messages: [{ role: 'user', content: userMessage }]
  });

  const content = message.content[0]?.text || '';
  return JSON.parse(content);
}

module.exports = { streamSession, createCompletion };
