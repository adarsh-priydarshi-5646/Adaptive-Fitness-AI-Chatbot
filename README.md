# Adaptive Fitness Companion Chatbot

An AI-powered fitness companion chatbot built with React Native (Expo) and Node.js backend. The chatbot adapts its behavior based on user personality, usage duration, and lifestyle context.

## Demo Video

[![Demo Video](https://img.shields.io/badge/Watch-Demo%20Video-red?style=for-the-badge&logo=youtube)](YOUR_VIDEO_LINK_HERE)

> Replace `YOUR_VIDEO_LINK_HERE` with your actual demo video link (YouTube/Loom/Google Drive)

---

## Tech Stack

- **Frontend**: React Native (Expo Managed Workflow)
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **AI**: Groq API (LLaMA 3.1 8B model)
- **Expo SDK**: 54

---

## Features

### Core Features
- ✅ Welcome screen with app introduction and disclaimer
- ✅ Personality-based onboarding (3 personality types)
- ✅ Chat interface with structured AI responses
- ✅ Typing animation (ChatGPT-style effect)
- ✅ Day-wise workout plans, bullet-point tips
- ✅ Follow-up quick action pills
- ✅ Coin reward system (1 coin per message)
- ✅ Safety guardrails for medical content

### Bonus Features
- ✅ Chat history screen (last 10 conversations)
- ✅ Clear history functionality
- ✅ Dark theme with consistent styling
- ✅ Responsive design for all devices

---

## How to Run

### Prerequisites
- Node.js 20.x (LTS)
- MongoDB running locally
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Step 1: Clone the Repository
```bash
git clone <your-repo-url>
cd fitness-chatbot
```

### Step 2: Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
```env
MONGODB_URI=mongodb://localhost:27017/fitness-chatbot
GROQ_API_KEY=your_groq_api_key_here
PORT=3000
```

Start the backend server:
```bash
npm start
```

### Step 3: Frontend Setup
Open a new terminal in the project root:
```bash
npm install
npx expo start
```

### Step 4: Run the App
- Press `w` to open in web browser
- Press `i` to open in iOS simulator
- Press `a` to open in Android emulator
- Scan QR code with Expo Go app on your phone

---

## How to Use the App

### 1. Welcome Screen
- Read what the chatbot can help with (workouts, exercises, wellness)
- Note the disclaimer about medical advice limitations
- Tap "Get Started" to begin

### 2. Personality Selection
Choose your fitness personality:
- **Encouragement Seeker (A)**: For those who need motivation and reassurance
- **Creative Explorer (B)**: For those who like variety and creative approaches
- **Goal Finisher (C)**: For those who prefer structured plans and checklists

### 3. Chat Screen
- Type your fitness question in the input bar
- Use quick action pills for common queries (Beginner workout, Warm-up routine, etc.)
- Watch the AI respond with typing animation
- Earn coins for each message sent
- Tap the clock icon to view chat history

### 4. Example Questions to Try
- "Create a beginner workout plan for 3 days a week"
- "What are good warm-up exercises before running?"
- "How can I stay consistent with workouts?"
- "Give me 5 tips for better posture"

### 5. Safety Test
Try asking about medical topics to see the safety guardrails:
- "I have diabetes, what exercises should I do?"
- "My knee is injured, how should I workout?"

The chatbot will politely refuse and suggest consulting a healthcare professional.

---

## Prompt Composition Strategy

Every AI request combines multiple context layers:

### 1. User Personality
| Personality | Traits | AI Tone |
|-------------|--------|---------|
| A - Encouragement Seeker | Easily demotivated, needs reassurance | Warm, encouraging, supportive |
| B - Creative Explorer | Prefers creativity, dislikes spoon-feeding | Creative, engaging, offers variety |
| C - Goal Finisher | Highly motivated, prefers structure | Direct, structured, action-oriented |

### 2. Usage Duration Behavior
| Days | AI Behavior |
|------|-------------|
| 0-3 days | Grounded, empathetic. No instant remedies unless asked. |
| 4-8 days | Friendly listener. Short remedies after 2 messages. |
| 9+ days | Coach-like. Actionable guidance after 1 message. |

### 3. Lifestyle Context
Dummy data used for personalization:
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

### 1. Keyword Detection (Backend)
Checks for medical terms before AI processing:
- **Diseases**: diabetes, heart disease, cancer, etc.
- **Injuries**: fracture, ligament, sprain, etc.
- **Medications**: medicine, prescription, supplement, etc.

### 2. System Prompt Guardrails
AI is instructed to:
- Never provide medical advice
- Refuse questions about diseases, injuries, medications
- Suggest consulting healthcare professionals

### Refusal Response Example
> "I appreciate your question, but I'm not able to provide medical advice regarding diseases, injuries, medications, or medical treatments. For health concerns like these, I strongly recommend consulting with a certified doctor or healthcare professional who can give you personalized guidance. I'm here to help with general fitness questions, workout routines, and wellness tips. Is there something fitness-related I can help you with instead?"

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
│   ├── utils/           # Prompt composer, safety guardrails
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
| PUT | `/api/user/:userId/lifestyle` | Update lifestyle data |
| POST | `/api/chat/message` | Send message, get AI response |
| GET | `/api/chat/history/:userId` | Get chat history (last 10) |
| DELETE | `/api/chat/history/:userId` | Clear chat history |

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
- [x] Responsive design for all devices
