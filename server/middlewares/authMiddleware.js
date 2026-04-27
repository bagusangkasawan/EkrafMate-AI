import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Optional auth: attach user if token present, otherwise continue as guest
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  req.user = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Token invalid, continue as guest
      console.warn('Optional auth: invalid token, proceeding as guest');
    }
  }

  next();
});

const isClient = (req, res, next) => {
    if (req.user && req.user.role === 'client') {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as a client');
    }
};

const isCreative = (req, res, next) => {
    if (req.user && req.user.role === 'creative') {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as a creative');
    } 
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as an admin');
    }
};

const isAdminOrClient = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'client')) {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as an admin or client');
    }
};

export { protect, optionalAuth, isClient, isCreative, isAdmin, isAdminOrClient };
