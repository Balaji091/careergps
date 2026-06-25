import Revision from '../models/Revision.js';
import Topic from '../models/Topic.js';
import { addXP, updateStreakActivity } from '../services/gamificationService.js';

// Get all revisions scheduled or completed
export const getRevisionQueue = async (req, res) => {
  try {
    const revisions = await Revision.find({ user: req.user._id })
      .populate('subject', 'name')
      .populate('topic', 'name difficulty status summary cachedLearnContent');

    const today = new Date();
    today.setHours(23, 59, 59, 999); // end of today

    // Filter queue categories to only show topics that are actually completed
    const due = revisions.filter(
      r => r.topic && r.topic.status === 'completed' && r.status === 'Scheduled' && r.nextRevisionDate && new Date(r.nextRevisionDate) <= today
    );
    const upcoming = revisions.filter(
      r => r.topic && r.topic.status === 'completed' && r.status === 'Scheduled' && r.nextRevisionDate && new Date(r.nextRevisionDate) > today
    );
    const mastered = revisions.filter(
      r => r.topic && r.topic.status === 'completed' && r.status === 'Mastered'
    );
    const notStarted = revisions.filter(
      r => r.topic && r.topic.status === 'completed' && r.status === 'Not Started'
    );

    res.json({
      due,
      upcoming,
      mastered,
      notStarted,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Log a revision completion and schedule the next interval
export const completeRevision = async (req, res) => {
  const { revisionId } = req.params;

  // Day intervals mapping
  const intervals = [1, 3, 7, 15, 30, 60];

  try {
    const revision = await Revision.findOne({ _id: revisionId, user: req.user._id });
    if (!revision) return res.status(404).json({ message: 'Revision card not found' });

    const currentStep = revision.intervalStep;
    const historyEntry = {
      date: new Date(),
      intervalStepUsed: currentStep,
    };

    revision.lastRevisionDate = new Date();
    revision.history.push(historyEntry);

    let nextIntervalDays = 1;
    let newStatus = 'Scheduled';
    let newStep = currentStep;

    if (currentStep < intervals.length) {
      nextIntervalDays = intervals[currentStep];
      newStep = currentStep + 1;
    } else {
      newStatus = 'Mastered';
      newStep = 6; // Mastered step
    }

    revision.intervalStep = newStep;
    revision.status = newStatus;

    if (newStatus !== 'Mastered') {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + nextIntervalDays);
      revision.nextRevisionDate = nextDate;
    } else {
      revision.nextRevisionDate = null;
    }

    await revision.save();

    // Reward XP
    const xpGained = 10; // Revision = 10 XP
    await addXP(req.user._id, xpGained, `Completed revision: ${revision.topic}`);
    await updateStreakActivity(req.user._id, 0.5, 0, 0, xpGained);

    res.json({
      message: newStatus === 'Mastered' ? 'Topic Mastered! 🎉' : `Revision logged. Next review in ${nextIntervalDays} days.`,
      revision,
      xpGained,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Manually trigger scheduling a revision card
export const scheduleRevision = async (req, res) => {
  const { topicId } = req.body;

  try {
    const revision = await Revision.findOne({ topic: topicId, user: req.user._id });
    if (!revision) return res.status(404).json({ message: 'Revision card not found' });

    // Schedule for tomorrow
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);

    revision.nextRevisionDate = nextDate;
    revision.status = 'Scheduled';
    revision.intervalStep = 0; // reset step
    await revision.save();

    res.json({ message: 'Revision scheduled successfully', revision });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
