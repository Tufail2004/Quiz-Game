// routes/userRoutes.js
// Player dashboard + history endpoints (both protected).
//   GET /api/users/profile
//   GET /api/users/history

const express = require('express');
const { getProfile, getHistory, getAllUsers } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/', protect, admin, getAllUsers);
router.get('/profile', protect, getProfile);
router.get('/history', protect, getHistory);

module.exports = router;
