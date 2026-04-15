"""
Generates synthetic semiconductor wafer manufacturing data.
In a real fab this comes from FDC systems (Fault Detection & Classification).
Each lot = 25 wafers going through the manufacturing process.
Each wafer has process parameters recorded at each step.
"""

import numpy as np
import pandas as pd
import sqlite3
import random
from datetime import datetime, timedelta

np.random.seed(42)
random.seed(42)

PROCESS_STEPS = [
    "Oxidation", "Lithography", "Etching",
    "Deposition", "Implantation", "Annealing",
    "Metrology", "Cleaning"
]

FAILURE_MODES = [
    "Particle Contamination",
    "CD Variation",
    "Thickness Out of Spec",
    "Implant Dose Error",
    "Alignment Error",
    "None"
]

def generate_lot_data(n_lots=200):
    """
    Generate n_lots of wafer manufacturing data.
    Each lot has process parameters and a final yield value.
    """
    lots = []

    for i in range(n_lots):
        lot_id = f"LOT-{1000 + i}"
        start_date = datetime(2024, 1, 1) + timedelta(days=i)

        # Process parameters — these are the FDC readings
        oxide_thickness = np.random.normal(100, 3)       # target 100nm
        litho_cd = np.random.normal(65, 2)               # critical dimension nm
        etch_rate = np.random.normal(500, 20)             # angstroms/min
        deposition_rate = np.random.normal(200, 8)       # nm/min
        implant_dose = np.random.normal(1e13, 5e11)      # ions/cm2
        anneal_temp = np.random.normal(900, 10)          # celsius
        particle_count = abs(np.random.normal(5, 3))     # particles per wafer
        alignment_error = abs(np.random.normal(0, 5))    # nm

        # Introduce random failures in some lots
        failure_mode = "None"
        if random.random() < 0.15:   # 15% chance of particle issue
            particle_count = np.random.normal(25, 5)
            failure_mode = "Particle Contamination"
        elif random.random() < 0.10:  # 10% chance of CD variation
            litho_cd = np.random.normal(72, 4)
            failure_mode = "CD Variation"
        elif random.random() < 0.08:  # 8% chance of thickness issue
            oxide_thickness = np.random.normal(115, 5)
            failure_mode = "Thickness Out of Spec"
        elif random.random() < 0.05:  # 5% chance of implant error
            implant_dose = np.random.normal(8e12, 1e12)
            failure_mode = "Implant Dose Error"

        # Yield calculation — based on process parameters
        # High particles, bad CD, wrong thickness = lower yield
        base_yield = 95
        yield_loss = 0
        yield_loss += max(0, (particle_count - 8) * 1.5)
        yield_loss += max(0, abs(litho_cd - 65) * 0.8)
        yield_loss += max(0, abs(oxide_thickness - 100) * 0.5)
        yield_loss += max(0, abs(implant_dose - 1e13) / 1e11 * 0.3)
        yield_loss += abs(alignment_error) * 0.2

        # Add some noise
        yield_loss += np.random.normal(0, 1.5)
        final_yield = max(60, min(99, base_yield - yield_loss))

        lots.append({
            "lot_id": lot_id,
            "date": start_date.strftime("%Y-%m-%d"),
            "oxide_thickness_nm": round(oxide_thickness, 2),
            "litho_cd_nm": round(litho_cd, 2),
            "etch_rate_aps": round(etch_rate, 2),
            "deposition_rate_nm": round(deposition_rate, 2),
            "implant_dose": round(implant_dose, 2),
            "anneal_temp_c": round(anneal_temp, 2),
            "particle_count": round(particle_count, 2),
            "alignment_error_nm": round(alignment_error, 2),
            "failure_mode": failure_mode,
            "yield_pct": round(final_yield, 2),
            "pass_fail": "PASS" if final_yield >= 85 else "FAIL"
        })

    return pd.DataFrame(lots)


def init_database():
    """Create SQLite database and populate with wafer data."""
    conn = sqlite3.connect("backend/yieldsense.db")
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS wafer_lots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lot_id TEXT UNIQUE,
            date TEXT,
            oxide_thickness_nm REAL,
            litho_cd_nm REAL,
            etch_rate_aps REAL,
            deposition_rate_nm REAL,
            implant_dose REAL,
            anneal_temp_c REAL,
            particle_count REAL,
            alignment_error_nm REAL,
            failure_mode TEXT,
            yield_pct REAL,
            pass_fail TEXT
        )
    """)

    df = generate_lot_data(200)
    df.to_sql("wafer_lots", conn, if_exists="replace", index=False)

    conn.commit()
    conn.close()
    print(f"Database created with {len(df)} lots")
    print(f"Average yield: {df['yield_pct'].mean():.1f}%")
    print(f"Pass rate: {(df['pass_fail']=='PASS').mean()*100:.1f}%")


if __name__ == "__main__":
    init_database()