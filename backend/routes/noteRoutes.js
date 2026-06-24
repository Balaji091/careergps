import express from 'express';
import {
  getNote,
  updateNote,
  getAIAssistantNote,
  searchNotes,
} from '../controllers/noteController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/topic/:topicId', getNote);
router.put('/topic/:topicId', updateNote);
router.post('/topic/:topicId/ai', getAIAssistantNote);
router.get('/search', searchNotes);

export default router;
