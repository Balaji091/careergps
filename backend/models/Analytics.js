import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  careerReadinessScore: {
    type: Number,
    default: 0,
  },
  totalStudyHours: {
    type: Number,
    default: 0,
  },
  totalTopicsCompleted: {
    type: Number,
    default: 0,
  },
  totalNotesCreated: {
    type: Number,
    default: 0,
  },
  totalQuestionsAnswered: {
    type: Number,
    default: 0,
  },
  totalQuizzesTaken: {
    type: Number,
    default: 0,
  },
  averageQuizScore: {
    type: Number,
    default: 0, // 0-100 percentage
  },
  revisionCompletionRate: {
    type: Number,
    default: 0, // percentage 0-100
  },
  dailyGoalCompletionRate: {
    type: Number,
    default: 0, // percentage 0-100
  },
  historicalReadiness: [{
    date: { type: String, required: true }, // YYYY-MM-DD
    score: { type: Number, required: true },
  }],
}, {
  timestamps: true,
});

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;
