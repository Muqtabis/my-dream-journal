const express = require('express');
const Dream = require('../models/dreamModel');
const mongoose = require('mongoose');

const router = express.Router();

// GET all dreams
router.get('/', async (req, res) => {
  try {
    const dreams = await Dream.find({}).sort({ createdAt: -1 });
    res.status(200).json(dreams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new dream
router.post('/', async (req, res) => {
  const { title, content, category, mood, tags, isLucid, isRecurring, date } = req.body;
  try {
    const dream = await Dream.create({ title, content, category, mood, tags, isLucid, isRecurring, date });
    res.status(201).json(dream);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE a dream by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({error: 'No such dream'});
  }
  try {
    const dream = await Dream.findByIdAndDelete(id);
    if (!dream) {
        return res.status(404).json({error: 'No such dream'});
    }
    res.status(200).json(dream);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;