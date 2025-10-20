import express from 'express';
import {
  getAllStages,
  getStageById,
  getStageQuestions,
  createStage,
  updateStage,
  deleteStage
} from '../controllers/stageController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public/authenticated routes
router.get('/', authenticate, getAllStages);
router.get('/:id', authenticate, getStageById);
router.get('/:id/questions', authenticate, getStageQuestions);

// Instructor/Admin routes
router.post('/', authenticate, authorize('instructor', 'admin'), createStage);
router.put('/:id', authenticate, authorize('instructor', 'admin'), updateStage);

// Admin only routes
router.delete('/:id', authenticate, authorize('admin'), deleteStage);

export default router;
