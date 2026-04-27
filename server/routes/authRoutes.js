import express from 'express';
import { registerUser, authUser, verifyEmail, resendVerificationEmail } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import turnstileProtect from '../middlewares/turnstileMiddleware.js';

const authRouter = express.Router();

authRouter.post('/register', turnstileProtect, registerUser);
authRouter.post('/login', authUser);
authRouter.get('/verify/:token', verifyEmail);
authRouter.post('/resend-verification', protect, resendVerificationEmail);

export default authRouter;
