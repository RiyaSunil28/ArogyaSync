ArogyaSync 🏥

An offline-first Patient Record Management System designed for rural Primary Health Centres (PHCs) in India.

📋 About

ArogyaSync enables healthcare workers to manage patient records even without internet connectivity. Data is stored locally and automatically synced to the cloud database when connection is restored.

✨ Features

🔐 Authentication — Secure login with JWT tokens

👥 Patient Management — Add, edit, search, and delete patient records

🩺 Consultations — Track doctor visits and diagnoses

💊 Prescriptions — Manage medicine orders linked to consultations

💉 Vaccinations — Record and track vaccination doses

🔄 Offline-First Sync — Works without internet, auto-syncs when online

📊 Sync Center — Monitor sync queue, retry failed records

📱 Mobile Responsive — Works on all screen sizes

🛠️ Tech Stack

Frontend

React + Vite

React Router

Context API (SyncContext)

Lucide React Icons

Backend

FastAPI (Python)

SQLAlchemy ORM

SQLite (local offline database)

PostgreSQL (cloud database)

JWT Authentication

🚀 How to Run Locally

Backend

cd arogyasync-final

python -m uvicorn app.main:app --reload

Frontend

cd frontend

npm install

npm run dev

Open http://localhost:5173 in your browser.

🔄 Offline Sync Flow

Data entered offline → saved to local SQLite database

Records queued in sync queue with status Pending

When connection restored → background sync triggers automatically

Records transferred to cloud PostgreSQL

Sync status updated to Synced

👥 Team

Name Role

Riya Sunil Frontend Developer

Ananthu Mohan Backend Developer

Jagan J P Literature Survey & Backend

🏫 Internship Project

Built as part of IEEE internship — June 2026
