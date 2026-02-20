const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST - Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash the password (10 rounds of salt)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create and Save the user
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      role: role || "user" // defaults to user if not provided
    });

    const savedUser = await newUser.save();
    
    // Don't send the password back in the response!
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    // 2. Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    // 3. Create a JWT Token
    // In production, move 'secret123' to your .env file as JWT_SECRET
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'secret123', 
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET - List all users (For testing)
router.get('/', async (req, res) => {
    const users = await User.find().select('-password');
    res.json(users);
});

module.exports = router;