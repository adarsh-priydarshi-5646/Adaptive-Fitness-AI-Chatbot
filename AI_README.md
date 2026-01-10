# AI Tools Usage Documentation

This document lists all AI tools and prompts used during the development of this project.

## AI Tools Used

### 1. Kiro AI (Development Assistant)
Used for code generation, debugging, and implementation guidance.

#### Prompts Used:

**Backend Setup:**
- "start with backend first by following the docs"
- "create Node.js + Express backend with MongoDB"
- "implement user model with personality and lifestyle data"
- "create conversation model for chat history"
- "implement safety guardrails for medical content filtering"
- "create prompt composer for adaptive AI behavior"
- "integrate Groq API for chat completion"

**Frontend Implementation:**
- "create welcome screen with disclaimer"
- "implement onboarding screen with personality selection"
- "build chat screen with message UI"
- "add structured AI response parsing"
- "implement chat history screen"

**Feature-specific:**
- "implement coin reward system"
- "add follow-up quick action pills"
- "parse AI responses for day-wise plans and bullet points"

### 2. Groq API (AI Model)
- **Model**: llama-3.3-70b-versatile
- **Purpose**: Generate fitness-related responses
- **Integration**: Via Groq SDK in Node.js backend

#### System Prompt Template:
```
You are an AI-powered fitness companion chatbot. Your role is to help users with fitness, workouts, and basic wellness guidance.

CRITICAL SAFETY RULES:
- You MUST NOT provide medical advice about diseases, injuries, medications, or medical treatments
- If asked about medical topics, politely refuse and suggest consulting a healthcare professional
- You are NOT a medical tool and should never diagnose or treat medical conditions

USER PERSONALITY: [A/B/C - Name]
- Traits: [personality traits]
- Communication style: [tone guidelines]

USAGE STAGE: [new_user/regular_user/experienced_user] ([X] days using the app)
- Behavior guideline: [stage-specific behavior]

Current lifestyle indicators:
- [Activity level analysis]
- [Exercise analysis]
- [Sleep analysis]

RESPONSE FORMAT GUIDELINES:
- Structure your responses clearly with sections when appropriate
- For workout plans, use day-wise breakdowns
- For tips, use numbered or bulleted lists
- Offer 2-3 follow-up suggestions at the end when relevant
- Keep responses conversational but organized
- Adapt your tone based on the user's personality type
```

## Code Attribution

All code in this repository was developed with assistance from Kiro AI. The AI was used for:
- Initial code scaffolding
- Implementation of features
- Bug fixes and debugging
- Documentation generation

Human review and modifications were applied to all AI-generated code.
