import LinkedInPost from '../models/LinkedInPost.js';
import Topic from '../models/Topic.js';
import { generateLinkedInPost } from '../services/aiService.js';

// Generate a professional LinkedIn post
export const createLinkedInPost = async (req, res) => {
  const { topicId, type, noteContent } = req.body;

  try {
    const topic = await Topic.findById(topicId);
    const topicName = topic ? topic.name : 'Software Engineering Principles';

    // Call Grok AI / Mock AI
    const generatedContent = await generateLinkedInPost(type, topicName, noteContent || '');

    const post = await LinkedInPost.create({
      user: req.user._id,
      topic: topicId || null,
      content: generatedContent,
      type,
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all saved LinkedIn posts
export const getLinkedInPosts = async (req, res) => {
  try {
    const posts = await LinkedInPost.find({ user: req.user._id })
      .populate('topic', 'name')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
