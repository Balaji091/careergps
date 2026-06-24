import Topic from '../models/Topic.js';
import Subject from '../models/Subject.js';
import Analytics from '../models/Analytics.js';
import Revision from '../models/Revision.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { generateLearnContent, generateTopicTutorResponse, generateTopicQuizQuestions } from '../services/aiService.js';
import { addXP, updateStreakActivity } from '../services/gamificationService.js';

// Get learn content for a topic (generating if not cached)
export const getTopicLearnContent = async (req, res) => {
  const { topicId } = req.params;

  try {
    const topic = await Topic.findOne({ _id: topicId, user: req.user._id });
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    if (topic.isLearnGenerated) {
      return res.json(topic.cachedLearnContent);
    }

    const subject = await Subject.findById(topic.subject);
    const subjectName = subject ? subject.name : 'Computer Science';
    const userLevel = req.user.profile.experienceLevel || 'Beginner';

    // Call Grok / Mock AI to generate content
    const learnContent = await generateLearnContent(topic.name, subjectName, userLevel);

    // Sanitize structure to prevent schema validation or rendering crashes
    const sanitizedContent = {
      definition: learnContent.definition || learnContent.Definition || '',
      detailedExplanation: learnContent.detailedExplanation || learnContent.DetailedExplanation || learnContent.explanation || '',
      realWorldExample: learnContent.realWorldExample || learnContent.RealWorldExample || learnContent.example || '',
      useCases: Array.isArray(learnContent.useCases) ? learnContent.useCases : Array.isArray(learnContent.UseCases) ? learnContent.UseCases : [],
      commonMistakes: Array.isArray(learnContent.commonMistakes) ? learnContent.commonMistakes : Array.isArray(learnContent.CommonMistakes) ? learnContent.CommonMistakes : [],
      interviewTips: Array.isArray(learnContent.interviewTips) ? learnContent.interviewTips : Array.isArray(learnContent.InterviewTips) ? learnContent.InterviewTips : [],
      keyTakeaways: Array.isArray(learnContent.keyTakeaways) ? learnContent.keyTakeaways : Array.isArray(learnContent.KeyTakeaways) ? learnContent.KeyTakeaways : [],
    };

    // Save to cache
    topic.cachedLearnContent = sanitizedContent;
    topic.isLearnGenerated = true;
    await topic.save();

    res.json(sanitizedContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update topic progress & status
export const updateTopicProgress = async (req, res) => {
  const { topicId } = req.params;
  const { progress, status } = req.body; // status: 'not_started', 'in_progress', 'completed'

  try {
    const topic = await Topic.findOne({ _id: topicId, user: req.user._id });
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const previousProgress = topic.progress || 0;
    const previousStatus = topic.status || 'not_started';
    
    // Update topic progress
    topic.progress = progress;
    topic.status = status;
    await topic.save();

    // Aggregating progress up to Subject Level
    const allTopics = await Topic.find({ subject: topic.subject });
    const completedCount = allTopics.filter(t => t.status === 'completed').length;
    const progressPercent = Math.round((completedCount / allTopics.length) * 100);

    const subject = await Subject.findById(topic.subject);
    if (subject) {
      subject.progress = progressPercent;
      if (progressPercent === 100) {
        subject.status = 'completed';
      } else if (progressPercent > 0) {
        subject.status = 'in_progress';
      } else {
        subject.status = 'not_started';
      }
      await subject.save();
    }

    // Gamification rewards on new completion / reversion
    let xpGained = 0;
    let topicsDelta = 0;

    if (status === 'completed' && previousStatus !== 'completed') {
      xpGained = 20; // Topic completed = 20 XP
      topicsDelta = 1;
      await addXP(req.user._id, xpGained, `Completed topic: ${topic.name}`);

      // Auto-schedule revision
      const user = await User.findById(req.user._id);
      if (user && user.profile.autoScheduleRevision !== false) {
        let revision = await Revision.findOne({ topic: topicId, user: req.user._id });
        if (!revision) {
          revision = new Revision({
            user: req.user._id,
            subject: topic.subject,
            topic: topicId,
          });
        }
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        revision.status = 'Scheduled';
        revision.nextRevisionDate = tomorrow;
        revision.intervalStep = 0;
        await revision.save();
        
        await Notification.create({
          user: req.user._id,
          title: `Revision Scheduled: ${topic.name} 📚`,
          message: `Great job! '${topic.name}' is now scheduled for revision tomorrow in your Spaced Repetition deck.`,
          type: 'Revision Due',
        });
      }
    } else if (previousStatus === 'completed' && status !== 'completed') {
      xpGained = -20; // Reverted completion = -20 XP
      topicsDelta = -1;
      await addXP(req.user._id, xpGained, `Reverted completion of topic: ${topic.name}`);

      // Revert revision scheduling
      const revision = await Revision.findOne({ topic: topicId, user: req.user._id });
      if (revision) {
        revision.status = 'Not Started';
        revision.nextRevisionDate = null;
        revision.intervalStep = 0;
        await revision.save();
      }
    }

    // Calculate hoursDelta proportional to the progress change percentage
    const hoursDelta = ((progress - previousProgress) / 100) * topic.estimatedHours;

    // Record study duration and XP update in the daily streak history
    await updateStreakActivity(req.user._id, hoursDelta, 0, topicsDelta, xpGained);

    res.json({
      message: 'Topic progress updated successfully',
      topic,
      subjectProgress: progressPercent,
      xpGained,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Chat with AI Topic Tutor
export const chatWithTopicTutor = async (req, res) => {
  const { topicId } = req.params;
  const { message } = req.body;

  try {
    const topic = await Topic.findOne({ _id: topicId, user: req.user._id });
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    let learnContentContext = topic.cachedLearnContent?.detailedExplanation || '';
    
    // Generate learn content context dynamically if not already cached
    if (!topic.isLearnGenerated) {
      const subject = await Subject.findById(topic.subject);
      const subjectName = subject ? subject.name : 'Computer Science';
      const userLevel = req.user.profile?.experienceLevel || 'Beginner';
      
      try {
        const generated = await generateLearnContent(topic.name, subjectName, userLevel);
        const sanitizedContent = {
          definition: generated.definition || generated.Definition || '',
          detailedExplanation: generated.detailedExplanation || generated.DetailedExplanation || generated.explanation || '',
          realWorldExample: generated.realWorldExample || generated.RealWorldExample || generated.example || '',
          useCases: Array.isArray(generated.useCases) ? generated.useCases : Array.isArray(generated.UseCases) ? generated.UseCases : [],
          commonMistakes: Array.isArray(generated.commonMistakes) ? generated.commonMistakes : Array.isArray(generated.CommonMistakes) ? generated.CommonMistakes : [],
          interviewTips: Array.isArray(generated.interviewTips) ? generated.interviewTips : Array.isArray(generated.InterviewTips) ? generated.InterviewTips : [],
          keyTakeaways: Array.isArray(generated.keyTakeaways) ? generated.keyTakeaways : Array.isArray(generated.KeyTakeaways) ? generated.KeyTakeaways : [],
        };
        topic.cachedLearnContent = sanitizedContent;
        topic.isLearnGenerated = true;
        await topic.save();
        learnContentContext = sanitizedContent.detailedExplanation;
      } catch (aiErr) {
        console.error('[TUTOR CHAT] Failed to generate learn context context:', aiErr.message);
      }
    }

    const tutorResponse = await generateTopicTutorResponse(
      topic.name,
      message,
      learnContentContext
    );

    res.json({ response: tutorResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Award XP for answering tutor quiz correctly
export const awardQuizReward = async (req, res) => {
  try {
    const xpGained = 5;
    await addXP(req.user._id, xpGained, 'Correctly answered tutor quiz');
    await updateStreakActivity(req.user._id, 0, 0, 0, xpGained);
    res.json({ message: 'Quiz reward processed successfully', xpGained });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Retrieve topic quiz (generating if not cached)
export const getTopicQuiz = async (req, res) => {
  const { topicId } = req.params;

  try {
    const topic = await Topic.findOne({ _id: topicId, user: req.user._id });
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    if (topic.isQuizGenerated && topic.quizQuestions && topic.quizQuestions.length > 0) {
      return res.json(topic.quizQuestions);
    }

    const subject = await Subject.findById(topic.subject);
    const subjectName = subject ? subject.name : 'Computer Science';
    const userLevel = req.user.profile?.experienceLevel || 'Beginner';

    const quizQuestions = await generateTopicQuizQuestions(topic.name, subjectName, userLevel);

    // Save to Cache
    topic.quizQuestions = quizQuestions;
    topic.isQuizGenerated = true;
    await topic.save();

    res.json(quizQuestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit topic quiz and evaluate score
export const submitTopicQuiz = async (req, res) => {
  const { topicId } = req.params;
  const { score } = req.body; // Score from 0 to 5

  try {
    const topic = await Topic.findOne({ _id: topicId, user: req.user._id });
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    // Award +10 XP per correct MCQ
    const xpGained = score * 10;
    if (xpGained > 0) {
      await addXP(req.user._id, xpGained, `Completed quiz for topic: ${topic.name}`);
    }

    // Update Analytics stats
    let analytics = await Analytics.findOne({ user: req.user._id });
    if (!analytics) {
      analytics = await Analytics.create({ user: req.user._id });
    }

    const previousQuizzes = analytics.totalQuizzesTaken || 0;
    const previousAvg = analytics.averageQuizScore || 0;
    const currentScorePercent = (score / 5) * 100;

    analytics.totalQuizzesTaken = previousQuizzes + 1;
    analytics.averageQuizScore = Math.round(
      (previousAvg * previousQuizzes + currentScorePercent) / (previousQuizzes + 1)
    );
    await analytics.save();

    // Log study duration and XP update in the daily streak history
    await updateStreakActivity(req.user._id, 0, 0, 0, xpGained);

    res.json({
      message: 'Quiz score evaluated successfully',
      score,
      xpGained,
      totalQuizzesTaken: analytics.totalQuizzesTaken,
      averageQuizScore: analytics.averageQuizScore,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
