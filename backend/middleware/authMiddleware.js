const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
  try {
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ No Bearer token in Authorization header');
      res.status(401);
      throw new Error('Not authorized, no token');
    }

    // Get token from header
    const token = authHeader.split(' ')[1];
    if (!token) {
      console.error('❌ Token is empty');
      res.status(401);
      throw new Error('Not authorized, invalid token format');
    }

    // Verify JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not configured');
      res.status(500);
      throw new Error('Server configuration error - JWT_SECRET missing');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified:', {
      userId: decoded.id,
      exp: new Date(decoded.exp * 1000).toISOString(),
      iat: new Date(decoded.iat * 1000).toISOString()
    });

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.error('❌ No user found with decoded ID:', decoded.id);
      res.status(401);
      throw new Error('Not authorized - user not found');
    }

    // Check if user is active
    if (!user.isActive) {
      console.error('❌ User account is inactive:', user._id);
      res.status(401);
      throw new Error('Account is inactive');
    }

    console.log('👤 User authenticated:', {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email
    });

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      console.error('❌ JWT Verification Error:', error.message);
      res.status(401);
      throw new Error('Not authorized - invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      console.error('❌ Token Expired:', error.expiredAt);
      res.status(401);
      throw new Error('Not authorized - token expired');
    }
    throw error;
  }
});

// Admin middleware
const admin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    console.error('❌ No user object found in request');
    res.status(401);
    throw new Error('Not authorized');
  }

  if (req.user.role !== 'admin') {
    console.error('❌ User is not an admin:', {
      userId: req.user._id,
      role: req.user.role
    });
    res.status(403);
    throw new Error('Not authorized as admin');
  }

  console.log('✅ Admin access granted:', {
    userId: req.user._id,
    role: req.user.role
  });
  next();
});

module.exports = { protect, admin }; 