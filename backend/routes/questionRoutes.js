// routes/questionRoutes.js
// Question management endpoints. Reading requires login; creating, editing
// and deleting require the 'admin' role (protect runs first, then admin).
//   GET    /api/questions        (any logged-in user)
//   GET    /api/questions/:id    (any logged-in user)
//   POST   /api/questions        (admin)
//   PUT    /api/questions/:id    (admin)
//   DELETE /api/questions/:id    (admin)

const express = require('express');
const {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require('../controllers/questionController');
const protect = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/', protect, getQuestions);
router.get('/:id', protect, getQuestionById);
router.post('/', protect, admin, createQuestion);
router.put('/:id', protect, admin, updateQuestion);
router.delete('/:id', protect, admin, deleteQuestion);

module.exports = router;
