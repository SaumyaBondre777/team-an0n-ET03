const express = require('express');
const router = express.Router();
const { simpleAnswer } = require('../llm');

// POST /chat - Get fast response from the agent
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    const response = await simpleAnswer(message);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;