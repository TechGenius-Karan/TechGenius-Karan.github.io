# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend
```bash
cd backend
npm install       # Install dependencies
npm start         # Start Express server on port 5000 (node server.js)
```

### Frontend
No build step — static files (`index.html`, `index.js`, `style.css`). Open `index.html` directly in a browser or deploy to GitHub Pages.

## Architecture

**Full-stack quote generator:**
- **Frontend**: Vanilla HTML/CSS/JS (no framework), deployed on GitHub Pages
- **Backend**: Express.js (v5, ES module syntax) on port 5000, deployed on Render.com
- **Database**: MongoDB Atlas via Mongoose

**Request flow:**
1. `index.js` fetches from the backend REST API on page load and on user interaction
2. The backend queries MongoDB and returns JSON arrays of quotes
3. AI quotes are generated via the Hugging Face Inference API (Zephyr-7B model)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/quotes` | All quotes |
| GET | `/quotes/category/:category` | Quotes filtered by category (case-insensitive regex) |
| POST | `/quotes` | Create a new quote `{ text, author, category }` |
| POST | `/ai-quote` | Generate AI quote `{ category, topic }` via Hugging Face |
| GET | `/routes-check` | Health check |

## Environment Variables

Backend requires a `backend/.env` file:
```
MONGO_URI=...        # MongoDB Atlas connection string
PORT=5000
HF_API_KEY=...       # Hugging Face API key for /ai-quote endpoint
```

## Key Notes

- Backend uses `"type": "module"` (ES6 imports); root `package.json` uses `"type": "commonjs"` — don't mix import styles.
- The `openai` package is installed but unused; AI integration uses Hugging Face directly via `axios`.
- Quote categories: Motivation, Life, Success, Wisdom, Happiness.
- No-repeat logic on the frontend uses a `usedQuotes` array that resets when all quotes are exhausted.
