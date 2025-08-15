// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  console.log('Signup attempt:', req.body);
  
  const { name, email, password } = req.body;

  // Validate input
  if (!name || !email || !password) {
    console.log('Missing required fields');
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  if (password.length < 6) {
    console.log('Password too short');
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    console.log('Creating new user...');
    user = new User({ 
      name: name.trim(), 
      email: email.toLowerCase().trim(), 
      password: hashedPassword 
    });
    
    const savedUser = await user.save();
    console.log('User saved successfully:', savedUser._id);

    // Verify user was saved by querying again
    const verifyUser = await User.findById(savedUser._id);
    console.log('User verification:', verifyUser ? 'Found' : 'Not found');

    res.status(201).json({ 
      message: 'User registered successfully',
      userId: savedUser._id 
    });
  } catch (err) {
    console.error('Signup error:', err);
    
    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  console.log('Login attempt:', { email: req.body.email });
  
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    console.log('Missing email or password');
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find user
    console.log('Looking for user with email:', email.toLowerCase().trim());
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      console.log('User not found in database');
      // List all users for debugging (remove in production)
      const allUsers = await User.find({}, 'email name');
      console.log('All users in database:', allUsers);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', user.email);

    // Check password
    console.log('Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Password matches, generating token...');

    // Check if JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not found in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    console.log('Login successful for:', user.email);

    res.json({ 
      token, 
      user: { 
        id: user._id,
        name: user.name, 
        email: user.email 
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Debug route to list all users (remove in production)
router.get('/debug/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email createdAt');
    res.json({ 
      count: users.length, 
      users: users 
    });
  } catch (err) {
    console.error('Debug users error:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

module.exports = router;