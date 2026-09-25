// models/QuizResult.js
// Mongoose model for a finished quiz attempt.
// One document is created every time a logged-in user completes a quiz.
// It stores everything the result page, leaderboard, dashboard and history
// need: score, counts, percentage, time taken, category and difficulty.
// The `user` field references the User who played, so we can populate the
// player's name on the leaderboard.

const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: { type: String, required: true, trim: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'mixed'],
      default: 'mixed',
    },
    score: { type: Number, required: true, default: 0 },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true, default: 0 },
    incorrectAnswers: { type: Number, required: true, default: 0 },
    unanswered: { type: Number, required: true, default: 0 },
    percentage: { type: Number, required: true, default: 0 },
    timeTaken: { type: Number, default: 0 }, // total seconds for the quiz
  },
  { timestamps: true }
);

// Leaderboard queries sort by score, so index it.
quizResultSchema.index({ score: -1 });

module.exports = mongoose.model('QuizResult', quizResultSchema);
