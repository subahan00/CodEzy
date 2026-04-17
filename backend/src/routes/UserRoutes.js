import e from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import userController from "../controllers/user/userController.js";
const router=e.Router();

router.get('/my-submissions',authMiddleware,userController.getMySubmission)
router.put('/profile', authMiddleware, userController.updateProfile);
router.get('/analytics', authMiddleware, userController.getAnalytics);
export default router;