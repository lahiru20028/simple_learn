require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mongoose Schema
const chatSchema = new mongoose.Schema({
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

// Routes
app.post('/api/chat', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const result = await model.generateContent(question);
    const response = await result.response;
    const text = response.text();

    // Save conversation to MongoDB (optional)
    try {
      if (mongoose.connection.readyState === 1) {
        const chat = new Chat({ question, answer: text });
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
