// backend/models/dreamModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dreamSchema = new Schema({
  // Add this user_id field
  user_id: {
    type: String,
    required: true
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  // ... keep all the other fields (category, mood, etc.)
}, { timestamps: true });

module.exports = mongoose.model('Dream', dreamSchema);