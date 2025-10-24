const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc      Register user
// @route     POST /api/auth/register
// @access    Public
router.post('/register', async (req, res) => {
  try {
    console.log('Register raw body received');
    console.log('Headers:', req.headers);
    console.log('Body type:', typeof req.body);

    const { name, email, password } = req.body;

    // Simple validation
    if (!name || !email || !password) {
      console.log('Missing fields:', { name, email, password });
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, and password'
      });
    }

    console.log('Creating user with:', { name, email, password });

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: 'user'
    });

    console.log('User created:', user._id);

    // Create token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Registration failed'
    });
  }
});

// @desc      Login user
// @route     POST /api/auth/login
// @access    Public
router.post('/login', asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Create token
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  });
}));

// @desc      Get current user profile
// @route     GET /api/auth/profile
// @access    Private
router.get('/profile', asyncHandler(async (req, res, next) => {
  // Get token from header
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        profileImage: user.profileImage,
        preferences: user.preferences
      }
    });
  } catch (error) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
}));

// @desc      Upload profile picture
// @route     POST /api/auth/upload-profile-image
// @access    Private
router.post('/upload-profile-image', asyncHandler(async (req, res, next) => {
  // Get token from header
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Get image data from request body
    const { imageData } = req.body;

    if (!imageData) {
      return next(new ErrorResponse('Please provide image data', 400));
    }

    // Store the base64 image directly in the database
    user.profileImage = imageData;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }
    return next(new ErrorResponse(error.message, 500));
  }
}));

// @desc      Update user profile
// @route     PUT /api/auth/profile
// @access    Private
router.put('/profile', asyncHandler(async (req, res, next) => {
  // Get token from header
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Update allowed fields
    const { name, bio, preferences } = req.body;

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (preferences) user.preferences = preferences;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        profileImage: user.profileImage,
        preferences: user.preferences
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }
    return next(new ErrorResponse(error.message, 500));
  }
}));

// Test endpoint to verify API connectivity
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth API is working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
