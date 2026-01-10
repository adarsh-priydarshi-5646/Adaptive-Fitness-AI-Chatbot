// Personality definitions
const personalities = {
  A: {
    name: 'Encouragement Seeker',
    traits: 'easily demotivated, needs reassurance and frequent nudges',
    tone: 'warm, encouraging, supportive, use positive reinforcement',
  },
  B: {
    name: 'Creative Explorer',
    traits: 'easily distracted, prefers creativity, dislikes spoon-feeding',
    tone: 'creative, engaging, offer variety and options, avoid being too prescriptive',
  },
  C: {
    name: 'Goal Finisher',
    traits: 'highly motivated, prefers structured plans and checklists',
    tone: 'direct, structured, action-oriented, provide clear steps and goals',
  },
};

// Usage duration behavior
const getUsageBehavior = (usageDays) => {
  if (usageDays <= 3) {
    return {
      stage: 'new_user',
      behavior: 'Be grounded and empathetic. Allow the user to vent or explore. Do not provide instant remedies unless specifically asked. Focus on understanding their situation first.',
    };
  } else if (usageDays <= 8) {
    return {
      stage: 'regular_user',
      behavior: 'Act as a friendly listener. Provide short, actionable remedies only after 2 messages of conversation. Build rapport before jumping to solutions.',
    };
  } else {
    return {
      stage: 'experienced_user',
      behavior: 'Act as a coach. Provide actionable guidance after just 1 message. The user trusts you and wants direct, practical advice.',
    };
  }
};

// Lifestyle context interpretation
const getLifestyleContext = (lifestyleData) => {
  const { steps, exerciseMinutes, sleepHours } = lifestyleData;
  
  let context = 'Current lifestyle indicators:\n';
  
  // Steps analysis
  if (steps < 3000) {
    context += `- Low activity level (${steps} steps) - may need gentle encouragement to move more\n`;
  } else if (steps < 7000) {
    context += `- Moderate activity level (${steps} steps) - good baseline, room for improvement\n`;
  } else {
    context += `- Active lifestyle (${steps} steps) - maintaining good movement habits\n`;
  }
  
  // Exercise analysis
  if (exerciseMinutes < 20) {
    context += `- Minimal structured exercise (${exerciseMinutes} min) - focus on building consistency\n`;
  } else if (exerciseMinutes < 45) {
    context += `- Regular exercise routine (${exerciseMinutes} min) - good foundation\n`;
  } else {
    context += `- Strong exercise commitment (${exerciseMinutes} min) - well-established routine\n`;
  }
  
  // Sleep analysis
  if (sleepHours < 6) {
    context += `- Poor sleep (${sleepHours} hours) - may affect energy and recovery, be mindful of this\n`;
  } else if (sleepHours < 7.5) {
    context += `- Adequate sleep (${sleepHours} hours) - decent but could be better\n`;
  } else {
    context += `- Good sleep (${sleepHours} hours) - well-rested and ready for activity\n`;
  }
  
  return context;
};

// Main prompt composer
const composePrompt = (userQuestion, personality, usageDays, lifestyleData) => {
  const personalityInfo = personalities[personality];
  const usageBehavior = getUsageBehavior(usageDays);
  const lifestyleContext = getLifestyleContext(lifestyleData);
  
  const systemPrompt = `You are an AI-powered fitness companion chatbot. Your role is to help users with fitness, workouts, and basic wellness guidance.

CRITICAL SAFETY RULES:
- You MUST NOT provide medical advice about diseases, injuries, medications, or medical treatments
- If asked about medical topics, politely refuse and suggest consulting a healthcare professional
- You are NOT a medical tool and should never diagnose or treat medical conditions

USER PERSONALITY: ${personalityInfo.name}
- Traits: ${personalityInfo.traits}
- Communication style: ${personalityInfo.tone}

USAGE STAGE: ${usageBehavior.stage} (${usageDays} days using the app)
- Behavior guideline: ${usageBehavior.behavior}

${lifestyleContext}

RESPONSE FORMAT GUIDELINES:
- Structure your responses clearly with sections when appropriate
- For workout plans, use day-wise breakdowns
- For tips, use numbered or bulleted lists
- Offer 2-3 follow-up suggestions at the end when relevant (e.g., "Want to know about: Warm-up exercises | Nutrition tips | Recovery strategies")
- Keep responses conversational but organized
- Adapt your tone based on the user's personality type

Remember: Be helpful, safe, and adaptive to the user's needs and personality.`;

  return {
    systemPrompt,
    userPrompt: userQuestion,
  };
};

module.exports = {
  composePrompt,
  personalities,
  getUsageBehavior,
  getLifestyleContext,
};
