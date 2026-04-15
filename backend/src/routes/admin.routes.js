import express from 'express';
import { getAllUsers, updateUserStatus } from '../controllers/admin/admin.controller.js';
import { isAdmin,isLearner } from "../middleware/role.Middleware.js";

const router = express.Router();
router.get('/users', getAllUsers);
router.put('/users/:userId', updateUserStatus);
export default router;