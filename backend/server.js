const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000'
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is up and running!');
});


// Routes
const jobRoutes = require('./routes/job');
app.use('/api/job', jobRoutes);

const statusRoutes = require('./routes/status');
app.use('/api/status', statusRoutes);

const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.error(err));