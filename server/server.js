require('dotenv').config();
const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/healthRoutes');
const analyzeRoutes = require('./routes/analyzeRoutes');
const { errorHandlerMiddleware, notFoundMiddleware } = require('./middleware/errorHandlerMiddleware');

const app = express();
const PORT = process.env.PORT || 5004;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

// Middleware configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman) or matching client origin
    if (!origin || origin === CLIENT_ORIGIN || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive for local college project use
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' }));

// Request logging (sanitized, avoids logging full error bodies)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/analyze', analyzeRoutes);

// Root route welcome message
app.get('/', (req, res) => {
  res.json({
    name: 'AI Error Message Helper - API Server',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      analyze: 'POST /api/analyze'
    }
  });
});

// 404 and Error handling
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// Start server
app.listen(PORT, () => {
  const apiKeyConfigured = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
  );

  console.log('====================================================');
  console.log(` AI Error Message Helper Server running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(` Gemini API Key: ${apiKeyConfigured ? '✓ Configured' : '✗ Missing (see .env)'}`);
  console.log(` Active Model: ${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}`);
  console.log('====================================================');
});

module.exports = app;
