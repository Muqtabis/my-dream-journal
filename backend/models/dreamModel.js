// backend/models/dreamModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dreamSchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  title: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    default: 'normal' 
  },
  mood: { 
    type: Number, 
    default: 5 
  },
  tags: { 
    type: [String], 
    default: [] 
  },
  isLucid: { 
    type: Boolean, 
    default: false 
  },
  isRecurring: { 
    type: Boolean, 
    default: false 
  },
  date: { 
    type: String, 
    required: true 
  },
  imageUrl: {
    type: String,
    default: ''
  },
  aiInterpretation: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Dream', dreamSchema);
