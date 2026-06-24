import express from 'express';
import {
  getRevisionQueue,
  completeRevision,
  scheduleRevision,
} from '../controllers/revisionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getRevisionQueue);
router.put('/complete/:revisionId', completeRevision);
router.post('/schedule', scheduleRevision);

export default router;
