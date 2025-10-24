# EventNest

EventNest is a full-stack event management application (Express + MongoDB backend, React frontend) designed for creating, discovering and attending community events. This repository contains two main folders:

- `eventnest-backend/` - Express API server with MongoDB (Mongoose) and JWT authentication.
- `eventnest-frontend/` - React app (Vite) with a modern dark-first design system and responsive UI.

This README covers local setup, environment variables, development workflows, and a brief overview of important files.

---

## Quick start (Windows PowerShell)

Open two terminals (one for backend, one for frontend).

Backend (from repo root or backend folder):

```powershell
# change to backend folder
cd "e:\5th sem 3rd internals\event-nest\eventnest-backend"
# install deps (only if not already installed)
npm install
# create or update .env with required variables (see below)
# start server
npm start
```

Frontend:

```powershell
cd "e:\5th sem 3rd internals\event-nest\eventnest-frontend"
npm install
npm run dev
# Open the app at http://localhost:3001 (Vite default in this workspace)
```

API base URL (default): `http://localhost:5000/api`

---

## Required environment variables

Create a `.env` file in `eventnest-backend/` with at least:

```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=some_long_random_secret
JWT_EXPIRE=30d
```

Notes:
- The backend reads `MONGODB_URI` (not `MONGO_URI`).
- Keep secrets out of source control.

---

## Useful scripts

Backend (`eventnest-backend/package.json`):
- `npm start` — start the server (runs `node server.js`).

Frontend (`eventnest-frontend/package.json`):
- `npm run dev` — start Vite dev server.

Utility script added during development:
- `eventnest-backend/fix-user-ids.js` — Node script used to fix event `user` fields in the database (used to migrate legacy events created before authentication was enforced).

Run it from backend folder:

```powershell
cd "e:\5th sem 3rd internals\event-nest\eventnest-backend"
node fix-user-ids.js
```

Use with caution — it updates DB documents.

---

## Project structure (high level)

eventnest-backend/
- `server.js` — app entry point
- `controllers/` — route handlers (`eventController.js`, `userController.js`, ...)
- `routes/` — Express routers (`events.js`, `auth.js`, `users.js`)
- `models/` — Mongoose models (`Event.js`, `User.js`)
- `middleware/` — `auth.js`, `async.js` etc.
- `utils/` — helpers like `errorResponse.js`
- `.env` — local env (not committed)

eventnest-frontend/
- `src/pages/` — React pages (`Dashboard.jsx`, `UserProfile.jsx`, ...)
- `src/components/` — shared components (navbar, footer, etc.)
- `src/context/` — `UserContext`, `ThemeContext`
- `src/services/api.js` — configured axios instance for API calls
- `src/styles/` — `design-system.css`, `dashboard.css`, `profile.css`, etc.
- `src/index.css` — global imports and small overrides

---

## Theming & styling notes

- The app uses a dark-first design system in `src/styles/design-system.css` with CSS variables (for example `--bg-0`, `--text-primary`, `--text-secondary`) and a `:root[data-theme="light"]` section for light theme overrides.
- `ThemeProvider` (in `src/context/ThemeContext.jsx`) toggles theme by setting `data-theme="light"` on the `document.documentElement`.
- If you see text that is too light/dark in a given theme, check for Bootstrap utility classes like `.text-muted`. The project contains targeted overrides in `src/styles/dashboard.css` and other files that enforce readable colors using the design variables.

---

## Authentication

- JWT tokens are issued by the backend on login/register.
- The frontend stores the token (key used in the app: `authToken` or managed through `UserContext`) and sends it in `Authorization: Bearer <token>` headers when required.
- All event mutation routes (create/update/delete/rsvp/feedback) are protected by the `protect` middleware which validates the JWT and attaches `req.user`.

---

## Debugging & common fixes

- If events created before adding auth show a `user` value of `000000000000000000000000`, those documents were created before the backend enforced auth. Use the migration helper `fix-user-ids.js` only if you know the correct mapping of events to users.
- If new events are still stored with zeros, ensure the backend was restarted after route/controller changes and that you're sending a valid Bearer token when creating events.
- Vite hot-reload messages: if you see `server connection lost. Polling for restart...`, check the terminal running the frontend for crashes and restart `npm run dev` if needed.
- For React dev-time debugging, install React DevTools: https://react.dev/link/react-devtools

---

## Testing

There are no automated tests in the repository by default. To add tests, consider using Jest + React Testing Library for the frontend and Jest + Supertest for the backend.

---

## Contribution

If you want to contribute:
1. Fork or create a branch for your feature/bugfix.
2. Keep commits small and focused.
3. Open a PR with a clear description and screenshots if UI changes were made.

---

## Security & production notes

- Rotate `JWT_SECRET` and keep it in a secure vault for production.
- Use environment-specific MongoDB connection strings and restrict database access.
- Do not run `fix-user-ids.js` in production without a backup.

---

## Contact / Maintainers

If you need help with local setup or reproducing issues, open an issue or contact the maintainer listed in your team.

---

License: (choose a license and add here)  

---

Happy hacking — explore `eventnest-frontend/src/pages/Dashboard.jsx` and `eventnest-frontend/src/pages/UserProfile.jsx` for the user activity logic, and `eventnest-backend/controllers/eventController.js` for the server-side behaviour.