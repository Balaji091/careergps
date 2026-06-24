import mongoose from 'mongoose';

const streakSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  lastActiveDate: {
    type: String, // YYYY-MM-DD
    default: '',
  },
  history: [{
    date: { type: String, required: true }, // YYYY-MM-DD
    hoursStudied: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    topicsCompleted: { type: Number, default: 0 },
    xpGained: { type: Number, default: 0 },
  }],
}, {
  timestamps: true,
});

const Streak = mongoose.model('Streak', streakSchema);
export default Streak;
