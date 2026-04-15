"""
Yield prediction model for semiconductor manufacturing.
Takes process parameters as input, predicts yield percentage.
This is what a yield engineer would use before a lot finishes
to catch problems early instead of finding out at end of line.
"""

import numpy as np
import pandas as pd
import sqlite3
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

FEATURES = [
    "oxide_thickness_nm",
    "litho_cd_nm",
    "etch_rate_aps",
    "deposition_rate_nm",
    "implant_dose",
    "anneal_temp_c",
    "particle_count",
    "alignment_error_nm",
]

_model = None
_mae = None
_r2 = None


def load_data():
    conn = sqlite3.connect("yieldsense.db")
    df = pd.read_sql("SELECT * FROM wafer_lots", conn)
    conn.close()
    return df


def train_model():
    global _model, _mae, _r2

    df = load_data()
    X = df[FEATURES]
    y = df["yield_pct"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    _model = Pipeline([
        ("scaler", StandardScaler()),
        ("reg", GradientBoostingRegressor(
            n_estimators=200,
            max_depth=4,
            learning_rate=0.05,
            random_state=42
        ))
    ])
    _model.fit(X_train, y_train)

    y_pred = _model.predict(X_test)
    _mae = round(mean_absolute_error(y_test, y_pred), 2)
    _r2 = round(r2_score(y_test, y_pred), 3)

    print(f"Model trained — MAE: {_mae}%, R2: {_r2}")
    return _model


def get_model():
    global _model
    if _model is None:
        train_model()
    return _model


def predict_yield(params: dict) -> dict:
    """
    Predict yield for a new lot given its process parameters.
    params: dict with keys matching FEATURES list
    Returns predicted yield and risk level.
    """
    model = get_model()
    X = pd.DataFrame([{f: params.get(f, 0) for f in FEATURES}])
    predicted = float(model.predict(X)[0])
    predicted = max(60, min(99, predicted))

    if predicted >= 90:
        risk = "LOW"
        action = "Lot looks healthy. Continue standard monitoring."
    elif predicted >= 80:
        risk = "MEDIUM"
        action = "Monitor closely. Check particle count and CD measurements."
    else:
        risk = "HIGH"
        action = "High yield loss predicted. Review particle count, litho CD, and oxide thickness before proceeding."

    return {
        "predicted_yield": round(predicted, 1),
        "risk_level": risk,
        "recommended_action": action,
        "model_mae": _mae,
        "model_r2": _r2,
    }


def get_feature_importance() -> list:
    """Return top feature importances for the dashboard."""
    model = get_model()
    reg = model.named_steps["reg"]
    importances = reg.feature_importances_
    result = sorted(
        [{"feature": f, "importance": round(float(i), 4)}
         for f, i in zip(FEATURES, importances)],
        key=lambda x: x["importance"],
        reverse=True
    )
    return result


if __name__ == "__main__":
    train_model()
    test_params = {
        "oxide_thickness_nm": 103,
        "litho_cd_nm": 67,
        "etch_rate_aps": 490,
        "deposition_rate_nm": 198,
        "implant_dose": 9.8e12,
        "anneal_temp_c": 895,
        "particle_count": 22,
        "alignment_error_nm": 8,
    }
    result = predict_yield(test_params)
    print("\nTest prediction (high particle count lot):")
    print(f"Predicted yield: {result['predicted_yield']}%")
    print(f"Risk level: {result['risk_level']}")
    print(f"Action: {result['recommended_action']}")