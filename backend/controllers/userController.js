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
    console.log('Login attempt with:', req.body);
    console.log('Environment check:', {
      hasJwtSecret: !!process.env.JWT_SECRET,
      jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
      nodeEnv: process.env.NODE_ENV
    });

    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });
    console.log('Found user:', user ? { 
      id: user._id, 
      email: user.email, 
      role: user.role,
      hasPassword: !!user.password 
    } : null);

    if (!user) {
      console.error('No user found with email:', email);
      res.status(400);
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.error('Password does not match for user:', email);
      res.status(400);
      throw new Error('Invalid credentials');
    }

    // Generate token
    let token;
    try {
      token = generateToken(user._id);
      console.log('Generated login token:', token ? 'Token generated successfully' : 'Token generation failed');
    } catch (error) {
      console.error('Token generation error:', error);
      res.status(500);
      throw error;
    }

    if (!token) {
      console.error('No token generated for user:', email);
      res.status(500);
      throw new Error('Failed to generate authentication token');
    }

    const response = {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    };
    
    console.log('Sending login response:', {
      ...response,
      token: token ? 'Token included' : 'No token'
    });
    
    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
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
  console.log('Attempting to generate token for ID:', id);
  console.log('JWT_SECRET status:', {
    isDefined: typeof process.env.JWT_SECRET !== 'undefined',
    isEmpty: !process.env.JWT_SECRET,
    length: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0
  });

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables');
    throw new Error('JWT_SECRET is not configured');
  }

  if (!process.env.JWT_SECRET.trim()) {
    console.error('JWT_SECRET is empty or contains only whitespace');
    throw new Error('JWT_SECRET is invalid');
  }

  try {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
    console.log('JWT generated successfully for ID:', id);
    return token;
  } catch (error) {
    console.error('Error generating JWT:', error);
    throw error;
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateUser,
}; 