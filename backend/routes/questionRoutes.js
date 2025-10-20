import express from 'express';
import {
  getQuestionsByStage,
  createQuestion,
  updateQuestion,
  deleteQuestion
} from '../controllers/questionController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Instructor/Admin routes
router.get('/stage/:stageId', authenticate, authorize('instructor', 'admin'), getQuestionsByStage);
router.post('/', authenticate, authorize('instructor', 'admin'), createQuestion);
router.put('/:id', authenticate, authorize('instructor', 'admin'), updateQuestion);
router.delete('/:id', authenticate, authorize('instructor', 'admin'), deleteQuestion);

export default router;
