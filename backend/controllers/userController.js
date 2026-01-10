const User = require('../models/User');

const createUser = async (req, res) => {
  try {
    const { userId, personality } = req.body;

    if (!userId || !personality) {
      return res.status(400).json({ error: 'userId and personality are required' });
    }

    if (!['A', 'B', 'C'].includes(personality)) {
      return res.status(400).json({ error: 'Invalid personality type. Must be A, B, or C' });
    }

    // Check if user already exists
    let user = await User.findOne({ userId });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user with dummy lifestyle data
    user = await User.create({
      userId,
      personality,
      lifestyleData: {
        steps: 4200,
        exerciseMinutes: 25,
        sleepHours: 5.5,
      },
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        userId: user.userId,
        personality: user.personality,
        coins: user.coins,
        lifestyleData: user.lifestyleData,
      },
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

const getUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        userId: user.userId,
        personality: user.personality,
        coins: user.coins,
        lifestyleData: user.lifestyleData,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

const updateLifestyleData = async (req, res) => {
  try {
    const { userId } = req.params;
    const { steps, exerciseMinutes, sleepHours } = req.body;

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (steps !== undefined) user.lifestyleData.steps = steps;
    if (exerciseMinutes !== undefined) user.lifestyleData.exerciseMinutes = exerciseMinutes;
    if (sleepHours !== undefined) user.lifestyleData.sleepHours = sleepHours;

    await user.save();

    res.json({
      message: 'Lifestyle data updated',
      lifestyleData: user.lifestyleData,
    });
  } catch (error) {
    console.error('Update lifestyle error:', error);
    res.status(500).json({ error: 'Failed to update lifestyle data' });
  }
};

module.exports = {
  createUser,
  getUser,
  updateLifestyleData,
};
