const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const OpenAI = require('openai');

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required and must be a string',
      });
    }

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant for the Bilge platform. Help users with authentication, usage, and general questions.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const reply = completion.choices[0].message.content;

    const convId = conversationId || `conversation_${Date.now()}`;

    res.json({
      conversationId: convId,
      reply,
      source: 'openai',
    });
  } catch (error) {
    console.error('OpenAI Error:', error);

    res.status(500).json({
      error: 'Failed to generate response',
    });
  }
});

module.exports = router;