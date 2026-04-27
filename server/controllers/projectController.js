import Project from '../models/Project.js';
import User from '../models/User.js';
import { generateEmbedding as ge, generateDescription as gd } from '../services/geminiService.js';
import { analyzeJobMatch } from '../services/azureOpenAIService.js';
import asyncHandler from 'express-async-handler';

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private/Client
export const createProject = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user.isVerified) {
        const projectCount = await Project.countDocuments({ owner: user._id, status: 'open' });
        if (projectCount >= 1) {
            res.status(403);
            throw new Error('Verifikasi akun Anda untuk membuat lebih dari 1 proyek.');
        }
    }
    const { title, description, requiredSkills, budget } = req.body;
    
    // --> LOGIKA EMBEDDING DITAMBAHKAN DI SINI <--
    if (!title || !description) {
        res.status(400);
        throw new Error('Judul dan deskripsi proyek wajib diisi.');
    }
    
    const embedding = await ge(description);

    const project = new Project({ 
        title, 
        description, 
        requiredSkills, 
        budget, 
        owner: req.user._id,
        projectEmbedding: embedding,
    });

    const createdProject = await project.save();
    res.status(201).json(createdProject);
});

// @desc    Generate project description using AI
// @route   POST /api/projects/generate-description
// @access  Private/Client
export const generateProjectDescription = asyncHandler(async (req, res) => {
    const { keyPoints } = req.body;

    if (!keyPoints) {
        res.status(400);
        throw new Error('Key points are required.');
    }

    // Prompt untuk AI
    const prompt = `Buatkan deskripsi proyek yang menarik dan jelas untuk klien di Indonesia. 
                    Deskripsi harus menonjolkan tujuan proyek, keahlian yang dibutuhkan, dan anggaran jika ada, 
                    berdasarkan poin-poin berikut: "${keyPoints}". 
                    Gunakan bahasa profesional dan persuasif agar talenta tertarik untuk mengajukan diri.`;

    try {
        const description = await gd(prompt);
        res.json({ description });
    } catch (error) {
        console.error(error);
        res.status(500);
        throw new Error('Failed to generate project description from AI model.');
    }
});

// @desc    Get projects owned by logged-in client
// @route   GET /api/projects/myprojects
// @access  Private/Client
export const getMyProjects = asyncHandler(async (req, res) => {
    const projects = await Project.find({ owner: req.user._id })
        .sort({ createdAt: -1 })
        .populate('applicants', 'name headline')
        .populate('creative', 'name');
    res.json(projects);
});


// @desc    Apply for a project (by creative)
// @route   PUT /api/projects/:id/apply
// @access  Private/Creative
export const applyForProject = asyncHandler(async (req, res) => {
    const creativeUser = await User.findById(req.user._id);
    if (!creativeUser.description) {
        res.status(403);
        throw new Error('Harap lengkapi deskripsi profil Anda sebelum mengambil proyek.');
    }

    const project = await Project.findById(req.params.id);
    if (project && project.status === 'open') {
        // Cek apakah user sudah apply
        if (project.applicants.includes(req.user._id)) {
            res.status(400);
            throw new Error('Anda sudah mengajukan diri untuk proyek ini.');
        }
        project.applicants.push(req.user._id);
        await project.save();
        res.json({ message: 'Berhasil mengajukan diri untuk proyek.' });
    } else {
        res.status(404);
        throw new Error('Proyek tidak ditemukan atau sudah tidak open.');
    }
});

