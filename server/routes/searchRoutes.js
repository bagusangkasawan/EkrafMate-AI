import express from 'express';
import { 
    searchCreatives,
    searchProjects
 } from '../controllers/searchController.js';

const searchRouter = express.Router();

searchRouter.post('/creatives', searchCreatives);

searchRouter.post('/projects', searchProjects);

export default searchRouter;
