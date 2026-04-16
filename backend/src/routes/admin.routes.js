import express from 'express';
import { getAllUsers, updateUserStatus, getDashboardStats } from '../controllers/admin/admin.controller.js';
import { isAdmin,isLearner } from "../middleware/role.Middleware.js";
 
const router = express.Router();
router.get('/users', getAllUsers);
router.put('/users/:userId', updateUserStatus);
router.get('/stats', getDashboardStats);
export default router;