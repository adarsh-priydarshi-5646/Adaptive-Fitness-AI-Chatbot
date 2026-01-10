const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  personality: {
    type: String,
    enum: ['A', 'B', 'C'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  coins: {
    type: Number,
    default: 0,
  },
  lifestyleData: {
    steps: { type: Number, default: 0 },
    exerciseMinutes: { type: Number, default: 0 },
    sleepHours: { type: Number, default: 0 },
  },
});

module.exports = mongoose.model('User', userSchema);
