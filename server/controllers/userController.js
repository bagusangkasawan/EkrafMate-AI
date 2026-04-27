import User from '../models/User.js';
import { generateEmbedding as ge, generateDescription as gd } from '../services/geminiService.js';
import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            headline: user.headline,
            description: user.description,
            skills: user.skills
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile (nama, email, deskripsi, dll.)
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Simpan deskripsi lama untuk cek perubahan
    const oldDescription = user.description;

    // Logika email: hanya bisa diubah jika belum terverifikasi
    if (req.body.email && req.body.email !== user.email) {
        if (user.isVerified) {
            res.status(400);
            throw new Error('Email tidak dapat diubah setelah akun terverifikasi.');
        }
        user.email = req.body.email;
    }

    // Update field lain
    user.name = req.body.name || user.name;
    user.headline = req.body.headline || user.headline;
    user.description = req.body.description || user.description;
    user.skills = req.body.skills || user.skills;

    // Jika deskripsi berubah, regenerate embedding
    if (req.body.description && req.body.description !== oldDescription) {
        try {
            user.profileEmbedding = await ge(req.body.description);
        } catch (err) {
            console.error("Gagal generate embedding:", err);
            // lanjut simpan walau embedding gagal
        }
    }

    const updatedUser = await user.save();

    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        headline: updatedUser.headline,
        description: updatedUser.description,
        skills: updatedUser.skills,
        isVerified: updatedUser.isVerified,
        token: generateToken(updatedUser._id),
    });
});

// @desc    Change user password
// @route   PUT /api/users/profile/change-password
// @access  Private
export const changeUserPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
        res.status(400);
        throw new Error('Harap isi semua field.');
    }
    
    if (newPassword !== confirmPassword) {
        res.status(400);
        throw new Error('Password baru dan konfirmasi tidak cocok.');
    }

    const user = await User.findById(req.user._id);

    if (user && (await user.matchPassword(currentPassword))) {
        user.password = newPassword; // Hashing akan terjadi otomatis via middleware model
        await user.save();
        res.json({ message: 'Password berhasil diubah.' });
    } else {
        res.status(401);
        throw new Error('Password saat ini tidak valid.');
    }
});

// @desc    Generate profile description using AI
// @route   POST /api/users/generate-description
// @access  Private
export const generateProfileDescription = asyncHandler(async (req, res) => {
    const { keyPoints } = req.body;
    if (!keyPoints) {
        res.status(400);
        throw new Error('Key points are required.');
    }
    const prompt = `Buatkan deskripsi profil profesional yang menarik untuk seorang pelaku kreatif di Indonesia dalam 150 kata. Deskripsi harus menonjolkan keahlian dan pengalaman berdasarkan poin-poin berikut: "${keyPoints}". Gunakan gaya bahasa yang percaya diri dan profesional.`;
    try {
        const description = await gd(prompt);
        res.json({ description });
    } catch (error) {
        res.status(500);
        throw new Error('Failed to generate description from AI model.');
    }
});

// @desc    Get public profile by ID
// @route   GET /api/users/:id
// @access  Public
export const getPublicProfileById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
        .select('-password -profileEmbedding')
        .populate('portfolio', 'title');

    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});
