import mongoose from 'mongoose';

const roadmapSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  estimatedDays: {
    type: Number,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const Roadmap = mongoose.model('Roadmap', roadmapSchema);
export default Roadmap;
