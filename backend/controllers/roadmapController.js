import Roadmap from '../models/Roadmap.js';
import Subject from '../models/Subject.js';
import Topic from '../models/Topic.js';
import Revision from '../models/Revision.js';
import User from '../models/User.js';
import Note from '../models/Note.js';
import InterviewAnswer from '../models/InterviewAnswer.js';
import Task from '../models/Task.js';
import { generateRoadmap } from '../services/aiService.js';

// Onboard user and generate roadmap
export const onboardUser = async (req, res) => {
  const { targetRole, experienceLevel, targetTimeline, dailyStudyTime } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update user profile fields
    user.profile.targetRole = targetRole;
    user.profile.experienceLevel = experienceLevel;
    user.profile.targetTimeline = targetTimeline;
    user.profile.dailyStudyTime = dailyStudyTime;
    await user.save();

    // Clean up old roadmaps, subjects, topics, revisions, tasks for clean reset
    const oldRoadmap = await Roadmap.findOne({ user: req.user._id });
    if (oldRoadmap) {
      await Promise.all([
        Subject.deleteMany({ roadmap: oldRoadmap._id }),
        Topic.deleteMany({ roadmap: oldRoadmap._id }),
        Revision.deleteMany({ user: req.user._id }),
        Task.deleteMany({ user: req.user._id }),
        Roadmap.deleteOne({ _id: oldRoadmap._id }),
      ]);
    }

    // Call Grok / Mock AI to generate structural career roadmap
    const aiData = await generateRoadmap(targetRole, experienceLevel, targetTimeline, dailyStudyTime);

    // Save active Roadmap
    const roadmap = await Roadmap.create({
      user: req.user._id,
      role: aiData.role || targetRole,
      estimatedDays: aiData.estimatedDays || 90,
      difficulty: aiData.difficulty || experienceLevel,
    });

    // Save Subjects and Topics
    if (aiData.subjects && Array.isArray(aiData.subjects)) {
      for (let sIdx = 0; sIdx < aiData.subjects.length; sIdx++) {
        const subData = aiData.subjects[sIdx];
        const subject = await Subject.create({
          roadmap: roadmap._id,
          user: req.user._id,
          name: subData.name,
          order: sIdx + 1,
          estimatedTime: subData.estimatedTime || '10 days',
          status: 'not_started',
          progress: 0,
        });

        if (subData.topics && Array.isArray(subData.topics)) {
          for (const topData of subData.topics) {
            const topic = await Topic.create({
              subject: subject._id,
              roadmap: roadmap._id,
              user: req.user._id,
              name: topData.name,
              difficulty: topData.difficulty || 'Beginner',
              estimatedHours: topData.estimatedHours || 4,
              status: 'not_started',
              progress: 0,
              learningObjectives: topData.learningObjectives || [],
              prerequisites: topData.prerequisites || [],
              summary: topData.summary || '',
              lessonName: topData.lessonName || 'General Fundamentals',
            });

            // Create initial spacing repetition entry
            await Revision.create({
              user: req.user._id,
              subject: subject._id,
              topic: topic._id,
              status: 'Not Started',
            });
          }
        }
      }
    }

    res.status(201).json({
      message: 'Onboarding completed and roadmap generated successfully!',
      roadmap,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current active roadmap with progress details
export const getActiveRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ user: req.user._id });
    if (!roadmap) {
      return res.status(200).json(null);
    }

    const subjects = await Subject.find({ roadmap: roadmap._id }).sort({ order: 1 });
    
    // Enrich subjects with topic count details dynamically
    const enrichedSubjects = await Promise.all(
      subjects.map(async (subj) => {
        const topicsCount = await Topic.countDocuments({ subject: subj._id });
        const completedCount = await Topic.countDocuments({ subject: subj._id, status: 'completed' });
        return {
          ...subj.toObject(),
          topicsCount,
          completedCount,
        };
      })
    );

    res.json({
      roadmap,
      subjects: enrichedSubjects,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get subject details and list of topics inside it
export const getSubjectDetails = async (req, res) => {
  const { subjectId } = req.params;

  try {
    const subject = await Subject.findOne({ _id: subjectId, user: req.user._id });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const topics = await Topic.find({ subject: subjectId });

    res.json({
      subject,
      topics,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get specific topic details and load cache / notes / questions
export const getTopicDetails = async (req, res) => {
  const { topicId } = req.params;

  try {
    const topic = await Topic.findOne({ _id: topicId, user: req.user._id });
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Get note
    let note = await Note.findOne({ topic: topicId, user: req.user._id });
    if (!note) {
      // create a default empty note so client doesn't need to do it
      note = await Note.create({
        user: req.user._id,
        subject: topic.subject,
        topic: topicId,
        content: '',
        tags: [],
      });
    }

    // Get revision status
    const revision = await Revision.findOne({ topic: topicId, user: req.user._id });

    // Get written answers
    const answers = await InterviewAnswer.find({ topic: topicId, user: req.user._id });

    res.json({
      topic,
      note,
      revision,
      answers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
