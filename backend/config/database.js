const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('Warning: MONGODB_URI not set. Database features will not work.');
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.warn('Server will continue without database connection.');
  }
};

module.exports = connectDB;
