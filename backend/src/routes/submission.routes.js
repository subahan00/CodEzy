import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import {isAdmin,isLearner} from '../middleware/role.middleware.js';
import {
  createSubmission,
  getMySubmissions
} from '../controllers/learner/submission.controller.js';

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  isLearner,
  createSubmission
);

// Learner views own submissions
router.get(
  '/mine',
  authMiddleware,
  isLearner,
  getMySubmissions
);

export default router;