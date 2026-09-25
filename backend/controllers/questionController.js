// controllers/questionController.js
// CRUD for quiz questions.
// Routes:
//   GET    /api/questions        (logged-in users; correct answers hidden from non-admins)
//   GET    /api/questions/:id    (logged-in users; correct answers hidden from non-admins)
//   POST   /api/questions        (admin only)
//   PUT    /api/questions/:id    (admin only)
//   DELETE /api/questions/:id    (admin only)

const Question = require('../models/Question');

// Remove the correct answer before sending a question to a non-admin player.
function hideAnswer(questionDoc) {
  const obj = questionDoc.toObject();
  delete obj.correctAnswer;
  return obj;
}

// GET /api/questions?category=JavaScript&difficulty=easy
async function getQuestions(req, res, next) {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;

    const questions = await Question.find(filter).sort({ createdAt: -1 });
    const isAdmin = req.user && req.user.role === 'admin';
    res.json(isAdmin ? questions : questions.map(hideAnswer));
  } catch (error) {
    next(error);
  }
}

// GET /api/questions/:id
async function getQuestionById(req, res, next) {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    const isAdmin = req.user && req.user.role === 'admin';
    res.json(isAdmin ? question : hideAnswer(question));
  } catch (error) {
    next(error);
  }
}

// POST /api/questions  (admin)
// Body: { question, options[4], correctAnswer, category, difficulty, explanation }
async function createQuestion(req, res, next) {
  try {
    const question = await Question.create(req.body);
    res.status(201).json(question);
  } catch (error) {
    // Mongoose validation errors (e.g. wrong option count) -> 400, not 500.
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
}

// PUT /api/questions/:id  (admin)
async function updateQuestion(req, res, next) {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, // re-run schema validation on updates
    });
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json(question);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
}

// DELETE /api/questions/:id  (admin)
async function deleteQuestion(req, res, next) {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json({ message: 'Question deleted' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};
