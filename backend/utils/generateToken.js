// utils/generateToken.js
// Creates a signed JWT for a logged-in user.
// The token payload only carries the user's id — never the password.
// Controllers call this after register/login and return the token to the
// frontend, which stores it in localStorage and sends it back in the
// `Authorization: Bearer <token>` header on protected requests.

const jwt = require('jsonwebtoken');

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

module.exports = generateToken;
