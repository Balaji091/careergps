import Task from '../models/Task.js';
import Topic from '../models/Topic.js';
import Revision from '../models/Revision.js';
import Subject from '../models/Subject.js';
import User from '../models/User.js';
import { generateDailyTasks } from '../services/aiService.js';
import { addXP, updateStreakActivity, getLocalDateString } from '../services/gamificationService.js';
import Notification from '../models/Notification.js';

// Get or auto-generate daily planner tasks
export const getDailyPlanner = async (req, res) => {
  const todayStr = getLocalDateString();

  try {
    let tasks = await Task.find({ user: req.user._id, date: todayStr });

    if (tasks.length === 0) {
      // Fetch details to feed into AI planner
      const [pendingTopics, rawRevisions] = await Promise.all([
        Topic.find({ user: req.user._id, status: { $ne: 'completed' } }).limit(5),
        Revision.find({ 
          user: req.user._id, 
          nextRevisionDate: { $lte: new Date() }, 
          status: 'Scheduled' 
        }).populate('topic').limit(10),
      ]);

      const revisionDue = rawRevisions
        .filter(r => r.topic && r.topic.status === 'completed')
        .slice(0, 5);

      // Calculate progress
      const totalTopics = await Topic.countDocuments({ user: req.user._id });
      const completedTopics = await Topic.countDocuments({ user: req.user._id, status: 'completed' });
      const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

      const studyHours = req.user.profile.dailyStudyTime || 2;

      // Call AI Service
      const aiTasks = await generateDailyTasks(pendingTopics, revisionDue, studyHours, progressPercent);

      // Save tasks to DB
      const taskInstances = await Promise.all(
        aiTasks.map(t =>
          Task.create({
            user: req.user._id,
            name: t.name,
            type: t.type || 'custom',
            status: 'Pending',
            date: todayStr,
          })
        )
      );
      tasks = taskInstances;
    }

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add custom task to daily planner
export const addCustomTask = async (req, res) => {
  const { name, type } = req.body;
  const todayStr = getLocalDateString();

  try {
    const task = await Task.create({
      user: req.user._id,
      name,
      type: type || 'custom',
      status: 'Pending',
      date: todayStr,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update task status (Pending, In Progress, Completed, Skipped)
export const updateTaskStatus = async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  try {
    const task = await Task.findOne({ _id: taskId, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const previousStatus = task.status;
    task.status = status;
    await task.save();

    let xpGained = 0;
    let dailyCompletedReward = false;

    if (status === 'Completed' && previousStatus !== 'Completed') {
      // 10 XP for task completion
      xpGained = 10;
      await addXP(req.user._id, xpGained, `Completed task: ${task.name}`);
      await updateStreakActivity(req.user._id, 0.5, 1, 0, xpGained);

      // Check if all tasks for today are completed
      const todayTasks = await Task.find({ user: req.user._id, date: task.date });
      const allDone = todayTasks.every(t => t.status === 'Completed');

      if (allDone && todayTasks.length > 0) {
        // Daily goal completed reward = 50 XP
        const dailyRewardXP = 50;
        xpGained += dailyRewardXP;
        dailyCompletedReward = true;
        await addXP(req.user._id, dailyRewardXP, 'Completed all daily tasks!');
        
        await Notification.create({
          user: req.user._id,
          title: 'Daily Goal Achieved! 🌟',
          message: 'Amazing work! You completed all scheduled tasks for today and earned +50 XP.',
          type: 'Daily Goal Reminder',
        });
      }
    } else if (previousStatus === 'Completed' && status !== 'Completed') {
      // Deduct 10 XP for task uncompletion
      xpGained = -10;
      await addXP(req.user._id, -10, `Uncompleted task: ${task.name}`);

      // Check if all tasks for today were completed before this toggle
      // Since task.status is already saved as status in DB above, we check if all other tasks are Completed
      const todayTasks = await Task.find({ user: req.user._id, date: task.date });
      const allOthersDone = todayTasks.every(t => t._id.toString() === taskId || t.status === 'Completed');

      if (allOthersDone && todayTasks.length > 0) {
        // Revert daily goal completed reward = -50 XP
        const dailyRewardXP = -50;
        xpGained += dailyRewardXP;
        await addXP(req.user._id, dailyRewardXP, 'Reverted daily tasks completion');
      }

      await updateStreakActivity(req.user._id, -0.5, -1, 0, xpGained);
    }

    res.json({
      message: 'Task updated successfully',
      task,
      xpGained,
      dailyCompletedReward,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete planner task
export const deletePlannerTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    const result = await Task.deleteOne({ _id: taskId, user: req.user._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
