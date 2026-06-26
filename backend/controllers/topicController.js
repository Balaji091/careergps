import Topic from '../models/Topic.js';
import Subject from '../models/Subject.js';
import Analytics from '../models/Analytics.js';
import Revision from '../models/Revision.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { generateLearnContent, generateTopicTutorResponse, generateTopicQuizQuestions, generateLearningActivity } from '../services/aiService.js';
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

// Centralized topic completion logic
export const completeTopic = async (topicId, userId) => {
  const topic = await Topic.findOne({ _id: topicId, user: userId });
  if (!topic) return null;

  const previousStatus = topic.status || 'not_started';
  const previousProgress = topic.progress || 0;

  if (previousStatus !== 'completed') {
    topic.status = 'completed';
    topic.progress = 100;
    await topic.save();

    // 1. Aggregating progress up to Subject Level
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

    // 2. Gamification rewards
    const xpGained = 20; // Topic completed = 20 XP
    const topicsDelta = 1;
    await addXP(userId, xpGained, `Completed topic: ${topic.name}`);

    // 3. Auto-schedule revision
    const user = await User.findById(userId);
    if (user && user.profile.autoScheduleRevision !== false) {
      let revision = await Revision.findOne({ topic: topicId, user: userId });
      if (!revision) {
        revision = new Revision({
          user: userId,
          subject: topic.subject,
          topic: topicId,
        });
      }
      
      revision.status = 'Scheduled';
      revision.nextRevisionDate = new Date();
      revision.intervalStep = 0;
      await revision.save();
      
      await Notification.create({
        user: userId,
        title: `Revision Scheduled: ${topic.name} 📚`,
        message: `Great job! '${topic.name}' is now scheduled for revision tomorrow in your Spaced Repetition deck.`,
        type: 'Revision Due',
      });
    }

    // 4. Record study duration and XP update in the daily streak history
    const hoursDelta = ((100 - previousProgress) / 100) * topic.estimatedHours;
    await updateStreakActivity(userId, hoursDelta, 0, topicsDelta, xpGained);

    return { topic, xpGained, progressPercent };
  }

  return { topic, xpGained: 0, progressPercent: 100 };
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

    if (status === 'completed') {
      const completionResult = await completeTopic(topicId, req.user._id);
      if (completionResult) {
        return res.json({
          message: 'Topic progress updated successfully',
          topic: completionResult.topic,
          subjectProgress: completionResult.progressPercent,
          xpGained: completionResult.xpGained,
        });
      }
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

    if (previousStatus === 'completed' && status !== 'completed') {
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

const allowedActivityTypes = new Set([
  'flow',
  'algorithm',
  'timeline',
  'matching',
  'simulation',
  'packet',
  'decision',
  'pipeline',
  'relationship',
  'memory',
  'bugfix',
  'visualization',
]);

const sanitizeLearningActivity = (activity, topic) => {
  const topicName = topic.name || 'this concept';
  const fallbackFlow = [
    { id: 'problem', step: 1, label: 'Problem', icon: 'error', description: 'Spot the real need.' },
    { id: 'concept', step: 2, label: topicName, icon: 'psychology_alt', description: 'Apply the core idea.' },
    { id: 'example', step: 3, label: 'Example', icon: 'deployed_code', description: 'Test with one case.' },
    { id: 'result', step: 4, label: 'Result', icon: 'verified', description: 'Explain the outcome.' },
  ];
  const source = activity && typeof activity === 'object' ? activity : {};
  const flow = Array.isArray(source.flow) && source.flow.length ? source.flow : fallbackFlow;
  const activityType = allowedActivityTypes.has(source.activityType) ? source.activityType : 'flow';

  return {
    activityType,
    title: source.title || `${topicName} Concept Lab`,
    subtitle: source.subtitle || `Learn ${topicName} through a visual activity.`,
    difficulty: source.difficulty || topic.difficulty || 'Beginner',
    scenario: source.scenario || topic.summary || `Use ${topicName} in a realistic product situation.`,
    objective: source.objective || source.goal || 'Arrange, test, and explain the concept.',
    estimatedTime: source.estimatedTime || '3 min',
    flow: flow.slice(0, 8).map((node, index) => ({
      id: node.id || `step-${index + 1}`,
      step: Number(node.step) || index + 1,
      label: node.label || `Step ${index + 1}`,
      icon: node.icon || 'tips_and_updates',
      description: node.description || 'Understand this step visually.',
    })),
    exercise: source.exercise && typeof source.exercise === 'object' ? source.exercise : {},
    memoryHack: source.memoryHack || source.memoryHook || `Remember ${topicName}: problem, rule, example, trade-off.`,
    realWorldExample: source.realWorldExample || `${topicName} appears in real product decisions.`,
    commonMistake: source.commonMistake || 'Memorizing definitions without an example.',
    interviewTip: source.interviewTip || 'Explain the purpose, then one trade-off.',
    summary: source.summary || source.lesson || `${topicName} becomes easier when shown as steps.`,
    successMessage: source.successMessage || 'Concept locked. You can explain the path.',
    retryHint: source.retryHint || 'Focus on cause, action, then result.',
  };
};

// Retrieve topic Concept Lab activity (generating if not cached)
export const getTopicPracticeBoard = async (req, res) => {
  const { topicId } = req.params;

  try {
    const topic = await Topic.findOne({ _id: topicId, user: req.user._id });
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    if (
      topic.isPracticeGenerated &&
      topic.cachedPracticeBoard?.activityType &&
      Array.isArray(topic.cachedPracticeBoard?.flow)
    ) {
      return res.json(topic.cachedPracticeBoard);
    }

    const subject = await Subject.findById(topic.subject);
    const subjectName = subject ? subject.name : 'Computer Science';
    const userLevel = req.user.profile?.experienceLevel || 'Beginner';

    const learningActivity = await generateLearningActivity(topic.name, subjectName, userLevel);
    const sanitizedBoard = sanitizeLearningActivity(learningActivity, topic);

    topic.cachedPracticeBoard = sanitizedBoard;
    topic.isPracticeGenerated = true;
    await topic.save();

    res.json(sanitizedBoard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Retrieve previous quiz attempts for a topic
export const getTopicQuizAttempts = async (req, res) => {
  const { topicId } = req.params;

  try {
    const topic = await Topic.findOne({ _id: topicId, user: req.user._id });
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    const attempts = await QuizAttempt.find({ topic: topicId, user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit topic quiz and evaluate score
export const submitTopicQuiz = async (req, res) => {
  const { topicId } = req.params;
  const { answers = {} } = req.body;

  try {
    const topic = await Topic.findOne({ _id: topicId, user: req.user._id });
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    const totalQuestions = topic.quizQuestions?.length || 0;
    if (totalQuestions === 0) {
      return res.status(400).json({ message: 'No quiz questions found for this topic' });
    }

    const answerSnapshot = topic.quizQuestions.map((q, idx) => {
      const selectedIndex = Number.isInteger(answers[idx]) ? answers[idx] : null;
      const isCorrect = selectedIndex === q.correctIndex;
      return {
        question: q.question,
        options: q.options,
        selectedIndex,
        correctIndex: q.correctIndex,
        explanation: q.explanation || '',
        isCorrect,
      };
    });

    const score = answerSnapshot.reduce((acc, answer) => acc + (answer.isCorrect ? 1 : 0), 0);
    const passMark = Math.ceil(totalQuestions * 0.6);
    const passed = score >= passMark;

    const attempt = await QuizAttempt.create({
      user: req.user._id,
      subject: topic.subject,
      topic: topicId,
      score,
      totalQuestions,
      passed,
      answers: answerSnapshot,
    });

    // Award +10 XP per correct MCQ
    const xpGained = score * 10;
    if (xpGained > 0) {
      await addXP(req.user._id, xpGained, `Completed quiz for topic: ${topic.name}`);
    }

    // Auto complete topic if passing score achieved
    if (passed) {
      await completeTopic(topicId, req.user._id);
    }

    let analytics = await Analytics.findOne({ user: req.user._id });
    if (!analytics) {
      analytics = await Analytics.create({ user: req.user._id });
    }

    const previousQuizzes = analytics.totalQuizzesTaken || 0;
    const previousAvg = analytics.averageQuizScore || 0;
    const currentScorePercent = (score / totalQuestions) * 100;

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
      passed,
      passMark,
      totalQuestions,
      attempt,
      xpGained,
      totalQuizzesTaken: analytics.totalQuizzesTaken,
      averageQuizScore: analytics.averageQuizScore,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
