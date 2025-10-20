import express from 'express';
import {
  generateCertificate,
  getUserCertificate,
  verifyCertificate
} from '../controllers/certificateController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Student routes
router.post('/generate', authenticate, authorize('student'), generateCertificate);
router.get('/my-certificate', authenticate, authorize('student'), getUserCertificate);

// Public route for verification
router.get('/verify/:code', verifyCertificate);

export default router;
