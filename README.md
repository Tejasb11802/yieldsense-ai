# ⚙️ YieldSense AI — Semiconductor Yield Intelligence Platform

**Built by Tejas Bhanushali** | ASU MS Data Science, Analytics & Engineering | May 2026

[![Python](https://img.shields.io/badge/Python-3.10+-blue)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688)](https://fastapi.tiangolo.com)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-ML-orange)](https://scikit-learn.org)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Tejas_Bhanushali-blue)](https://linkedin.com/in/tejas-b-6a28aa263/)

---

## What is YieldSense AI?

YieldSense AI is a full-stack semiconductor wafer yield intelligence platform that predicts wafer yield from inline FDC (Fault Detection and Classification) process parameters, before a lot reaches costly end-of-line testing.

Built as a targeted portfolio project for **Microchip Technology's Engineer II Software Development role (R1502-26)** in Chandler, AZ. The project directly mirrors the team's stated mission: transforming how production data is collected, analyzed, and put into action across manufacturing sites.

---

## The Problem It Solves

In semiconductor manufacturing, a wafer lot goes through hundreds of process steps before end-of-line testing reveals whether it passes or fails. By then, the cost of failure is already locked in.

**Without YieldSense:** A yield engineer manually digs through FDC parameter logs after a lot fails, spending hours finding the root cause.

**With YieldSense:** The ML model reads inline FDC parameters during production and predicts yield percentage before the lot finishes processing. Engineers get an early warning with specific recommended actions, enabling intervention before failure occurs.

---

## Architecture

FDC Process Data (200 wafer lots)
|
Python Data Pipeline (data_gen.py)
Generates realistic synthetic fab data:
oxide thickness, litho CD, etch rate,
deposition rate, implant dose, particle count
|
SQLite Database (yieldsense.db)
|
ML Model (Gradient Boosting Regressor)
MAE: 1.74% | R2: 0.943
|
FastAPI Backend (8 REST endpoints)
|
React.js Frontend (3 pages)
Dashboard | Yield Predictor | Lot Explorer

---

## Key Results

| Metric | Value |
|---|---|
| Model accuracy (R2) | 0.943 |
| Mean Absolute Error | 1.74% |
| Lots analysed | 200 wafer lots |
| Average fab yield | 85.9% |
| Pass rate | 72.5% |
| Top failure driver | Particle contamination |

---

## Features

**Dashboard**
- Live KPI cards: total lots, avg yield, pass rate, failed lots
- Yield trend line chart across 50 most recent lots
- Failure mode Pareto chart (particle contamination, CD variation, thickness, implant dose)
- Feature importance chart showing which FDC parameters drive yield loss most

**Yield Predictor**
- Engineer enters inline FDC readings for a new lot
- ML model predicts yield percentage instantly
- Risk level: LOW / MEDIUM / HIGH
- Recommended action for the process engineer
- 3 preset scenarios: Healthy Lot, High Particle Count, CD Variation Issue

**Lot Explorer**
- Browse all 200 wafer lots
- Filter by PASS / FAIL status
- See yield, failure mode, particle count, and litho CD per lot

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js 18, Recharts, React Router |
| Backend | FastAPI, Python 3.10 |
| ML Model | scikit-learn Gradient Boosting Regressor |
| Database | SQLite with pandas SQL interface |
| Data pipeline | NumPy synthetic FDC data generation |
| API | 8 REST endpoints with auto Swagger docs |

---

## How to Run

**Clone the repo:**
```bash
git clone https://github.com/Tejasb11802/yieldsense-ai.git
cd yieldsense-ai
```

**Install Python dependencies:**
```bash
pip install fastapi uvicorn scikit-learn pandas numpy python-dotenv
```

**Generate the database:**
```bash
cd backend
python data_gen.py
```

**Start the backend:**
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 5000
```

**Install and start the frontend:**
```bash
cd frontend
npm install
npm start
```

App runs at `http://localhost:3000`. API docs at `http://127.0.0.1:5000/docs`.

---

## Project Structure

| Path | Description |
|---|---|
| `backend/main.py` | FastAPI server with 8 REST endpoints |
| `backend/models.py` | Gradient Boosting yield prediction model |
| `backend/data_gen.py` | Synthetic FDC wafer data generator |
| `frontend/src/pages/Dashboard.js` | KPI cards, yield trend, Pareto, feature importance |
| `frontend/src/pages/Predict.js` | FDC parameter form and yield prediction result |
| `frontend/src/pages/Lots.js` | Filterable lot table with pass/fail status |
| `frontend/src/styles.css` | Dark theme UI styling |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/kpis` | Headline KPI numbers |
| GET | `/api/yield-trend` | Yield % for last N lots |
| GET | `/api/pareto` | Failure mode counts |
| GET | `/api/feature-importance` | ML model feature importance |
| GET | `/api/lots` | Paginated lot table |
| GET | `/api/lot/{lot_id}` | Single lot full detail |
| POST | `/api/predict` | Predict yield from FDC parameters |
| GET | `/docs` | Auto-generated Swagger UI |

---

## The Microchip Connection

This project was built after reading the Engineer II Software Development job description (R1502-26) and understanding exactly what the Chandler team is building:

**Job description says:** "Build Python services, APIs, and data pipelines that collect, transform, and deliver semiconductor manufacturing data at scale."
**This project:** Python FastAPI service with SQLite pipeline delivering FDC manufacturing data.

**Job description says:** "Develop and deploy AI/ML models and LLM-based solutions that automate analysis and surface actionable insights for engineers."
**This project:** Gradient Boosting model predicting yield from FDC parameters, surfacing risk level and recommended action.

**Job description says:** "Work directly with end-users, test engineers, yield engineers, to understand their problems and ship solutions."
**This project:** Built around the yield engineer workflow, FDC readings in, yield prediction and recommended action out.

**Preferred qualification:** "Experience with web front-end technologies (JavaScript, React)"
**This project:** Full React.js frontend with 3 pages, Recharts visualisations, and React Router navigation.

---

## About

**Tejas Bhanushali**
MS Data Science, Analytics & Engineering — Arizona State University (GPA 3.80)
Graduating May 2026 | Based in Tempe, AZ (local to Chandler facility)

[LinkedIn](https://linkedin.com/in/tejas-b-6a28aa263/) · [GitHub](https://github.com/Tejasb11802)
