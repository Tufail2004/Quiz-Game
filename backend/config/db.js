// config/db.js
// Opens the connection to MongoDB using the MONGO_URI from your .env file.
// server.js calls this once at startup. If the connection fails, the app
// exits with an error instead of running without a database.

const mongoose = require('mongoose');

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1); // stop the server — it cannot work without the database
  }
}

module.exports = connectDB;
