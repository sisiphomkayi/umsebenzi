const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');

const app = express();

// ─── MIDDLEWARE ───────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── ROUTES ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ─── TEST ROUTE ───────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🇿🇦 Umsebenzi API is running!',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      auth: '/api/auth',
    }
  });
});

// ─── 404 HANDLER ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ─── START SERVER ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Umsebenzi server running on port ${PORT}`);
});

module.exports = app;