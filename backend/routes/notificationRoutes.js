import express from 'express';
import {
  getNotifications,
  markAsRead,
  checkStreakRisk,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.post('/streak-check', checkStreakRisk);

export default router;
