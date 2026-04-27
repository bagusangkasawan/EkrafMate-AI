import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Project from '../models/Project.js';

// @desc    Get all users with role creative or client
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({
        role: { $in: ['creative', 'client'] }
    });

    res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;

        if (typeof req.body.isVerified !== 'undefined') {
            user.isVerified = req.body.isVerified;
        }

        const updatedUser = await user.save();

        res.json({ 
            _id: updatedUser._id, 
            name: updatedUser.name, 
            email: updatedUser.email, 
            role: updatedUser.role,
            isVerified: updatedUser.isVerified
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Reset user password by Admin
// @route   PUT /api/admin/users/:id/reset-password
// @access  Private/Admin
export const resetUserPasswordByAdmin = asyncHandler(async (req, res) => {
    const { newPassword } = req.body;

    if (!newPassword) {
        res.status(400);
        throw new Error('Password baru diperlukan.');
    }

    const user = await User.findById(req.params.id);

    if (user) {
        user.password = newPassword;
        await user.save();
        res.json({ message: `Password untuk user ${user.name} berhasil di-reset.` });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get all projects
// @route   GET /api/admin/projects
// @access  Private/Admin
export const getAllProjects = asyncHandler(async (req, res) => {
    // Menggunakan .populate() untuk menyertakan data 'owner' di hasil
    const projects = await Project.find({}).populate('owner', 'id name email');
    res.json(projects);
});

// @desc    Delete a project
// @route   DELETE /api/admin/projects/:id
// @access  Private/Admin
export const deleteProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (project) {
        await project.deleteOne();
        res.json({ message: 'Project removed' });
    } else {
        res.status(404);
        throw new Error('Project not found');
    }
});
