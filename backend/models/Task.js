import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['learn', 'revise', 'review_notes', 'interview', 'custom'],
    default: 'custom',
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Skipped'],
    default: 'Pending',
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false, // can refer to Topic, Note, or Revision depending on the task type
  },
  date: {
    type: String, // format YYYY-MM-DD
    required: true,
  },
  xpRewarded: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Task = mongoose.model('Task', taskSchema);
export default Task;
