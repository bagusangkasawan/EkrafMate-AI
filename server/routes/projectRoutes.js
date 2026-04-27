import express from 'express';
import { 
    createProject, 
    getMyProjects, 
    applyForProject,
    acceptCreative,
    updateProject,
    completeProject, 
    closeProject, 
    getAssignedProjects,
    getOpenProjects,
    getProjectById,
    generateProjectDescription,
    deleteMyProject
} from '../controllers/projectController.js';
import { protect, optionalAuth, isClient, isCreative, isAdminOrClient } from '../middlewares/authMiddleware.js';

const projectRouter = express.Router();

projectRouter.route('/')
    .get(getOpenProjects)
    .post(protect, isClient, createProject);

projectRouter.route('/myprojects').get(protect, isClient, getMyProjects);
projectRouter.route('/generate-description').post(protect, isAdminOrClient, generateProjectDescription);
projectRouter.route('/assigned').get(protect, isCreative, getAssignedProjects);

projectRouter.route('/:id')
    .get(optionalAuth, getProjectById)
    .put(protect, isAdminOrClient, updateProject)
    .delete(protect, isClient, deleteMyProject);

projectRouter.route('/:id/apply').put(protect, isCreative, applyForProject);
projectRouter.route('/:id/accept').put(protect, isClient, acceptCreative);
projectRouter.route('/:id/complete').put(protect, isCreative, completeProject);
projectRouter.route('/:id/close').put(protect, isClient, closeProject);

export default projectRouter;
