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
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
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

const getChatCompletionStream = async (systemPrompt, userPrompt, onChunk) => {
  try {
    const client = getGroqClient();
    const stream = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        onChunk(content);
      }
    }
  } catch (error) {
    console.error('Groq Stream Error:', error);
    throw new Error('Failed to stream AI response');
  }
};

module.exports = {
  getChatCompletion,
  getChatCompletionStream,
};
