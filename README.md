# Study Help

Study Help is a production-minded full-stack starter for an AI-powered student preparation and career tracking platform.

## Stack

- React, TypeScript, Tailwind CSS, Framer Motion, Recharts
- Node.js, Express, JWT auth
- PostgreSQL-ready schema with persistent local JSON storage for development
- OpenAI/Gemini-ready AI service with a dynamic local planner fallback

## Quick Start

```bash
npm.cmd install
npm.cmd run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:4000

## Environment

Copy `.env.example` to `.env` inside `server/` when you are ready to connect real services.

```bash
cp server/.env.example server/.env
```

The app runs without external credentials. Local development data is saved to
`server/data/store.json`, which is ignored by git. Configure `DATABASE_URL`
when you are ready to connect PostgreSQL in production.

## Useful Scripts

```bash
npm.cmd run dev
npm.cmd run typecheck
npm.cmd run build
```
