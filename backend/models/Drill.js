import mongoose from 'mongoose';

const drillSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  focusTitle: {
    type: String,
    default: '',
  },
  source: {
    type: String,
    enum: ['planner', 'insights', 'dashboard', 'general'],
    default: 'general',
  },
  date: {
    type: String,
    required: true,
    default: () => {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
  },
  questions: [
    {
      question: { type: String },
      answer: { type: String, default: '' },
      expectedAnswer: { type: String },
    },
  ],
  evaluation: {
    score: { type: Number },
    verdict: { type: String },
    strengths: { type: String },
    improvements: { type: String },
  },
  xpAwarded: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

drillSchema.index({ user: 1, status: 1, createdAt: -1 });
drillSchema.index({ user: 1, date: 1, source: 1 });

const Drill = mongoose.model('Drill', drillSchema);
export default Drill;
