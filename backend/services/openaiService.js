const Groq = require('groq-sdk');

let groq = null;

const getGroqClient = () => {
  if (!groq) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groq;
};

const getChatCompletion = async (systemPrompt, userPrompt) => {
  try {
    const client = getGroqClient();
    const completion = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Groq API Error:', error);
    throw new Error('Failed to get AI response');
  }
};

module.exports = {
  getChatCompletion,
};
