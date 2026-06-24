import express from 'express';
import { createLinkedInPost, getLinkedInPosts } from '../controllers/linkedinController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createLinkedInPost);
router.get('/', getLinkedInPosts);

export default router;
