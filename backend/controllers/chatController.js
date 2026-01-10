const User = require('../models/User');
const Conversation = require('../models/Conversation');
const { checkForMedicalContent, getMedicalRefusalResponse } = require('../utils/safetyGuardrails');
const { composePrompt } = require('../utils/promptComposer');
const { getChatCompletion, getChatCompletionStream } = require('../services/openaiService');

const calculateUsageDays = (createdAt) => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const sendMessage = async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please complete onboarding first.' });
    }

    if (checkForMedicalContent(message)) {
      const refusalResponse = getMedicalRefusalResponse();
      
      await Conversation.create({
        userId,
        userMessage: message,
        aiResponse: refusalResponse.response,
        personality: user.personality,
        usageDays: calculateUsageDays(user.createdAt),
        lifestyleContext: user.lifestyleData,
      });

      user.coins += 1;
      await user.save();

      return res.json({
        response: refusalResponse.response,
        isMedicalRefusal: true,
        coins: user.coins,
      });
    }

    const usageDays = calculateUsageDays(user.createdAt);

    const { systemPrompt, userPrompt } = composePrompt(
      message,
      user.personality,
      usageDays,
      user.lifestyleData
    );

    const aiResponse = await getChatCompletion(systemPrompt, userPrompt);

    await Conversation.create({
      userId,
      userMessage: message,
      aiResponse,
      personality: user.personality,
      usageDays,
      lifestyleContext: user.lifestyleData,
    });

    user.coins += 1;
    await user.save();

    res.json({
      response: aiResponse,
      coins: user.coins,
      isMedicalRefusal: false,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
};

const sendMessageStream = async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (checkForMedicalContent(message)) {
      const refusalResponse = getMedicalRefusalResponse();
      
      await Conversation.create({
        userId,
        userMessage: message,
        aiResponse: refusalResponse.response,
        personality: user.personality,
        usageDays: calculateUsageDays(user.createdAt),
        lifestyleContext: user.lifestyleData,
      });

      user.coins += 1;
      await user.save();

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      res.write(`data: ${JSON.stringify({ type: 'content', text: refusalResponse.response })}\n\n`);
      res.write(`data: ${JSON.stringify({ type: 'done', coins: user.coins })}\n\n`);
      return res.end();
    }

    const usageDays = calculateUsageDays(user.createdAt);
    const { systemPrompt, userPrompt } = composePrompt(
      message,
      user.personality,
      usageDays,
      user.lifestyleData
    );

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullResponse = '';

    await getChatCompletionStream(systemPrompt, userPrompt, (chunk) => {
      fullResponse += chunk;
      res.write(`data: ${JSON.stringify({ type: 'content', text: chunk })}\n\n`);
    });

    await Conversation.create({
      userId,
      userMessage: message,
      aiResponse: fullResponse,
      personality: user.personality,
      usageDays,
      lifestyleContext: user.lifestyleData,
    });

    user.coins += 1;
    await user.save();

    res.write(`data: ${JSON.stringify({ type: 'done', coins: user.coins })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Stream error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to process' })}\n\n`);
    res.end();
  }
};

const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const conversations = await Conversation.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json({ conversations: conversations.reverse() });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};

const clearHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    await Conversation.deleteMany({ userId });

    res.json({ message: 'Chat history cleared successfully' });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
};

module.exports = {
  sendMessage,
  sendMessageStream,
  getChatHistory,
  clearHistory,
};
