// routes/authRoutes.js
// Player entry endpoints (name-only, no email/password).
//   POST /api/auth/play   (public)
//   GET  /api/auth/me     (protected)

const express = require('express');
const { play, getMe } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/play', play);
router.get('/me', protect, getMe);

module.exports = router;
