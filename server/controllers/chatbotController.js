import asyncHandler from 'express-async-handler';
import { getChatbotResponse, generateEmbedding as ge } from '../services/geminiService.js';
import { getChatbotResponseAzure } from '../services/azureOpenAIService.js';
import User from '../models/User.js';
import Project from '../models/Project.js';

// @desc    Get a response from the chatbot (RAG-enhanced, multi-model)
// @route   POST /api/chatbot
// @access  Private
export const getChatResponse = asyncHandler(async (req, res) => {
    const { prompt, history, model } = req.body;

    if (!prompt) {
        res.status(400);
        throw new Error('Prompt is required');
    }

    try {
        // RAG context retrieval (always uses Gemini embedding)
        let context = '';
        try {
            const queryEmbedding = await ge(prompt);

            const [creatives, projects] = await Promise.all([
                User.aggregate([
                    {
                        $vectorSearch: {
                            index: 'users_profileEmbedding_index',
                            path: 'profileEmbedding',
                            queryVector: queryEmbedding,
                            numCandidates: 50,
                            limit: 3,
                        },
                    },
                    { $match: { role: 'creative', isVerified: true } },
                    { $project: { _id: 0, name: 1, headline: 1, description: 1, skills: 1 } },
                ]),
                Project.aggregate([
                    {
                        $vectorSearch: {
                            index: 'projects_projectEmbedding_index',
                            path: 'projectEmbedding',
                            queryVector: queryEmbedding,
                            numCandidates: 50,
                            limit: 3,
                        },
                    },
                    { $match: { status: { $in: ['open', 'in_progress'] } } },
                    { $project: { _id: 0, title: 1, description: 1, requiredSkills: 1, budget: 1, status: 1 } },
                ]),
            ]);

            const parts = [];
            if (projects.length > 0) {
                parts.push(
                    '=== Proyek Tersedia di Platform ===\n' +
                    projects.map(p =>
                        `- ${p.title}: ${p.description} | Skills: ${(p.requiredSkills || []).join(', ')} | Budget: ${p.budget ? `Rp${p.budget.toLocaleString('id-ID')}` : 'Tidak ditentukan'} | Status: ${p.status}`
                    ).join('\n')
                );
            }
            if (creatives.length > 0) {
                parts.push(
                    '=== Talenta Kreatif di Platform ===\n' +
                    creatives.map(c =>
                        `- ${c.name}${c.headline ? ` (${c.headline})` : ''}: ${c.description || '-'} | Skills: ${(c.skills || []).join(', ')}`
                    ).join('\n')
                );
            }
            context = parts.join('\n\n');
        } catch (ragError) {
            console.warn('RAG context retrieval failed, proceeding without context:', ragError.message);
        }

        // Select model for response generation
        let response;
        if (model === 'azure') {
            response = await getChatbotResponseAzure(prompt, history, context);
        } else {
            // Default: Gemini
            response = await getChatbotResponse(prompt, history, context);
        }

        res.json({ response, model: model === 'azure' ? 'azure' : 'gemini' });
    } catch (error) {
        res.status(500);
        throw new Error('Failed to get response from chatbot');
    }
});
