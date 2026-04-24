# Wealth

Wealth is a full-stack wellness tracker that helps users manage daily health habits in one place. The app includes activity tracking, diet logging, reminders, profile progress, mental health tools, and location-based hospital/clinic booking support. It is built with Vue 3 + Pinia on the frontend and a lightweight Node.js/Express API backend for authentication and profile data.

## What This Project Includes

- User authentication (register/login/logout)
- Activity, diet, reminders, and mental health tracking
- Profile management with persistent user data
- Hospital/clinic lookup and booking-related utilities
- Bilingual interface support (Traditional Chinese / English)

## Tech Stack

- Frontend: Vue 3, Vite, Pinia, Vue Router, Element Plus
- Backend: Node.js, Express
- Deployment: GitHub Pages (frontend) + Render (backend)

## Live Demo

- Frontend (GitHub Pages): https://xgc0401.github.io/Wealth/
- Backend API (Render): https://wealth-10ru.onrender.com/api

## Frontend API Configuration

This app uses `VITE_API_BASE_URL` for backend requests.

- Local development default: `/api` (works with Vite proxy to `http://localhost:3100`)
- GitHub Pages: set repository variable `VITE_API_BASE_URL` to your deployed backend URL, for example:
	`https://your-backend.example.com/api`

Optional local override:

1. Create `.env.local`
2. Add:

```env
VITE_API_BASE_URL=http://localhost:3100/api
```

## Render Deployment (Single Service)

If you want `https://your-render-url.onrender.com/` to open the web app directly, deploy this repo as a Node Web Service and use:

- Build Command: `npm install && npm run build`
- Start Command: `npm start`

This works because `server.js` now serves:

- API routes under `/api/*`
- built Vue files from `dist/`
- SPA fallback to `index.html` for non-API routes
