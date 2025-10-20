import express from 'express';
import {
  getUserProgress,
  submitInitialAssessment,
  submitStageAssessment,
  markVideoCompleted,
  getVideoProgress
} from '../controllers/progressController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Student routes
router.get('/my-progress', authenticate, authorize('student'), getUserProgress);
router.post('/initial-assessment', authenticate, authorize('student'), submitInitialAssessment);
router.post('/stage-assessment', authenticate, authorize('student'), submitStageAssessment);
router.post('/video-completed', authenticate, authorize('student'), markVideoCompleted);
router.get('/videos', authenticate, authorize('student'), getVideoProgress);

// Instructor/Admin routes - view student progress
router.get('/user/:userId', authenticate, authorize('instructor', 'admin'), getUserProgress);
router.get('/user/:userId/videos', authenticate, authorize('instructor', 'admin'), getVideoProgress);

export default router;
