const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Make sure you have run 'npm install jsonwebtoken'
const User = require('../models/userModel');

// A helper function to create a token
const createToken = (_id) => {
  return jwt.sign({_id}, process.env.JWT_SECRET, { expiresIn: '3d' });
};

// Create a new router
const router = express.Router();

// --- SIGNUP ROUTE ---
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ email, password: hashedPassword });

    const token = createToken(user._id);
    res.status(201).json({ email: user.email, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- LOGIN ROUTE ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Incorrect email or password' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Incorrect email or password' });
    }
    const token = createToken(user._id);
    res.status(200).json({ email: user.email, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// This line is crucial! It makes the router available to be imported.
module.exports = router;