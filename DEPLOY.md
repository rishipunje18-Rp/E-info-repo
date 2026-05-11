# E-Info Deployment Guide

This application is and Express + Vite unified full-stack application.

## Render Deployment Instructions

To deploy this successfully on Render, follow these steps:

### 1. Create a "Web Service"
Do NOT create a "Static Site". Create a **Web Service** so the Express backend can run.

### 2. Configure Environment Variables
In the Render dashboard, add the following Environment Variables:
- `GEMINI_API_KEY`: Your Google Gemini API Key.
- `NODE_ENV`: Set to `production`.
- `VITE_BACKEND_URL`: Leave empty if you want to use the same domain, or set to your full backend URL (e.g. `https://e-info-repo.onrender.com`) if needed.
- `PORT`: 3000 (Render usually sets this automatically).

### 3. Build & Start Commands
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 4. Database Persistence (Optional)
This app uses SQLite (`einfo.db`). On Render, the folder is temporary.
- For a small demo: No action needed (data resets on every deploy).
- For real use: Add a **Render Disk** and mount it at the root, or change the database path in `server.ts` to a persistent directory.

## Local Development
1. `npm install`
2. `npm run dev`
