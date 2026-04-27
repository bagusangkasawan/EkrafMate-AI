import express from 'express';
import { 
    getUserProfile, 
    updateUserProfile, 
    generateProfileDescription, 
    getPublicProfileById,
    changeUserPassword
} from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const userRouter = express.Router();

userRouter.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

userRouter.put('/profile/change-password', protect, changeUserPassword);

userRouter.post('/generate-description', protect, generateProfileDescription);

userRouter.route('/:id').get(getPublicProfileById);

export default userRouter;
