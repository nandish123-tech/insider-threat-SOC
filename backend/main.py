"""Backend application entry point."""


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from data_loader import load_csv_files, get_data_summary

# Initialize FastAPI
app = FastAPI(
    title="Insider Threat Detection API",
    description="Backend API for the SOC Dashboard",
    version="1.0"
)

# Allow React frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load project datasets
data = load_csv_files()
def convert_to_records(df):
    # Replace missing values with JSON-compatible None
    clean_df = df.astype(object).where(df.notna(), None)
    return clean_df.to_dict(orient="records")

@app.get("/")
def home():
    return {"message": "Insider Threat Detection API is running"}


@app.get("/api/summary")
def dashboard_summary():
    return get_data_summary(data)


@app.get("/api/employees")
def get_employees():
    return convert_to_records(data["employees"])


@app.get("/api/alerts")
def get_alerts():
    return convert_to_records(data["alerts"])


@app.get("/api/sequences")
def get_sequences():
    return convert_to_records(data["sequences"])


@app.get("/api/events")
def get_events():
    return convert_to_records(data["events"])