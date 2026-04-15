"""
YieldSense AI - FastAPI Backend
The waiter that connects React frontend to the ML model and database.
"""

import sqlite3
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from models import predict_yield, get_feature_importance, train_model, load_data

app = FastAPI(title="YieldSense AI", version="1.0.0")

# Allow React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Train model on startup
@app.on_event("startup")
async def startup_event():
    train_model()
    print("YieldSense AI backend ready")


# ── Health check ──────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "YieldSense AI running"}


# ── Yield trend data ──────────────────────────────────────────────────────────

@app.get("/api/yield-trend")
def yield_trend(limit: int = 50):
    """
    Returns yield percentage for the last N lots.
    React uses this to draw the yield trend line chart.
    """
    conn = sqlite3.connect("yieldsense.db")
    df = pd.read_sql(
        f"SELECT lot_id, date, yield_pct, pass_fail FROM wafer_lots ORDER BY date DESC LIMIT {limit}",
        conn
    )
    conn.close()
    return df.iloc[::-1].to_dict(orient="records")


# ── KPI summary ───────────────────────────────────────────────────────────────

@app.get("/api/kpis")
def kpis():
    """
    Returns headline KPI numbers for the dashboard top bar.
    """
    conn = sqlite3.connect("yieldsense.db")
    df = pd.read_sql("SELECT * FROM wafer_lots", conn)
    conn.close()

    return {
        "total_lots": len(df),
        "avg_yield": round(df["yield_pct"].mean(), 1),
        "pass_rate": round((df["pass_fail"] == "PASS").mean() * 100, 1),
        "failed_lots": int((df["pass_fail"] == "FAIL").sum()),
        "best_yield": round(df["yield_pct"].max(), 1),
        "worst_yield": round(df["yield_pct"].min(), 1),
    }


# ── Pareto of failure modes ───────────────────────────────────────────────────

@app.get("/api/pareto")
def pareto():
    """
    Returns count of each failure mode for the Pareto chart.
    Engineers use this to see which failure is most common.
    """
    conn = sqlite3.connect("yieldsense.db")
    df = pd.read_sql("SELECT failure_mode FROM wafer_lots", conn)
    conn.close()

    counts = (
        df[df["failure_mode"] != "None"]["failure_mode"]
        .value_counts()
        .reset_index()
    )
    counts.columns = ["failure_mode", "count"]
    return counts.to_dict(orient="records")


# ── Feature importance ────────────────────────────────────────────────────────

@app.get("/api/feature-importance")
def feature_importance():
    """
    Returns which process parameters drive yield the most.
    """
    return get_feature_importance()


# ── Lot detail ────────────────────────────────────────────────────────────────

@app.get("/api/lot/{lot_id}")
def lot_detail(lot_id: str):
    """
    Returns full details for a specific lot.
    """
    conn = sqlite3.connect("yieldsense.db")
    df = pd.read_sql(
        "SELECT * FROM wafer_lots WHERE lot_id = ?",
        conn, params=(lot_id,)
    )
    conn.close()
    if df.empty:
        raise HTTPException(status_code=404, detail=f"Lot {lot_id} not found")
    return df.iloc[0].to_dict()


# ── Yield prediction ──────────────────────────────────────────────────────────

class PredictionRequest(BaseModel):
    oxide_thickness_nm: float = 100.0
    litho_cd_nm: float = 65.0
    etch_rate_aps: float = 500.0
    deposition_rate_nm: float = 200.0
    implant_dose: float = 1e13
    anneal_temp_c: float = 900.0
    particle_count: float = 5.0
    alignment_error_nm: float = 3.0


@app.post("/api/predict")
def predict(request: PredictionRequest):
    """
    Predict yield for a new lot given its process parameters.
    This is the core ML endpoint — engineer enters FDC readings,
    gets yield prediction before the lot finishes processing.
    """
    result = predict_yield(request.dict())
    return result


# ── All lots table ────────────────────────────────────────────────────────────

@app.get("/api/lots")
def all_lots(limit: int = 100, offset: int = 0):
    """
    Returns paginated list of all lots for the data table.
    """
    conn = sqlite3.connect("yieldsense.db")
    df = pd.read_sql(
        f"SELECT lot_id, date, yield_pct, pass_fail, failure_mode, particle_count, litho_cd_nm FROM wafer_lots ORDER BY date DESC LIMIT {limit} OFFSET {offset}",
        conn
    )
    conn.close()
    return {
        "lots": df.to_dict(orient="records"),
        "total": 200
    }