require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const User = require('./models/User');

const app = express();
const port = process.env.PORT || 5000;
const jwtSecret = process.env.JWT_SECRET || 'your_fallback_secret_for_dev_only';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mongoose Schema for Chat
const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Chat = mongoose.model('Chat', chatSchema);

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  systemInstruction: "You are Simple Learn, a helpful AI tutor. Explain topics simply for students in English."
});

// Auth Middleware (Optional for now, but good to have)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Authentication token required' });

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// --- Auth Routes ---

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    // Create token
    const token = jwt.sign({ userId: newUser._id, username: newUser.username }, jwtSecret, { expiresIn: '1d' });

    res.status(201).json({ 
      message: 'User registered successfully', 
      token,
      user: { id: newUser._id, username: newUser.username, email: newUser.email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user', details: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Create token
    const token = jwt.sign({ userId: user._id, username: user.username }, jwtSecret, { expiresIn: '1d' });

    res.json({ 
      message: 'Logged in successfully', 
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to log in', details: error.message });
  }
});

// --- Chat Routes ---

app.post('/api/chat', async (req, res) => {
  try {
    const { question } = req.body;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, jwtSecret);
        userId = decoded.userId;
      } catch (err) {
        // Token invalid, proceed as guest
      }
    }

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const result = await model.generateContent(question);
    const response = await result.response;
    const text = response.text();

    // Save conversation to MongoDB (optional)
    try {
      if (mongoose.connection.readyState === 1) {
        const chat = new Chat({ userId, question, answer: text });
        await chat.save();
      } else {
        console.warn('MongoDB not connected, skipping save');
      }
    } catch (dbError) {
      console.error('Failed to save chat to MongoDB:', dbError);
    }

    res.json({ answer: text });
  } catch (error) {
    console.error('Error generating content from Gemini:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
