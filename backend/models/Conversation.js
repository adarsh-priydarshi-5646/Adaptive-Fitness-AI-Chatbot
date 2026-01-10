const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  userMessage: {
    type: String,
    required: true,
  },
  aiResponse: {
    type: String,
    required: true,
  },
  personality: {
    type: String,
    enum: ['A', 'B', 'C'],
  },
  usageDays: {
    type: Number,
  },
  lifestyleContext: {
    steps: Number,
    exerciseMinutes: Number,
    sleepHours: Number,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Conversation', conversationSchema);
