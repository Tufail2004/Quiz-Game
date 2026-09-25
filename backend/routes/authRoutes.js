// routes/authRoutes.js
// Authentication endpoints.
//   POST /api/auth/register   (public)
//   POST /api/auth/login      (public)
//   GET  /api/auth/me        (protected)

const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
