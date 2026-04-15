import express from 'express';
import { getGlobalLeaderboard } from '../controllers/leaderboard/leaderboard.controller.js';

const router = express.Router();

router.get('/', getGlobalLeaderboard);

export default router;