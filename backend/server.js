require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const dreamRoutes = require('./routes/dreamRoutes'); // We will create this next
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- API ROUTES ---
app.use('/api/dreams', dreamRoutes);
app.use('/api/users', userRoutes); // This is line 12 from the error

// Connect to DB & start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`✅ Connected to DB & Server is listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(`❌ DB connection error: ${error}`);
  });