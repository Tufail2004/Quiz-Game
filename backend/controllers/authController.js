// controllers/authController.js
// Name-only "auth" for a kids' game: no email, no password.
//   POST /api/auth/play   (public)  — body { name } -> { user, token }
//   GET  /api/auth/me     (protected)
//
// POST /play finds a player by name (case-insensitive) or creates one,
// then returns a JWT. The token just says "this browser claimed this name" —
// it is NOT real security, but it keeps every protected route
// (quiz, leaderboard, history, admin) working unchanged.

const User = require('../models/User');
const generateToken = require('../utils/generateToken');

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// POST /api/auth/play
// Body: { name } -> 200 { user, token }
async function play(req, res, next) {
  try {
    const name = (req.body.name || '').trim();

    if (name.length < 2) {
      return res.status(400).json({ message: 'Please tell us your name (at least 2 letters) 😊' });
    }
    if (name.length > 30) {
      return res.status(400).json({ message: 'That name is a bit too long — 30 letters max!' });
    }

    // Returning player? Reuse their record so history/leaderboard stay theirs.
    let user = await User.findOne({ name: new RegExp(`^${escapeRegExp(name)}$`, 'i') });
    if (!user) {
      user = await User.create({ name });
    }

    res.json({ user, token: generateToken(user._id) });
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/me  (protected — needs a valid JWT)
// Returns the current player.
async function getMe(req, res) {
  res.json({ user: req.user });
}

module.exports = { play, getMe };
