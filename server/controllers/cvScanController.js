import asyncHandler from 'express-async-handler';
import multer from 'multer';
import { analyzeCV } from '../services/documentIntelligenceService.js';
import { analyzeCVWithAI, analyzeJobMatch } from '../services/azureOpenAIService.js';
import Project from '../models/Project.js';
import { generateEmbedding } from '../services/geminiService.js';

// Multer configuration for file upload (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/bmp',
            'image/tiff',
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Format file tidak didukung. Gunakan PDF, JPEG, PNG, BMP, atau TIFF.'), false);
        }
    },
});

export const uploadMiddleware = upload.single('cv');

// @desc    Scan and analyze CV using Azure Document Intelligence + Azure OpenAI
// @route   POST /api/cv-scan
// @access  Public (but full results require authentication)
export const scanCV = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('File CV harus diupload.');
    }

    try {
        // Step 1: Extract text from CV using Azure Document Intelligence
        const extractedText = await analyzeCV(req.file.buffer, req.file.mimetype);

        if (!extractedText || extractedText.trim().length === 0) {
            res.status(422);
            throw new Error('Tidak dapat mengekstrak teks dari dokumen. Pastikan file berisi teks yang dapat dibaca.');
        }

        // Step 2: Analyze extracted text with Azure OpenAI
        const analysis = await analyzeCVWithAI(extractedText);

        // Step 3: Get AI Job Matches if authenticated
        const isAuthenticated = !!req.user;
        let projectMatches = [];

        if (isAuthenticated && analysis.skills && analysis.skills.length > 0) {
            try {
                const skillString = analysis.skills.join(', ');
                const queryEmbedding = await generateEmbedding(skillString);

                const projects = await Project.aggregate([
                    {
                        $vectorSearch: {
                            index: 'projects_projectEmbedding_index',
                            path: 'projectEmbedding',
                            queryVector: queryEmbedding,
                            numCandidates: 50,
                            limit: 3,
                        },
                    },
                    { $match: { status: 'open' } },
                    { $project: { _id: 1, title: 1, description: 1, requiredSkills: 1, budget: 1 } },
                ]);

                if (projects.length > 0) {
                    const matchPromises = projects.map(async (project) => {
                        const matchAnalysis = await analyzeJobMatch(
                            { skills: analysis.skills, experience: analysis.experience },
                            { title: project.title, description: project.description, requiredSkills: project.requiredSkills }
                        );
                        return { project, matchAnalysis };
                    });
                    projectMatches = await Promise.all(matchPromises);
                    projectMatches.sort((a, b) => b.matchAnalysis.matchScore - a.matchAnalysis.matchScore);
                }
            } catch (matchError) {
                console.error('Error generating job matches:', matchError);
            }
        }

        // Step 4: Build response based on authentication status
        if (isAuthenticated) {
            // Full results for logged-in users
            res.json({
                authenticated: true,
                analysis,
                projectMatches,
            });
        } else {
            // Partial (preview) results for non-logged-in users
            const preview = {
                name: analysis.name || 'Nama Terdeteksi',
                headline: analysis.headline || '',
                summary: analysis.summary || '',
                overallScore: analysis.overallScore || 0,
                scores: analysis.scores || {},
                skillsCount: (analysis.skills || []).length,
                experienceCount: (analysis.experience || []).length,
                educationCount: (analysis.education || []).length,
                freelanceReadiness: analysis.freelanceReadiness ? {
                    score: analysis.freelanceReadiness.score,
                    verdict: analysis.freelanceReadiness.verdict,
                } : null,
                // These fields are hidden (blurred) for non-authenticated users
                skills: null,
                experience: null,
                education: null,
                strengths: null,
                improvements: null,
                recommendedRoles: null,
            };

            res.json({
                authenticated: false,
                analysis: preview,
            });
        }
    } catch (error) {
        console.error('CV Scan error:', error);
        if (!res.statusCode || res.statusCode === 200) {
            res.status(500);
        }
        throw new Error(error.message || 'Gagal menganalisis CV. Silakan coba lagi.');
    }
});
