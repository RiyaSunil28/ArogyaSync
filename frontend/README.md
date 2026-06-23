# ArogyaSync — Offline-First PHC Management System

React/Vite frontend for the ArogyaSync Primary Health Centre management system.

## Tech Stack
- React 18 + Vite
- React Router v6
- ApexCharts (react-apexcharts)
- Lucide React (icons)

## Installation

```bash
git clone https://github.com/luffy-2004/arogyasync.git
cd arogyasync
git checkout -b frontend-development
npm install
```

## Running locally

```bash
npm run dev
```
Opens at `http://localhost:5173`

## Building for production

```bash
npm run build
```
Output goes to `dist/`

## Environment Variables

Create a `.env` file in the project root:

```
VITE_API_BASE_URL=http://localhost:8000
```

All API calls should use `import.meta.env.VITE_API_BASE_URL` as the base.

## Project Structure

```
src/
├── components/
│   ├── Header.jsx       # Top bar with greeting, date/time, online status
│   ├── Layout.jsx       # App shell — sidebar + header + outlet
│   └── Sidebar.jsx      # Nav menu, connection widget, user profile
├── context/
│   ├── SyncContext.jsx  # Global state — patients, consultations, sync logic
│   └── useSyncContext.js # useSync() hook
├── pages/
│   ├── Login.jsx        # JWT login page
│   ├── Dashboard.jsx    # Charts, stats, quick actions
│   ├── Patients.jsx     # CRUD + search
│   ├── Consultations.jsx
│   ├── Prescriptions.jsx
│   ├── Vaccinations.jsx
│   └── SyncCenter.jsx   # Sync queue, logs, retry failed
├── App.jsx              # Routes + protected route logic
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## API Endpoints (Backend Integration)

| Module         | Endpoints |
|----------------|-----------|
| Auth           | POST /api/v1/auth/login |
| Patients       | GET/POST /api/v1/patients, PUT/GET/DELETE /api/v1/patients/{id} |
| Consultations  | GET/POST /api/v1/consultations, PUT/GET /api/v1/consultations/{id} |
| Prescriptions  | GET/POST /api/v1/prescriptions, PUT/GET /api/v1/prescriptions/{id} |
| Vaccinations   | GET/POST /api/v1/vaccinations, PUT/GET /api/v1/vaccinations/{id} |
| Sync           | GET /api/v1/sync/status, GET /api/v1/sync/queue, POST /api/v1/sync/trigger, POST /api/v1/sync/retry-failed |

## Git Workflow

```bash
git checkout -b frontend-development
git add .
git commit -m "feat: complete frontend implementation"
git push origin frontend-development
```

> Do NOT merge into main. All frontend work stays on the `frontend-development` branch.

## Current Status

- ✅ Login page with JWT token storage
- ✅ Protected routes (redirect to /login without token)
- ✅ Dashboard with charts and quick actions
- ✅ Patients — create, edit, delete, search (name, age, gender, phone, address)
- ✅ Consultations — create, edit, search (symptoms, diagnosis, doctor notes)
- ✅ Prescriptions — create, edit, search (consultation link, medicine, dosage, duration)
- ✅ Vaccinations — create, edit, search (vaccine name, date, batch, status)
- ✅ Sync Center — sync queue table, log history, retry failed records
- ✅ Offline-first local state — all changes queue locally when offline
- ✅ Auto-sync on reconnect
- ⏳ Real API integration (replace mock calls in SyncContext with fetch/axios)
- ⏳ JWT auto-inclusion in API headers (add Authorization header to all requests)