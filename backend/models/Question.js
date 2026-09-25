// models/Question.js
// Mongoose model for quiz questions.
// Each question has: the question text, exactly 4 options, the correct
// answer (stored as the exact text of the correct option), a category
// (e.g. "JavaScript"), a difficulty ("easy" | "medium" | "hard"), and a
// short explanation shown to the player after they answer.

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    options: {
      type: [String],
      required: [true, 'Options are required'],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length === 4,
        message: 'A question must have exactly 4 options',
      },
    },
    correctAnswer: {
      type: String,
      required: [true, 'Correct answer is required'],
      // Must be one of the four options — keeps data consistent.
      validate: {
        validator: function (value) {
          return this.options.includes(value);
        },
        message: 'Correct answer must match one of the options',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'easy',
      index: true,
    },
    explanation: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

// Speed up the "random 10 questions for category + difficulty" query.
questionSchema.index({ category: 1, difficulty: 1 });

module.exports = mongoose.model('Question', questionSchema);