// @desc    Accept a creative for a project
// @route   PUT /api/projects/:id/accept
// @access  Private/Client
export const acceptCreative = asyncHandler(async (req, res) => {
    const { creativeId } = req.body;
    const project = await Project.findById(req.params.id);

    if (project && project.owner.equals(req.user._id) && project.status === 'open') {
        // Pastikan creativeId ada di dalam daftar applicants
        if (!project.applicants.includes(creativeId)) {
            res.status(400);
            throw new Error('Pelaku kreatif ini tidak mengajukan diri.');
        }
        project.creative = creativeId;
        project.status = 'in_progress';
        const updatedProject = await project.save();
        res.json(updatedProject);
    } else {
        res.status(404);
        throw new Error('Proyek tidak ditemukan, bukan milik Anda, atau sudah tidak open.');
    }
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Client or Private/Admin
export const updateProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
        res.status(404);
        throw new Error('Proyek tidak ditemukan');
    }

    // Hanya pemilik proyek atau admin yang bisa mengedit
    if (!project.owner.equals(req.user._id) && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Tidak diizinkan');
    }

    const oldDescription = project.description;
    
    project.title = req.body.title || project.title;
    project.description = req.body.description || project.description;
    project.requiredSkills = req.body.requiredSkills || project.requiredSkills;
    project.budget = req.body.budget || project.budget;

    // Generate ulang embedding jika deskripsi berubah
    if (req.body.description && req.body.description !== oldDescription) {
        project.projectEmbedding = await ge(req.body.description);
    }

    const updatedProject = await project.save();
    res.json(updatedProject);
});

// @desc    Mark a project as complete (by creative)
// @route   PUT /api/projects/:id/complete
// @access  Private/Creative
export const completeProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);
    if (project && project.creative.equals(req.user._id) && project.status === 'in_progress') {
        project.status = 'pending_approval';
        const updatedProject = await project.save();
        res.json(updatedProject);
    } else {
        res.status(404);
        throw new Error('Proyek tidak ditemukan atau Anda tidak berhak');
    }
});

// @desc    Close a project (approve completion by client)
// @route   PUT /api/projects/:id/close
// @access  Private/Client
export const closeProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);
    if (project && project.owner.equals(req.user._id) && project.status === 'pending_approval') {
        project.status = 'closed';
        if (project.creative) {
            const creativeUser = await User.findById(project.creative);
            if (creativeUser) {
                const isAlreadyInPortfolio = creativeUser.portfolio.some(p => p.equals(project._id));
                if (!isAlreadyInPortfolio) {
                    creativeUser.portfolio.push(project._id);
                    await creativeUser.save();
                }
            }
        }
        const updatedProject = await project.save();
        res.json(updatedProject);
    } else {
        res.status(404);
        throw new Error('Proyek tidak ditemukan atau Anda tidak berhak');
    }
});

// @desc    Get projects assigned to logged-in creative
// @route   GET /api/projects/assigned
// @access  Private/Creative
export const getAssignedProjects = asyncHandler(async (req, res) => {
    const projects = await Project.find({ creative: req.user._id }).sort({ updatedAt: -1 });
    res.json(projects);
});

// @desc    Get all open projects
// @route   GET /api/projects
// @access  Public
export const getOpenProjects = asyncHandler(async (req, res) => {
    const projects = await Project.find({ status: 'open' }).populate('owner', 'name').sort({ createdAt: -1 });
    res.json(projects);
});

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Public
export const getProjectById = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id).populate('owner', 'name').populate('creative', 'name');
    if (project) {
        let matchAnalysis = null;
        
        // If user is a creative with skills, generate job match analysis
        if (req.user && req.user.role === 'creative' && req.user.skills && req.user.skills.length > 0) {
            try {
                matchAnalysis = await analyzeJobMatch(
                    { skills: req.user.skills, headline: req.user.headline, description: req.user.description },
                    { title: project.title, description: project.description, requiredSkills: project.requiredSkills }
                );
            } catch (error) {
                console.error('Error generating job match analysis for project detail:', error);
                // Continue without failing the request
            }
        }
        
        // Return project + matchAnalysis (if any)
        res.json({
            ...project._doc,
            matchAnalysis
        });
    } else {
        res.status(404);
        throw new Error('Proyek tidak ditemukan');
    }
});

// @desc    Delete a project owned by the client
// @route   DELETE /api/projects/:id
// @access  Private/Client
export const deleteMyProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Proyek tidak ditemukan');
    }

    // Pastikan hanya pemilik proyek yang bisa menghapus
    if (project.owner.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Tidak diizinkan untuk menghapus proyek ini');
    }

    await project.deleteOne();
    res.json({ message: 'Proyek berhasil dihapus' });
});
