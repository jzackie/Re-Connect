const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require("./routes/auth.js");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');

  const app = express();
  const PORT = process.env.PORT || 5000;

  app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/', (req, res) => {
    res.send('Hello, World!');    
  });

  app.use('/auth', authRoutes);

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});