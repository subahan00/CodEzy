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
  getProblemBySlug,
  getRandomProblem
} from '../controllers/learner/problem.controller.js';
import {
  deleteProblem,
  updateProblem,
  getProblemById} from '../controllers/admin/problem.controller.js';

const router = express.Router();

// =====================
// Admin routes
// =====================
router.post(
  '/',
   authMiddleware,
  // isAdmin,
  createProblem
);
router.put(
  '/publish/:id',
  authMiddleware,
  isAdmin,
  publishProblem
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
  // isLearner,
  getAllProblems
);
router.get(
  '/random',
  authMiddleware,
  // isLearner,
  getRandomProblem
);
router.get(
  '/slug/:slug',
  authMiddleware,
  // isLearner,
  getProblemBySlug
);


router.delete(
  '/:id',
  authMiddleware,
  isAdmin,
  deleteProblem
);
router.put(
  '/:id',
  authMiddleware,
  isAdmin,
  updateProblem
);
router.get(
  '/:id',
  authMiddleware,
  // isLearner,
  getProblemById
)
export default router;
