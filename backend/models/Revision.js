import mongoose from 'mongoose';

const revisionSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['Not Started', 'Scheduled', 'Completed', 'Mastered'],
    default: 'Not Started',
  },
  intervalStep: {
    type: Number, // 0 = Day 1, 1 = Day 3, 2 = Day 7, 3 = Day 15, 4 = Day 30, 5 = Day 60, 6 = Mastered
    default: 0,
  },
  nextRevisionDate: {
    type: Date,
  },
  lastRevisionDate: {
    type: Date,
  },
  history: [{
    date: { type: Date, default: Date.now },
    intervalStepUsed: Number,
  }],
}, {
  timestamps: true,
});

const Revision = mongoose.model('Revision', revisionSchema);
export default Revision;
