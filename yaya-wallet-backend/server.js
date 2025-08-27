// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const transactionsRouter = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 4000;

// CORS: allow front-end origin(s)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (e.g., curl, mobile clients)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// Proxy routes
app.use('/api/transactions', transactionsRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message || err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
