import User from '../models/User.js';
import Achievement from '../models/Achievement.js';
import Notification from '../models/Notification.js';
import Streak from '../models/Streak.js';
import Topic from '../models/Topic.js';
import Note from '../models/Note.js';
import InterviewAnswer from '../models/InterviewAnswer.js';
import Subject from '../models/Subject.js';
import mongoose from 'mongoose';

// Helper to get formatted date string in YYYY-MM-DD
export const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to get yesterday's date string
export const getYesterdayDateString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getXPForLevel = (level) => {
  return (level - 1) * 200 + 100;
};

export const addXP = async (userId, xpAmount, reason) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    user.xp = Math.max(0, user.xp + xpAmount);

    // Check level ups
    let leveledUp = false;
    let requiredXP = getXPForLevel(user.level);
    
    while (user.xp >= requiredXP) {
      user.xp -= requiredXP;
      user.level += 1;
      leveledUp = true;
      requiredXP = getXPForLevel(user.level);
    }

    await user.save();

    if (xpAmount > 0) {
      await Notification.create({
        user: userId,
        title: `+${xpAmount} XP Earned! ⚡`,
        message: reason || 'Completed learning activity.',
        type: 'Daily Goal Reminder',
      });
    }

    if (leveledUp) {
      await Notification.create({
        user: userId,
        title: 'Level Up! 🎉',
        message: `Congratulations! You have reached Level ${user.level}. Keep up the great work!`,
        type: 'Daily Goal Reminder',
      });
    }

    return {
      xp: user.xp,
      level: user.level,
      leveledUp,
    };
  } catch (error) {
    console.error('Gamification Service XP update error:', error.message);
    return null;
  }
};

// Update streak status and activity record
export const updateStreakActivity = async (userId, hoursDelta = 0, tasksDelta = 0, topicsDelta = 0, xpDelta = 0) => {
  try {
    const today = getLocalDateString();
    const yesterday = getYesterdayDateString();
    
    let streakDoc = await Streak.findOne({ user: userId });
    if (!streakDoc) {
      streakDoc = await Streak.create({ user: userId });
    }

    // Check history item
    let historyItem = streakDoc.history.find(h => h.date === today);
    if (!historyItem) {
      historyItem = {
        date: today,
        hoursStudied: 0,
        tasksCompleted: 0,
        topicsCompleted: 0,
        xpGained: 0,
      };
      streakDoc.history.push(historyItem);
    }

    // Update daily accumulators
    historyItem = streakDoc.history.find(h => h.date === today);
    historyItem.hoursStudied = Math.max(0, historyItem.hoursStudied + hoursDelta);
    historyItem.tasksCompleted = Math.max(0, historyItem.tasksCompleted + tasksDelta);
    historyItem.topicsCompleted = Math.max(0, historyItem.topicsCompleted + topicsDelta);
    historyItem.xpGained = Math.max(0, historyItem.xpGained + xpDelta);

    // Update streak counts
    const lastActive = streakDoc.lastActiveDate;
    if (!lastActive) {
      streakDoc.currentStreak = 1;
      streakDoc.longestStreak = 1;
    } else if (lastActive === yesterday) {
      streakDoc.currentStreak += 1;
      if (streakDoc.currentStreak > streakDoc.longestStreak) {
        streakDoc.longestStreak = streakDoc.currentStreak;
      }
    } else if (lastActive !== today) {
      // Streak broken, reset
      streakDoc.currentStreak = 1;
    }

    streakDoc.lastActiveDate = today;
    streakDoc.markModified('history');
    await streakDoc.save();

    // Check achievement unlock
    await checkAndUnlockAchievements(userId);

    return streakDoc;
  } catch (error) {
    console.error('Streak update error:', error.message);
    return null;
  }
};

export const checkAndUnlockAchievements = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    const [
      topicsCount,
      notesCount,
      answersCount,
      streakDoc,
      completedSubjectsCount,
    ] = await Promise.all([
      Topic.countDocuments({ user: userId, status: 'completed' }),
      Note.countDocuments({ user: userId, content: { $ne: '' } }),
      InterviewAnswer.countDocuments({ user: userId, answer: { $ne: '' } }),
      Streak.findOne({ user: userId }),
      Subject.countDocuments({ user: userId, status: 'completed' }),
    ]);

    const streakCount = streakDoc ? streakDoc.currentStreak : 0;
    const achievementsToUnlock = [];

    // Check definitions
    if (streakCount >= 7) {
      achievementsToUnlock.push({
        title: '7 Day Streak',
        description: 'Learned continuously for 7 days in a row.',
        badgeIcon: 'streak-7',
      });
    }
    if (streakCount >= 30) {
      achievementsToUnlock.push({
        title: '30 Day Streak',
        description: 'Maintained a learning habit for 30 consecutive days.',
        badgeIcon: 'streak-30',
      });
    }
    if (topicsCount >= 100) {
      achievementsToUnlock.push({
        title: '100 Topics Learned',
        description: 'Successfully learned and completed 100 core path topics.',
        badgeIcon: 'topics-100',
      });
    }
    if (notesCount >= 50) {
      achievementsToUnlock.push({
        title: '50 Notes Created',
        description: 'Wrote 50 comprehensive personal study notes.',
        badgeIcon: 'notes-50',
      });
    }
    if (answersCount >= 100) {
      achievementsToUnlock.push({
        title: '100 Interview Answers Written',
        description: 'Successfully drafted answers for 100 technical interview questions.',
        badgeIcon: 'interview-100',
      });
    }

    // Starter & Subject Achievements
    if (topicsCount >= 1) {
      achievementsToUnlock.push({
        title: 'First Step',
        description: 'Completed your first learning topic on the path.',
        badgeIcon: 'topics-1',
      });
    }
    if (notesCount >= 1) {
      achievementsToUnlock.push({
        title: 'First Documentation',
        description: 'Created your first study note to summarize learning.',
        badgeIcon: 'notes-1',
      });
    }
    if (answersCount >= 1) {
      achievementsToUnlock.push({
        title: 'Interview Ready Starter',
        description: 'Drafted your first technical mock interview response.',
        badgeIcon: 'interview-1',
      });
    }

    // Dynamic Subject & Course Certificate achievements
    const allUserSubjects = await Subject.find({ user: userId });
    let completedCount = 0;
    
    for (const sub of allUserSubjects) {
      if (sub.status === 'completed') {
        completedCount++;
        achievementsToUnlock.push({
          title: `${sub.name} Master`,
          description: `Successfully completed all topics in the "${sub.name}" subject module.`,
          badgeIcon: `subject-${sub._id.toString()}`,
        });
      }
    }

    if (allUserSubjects.length > 0 && completedCount === allUserSubjects.length) {
      achievementsToUnlock.push({
        title: `Certificate: ${user.profile?.targetRole || 'Software Career Pathway'}`,
        description: `Official certificate for successfully mastering all modules in the ${user.profile?.targetRole || 'Software Career'} path.`,
        badgeIcon: 'certificate',
      });
    }

    const unlocked = [];
    for (const ach of achievementsToUnlock) {
      try {
        const doc = await Achievement.create({
          user: userId,
          title: ach.title,
          description: ach.description,
          badgeIcon: ach.badgeIcon,
        });
        unlocked.push(doc);

        await Notification.create({
          user: userId,
          title: `Achievement Unlocked: ${ach.title}! 🏆`,
          message: ach.description,
          type: 'Daily Goal Reminder',
        });
      } catch (err) {
        // already unlocked
      }
    }

    return unlocked;
  } catch (error) {
    console.error('Gamification Service Achievement error:', error.message);
    return [];
  }
};
