const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// A helper function to create a token
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '3d' });
};

// Create a new router
const router = express.Router();

// --- SIGNUP ROUTE ---
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'All fields must be filled' });
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const exists = await User.findOne({ email: cleanEmail });
    if (exists) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ email: cleanEmail, password: hashedPassword });

    const token = createToken(user._id);
    res.status(201).json({ email: user.email, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- LOGIN ROUTE ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'All fields must be filled' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const user = await User.findOne({ email: cleanEmail });
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

module.exports = router;
