import express from 'express';
import {
  getDailyPlanner,
  addCustomTask,
  updateTaskStatus,
  deletePlannerTask,
} from '../controllers/plannerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getDailyPlanner);
router.post('/', addCustomTask);
router.put('/:taskId', updateTaskStatus);
router.delete('/:taskId', deletePlannerTask);

export default router;
