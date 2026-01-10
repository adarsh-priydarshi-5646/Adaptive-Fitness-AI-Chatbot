const User = require('../models/User');
const Conversation = require('../models/Conversation');
const { checkForMedicalContent, getMedicalRefusalResponse } = require('../utils/safetyGuardrails');
const { composePrompt } = require('../utils/promptComposer');
const { getChatCompletion } = require('../services/openaiService');

// Calculate usage days
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

    // Get user data
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please complete onboarding first.' });
    }

    // Check for medical content first
    if (checkForMedicalContent(message)) {
      const refusalResponse = getMedicalRefusalResponse();
      
      // Save the conversation
      await Conversation.create({
        userId,
        userMessage: message,
        aiResponse: refusalResponse.response,
        personality: user.personality,
        usageDays: calculateUsageDays(user.createdAt),
        lifestyleContext: user.lifestyleData,
      });

      // Award coin even for refused messages
      user.coins += 1;
      await user.save();

      return res.json({
        response: refusalResponse.response,
        isMedicalRefusal: true,
        coins: user.coins,
      });
    }

    // Calculate usage days
    const usageDays = calculateUsageDays(user.createdAt);

    // Compose adaptive prompt
    const { systemPrompt, userPrompt } = composePrompt(
      message,
      user.personality,
      usageDays,
      user.lifestyleData
    );

    // Get AI response
    const aiResponse = await getChatCompletion(systemPrompt, userPrompt);

    // Save conversation
    await Conversation.create({
      userId,
      userMessage: message,
      aiResponse,
      personality: user.personality,
      usageDays,
      lifestyleContext: user.lifestyleData,
    });

    // Award coin
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

module.exports = {
  sendMessage,
  getChatHistory,
};
