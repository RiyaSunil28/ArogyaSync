# ArogyaSync 🏥
### Offline-First Patient Record Management for Rural PHCs

> Developed under the **IEEE EMBS Pune Chapter Internship Program**
> **Team AJR** — Riya Elizabeth Sunil · Ananthu Mohan · Jagan J P
> Mentor: Sai Varun Chandrashekar

[![Live Demo](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://arogya-sync-5tyj.vercel.app)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE.txt)

---

## About

ArogyaSync is a browser-based healthcare management system built for **Primary Health Centres (PHCs) in rural India**, where internet access is frequently unavailable or unreliable.

Healthcare workers can register patients, record consultations, issue prescriptions, and log vaccinations — all **without any internet connection**. Data is stored locally on the device and automatically synced to the central cloud database the moment connectivity is restored, with no manual action required.

---

## Key Features

| Feature | Description |
|---|---|
| 🔌 Offline-First | All modules work fully without internet |
| 🔄 Auto Sync | Queue-based sync engine pushes local records to cloud on reconnection |
| 👤 Patient Management | Register and manage patient profiles with UUID-based linking |
| 🩺 Consultations | Log symptoms, diagnosis, and clinical notes per visit |
| 💊 Prescriptions | Issue prescriptions linked to specific consultations |
| 💉 Vaccinations | Track vaccine name, batch number, date, and status |
| 📊 Dashboard | Live analytics — patient counts, visit trends, sync health |
| 🔒 Role-Based Auth | JWT authentication with role-based access control |
| 📡 Sync Center | Monitor queue, connection status, and retry failed records |

---

## System Architecture

ArogyaSync uses a **six-layer architecture**:

```
User Layer          →  Doctors, nurses, health officers (any browser)
Application Layer   →  React + Vite frontend (6 modules)
Offline Layer       →  SQLite local database (local_phc.db)
Synchronization     →  Queue-based sync engine
Server Layer        →  FastAPI backend (JWT auth, REST API)
Database Layer      →  PostgreSQL on Render (cloud source of truth)
```

---

## Technology Stack

### Frontend
| Library | Version |
|---|---|
| React | 19.2.7 |
| Vite | 8.0.16 |
| React Router DOM | 7.18.0 |
| ApexCharts | 5.15.0 |
| react-apexcharts | 2.1.0 |
| Lucide React | 1.21.0 |

### Backend
| Library | Version |
|---|---|
| Python | 3.13 |
| FastAPI | 0.137.2 |
| Uvicorn | 0.30.1 |
| SQLAlchemy | ≥2.0.40 |
| Pydantic | 2.13.4 |
| pydantic-settings | 2.3.1 |
| Alembic | 1.13.1 |
| python-jose | 3.3.0 |
| passlib | 1.7.4 |
| bcrypt | 4.1.3 |
| psycopg[binary] | latest |

### Databases
| | |
|---|---|
| Local | SQLite (`local_phc.db`) |
| Cloud | PostgreSQL (hosted on Render) |

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- Python 3.13
- npm

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd app
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Environment Variables
Create a `.env` file in the root directory:
```
DATABASE_URL=postgresql://...
SECRET_KEY=your_secret_key
```

---

## Deployment

| Service | Platform |
|---|---|
| Frontend | [Vercel](https://arogya-sync-5tyj.vercel.app) |
| Backend + DB | [Render](https://arogyasync-backend.onrender.com) |
| API Docs | [Swagger UI](https://arogyasync-backend.onrender.com/docs) |

---

## Testing Results

End-to-end offline sync test: **21 patient records** entered with no internet connection → all 21 automatically synchronized to cloud on reconnection → **100% sync health**, 0 records pending.

---

## License

This project is licensed under the **GNU General Public License v3.0**.
See [LICENSE.txt](LICENSE.txt) for details.
