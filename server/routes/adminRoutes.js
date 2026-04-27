import express from 'express';
import { 
    getUsers, 
    deleteUser, 
    getUserById, 
    updateUser,
    getAllProjects,
    deleteProject,
    resetUserPasswordByAdmin
} from '../controllers/adminController.js';
import { protect, isAdmin } from '../middlewares/authMiddleware.js';

const adminRouter = express.Router();

// Rute Manajemen Pengguna
adminRouter.route('/users').get(protect, isAdmin, getUsers);
adminRouter.route('/users/:id')
    .delete(protect, isAdmin, deleteUser)
    .get(protect, isAdmin, getUserById)
    .put(protect, isAdmin, updateUser);

adminRouter.put('/users/:id/reset-password', protect, isAdmin, resetUserPasswordByAdmin);

// Rute Manajemen Proyek
adminRouter.route('/projects').get(protect, isAdmin, getAllProjects);
adminRouter.route('/projects/:id').delete(protect, isAdmin, deleteProject);

export default adminRouter;