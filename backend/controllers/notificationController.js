import Notification from '../models/Notification.js';
import Streak from '../models/Streak.js';
import { getLocalDateString, getYesterdayDateString } from '../services/gamificationService.js';

// Retrieve all notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findOne({ _id: id, user: req.user._id });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check for streak breaking risk and alert
export const checkStreakRisk = async (req, res) => {
  const today = getLocalDateString();
  const yesterday = getYesterdayDateString();

  try {
    const streak = await Streak.findOne({ user: req.user._id });
    if (!streak || streak.currentStreak === 0) {
      return res.json({ status: 'no_risk', currentStreak: 0 });
    }

    // Check if user has updated study activity today
    const studiedToday = streak.history.some(h => h.date === today && h.hoursStudied > 0);

    if (!studiedToday && streak.lastActiveDate === yesterday) {
      // User is at risk of losing their streak
      // Check if alert already created today
      const todayAlertExists = await Notification.findOne({
        user: req.user._id,
        type: 'Streak Risk',
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      });

      if (!todayAlertExists) {
        const notif = await Notification.create({
          user: req.user._id,
          title: 'Streak Risk Alert! ⚡',
          message: `Your ${streak.currentStreak}-day learning streak is at risk! Log some study activity or complete a daily planner task today to keep it active.`,
          type: 'Streak Risk',
        });
        return res.json({ status: 'risk_detected', notification: notif });
      }
      return res.json({ status: 'risk_detected', message: 'Alert already triggered today.' });
    }

    res.json({ status: 'no_risk', currentStreak: streak.currentStreak });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
