import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  roadmap: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  estimatedHours: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started',
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  learningObjectives: [{ type: String }],
  prerequisites: [{ type: String }],
  summary: { type: String, default: '' },
  
    // Cache for dynamic AI Learn content
    isLearnGenerated: {
      type: Boolean,
      default: false,
    },
    cachedLearnContent: {
      definition: { type: String, default: '' },
      detailedExplanation: { type: String, default: '' },
      realWorldExample: { type: String, default: '' },
      useCases: [{ type: String }],
      commonMistakes: [{ type: String }],
      interviewTips: [{ type: String }],
      keyTakeaways: [{ type: String }],
    },

    // Lesson hierarchy & cached Topic Quizzes
    lessonName: {
      type: String,
      default: 'General Fundamentals',
    },
    isQuizGenerated: {
      type: Boolean,
      default: false,
    },
    quizQuestions: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctIndex: { type: Number, required: true },
        explanation: { type: String, default: '' },
      }
    ],
  }, {
    timestamps: true,
  });

const Topic = mongoose.model('Topic', topicSchema);
export default Topic;
