const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, (req, res) => {
  const { message, conversationId } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required and must be a string' });
  }

  const body = message.trim().toLowerCase();
  let reply = 'I did not understand that. Can you rephrase?';

  if (body.includes('hello') || body.includes('hi')) {
    reply = 'Hello! How can I help you today?';
  } else if (body.includes('help')) {
    reply = 'I am here to help. Ask me about Bilge or authentication.';
  } else if (body.includes('logout') || body.includes('log out')) {
    reply = 'If you want to log out, use the /api/auth/logout endpoint.';
  } else if (body.includes('status')) {
    reply = 'The Bilge backend is running and ready for requests.';
  }

  const convId = conversationId || `conversation_${Date.now()}`;
  res.json({ conversationId: convId, reply, source: 'bot' });
});

module.exports = router;
