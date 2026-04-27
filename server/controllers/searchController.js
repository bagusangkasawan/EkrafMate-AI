import User from '../models/User.js';
import Project from '../models/Project.js';
import { generateEmbedding as ge } from '../services/geminiService.js';
import asyncHandler from 'express-async-handler';

// @desc    Search creatives (users) using semantic search
// @route   POST /api/search/creatives
// @access  Public
export const searchCreatives = asyncHandler(async (req, res) => {
    const { query } = req.body;
    if (!query) {
        res.status(400);
        throw new Error('Search query is required.');
    }
    try {
        const queryEmbedding = await ge(query);

        const results = await User.aggregate([
            {
                $vectorSearch: {
                    index: 'users_profileEmbedding_index',
                    path: 'profileEmbedding',
                    queryVector: queryEmbedding,
                    numCandidates: 100,
                    limit: 10
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    headline: 1,
                    description: 1,
                    skills: 1,
                    score: { $meta: 'vectorSearchScore' }
                }
            }
        ]);

        res.json(results);
    } catch (error) {
        console.error('Semantic search users error:', error);
        res.status(500);
        throw new Error('Failed to perform semantic search on users.');
    }
});

// @desc    Search projects using semantic search
// @route   POST /api/search/projects
// @access  Public
export const searchProjects = asyncHandler(async (req, res) => {
    const { query } = req.body;
    if (!query) {
        res.status(400);
        throw new Error('Search query is required.');
    }
    try {
        const queryEmbedding = await ge(query);

        const results = await Project.aggregate([
            {
                $vectorSearch: {
                    index: 'projects_projectEmbedding_index',
                    path: 'projectEmbedding',
                    queryVector: queryEmbedding,
                    numCandidates: 100,
                    limit: 10
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    owner: 1,
                    requiredSkills: 1,
                    budget: 1,
                    status: 1,
                    score: { $meta: 'vectorSearchScore' }
                }
            }
        ]);

        res.json(results);
    } catch (error) {
        console.error('Semantic search projects error:', error);
        res.status(500);
        throw new Error('Failed to perform semantic search on projects.');
    }
});
