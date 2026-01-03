import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import {isAdmin,isLearner} from '../middleware/role.middleware.js';
import {
  createProblem,
  publishProblem,
  addTestCases
} from '../controllers/admin/problem.controller.js';
import {
  getAllProblems,
  getProblemBySlug
} from '../controllers/learner/problem.controller.js';

const router = express.Router();

// =====================
// Admin routes
// =====================
router.post(
  '/',
  authMiddleware,
  isAdmin,
  createProblem
);

router.post(
  '/:id/testcases',
  authMiddleware,
  isAdmin,
  addTestCases
);

router.patch(
  '/:id/publish',
  authMiddleware,
  isAdmin,
  publishProblem
);

// =====================
// Learner routes
// =====================
router.get(
  '/',
  authMiddleware,
  isLearner,
  getAllProblems
);

router.get(
  '/:slug',
  authMiddleware,
  isLearner,
  getProblemBySlug
);

export default router;
