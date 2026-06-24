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
  confidence: {
    type: Number,
    min: 1,
    max: 5,
    default: 3, // default confidence rating
  },
}, {
  timestamps: true,
});

const InterviewAnswer = mongoose.model('InterviewAnswer', interviewAnswerSchema);
export default InterviewAnswer;
