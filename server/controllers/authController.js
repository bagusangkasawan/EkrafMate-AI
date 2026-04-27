import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';

// @desc    Register a new user & send verification email
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
    const { name, username, email, password, role } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
        res.status(400);
        throw new Error('Pengguna dengan email atau username tersebut sudah terdaftar');
    }

    const user = await User.create({
        name,
        username,
        email,
        password,
        role,
    });

    if (user) {
        const verificationToken = user.getVerificationToken();
        await user.save({ validateBeforeSave: false });

        const verifyUrl = `${process.env.EMAIL_VERIFICATION_URL}/${verificationToken}`;
        const message = `Terima kasih telah mendaftar di EkrafMate! Silakan klik link berikut untuk memverifikasi email Anda: \n\n${verifyUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Verifikasi Email Akun EkrafMate',
                message,
            });
            res.status(201).json({ message: 'Registrasi berhasil. Silakan cek email Anda untuk verifikasi.' });
        } catch (error) {
            console.error(error);
            user.verificationToken = undefined;
            user.verificationTokenExpires = undefined;
            await user.save({ validateBeforeSave: false });
            res.status(500);
            throw new Error('Email verifikasi gagal dikirim.');
        }
    } else {
        res.status(400);
        throw new Error('Data pengguna tidak valid');
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;

    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
            isVerified: user.isVerified,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Email/Username atau password salah');
    }
});

// @desc    Verify email & return user data for auto-login
// @route   GET /api/auth/verify/:token
// @access  Public
export const verifyEmail = asyncHandler(async (req, res) => {
    // PERBAIKAN: Menggunakan 'sha256' yang benar, bukan 'sha26'.
    const verificationToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        verificationToken,
        verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
        res.status(400);
        throw new Error('Token verifikasi tidak valid atau sudah kedaluwarsa');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    
    // Kirim respons sukses beserta data user dan token baru untuk auto-login/state update
    res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        isVerified: user.isVerified,
        token: generateToken(user._id),
        message: 'Email berhasil diverifikasi!',
    });
});

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
export const resendVerificationEmail = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('Pengguna tidak ditemukan');
    }

    if (user.isVerified) {
        res.status(400);
        throw new Error('Akun ini sudah terverifikasi.');
    }

    const verificationToken = user.getVerificationToken();
    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${process.env.EMAIL_VERIFICATION_URL}/${verificationToken}`;
    const message = `Berikut adalah link verifikasi baru untuk akun EkrafMate Anda: \n\n${verifyUrl}`;
    
    try {
        await sendEmail({ email: user.email, subject: 'Email Verifikasi Ulang EkrafMate', message });
        res.json({ message: 'Email verifikasi baru telah dikirim.' });
    } catch (error) {
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save({ validateBeforeSave: false });
        res.status(500);
        throw new Error('Email verifikasi gagal dikirim ulang.');
    }
});
