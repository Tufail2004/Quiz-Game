// seed/seed.js
// Inserts starter quiz content into MongoDB.
// Run with:  npm run seed   (from the backend/ folder)
// What it does:
//   1. Connects to MongoDB using MONGO_URI from .env
//   2. Deletes all existing questions (so re-running never creates duplicates)
//   3. Inserts 50 questions: 10 each for JavaScript, HTML, CSS, Node.js, MongoDB,
//      with a mix of easy / medium / hard difficulties.
//
// NOTE: correctAnswer must be the EXACT text of one of the four options.

require('dotenv').config({ path: `${__dirname}/../.env` });
const mongoose = require('mongoose');
const Question = require('../models/Question');

const questions = require('./questions');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear old questions so re-running the seed never creates duplicates.
    await Question.deleteMany({});
    const inserted = await Question.insertMany(questions);

    console.log(`Seeded ${inserted.length} questions successfully.`);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
