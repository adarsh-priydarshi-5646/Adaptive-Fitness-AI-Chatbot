# Adaptive Fitness Companion Chatbot

An AI-powered fitness companion chatbot built with React Native (Expo) and Node.js backend. The chatbot adapts its behavior based on user personality, usage duration, and lifestyle context.

## Tech Stack

- **Frontend**: React Native (Expo Managed Workflow)
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **AI**: Groq API (LLaMA 3.3 70B model)
- **Expo SDK**: 54

## Features

### Core Features
- ✅ Welcome screen with app introduction and disclaimer
- ✅ Personality-based onboarding (3 personality types)
- ✅ Chat interface with structured AI responses
- ✅ Day-wise workout plans, bullet-point tips
- ✅ Follow-up quick action pills
- ✅ Coin reward system (1 coin per message)
- ✅ Safety guardrails for medical content

### Bonus Features
- ✅ Chat history screen (last 10 conversations)
- ✅ Dark theme with consistent styling

---

## How to Run

### Prerequisites
- Node.js 20.x (LTS)
- MongoDB running locally
- Groq API key (free at console.groq.com)

### Backend Setup
```bash
cd backend
npm install

# Create .env file with:
# MONGODB_URI=mongodb://localhost:27017/fitness-chatbot
# GROQ_API_KEY=your_groq_api_key
# PORT=3000

npm start
```

### Frontend Setup
```bash
npm install
npx expo start
```

---

## Prompt Composition Strategy

Every AI request combines multiple context layers to create adaptive responses:

### 1. User Personality
Three personality types affect AI communication style:

| Personality | Traits | AI Tone |
|-------------|--------|---------|
| A - Encouragement Seeker | Easily demotivated, needs reassurance | Warm, encouraging, supportive |
| B - Creative Explorer | Prefers creativity, dislikes spoon-feeding | Creative, engaging, offers variety |
| C - Goal Finisher | Highly motivated, prefers structure | Direct, structured, action-oriented |

### 2. Usage Duration Behavior
AI coaching style evolves based on days using the app:

| Days | AI Behavior |
|------|-------------|
| 0-3 days | Grounded, empathetic. No instant remedies unless asked. |
| 4-8 days | Friendly listener. Short remedies after 2 messages. |
| 9+ days | Coach-like. Actionable guidance after 1 message. |

### 3. Lifestyle Context
Dummy data influences recommendations:
```json
{
  "steps": 4200,
  "exerciseMinutes": 25,
  "sleepHours": 5.5
}
```

The AI considers:
- **Low activity** (< 3000 steps): Gentle encouragement
- **Poor sleep** (< 6 hours): Mindful of energy levels
- **Minimal exercise** (< 20 min): Focus on building consistency

### Prompt Structure
```
System Prompt:
├── Role definition (fitness companion)
├── Safety rules (no medical advice)
├── User personality + traits + tone
├── Usage stage + behavior guideline
├── Lifestyle context interpretation
└── Response format guidelines

User Prompt:
└── User's fitness question
```

---

## Safety & Scope Handling

The chatbot implements dual-layer safety:

### 1. Keyword Detection (Backend)
Checks for medical terms before AI processing:
- Diseases: diabetes, heart disease, cancer, etc.
- Injuries: fracture, ligament, sprain, etc.
- Medications: medicine, prescription, supplement, etc.

### 2. System Prompt Guardrails
AI is instructed to:
- Never provide medical advice
- Refuse questions about diseases, injuries, medications
- Suggest consulting healthcare professionals

### Refusal Response Example
> "I appreciate you sharing that with me, but I'm not qualified to give advice about medical conditions or injuries. For your safety, please consult a certified healthcare professional or doctor who can properly assess your situation. I'm here to help with general fitness questions, workout plans, and wellness tips!"

---

## Project Structure

```
├── app/
│   ├── _layout.tsx      # Root navigation
│   ├── index.tsx        # Welcome screen
│   ├── onboarding.tsx   # Personality selection
│   ├── chat.tsx         # Main chat interface
│   └── history.tsx      # Chat history
├── backend/
│   ├── controllers/     # Route handlers
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── services/        # AI service (Groq)
│   ├── utils/           # Prompt composer, safety
│   └── server.js        # Express server
├── components/          # Reusable UI components
├── config/              # API configuration
└── constants/           # Theme colors
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/user/create` | Create user with personality |
| GET | `/api/user/:userId` | Get user profile |
| POST | `/api/chat/message` | Send message, get AI response |
| GET | `/api/chat/history/:userId` | Get chat history |

---

## Demo Checklist

- [x] Welcome screen with disclaimer
- [x] Personality selection during onboarding
- [x] Chat interaction with structured responses
- [x] Personality-based AI behavior
- [x] Usage-duration adaptation
- [x] Lifestyle context consideration
- [x] Safety refusal for medical queries
- [x] Coin reward system
- [x] Chat history screen
