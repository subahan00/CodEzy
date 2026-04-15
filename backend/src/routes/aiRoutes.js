import { askAI, getCodeReportCard } from "../controllers/aiController.js";
import express from "express";
    import authMiddleware from "../middleware/auth.middleware.js";
import { isAdmin,isLearner } from "../middleware/role.Middleware.js";
const router = express.Router();
router.post("/ask", authMiddleware, isLearner, askAI);
router.post("/evaluate", authMiddleware, isLearner, getCodeReportCard);

export default router;