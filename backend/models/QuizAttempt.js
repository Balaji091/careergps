import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 1,
  },
  passed: {
    type: Boolean,
    default: false,
  },
  answers: [
    {
      question: { type: String, required: true },
      options: [{ type: String, required: true }],
      selectedIndex: { type: Number, default: null },
      correctIndex: { type: Number, required: true },
      explanation: { type: String, default: '' },
      isCorrect: { type: Boolean, default: false },
    }
  ],
}, {
  timestamps: true,
});

quizAttemptSchema.index({ user: 1, topic: 1, createdAt: -1 });

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
export default QuizAttempt;
