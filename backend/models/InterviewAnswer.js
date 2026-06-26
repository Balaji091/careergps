import mongoose from 'mongoose';

const interviewAnswerSchema = new mongoose.Schema({
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
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    default: '',
  },
  evaluation: {
    score: { type: Number, min: 0, max: 100, default: null },
    verdict: { type: String, default: '' },
    strengths: { type: String, default: '' },
    gaps: { type: String, default: '' },
    explanation: { type: String, default: '' },
    evaluatedAt: { type: Date, default: null },
  },
}, {
  timestamps: true,
});

const InterviewAnswer = mongoose.model('InterviewAnswer', interviewAnswerSchema);
export default InterviewAnswer;
