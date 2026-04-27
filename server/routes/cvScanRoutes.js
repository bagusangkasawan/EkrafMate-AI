import express from 'express';
import { scanCV, uploadMiddleware } from '../controllers/cvScanController.js';
import { optionalAuth } from '../middlewares/authMiddleware.js';

const cvScanRouter = express.Router();

// POST /api/cv-scan — Upload and analyze CV (public with optional auth)
cvScanRouter.route('/').post(optionalAuth, uploadMiddleware, scanCV);

export default cvScanRouter;
