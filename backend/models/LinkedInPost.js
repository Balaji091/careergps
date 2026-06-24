import mongoose from 'mongoose';

const linkedinPostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: false, // Optional if post is not topic-specific (e.g. general career update)
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['learning_post', 'takeaways', 'summary', 'career_update'],
    required: true,
  },
}, {
  timestamps: true,
});

const LinkedInPost = mongoose.model('LinkedInPost', linkedinPostSchema);
export default LinkedInPost;
