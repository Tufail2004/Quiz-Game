// models/User.js
// Mongoose model for players.
// Name-only identity: a player just types their name to play —
// no email, no password. Fields: name, role ('user' | 'admin'), timestamps.
//
// Note: there is no password, so anyone can play as any name. That's fine
// for a fun kids' game, but this is NOT real account security — don't
// expose the backend publicly with anything sensitive behind the admin role.

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [30, 'Name must be at most 30 characters long'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
