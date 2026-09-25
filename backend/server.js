// server.js — entry point of the Quiz Game backend.
// What it does, step by step:
//   1. Loads environment variables from .env (PORT, MONGO_URI, JWT_SECRET).
//   2. Creates the Express app and adds middleware (CORS + JSON body parsing).
//   3. Connects to MongoDB.
//   4. Mounts the API route files under /api/... paths.
//   5. Adds a 404 handler and a central error handler.
//   6. Starts listening for HTTP requests.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const quizRoutes = require('./routes/quizRoutes');
const userRoutes = require('./routes/userRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
// CORS: lets the frontend (served from a different port/origin) call this API.
app.use(cors());
// Parse incoming JSON request bodies into req.body.
app.use(express.json());

// --- Database ---
connectDB();

// --- API routes ---
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Simple health check so you can verify the server is up in a browser.
app.get('/', (req, res) => res.json({ message: 'Quiz Game API is running' }));

// 404 handler for unknown routes.
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Central error handler: any controller that calls next(err) ends up here.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
