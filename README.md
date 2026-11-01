# 🎉 EventWise AI – Intelligent Celebration & Event Planning Assistant

> **Plan Smarter. Celebrate Better.**

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Built with React](https://img.shields.io/badge/Built%20with-React%2018-61DAFB?logo=react)](https://react.dev)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Google%20Gemini-4285F4?logo=google)](https://ai.google.dev)

---

## 1. Project Title

**EventWise AI** – A GenAI-powered event planning assistant that helps users organize weddings, birthdays, anniversaries, and community events with AI-generated budgets, timelines, vendor checklists, and personalized creative ideas.

---

## 2. Problem Statement

Planning a celebration is stressful, time-consuming, and expensive. People often lack structured guidance on budgeting, vendor management, and creative ideas specific to their event type, culture, and budget. There's no single intelligent tool that helps them organize every aspect end-to-end.

**EventWise AI** solves this by providing an AI-powered planning assistant that generates complete, personalized event plans in seconds.

---

## 3. Chosen Vertical

**Celebration & Event Planner** — GenAI-powered planning for weddings, birthdays, anniversaries, engagements, baby showers, community events, and festival celebrations.

---

## 4. Project Overview

EventWise AI is a full-stack web application built with React + Vite on the frontend and Vercel serverless functions on the backend. It integrates Google Gemini 1.5 Flash to generate comprehensive event plans including budget breakdowns, timelines, vendor checklists, and creative ideas — all personalized to the user's event type, budget, location, and preferences.

When the Gemini API is unavailable, the app automatically falls back to a built-in local planning engine (Demo Mode) so it always remains functional.

---

## 5. Key Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Event Creation** | Generate complete event plans using Google Gemini AI |
| 💰 **Smart Budget Planner** | Auto-allocate budget with visual pie charts; editable categories |
| 📅 **Event Timeline** | Phase-by-phase preparation checklist with completion tracking |
| ✅ **Vendor Checklist** | Manage vendor bookings with status tracking (add/edit/delete) |
| 💡 **AI Creative Ideas** | Personalized themes, decoration, food, entertainment suggestions |
| 💾 **Event Persistence** | Save, load, edit, and delete events using localStorage |
| 📄 **PDF Export** | Download complete event plan as a professionally formatted PDF |
| 🇮🇳 **Indian/Kerala Support** | Regional cultural elements, traditions, and food suggestions |
| 📱 **Responsive Design** | Fully mobile, tablet, and desktop optimized |
| 🔒 **Demo Mode** | Fully functional without an API key |

---

## 6. Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Language | JavaScript (ES Modules) |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Charts | Recharts |
| PDF Export | jsPDF |
| Routing | React Router DOM v6 |
| AI | Google Gemini 1.5 Flash API |
| Backend | Vercel Serverless Functions (Node.js) |
| Storage | Browser localStorage |
| Deployment | Vercel |

---

## 7. Approach and Logic

### Architecture

```
┌─────────────────────────────────────────┐
│           React Frontend (Vite)          │
│  Dashboard → Create → Events → Detail   │
│  Budget → Timeline → Vendors → Ideas    │
└──────────────┬──────────────────────────┘
               │ fetch /api/*
┌──────────────▼──────────────────────────┐
│      Vercel Serverless Functions         │
│  /api/health  (API availability check)   │
│  /api/generate-plan  (Gemini call)       │
│  /api/generate-ideas  (Gemini call)      │
└──────────────┬──────────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────────┐
│        Google Gemini 1.5 Flash API       │
│     (GEMINI_API_KEY in env variables)    │
└─────────────────────────────────────────┘
```

### Key Design Decisions

1. **No backend database** — localStorage keeps it simple and fast
2. **Demo Mode** — Always functional even without API key
3. **Secure API key** — Never exposed in frontend; only accessed via serverless function
4. **Budget validation** — AI output is validated and scaled to never exceed user's budget
5. **JSON response mode** — Gemini configured with `responseMimeType: 'application/json'` for reliable parsing

---

## 8. How the Solution Works

1. **User fills the Create Event form** with event details, budget, and preferences
2. **Frontend calls `/api/health`** to check if Gemini is available
3. **If AI available**: Frontend calls `/api/generate-plan` → serverless function → Gemini API → structured JSON plan
4. **If AI unavailable**: Local Demo Engine generates a realistic plan from templates
5. **Plan is saved** to localStorage with all sections (budget, timeline, vendors, ideas)
6. **User navigates** between Budget Planner, Timeline, Vendor Checklist, and AI Ideas tabs
7. **All edits persist** automatically to localStorage
8. **PDF export** generates a complete formatted document using jsPDF

---

## 9. AI Integration Explanation

### Gemini API Usage

- **Model**: `gemini-1.5-flash` (fast, cost-effective, supports JSON mode)
- **Endpoint**: `POST /api/generate-plan` and `POST /api/generate-ideas`
- **Prompt Engineering**: Structured prompt with event details → JSON schema instruction
- **Response Validation**: Parsed, validated, and sanitized before display
- **Error Handling**: Network errors, invalid JSON, API quota errors all handled gracefully

### Security

- API key stored in **Vercel environment variables** (server-side only)
- Frontend never receives or sees the API key
- All AI calls proxied through serverless functions

### Fallback (Demo Mode)

When Gemini is unavailable:
- Local engine uses event-type-specific budget allocation tables
- Pre-built vendor lists, timeline phases, and creative idea banks
- Clearly labeled as "Demo Mode" — never pretends to be AI-generated

---

## 10. Budget Calculation Approach

### AI Mode
Gemini generates category-wise percentage allocations based on event type, guest count, and total budget. The serverless function validates and scales the output to ensure total ≤ user budget.

### Demo Mode
Fixed percentage allocations per event type (e.g., Wedding: Venue 25%, Catering 30%…). Total is adjusted to exactly match the user's budget.

### User Editing
Users can manually edit any category amount. The remaining budget updates in real-time and highlights overruns.

> ⚠️ **Disclaimer**: All budget figures are estimates for planning purposes only, not verified market quotations.

---

## 11. Assumptions Made

- Users are primarily from India (INR default, Indian cultural preferences)
- localStorage is sufficient for single-user personal planning
- Gemini 1.5 Flash provides adequate quality for event planning
- No authentication needed for personal planning tool
- PDF export covers essential plan sections

---

## 12. Project Folder Structure

```
eventwise-ai/
├── api/                      # Vercel serverless functions
│   ├── health.js             # API availability check
│   ├── generate-plan.js      # AI plan generation (Gemini)
│   └── generate-ideas.js     # AI ideas regeneration (Gemini)
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── Sidebar.jsx       # Navigation sidebar
│   ├── pages/
│   │   ├── Dashboard.jsx     # Home/overview dashboard
│   │   ├── CreateEvent.jsx   # Event creation form
│   │   ├── MyEvents.jsx      # Event list view
│   │   ├── EventDetail.jsx   # Full event detail + PDF export
│   │   ├── BudgetPlanner.jsx # Budget breakdown + chart
│   │   ├── Timeline.jsx      # Preparation timeline
│   │   ├── VendorChecklist.jsx # Vendor management
│   │   └── AIIdeas.jsx       # Creative ideas
│   ├── utils/
│   │   ├── storage.js        # localStorage utilities
│   │   ├── demoEngine.js     # Local planning engine
│   │   └── aiService.js      # Frontend API calls
│   ├── App.jsx               # Router + layout
│   ├── main.jsx              # React entry point
│   └── index.css             # Global styles + Tailwind
├── .env.example              # Environment variable template
├── .gitignore
├── index.html
├── package.json
├── vercel.json               # Vercel deployment config
├── vite.config.js
├── LICENSE
└── README.md
```

---

## 13. Installation Instructions

### Prerequisites
- Node.js v18 or higher
- npm v9 or higher
- A Google Gemini API key (optional, for AI features)

### Steps

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/eventwise-ai.git
cd eventwise-ai

# Install dependencies
npm install
```

---

## 14. Environment Variable Setup

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env`:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

Get your free Gemini API key from: https://makersuite.google.com/app/apikey

> **Note**: The app works in Demo Mode without an API key. The AI features require the key.

---

## 15. How to Run Locally

```bash
# Start development server (frontend only - demo mode)
npm run dev

# For full AI functionality locally, use Vercel CLI:
npm install -g vercel
vercel dev
```

The app will open at http://localhost:5173 (npm run dev) or http://localhost:3000 (vercel dev).

---

## 16. Deployment Instructions

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Add your Gemini API key as an environment variable
vercel env add GEMINI_API_KEY

# Deploy to production
vercel --prod
```

### Set Environment Variables in Vercel Dashboard

1. Go to your project on [vercel.com](https://vercel.com)
2. Navigate to **Settings → Environment Variables**
3. Add: `GEMINI_API_KEY` = `your_api_key`
4. Redeploy for changes to take effect

---

## 17. Testing Details

### Test Scenarios Covered

| # | Test | Result |
|---|------|--------|
| 1 | Create birthday event | ✅ Plan generated with birthday-specific vendors/ideas |
| 2 | Create wedding event | ✅ Wedding plan with Kerala cultural elements |
| 3 | Budget breakdown generation | ✅ Categories allocated, total ≤ user budget |
| 4 | Budget allocation validation | ✅ Never exceeds total budget; overrun highlighted |
| 5 | Event timeline generation | ✅ Phase-based timeline from 3 months to event day |
| 6 | Mark checklist items complete | ✅ Progress saved to localStorage |
| 7 | Edit event details | ✅ Inline edit form, persists on save |
| 8 | Save and reload event | ✅ localStorage persistence across page refreshes |
| 9 | Delete event | ✅ Confirmation dialog, removed from list |
| 10 | Export PDF | ✅ Formatted PDF with all sections |
| 11 | No Gemini API key | ✅ Demo Mode banner, local engine used |
| 12 | API error handling | ✅ Graceful fallback to demo engine |
| 13 | Mobile responsive | ✅ Sidebar collapses, cards stack vertically |

---

## 18. Security and Accessibility Considerations

### Security
- ✅ Gemini API key never exposed in frontend code
- ✅ All AI calls proxied through serverless functions
- ✅ No dangerouslySetInnerHTML used
- ✅ Input validation on all form fields
- ✅ No personal data collected or transmitted (localStorage only)
- ✅ No hardcoded secrets anywhere in codebase

### Accessibility
- ✅ Semantic HTML elements throughout
- ✅ ARIA labels on interactive buttons
- ✅ Keyboard navigation support
- ✅ Visible focus indicators
- ✅ Sufficient color contrast (WCAG AA)
- ✅ Form labels linked to inputs
- ✅ Error messages with clear descriptions
- ✅ Loading states clearly communicated

---

## 19. Screenshots

> 📸 Add screenshots here after deployment

| Screen | Description |
|--------|-------------|
| Dashboard | Overview with stats and recent events |
| Create Event | Multi-section form with AI generation |
| Event Detail | Complete plan with navigation to sub-sections |
| Budget Planner | Category breakdown with pie chart |
| Timeline | Phase-based preparation checklist |
| Vendor Checklist | Status tracking with add/edit/delete |
| AI Ideas | Creative suggestions by category |
| Mobile View | Responsive sidebar navigation |

---

## License

MIT License – see [LICENSE](LICENSE) for details.

---

*Built with ❤️ using React, Tailwind CSS, and Google Gemini AI*
