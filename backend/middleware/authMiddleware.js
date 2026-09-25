// middleware/authMiddleware.js
// `protect` guards routes that require a logged-in user.
// It reads the JWT from the `Authorization: Bearer <token>` header,
// verifies it, loads the user from MongoDB (without the password) and
// attaches it as req.user. If anything is missing/invalid it responds
// with 401 Unauthorized and the request never reaches the controller.

const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized — no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Not authorized — user not found' });
    }
    req.user = user; // password already stripped by User.toJSON on responses
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized — invalid or expired token' });
  }
}

module.exports = protect;
