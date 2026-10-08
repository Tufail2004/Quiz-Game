// utils/autoSeed.js
// Seeds the questions collection on server startup, but ONLY if it's empty.
// This lets a fresh hosted database (e.g. MongoDB Atlas) populate itself
// automatically on first deploy — no manual seeding step needed.
// Safe to run on every startup: if questions already exist, it does nothing.

const Question = require('../models/Question');
const questions = require('../seed/questions');

async function autoSeed() {
  try {
    const count = await Question.countDocuments();
    if (count > 0) {
      console.log(`Questions already present (${count}), skipping auto-seed.`);
      return;
    }
    await Question.insertMany(questions);
    console.log(`Auto-seeded ${questions.length} questions.`);
  } catch (error) {
    // Don't crash the server over seeding — log it and keep running.
    console.error('Auto-seed failed:', error.message);
  }
}

module.exports = autoSeed;
