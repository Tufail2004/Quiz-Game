// controllers/userController.js
// Player dashboard + history.
// Routes:
//   GET /api/users/profile  (protected) -> user + aggregate stats
//   GET /api/users/history  (protected) -> the user's past quiz results

const QuizResult = require('../models/QuizResult');

// GET /api/users/profile
async function getProfile(req, res, next) {
  try {
    const results = await QuizResult.find({ user: req.user._id });

    const quizzesPlayed = results.length;
    const highestScore = results.reduce((max, r) => Math.max(max, r.score), 0);
    const averageScore = quizzesPlayed
      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / quizzesPlayed)
      : 0;
    const totalCorrect = results.reduce((sum, r) => sum + r.correctAnswers, 0);
    const recent = await QuizResult.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('category difficulty score percentage createdAt');

    res.json({
      user: req.user,
      stats: { quizzesPlayed, highestScore, averageScore, totalCorrect },
      recent,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/users/history
async function getHistory(req, res, next) {
  try {
    const history = await QuizResult.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    next(error);
  }
}

module.exports = { getProfile, getHistory };
