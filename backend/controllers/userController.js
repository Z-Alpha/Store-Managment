const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  if (user) {
    const token = generateToken(user._id);
    console.log('Generated registration token:', token);
    
    const response = {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    };
    
    console.log('Sending registration response:', response);
    res.status(201).json(response);
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  try {
    console.log('👤 Login attempt:', {
      email: req.body.email,
      hasPassword: !!req.body.password
    });

    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });
    console.log('🔍 User lookup result:', user ? {
      id: user._id,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password
    } : 'No user found');

    if (!user) {
      console.error('❌ No user found with email:', email);
      res.status(400);
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔐 Password verification:', isMatch ? 'matched' : 'failed');

    if (!isMatch) {
      console.error('❌ Password does not match for user:', email);
      res.status(400);
      throw new Error('Invalid credentials');
    }

    // Generate token
    let token;
    try {
      token = generateToken(user._id);
    } catch (error) {
      console.error('❌ Token generation failed:', error);
      res.status(500);
      throw error;
    }

    const response = {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    };
    
    console.log('✅ Login successful:', {
      userId: user._id,
      role: user.role,
      tokenLength: token.length
    });
    
    res.json(response);
  } catch (error) {
    console.error('❌ Login error:', {
      message: error.message,
      stack: error.stack
    });
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.status(200).json(user);
});

// @desc    Update user data
// @route   PUT /api/users/update
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name || user.name,
      email: req.body.email || user.email,
    },
    { new: true }
  ).select('-password');

  res.status(200).json(updatedUser);
});

// Generate JWT
const generateToken = (id) => {
  console.log('🔑 Attempting to generate token for ID:', id);
  
  // Validate JWT_SECRET
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is not defined in environment variables');
    throw new Error('JWT_SECRET is not configured');
  }

  if (!process.env.JWT_SECRET.trim()) {
    console.error('❌ JWT_SECRET is empty or contains only whitespace');
    throw new Error('JWT_SECRET is invalid');
  }

  try {
    const token = jwt.sign(
      { 
        id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
      }, 
      process.env.JWT_SECRET
    );
    
    console.log('✅ JWT generated successfully:', {
      userId: id,
      tokenPreview: token.substring(0, 10) + '...',
      length: token.length,
      expiresIn: '30 days'
    });
    
    return token;
  } catch (error) {
    console.error('❌ Error generating JWT:', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateUser,
}; 