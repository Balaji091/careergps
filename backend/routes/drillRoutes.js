import express from 'express';
import {
  generateDrill,
  submitDrill,
  getDrillHistory,
  getDrillHistoryList,
  getTodaysDrills,
  getDrillStats,
} from '../controllers/drillController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/generate', generateDrill);
router.put('/submit/:drillId', submitDrill);
router.get('/history', getDrillHistory);
router.get('/history/list', getDrillHistoryList);
router.get('/today', getTodaysDrills);
router.get('/stats', getDrillStats);

export default router;
