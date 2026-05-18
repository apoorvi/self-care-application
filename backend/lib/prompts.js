const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function buildSessionPrompt({ session, mood, timeAvailable, categories, completionHistory, preferences }) {
  const now = new Date();
  const dayName = DAYS[now.getDay()];
  const dateStr = now.toISOString().split('T')[0];

  const historyLines = Object.entries(completionHistory || {})
    .map(([cat, count]) => `  - ${cat}: completed ${count} time(s) this week`)
    .join('\n');

  const prefLines = Object.entries(preferences || {})
    .filter(([, v]) => v)
    .map(([k]) => `  - ${k}`)
    .join('\n') || '  - none';

  return `Date: ${dateStr} (${dayName})
Session type: ${session}
Mood: ${mood}
Time available: ${timeAvailable} minutes total
Categories to fill: ${(categories || []).join(', ')}

Completion history this week:
${historyLines || '  - no history yet'}

User preferences:
${prefLines}

Generate a self-care session fitting within ${timeAvailable} minutes. Prioritize categories with low completion counts. Return only valid JSON matching this schema:
{
  "session": "${session}",
  "total_duration_mins": <number>,
  "tasks": [
    {
      "category": "<category>",
      "name": "<task name>",
      "duration_mins": <number>,
      "instructions": "<1-2 sentence instructions>",
      "why": "<personalized reason or null>"
    }
  ]
}`;
}

function buildAlternativePrompt({ category, currentTask, mood, completionHistory }) {
  return `Suggest ONE alternative self-care task for category: ${category}
Current task to replace: "${currentTask?.name || 'unknown'}"
User mood: ${mood}
Completion history: ${JSON.stringify(completionHistory || {})}

Return only valid JSON for a single task:
{
  "category": "${category}",
  "name": "<task name>",
  "duration_mins": <number>,
  "instructions": "<1-2 sentence instructions>",
  "why": "<brief reason for this alternative>"
}`;
}

function buildExplorePrompt({ category, mood, limit }) {
  return `Suggest ${limit} self-care tasks for category: ${category}
User mood: ${mood || 'neutral'}

Return only valid JSON:
{
  "category": "${category}",
  "tasks": [
    {
      "category": "${category}",
      "name": "<task name>",
      "duration_mins": <number>,
      "instructions": "<1-2 sentence instructions>",
      "why": null
    }
  ]
}`;
}

function buildWeeklyPrompt({ weekHistory, preferences }) {
  const prefLines = Object.entries(preferences || {})
    .filter(([, v]) => v)
    .map(([k]) => `  - ${k}`)
    .join('\n') || '  - none';

  return `Create a 7-day self-care plan for the coming week.

Last week's history:
${JSON.stringify(weekHistory || {}, null, 2)}

User preferences:
${prefLines}

Return only valid JSON:
{
  "week": [
    {
      "day": "Monday",
      "tasks": [
        {
          "category": "<category>",
          "name": "<task name>",
          "duration_mins": <number>,
          "instructions": "<brief instructions>",
          "why": null
        }
      ]
    }
  ]
}`;
}

module.exports = { buildSessionPrompt, buildAlternativePrompt, buildExplorePrompt, buildWeeklyPrompt };
