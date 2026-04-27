import { generalChat, codeMentor, getCodeReportCard, generateTestCases } from "../controllers/aiController.js";
import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { isLearner } from "../middleware/role.Middleware.js";

const router = express.Router();

// ── GENERAL FREE CHAT  (no code context, no problem awareness) ────────────────
// Frontend calls this for: general questions, CS theory, off-topic talk, jokes
// Body: { prompt, history?, persona? }
router.post("/chat", authMiddleware, isLearner, generalChat);

// ── CODE MENTOR  (full problem + code context, mode-specific guidance) ────────
// Frontend calls this for: hints, error help, pre-submit review, edge cases, etc.
// Body: { prompt, history?, persona?, mode?, code?, problemId?, errorOutput? }
router.post("/mentor", authMiddleware, isLearner, codeMentor);

// ── POST-SUBMISSION REPORT CARD ───────────────────────────────────────────────
router.post("/evaluate", authMiddleware, isLearner, getCodeReportCard);

// ── TEST CASE GENERATOR (admin tool) ─────────────────────────────────────────
router.post('/generate-tests', generateTestCases);

// ── Legacy route (keeps old /ask calls working) ───────────────────────────────
router.post("/ask", authMiddleware, isLearner, generalChat);

export default router;