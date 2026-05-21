# BridgeMee - Frontend

React + Vite single-page app for login, registration, user dashboard, and admin dashboard.

**Live app:** https://bridgemeefrontend.onrender.com  
**Repository:** https://github.com/primehta17/bridgemeeFrontend.git  
**API:** https://bridgemeebackend.onrender.com/api  
**Backend repo:** https://github.com/primehta17/bridgemeeBackend.git

## Clone and run

Start the backend first, then:

```bash
git clone https://github.com/primehta17/bridgemeeFrontend.git
cd bridgemeeFrontend
npm install
npm run dev
```

App: `http://localhost:3000` (dev proxy sends `/api` to `http://localhost:5000`).

> **Monorepo:** If you downloaded the full project, this code is in the `client/` folder - run the commands above from `client/` instead of `bridgemeeFrontend/`.

## Backend (local)

```bash
git clone https://github.com/primehta17/bridgemeeBackend.git
cd bridgemeeBackend
cp .env.example .env
npm install && npm run seed && npm run dev
```

No frontend `.env` needed. Production build uses the live Render API.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview build locally |

## Tests

Manual UI testing with backend running. API health: `curl https://bridgemeebackend.onrender.com/api/health`

## Render deploy

Repo: [bridgemeeFrontend](https://github.com/primehta17/bridgemeeFrontend.git) · Build: `npm run build` · Publish `dist` as static site
