import Drill from '../models/Drill.js';
import { generateDrillQuestions, evaluateDrillAnswers } from '../services/aiService.js';
import { addXP, getLocalDateString, updateStreakActivity } from '../services/gamificationService.js';

// @desc    Generate a new drill with AI questions
// @route   POST /api/drill/generate
export const generateDrill = async (req, res) => {
  const { role, source = 'general', focusTitle = '', questions: providedQuestions } = req.body;

  if (!role) {
    return res.status(400).json({ message: 'Role is required' });
  }

  try {
    const questions = Array.isArray(providedQuestions) && providedQuestions.length > 0
      ? providedQuestions
      : await generateDrillQuestions(role);

    const drill = await Drill.create({
      user: req.user._id,
      role,
      focusTitle,
      source,
      date: getLocalDateString(),
      questions: questions.map(q => ({
        question: q.question,
        expectedAnswer: q.expectedAnswer,
        answer: '',
      })),
      status: 'pending',
    });

    res.status(201).json(drill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit answers for a drill and get AI evaluation
// @route   PUT /api/drill/submit/:drillId
export const submitDrill = async (req, res) => {
  const { drillId } = req.params;
  const { answers } = req.body;

  try {
    const drill = await Drill.findOne({ _id: drillId, user: req.user._id });
    if (!drill) return res.status(404).json({ message: 'Drill not found' });

    if (drill.status === 'completed') {
      return res.status(400).json({ message: 'Drill already submitted' });
    }

    if (!answers || answers.length !== drill.questions.length) {
      return res.status(400).json({ message: `Please provide exactly ${drill.questions.length} answers` });
    }

    // Update questions with user answers
    drill.questions.forEach((q, i) => {
      q.answer = answers[i];
    });

    // Evaluate answers via AI
    const evaluation = await evaluateDrillAnswers(drill.questions);

    const score = evaluation.score || 0;
    const xpAwarded = Math.round(score / 10) * 5;

    drill.evaluation = {
      score: evaluation.score,
      verdict: evaluation.verdict,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
    };
    drill.xpAwarded = xpAwarded;
    drill.status = 'completed';

    await drill.save();

    // Update streak and XP
    if (xpAwarded > 0) {
      await addXP(req.user._id, xpAwarded, `Completed drill: ${drill.focusTitle || drill.role}`);
    }
    await updateStreakActivity(req.user._id, 0.2, 1, 0, xpAwarded);

    res.json(drill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get drill history (last 10 completed drills)
// @route   GET /api/drill/history
export const getDrillHistory = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const [drills, total] = await Promise.all([
      Drill.find({ user: req.user._id, status: 'completed' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Drill.countDocuments({ user: req.user._id, status: 'completed' }),
    ]);

    res.json({
      drills,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's stored drill records, separate from planner tasks
// @route   GET /api/drill/today
export const getTodaysDrills = async (req, res) => {
  try {
    const drills = await Drill.find({ user: req.user._id, date: getLocalDateString() })
      .sort({ createdAt: -1 });

    res.json(drills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get legacy drill history list for simple consumers
// @route   GET /api/drill/history/list
export const getDrillHistoryList = async (req, res) => {
  try {
    const drills = await Drill.find({ user: req.user._id, status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(drills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get drill statistics for the user
// @route   GET /api/drill/stats
export const getDrillStats = async (req, res) => {
  try {
    const completedDrills = await Drill.find({ user: req.user._id, status: 'completed' })
      .sort({ createdAt: -1 });

    const totalDrills = completedDrills.length;

    const averageScore = totalDrills > 0
      ? Math.round(completedDrills.reduce((sum, d) => sum + (d.evaluation?.score || 0), 0) / totalDrills)
      : 0;

    const lastDrillDate = totalDrills > 0 ? completedDrills[0].createdAt : null;

    const recentScores = completedDrills.slice(0, 5).map(d => d.evaluation?.score || 0);

    res.json({
      totalDrills,
      averageScore,
      lastDrillDate,
      recentScores,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
