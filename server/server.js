require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const OpenAI = require('openai');

const User = require('./models/User');
const Conversation = require('./models/Conversation');

const app = express();
const port = process.env.PORT || 5000;
const jwtSecret = process.env.JWT_SECRET || 'your_fallback_secret_for_dev_only';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err.message));

// Initialize OpenRouter AI (OpenAI-compatible)
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'Simple Learn',
  },
});
const AI_MODELS = [
  'google/gemma-3-27b-it:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
  'google/gemma-3-12b-it:free',
  'qwen/qwen3-4b:free',
];
const SYSTEM_PROMPT = "You are Simple Learn, a helpful AI tutor. Explain topics simply for students in English.";

// Try multiple free models with fallback on rate limit or transient errors
async function getAIResponse(messages) {
  console.log('API Key loaded (first 25):', process.env.OPENROUTER_API_KEY?.substring(0, 25));
  let lastError = null;
  for (const model of AI_MODELS) {
    try {
      console.log(`Trying model: ${model}`);
      const completion = await openai.chat.completions.create({ model, messages });
      console.log(`Success with model: ${model}`);
      return completion.choices[0].message.content;
    } catch (err) {
      lastError = err;
      console.log(`Failed on ${model}: status=${err.status}, message=${err.error?.message || err.message}`);
      if (err.status === 429 || err.status === 401 || err.status === 503) {
        // Retry on rate limit, transient auth errors, or service unavailable
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      throw err;
    }
  }
  throw lastError || new Error('All free models failed. Please try again in a moment.');
}

// Auth Middleware
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

// Optional auth - sets req.user if token present, but doesn't block
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.user = decoded;
    } catch (err) {
      // Token invalid, proceed as guest
    }
  }
  next();
};

// --- Auth Routes ---

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

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

// --- Conversation Routes ---

// Get all conversations for logged-in user
app.get('/api/conversations', authenticateToken, async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user.userId })
      .select('title updatedAt')
      .sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get a single conversation with messages
app.get('/api/conversations/:id', authenticateToken, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json(conversation);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Delete a conversation
app.delete('/api/conversations/:id', authenticateToken, async (req, res) => {
  try {
    const result = await Conversation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    if (!result) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// --- Chat Route ---

app.post('/api/chat', optionalAuth, async (req, res) => {
  try {
    const { question, conversationId } = req.body;
    const userId = req.user?.userId || null;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const text = await getAIResponse([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: question },
    ]);

    let savedConversationId = conversationId || null;

    // Save to conversation if user is logged in
    if (userId) {
      try {
        if (conversationId) {
          // Append to existing conversation
          await Conversation.findOneAndUpdate(
            { _id: conversationId, userId },
            {
              $push: {
                messages: [
                  { role: 'user', content: question },
                  { role: 'assistant', content: text }
                ]
              }
            }
          );
          savedConversationId = conversationId;
        } else {
          // Create new conversation
          const title = question.length > 40 ? question.substring(0, 40) + '...' : question;
          const conversation = new Conversation({
            userId,
            title,
            messages: [
              { role: 'user', content: question },
              { role: 'assistant', content: text }
            ]
          });
          await conversation.save();
          savedConversationId = conversation._id;
        }
      } catch (dbError) {
        console.error('Failed to save conversation:', dbError);
      }
    }

    res.json({ answer: text, conversationId: savedConversationId });
  } catch (error) {
    console.error('Error generating content from DeepSeek:', error);
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
