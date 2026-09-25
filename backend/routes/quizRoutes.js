// routes/quizRoutes.js
// Quiz gameplay endpoints.
//   GET  /api/quiz/questions?category=..&difficulty=..   (public — anyone can play)
//   POST /api/quiz/result                                (protected — saving a score needs login)

const express = require('express');
const { getQuizQuestions, submitResult } = require('../controllers/quizController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/questions', getQuizQuestions);
router.post('/result', protect, submitResult);

module.exports = router;
