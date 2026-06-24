import express from 'express';
import {
  onboardUser,
  getActiveRoadmap,
  getSubjectDetails,
  getTopicDetails,
} from '../controllers/roadmapController.js';
import {
  getTopicLearnContent,
  updateTopicProgress,
  chatWithTopicTutor,
  awardQuizReward,
  getTopicQuiz,
  submitTopicQuiz,
} from '../controllers/topicController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // protect all roadmap routes

router.post('/onboard', onboardUser);
router.get('/active', getActiveRoadmap);
router.get('/subject/:subjectId', getSubjectDetails);
router.get('/topic/:topicId', getTopicDetails);

// Topic specific learning/progress routes
router.get('/topic/:topicId/learn', getTopicLearnContent);
router.put('/topic/:topicId/progress', updateTopicProgress);
router.post('/topic/:topicId/chat', chatWithTopicTutor);
router.post('/topic/:topicId/quiz/reward', awardQuizReward);
router.get('/topic/:topicId/quiz', getTopicQuiz);
router.post('/topic/:topicId/quiz/submit', submitTopicQuiz);

export default router;
