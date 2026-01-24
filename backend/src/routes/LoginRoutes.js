import express from "express";
import LoginController from "../controllers/auth/LoginController.js";
import authMiddleware from "../middleware/auth.middleware.js";
const router =express.Router()
router.post('/login',LoginController.loginUser)
router.post('/register',LoginController.registerUser)
router.get('/profile',authMiddleware,LoginController.getUserData)
export default router;