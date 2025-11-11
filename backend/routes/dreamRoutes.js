const express = require('express');
const Dream = require('../models/dreamModel');
const mongoose = require('mongoose');
const requireAuth = require('../middleware/requireAuth'); 

const router = express.Router();

// This middleware protects all routes in this file
router.use(requireAuth);

// GET all dreams (with full filtering and search)
router.get('/', async (req, res) => {
  const user_id = req.user._id;
  
  // Destructure all query parameters from the frontend
  const { category, mood, isLucid, q } = req.query; 

  const query = {
    user_id: user_id, // Always filter by the logged-in user
  };

  // Add filters to the query object if they exist
  if (category && category !== 'all') {
    query.category = category;
  }
  if (mood) {
    query.mood = { $gte: parseInt(mood) };
  }
  if (isLucid === 'true') {
    query.isLucid = true;
  }
  
  // Add text search filter ('q')
  if (q) {
    const searchRegex = new RegExp(q, 'i'); // 'i' for case-insensitive
    // Search across title, content, and tags
    query.$or = [
      { title: { $regex: searchRegex } },
      { content: { $regex: searchRegex } },
      { tags: { $regex: searchRegex } }
    ];
  }

  try {
    const dreams = await Dream.find(query).sort({ createdAt: -1 });
    res.status(200).json(dreams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new dream
router.post('/', async (req, res) => {
  const { title, content, category, mood, tags, isLucid, isRecurring, date } = req.body;
  const user_id = req.user._id;

  try {
    const dream = await Dream.create({ title, content, category, mood, tags, isLucid, isRecurring, date, user_id });
    res.status(201).json(dream);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT (Update) a dream by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({error: 'No such dream'});
  }

  try {
    const dream = await Dream.findByIdAndUpdate(id, {
      ...req.body 
    }, { new: true }); 

    if (!dream) {
        return res.status(404).json({error: 'No such dream'});
    }
    res.status(200).json(dream);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a dream by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const user_id = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({error: 'No such dream'});
  }

  try {
    const dream = await Dream.findOneAndDelete({ _id: id, user_id: user_id }); 
    if (!dream) {
        return res.status(404).json({error: 'No such dream'});
    }
    res.status(200).json(dream);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;