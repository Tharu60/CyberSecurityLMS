import express from 'express';
import {
  getAllUsers,
  getUserById,
  deleteUser,
  getStatistics,
  getStudentAnalytics
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are admin-only
router.use(authenticate);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.delete('/users/:id', deleteUser);
router.get('/statistics', getStatistics);
router.get('/analytics', getStudentAnalytics);

export default router;
