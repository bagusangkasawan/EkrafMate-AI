import express from 'express';
import { getChatResponse } from '../controllers/chatbotController.js';
import { protect } from '../middlewares/authMiddleware.js';

const chatbotRouter = express.Router();

chatbotRouter.route('/').post(protect, getChatResponse);

export default chatbotRouter;
