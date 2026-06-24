import express from 'express';
import {
  getTopicQuestions,
  saveInterviewAnswer,
} from '../controllers/interviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/topic/:topicId', getTopicQuestions);
router.put('/answer/:questionId', saveInterviewAnswer);

export default router;
