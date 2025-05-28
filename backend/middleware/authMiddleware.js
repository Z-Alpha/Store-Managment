const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  console.log('Auth Headers:', req.headers.authorization);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Token received:', token);

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);

      // Get user from the token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.error('No user found with decoded ID');
        res.status(401);
        throw new Error('Not authorized - user not found');
      }

      console.log('User found:', { id: user._id, role: user.role });
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth Error:', error.message);
      res.status(401);
      throw new Error('Not authorized - invalid token');
    }
  }

  if (!token) {
    console.error('No token provided');
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Admin middleware
const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    console.log('Admin access granted for user:', req.user._id);
    next();
  } else {
    console.error('Admin access denied for user:', req.user?._id);
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
});

module.exports = { protect, admin }; 