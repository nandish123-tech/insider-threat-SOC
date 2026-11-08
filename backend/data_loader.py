"""Utilities for loading backend data."""
import pandas as pd
from pathlib import Path

# Backend data directory
DATA_DIR = Path(__file__).parent / "data"

# Required project files
FILE_PATHS = {
    "employees": DATA_DIR / "final_employee_risk_results.csv",
    "alerts": DATA_DIR / "hybrid_alerts.csv",
    "sequences": DATA_DIR / "temporal_sequence_alerts.csv",
    "events": DATA_DIR / "correlation_events.csv"
}


def load_csv_files():
    """Load all four project CSV files."""

    data = {}

    for name, path in FILE_PATHS.items():

        if not path.exists():
            raise FileNotFoundError(
                f"Missing file: {path.name}. "
                "Place it inside the backend/data folder."
            )

        df = pd.read_csv(path)

        # Remove accidental spaces from column names
        df.columns = df.columns.str.strip()

        data[name] = df

        print(f"{name}: {len(df)} records loaded")

    return data


def get_data_summary(data):
    """Generate basic dashboard statistics."""

    employees = data["employees"]

    summary = {
        "total_employees": len(employees),
        "flagged_employees": int(
            employees["final_detection_flag"].sum()
        ),
        "critical_alerts": int(
            (employees["hybrid_risk_level"] == "Critical").sum()
        ),
        "high_risk_alerts": int(
            (employees["hybrid_risk_level"] == "High").sum()
        ),
        "isolation_forest": int(
            employees["if_flag"].sum()
        ),
        "role_policy": int(
            employees["policy_flag"].sum()
        ),
        "temporal_employees": int(
            employees["temporal_flag"].sum()
        ),
        "temporal_sequences": len(data["sequences"])
    }

    return summary
