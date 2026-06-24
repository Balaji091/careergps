import User from '../models/User.js';
import Streak from '../models/Streak.js';
import Analytics from '../models/Analytics.js';
import Roadmap from '../models/Roadmap.js';
import Subject from '../models/Subject.js';
import Topic from '../models/Topic.js';
import Task from '../models/Task.js';
import Revision from '../models/Revision.js';
import Note from '../models/Note.js';
import InterviewAnswer from '../models/InterviewAnswer.js';
import Achievement from '../models/Achievement.js';
import Notification from '../models/Notification.js';

// Get list of all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user role (e.g. elevate to admin)
export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body; // 'user' or 'admin'

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    await user.save();

    res.json({ message: `User role updated to ${role} successfully`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user account & cascade all associated collections data
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Cascade deletions
    await Promise.all([
      Streak.deleteOne({ user: id }),
      Analytics.deleteOne({ user: id }),
      Roadmap.deleteMany({ user: id }),
      Subject.deleteMany({ user: id }),
      Topic.deleteMany({ user: id }),
      Task.deleteMany({ user: id }),
      Revision.deleteMany({ user: id }),
      Note.deleteMany({ user: id }),
      InterviewAnswer.deleteMany({ user: id }),
      Achievement.deleteMany({ user: id }),
      Notification.deleteMany({ user: id }),
      User.deleteOne({ _id: id }),
    ]);

    res.json({ message: 'User and all related learning data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
