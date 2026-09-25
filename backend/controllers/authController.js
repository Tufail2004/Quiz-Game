// controllers/authController.js
// Handles user registration, login and "who am I".
// Routes: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me

const User = require('../models/User');
const generateToken = require('../utils/generateToken');

function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}

// POST /api/auth/register
// Body: { name, email, password } -> 201 { user, token }
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // --- Validation ---
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // --- Duplicate email prevention ---
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Password hashing happens in the User model's pre-save hook.
    const user = await User.create({ name, email, password });

    res.status(201).json({
      user, // password is stripped by User.toJSON
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/login
// Body: { email, password } -> 200 { user, token }
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      // Same message for both cases so attackers can't probe for valid emails.
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({ user, token: generateToken(user._id) });
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/me  (protected — needs a valid JWT)
// Returns the currently logged-in user.
async function getMe(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, getMe };
