# Insider Threat Detection SOC Dashboard (React + Vite)

Role-Aware Security Monitoring and Incident Response — frontend prototype.

## Run locally (VS Code, Windows/macOS/Linux)
Requires Node.js 18 or newer (https://nodejs.org).

    npm install
    npm run dev

Open the URL shown in the terminal (usually http://localhost:5173).
Production build: `npm run build`, then `npm run preview`.

## Using your real CERT results
Open **Data Upload** in the sidebar, drop the four files, then switch **Data mode** to *Actual CERT*:
final_employee_risk_results.csv, hybrid_alerts.csv, temporal_sequence_alerts.csv, correlation_events.csv.
Files are parsed in the browser (PapaParse); nothing is uploaded. Demo mode (synthetic data) stays available.
Analyst decisions are simulated only and stored in localStorage (separate demo / actual logs).

## Project structure
    index.html              page shell
    src/main.jsx            entry point + error boundary
    src/App.jsx             layout, navigation, data-mode switching
    src/styles.css          all styling (white + violet theme)
    src/config.js           default data mode
    src/html.js             htm template helper (JSX-like templates on React)
    src/lib/shared.js       constants + pure helpers (column matching, formatting, timestamps)
    src/services/dataService.js   CSV parsing + validation for ACTUAL files
    src/data/demoData.js    synthetic demonstration data generator (kept separate)
    src/data/prepare.js     normalises demo or real data into one employee model
    src/components/ui.js    Card, Note, Tag, Plot (Plotly), Table, Chips
    src/pages/              Overview, Analytics, Alerts, Temporal, Investigate, Response, Upload
