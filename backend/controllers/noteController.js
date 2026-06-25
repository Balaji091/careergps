import Note from '../models/Note.js';
import Subject from '../models/Subject.js';
import Topic from '../models/Topic.js';
import { generateNotesAssisted } from '../services/aiService.js';
import { updateStreakActivity } from '../services/gamificationService.js';

// Get note for a specific topic
export const getNote = async (req, res) => {
  const { topicId } = req.params;

  try {
    let note = await Note.findOne({ topic: topicId, user: req.user._id });
    if (!note) {
      const topic = await Topic.findById(topicId);
      if (!topic) return res.status(404).json({ message: 'Topic not found' });

      note = await Note.create({
        user: req.user._id,
        subject: topic.subject,
        topic: topicId,
        content: '',
        tags: [],
      });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update note content (autosave handler)
export const updateNote = async (req, res) => {
  const { topicId } = req.params;
  const { content, tags, isPinned } = req.body;

  try {
    let note = await Note.findOne({ topic: topicId, user: req.user._id });
    if (!note) {
      const topic = await Topic.findById(topicId);
      if (!topic) return res.status(404).json({ message: 'Topic not found' });

      note = new Note({
        user: req.user._id,
        subject: topic.subject,
        topic: topicId,
      });
    }

    note.content = content !== undefined ? content : note.content;
    note.tags = tags !== undefined ? tags : note.tags;
    note.isPinned = isPinned !== undefined ? isPinned : note.isPinned;
    await note.save();

    // Auto-complete topic if note is long enough (>= 100 characters)
    if (note.content && note.content.trim().length >= 100) {
      const topic = await Topic.findOne({ _id: topicId, user: req.user._id });
      if (topic && topic.status !== 'completed') {
        topic.status = 'completed';
        topic.progress = 100;
        await topic.save();

        // Aggregate progress to subject
        const allTopics = await Topic.find({ subject: topic.subject });
        const completedCount = allTopics.filter(t => t.status === 'completed').length;
        const progressPercent = Math.round((completedCount / allTopics.length) * 100);
        const subject = await Subject.findById(topic.subject);
        if (subject) {
          subject.progress = progressPercent;
          subject.status = progressPercent === 100 ? 'completed' : (progressPercent > 0 ? 'in_progress' : 'not_started');
          await subject.save();
        }
      }
    }

    res.json({ message: 'Note saved successfully', note });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Trigger Grok assistance for notes
export const getAIAssistantNote = async (req, res) => {
  const { topicId } = req.params;
  const { type, content } = req.body; // type: generate, revision, summary, examples, flashcards

  try {
    const topic = await Topic.findById(topicId);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    const subject = await Subject.findById(topic.subject);
    const subjectName = subject ? subject.name : 'Software Engineering';
    const userLevel = req.user.profile?.experienceLevel || 'Beginner';

    const aiSuggestedContent = await generateNotesAssisted(type, content || '', topic.name, subjectName, userLevel);
    
    // Add micro-streak reward for engaging in notes expansion
    await updateStreakActivity(req.user._id, 0.1, 0, 0, 0);

    res.json({ aiSuggestedContent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search notes globally or by subject
export const searchNotes = async (req, res) => {
  const { query, tag } = req.query;

  try {
    let filter = { user: req.user._id };

    if (tag) {
      filter.tags = tag;
    }

    if (query) {
      filter.content = { $regex: query, $options: 'i' };
    }

    const notes = await Note.find(filter)
      .populate('subject', 'name')
      .populate('topic', 'name');

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
