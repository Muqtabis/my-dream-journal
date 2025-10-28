const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dreamSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true }, // Changed from 'body'
  category: { type: String, default: 'normal' },
  mood: { type: Number, default: 5 },
  tags: { type: [String], default: [] }, // This is now an array
  isLucid: { type: Boolean, default: false },
  isRecurring: { type: Boolean, default: false },
  date: { type: String, required: true } // Added date field
}, { timestamps: true });

module.exports = mongoose.model('Dream', dreamSchema);