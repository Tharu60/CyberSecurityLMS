import express from 'express';
import {
  getVideosByStage,
  getAllVideos,
  createVideo,
  updateVideo,
  deleteVideo
} from '../controllers/videoController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All authenticated users can view videos
router.get('/stage/:stageId', authenticate, getVideosByStage);

// Instructor/Admin routes
router.get('/', authenticate, authorize('instructor', 'admin'), getAllVideos);
router.post('/', authenticate, authorize('instructor', 'admin'), createVideo);
router.put('/:id', authenticate, authorize('instructor', 'admin'), updateVideo);
router.delete('/:id', authenticate, authorize('instructor', 'admin'), deleteVideo);

export default router;
