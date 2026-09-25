// routes/userRoutes.js
// Player dashboard + history endpoints (both protected).
//   GET /api/users/profile
//   GET /api/users/history

const express = require('express');
const { getProfile, getHistory } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.get('/history', protect, getHistory);

module.exports = router;
