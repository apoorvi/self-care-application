require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');

const generateRoute = require('./routes/generate');
const alternativeRoute = require('./routes/alternative');
const exploreRoute = require('./routes/explore');
const weeklyRoute = require('./routes/weekly');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/generate-session', generateRoute);
app.use('/api/suggest-alternative', alternativeRoute);
app.use('/api/explore', exploreRoute);
app.use('/api/weekly-plan', weeklyRoute);

app.use((err, req, res, next) => {
  console.error(err.message);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => console.log(`Self-care backend running on port ${PORT}`));

module.exports = app;
