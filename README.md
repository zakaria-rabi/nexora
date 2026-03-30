# NEXORA — AI-Powered E-Commerce Platform
> Final Year Project (PFE) | Full-Stack + AI Recommendation System

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/Python-3.11-yellow)
![React](https://img.shields.io/badge/React-18-cyan)

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                         │
│         React.js + Tailwind CSS + Framer Motion          │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / REST API
┌────────────────────────▼────────────────────────────────┐
│                    API GATEWAY LAYER                      │
│              FastAPI + JWT Authentication                 │
│         Swagger UI at /docs | ReDoc at /redoc            │
└──────┬──────────────────────────┬───────────────────────┘
       │                          │
┌──────▼──────┐          ┌────────▼────────┐
│  PostgreSQL  │          │  Redis Cache    │
│  (Primary DB)│          │  (Sessions/TTL) │
└──────┬──────┘          └─────────────────┘
       │
┌──────▼──────────────────────────────────────┐
│           AI RECOMMENDATION ENGINE           │
│  • Collaborative Filtering (SVD/ALS)         │
│  • Content-Based Filtering (TF-IDF/Cosine)   │
│  • Hybrid Ensemble Model                     │
└─────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (Docker)

```bash
git clone https://github.com/yourname/nexora.git
cd nexora
cp .env.example .env
docker-compose up --build
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **pgAdmin**: http://localhost:5050

---

## 🛠 Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # Edit with your config
alembic upgrade head       # Run migrations
python scripts/seed_data.py # Seed sample data
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

---

## 📁 Project Structure

```
nexora/
├── backend/
│   ├── app/
│   │   ├── api/routes/       # FastAPI route handlers
│   │   ├── core/             # Config, security, logging
│   │   ├── db/               # Database session, base
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   └── ml/               # AI recommendation engine
│   ├── alembic/              # Database migrations
│   ├── tests/                # Pytest test suite
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route-level pages
│   │   ├── store/            # Zustand state management
│   │   ├── hooks/            # Custom React hooks
│   │   └── utils/            # Helpers & API client
│   └── package.json
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
└── docs/
    ├── DATABASE_SCHEMA.md
    ├── API_ENDPOINTS.md
    └── ML_SYSTEM.md
```

---

## 🔑 Default Credentials (Dev)

| Role  | Email                | Password  |
|-------|----------------------|-----------|
| Admin | admin@nexora.com     | Admin123! |
| User  | demo@nexora.com      | Demo123!  |

---

## 📖 Documentation
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [API Endpoints](docs/API_ENDPOINTS.md)
- [ML System Design](docs/ML_SYSTEM.md)
