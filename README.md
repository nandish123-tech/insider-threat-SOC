# 🛡️ Insider Threat Detection and SOC Dashboard

### A Role-Aware and Explainable Insider Threat Detection and Incident Response Framework Using Behavioural and Temporal Analysis

An insider threat detection prototype that analyses employee activity logs using behavioural features, role-aware policy thresholds, machine-learning-based anomaly detection and temporal correlation. The system provides explainable risk information through a FastAPI backend and a React-based Security Operations Center (SOC) dashboard.

---

## 📌 1. Project Overview

Insider threats are cybersecurity risks that originate from individuals who have authorised access to an organisation's systems and information.

Employees regularly access computers, files, removable devices, emails and websites as part of their responsibilities. However, unusual combinations of these activities may indicate suspicious behaviour.

This project aims to identify potentially suspicious employee activities by analysing multiple activity logs and combining different detection techniques.

The framework integrates:

- Employee behavioural analysis
- Role-aware policy violation detection
- Isolation Forest anomaly detection
- Hybrid detection and risk scoring
- Temporal event correlation
- Explainable security alerts
- Analyst-controlled simulated incident response
- Interactive SOC dashboard

**Important:** This is a research prototype using historical CERT dataset samples. It does not perform live enterprise monitoring or automatic account blocking.

---

## 🎯 2. Project Objectives

1. Analyse employee activities across multiple log sources.
2. Extract meaningful behavioural features from raw activity logs.
3. Establish role-aware activity thresholds.
4. Identify unusual employee behaviour using Isolation Forest.
5. Detect suspicious activities using policy-based rules.
6. Identify suspicious event sequences through temporal correlation.
7. Generate explainable employee risk scores.
8. Provide a dashboard for security monitoring and investigation.
9. Demonstrate analyst-approved simulated incident response.

---

## 📂 3. Dataset

The project uses the CERT Insider Threat dataset available through Kaggle.

The main activity logs used are:

| Dataset | Description |
|---|---|
| `logon.csv` | Employee login and logout activities |
| `device.csv` | Device connection and disconnection activities |
| `file.csv` | File access and file operations |
| `email.csv` | Employee email activities |
| `http.csv` | Website and HTTP activities |
| `users.csv` | Employee role and organisational information |

Additional dataset files include psychometric and decoy-file information, but they are not part of the main five-log detection pipeline.

### Data Processing

For the experiment, the first 100,000 rows from each of the five main activity logs were processed.

Employee metadata was integrated using `users.csv`.

The resulting employee-level dataset contained:

- 4,000 employees
- 25 initial integrated feature columns
- 29 columns after role metadata integration

---

## ⚙️ 4. Methodology and Implementation

### Step 1: Data Loading and Preprocessing

The five activity logs were loaded using Python and Pandas.

The data was examined for:
- Column structures
- Data types
- Missing values
- Employee identifiers
- Timestamp information

The logs were prepared for employee-level feature extraction and analysis.

### Step 2: Feature Engineering

Raw activity records were converted into employee-level behavioural features.

The 15 features used by the Isolation Forest pipeline include:

| Feature | Description |
|---|---|
| `total_activity` | Overall employee activity |
| `unique_pcs` | Number of unique computers |
| `after_hours_count` | After-hours activity |
| `logon_count` | Number of logon records |
| `device_count` | Device activity count |
| `file_count` | File activity count |
| `emails_sent` | Number of emails sent |
| `total_emails` | Total email activity |
| `avg_email_size` | Average email size |
| `attachment_count` | Email attachment count |
| `avg_recipients` | Average email recipients |
| `http_count` | HTTP activity count |
| `unique_urls` | Number of unique URLs |
| `http_after_hours` | After-hours HTTP activity |
| `unique_http_pcs` | Unique computers associated with HTTP activity |

### Step 3: Role-Aware Behavioural Analysis

Employee role information was integrated from `users.csv`.

Different employee roles can have different normal activity patterns.

For example, an IT administrator may require more device access than an employee in another department.

To account for these differences, role-specific 95th-percentile thresholds were calculated for selected activity features.

A global 95th-percentile fallback was used when a role group contained fewer than 20 employees.

Activities exceeding the relevant thresholds were flagged as policy violations.

**Result:** 726 employees were flagged by role-based policy detection.

*Note: These thresholds are derived from the analysed dataset and are not verified organisational security policies.*

### Step 4: Isolation Forest Anomaly Detection

Isolation Forest was implemented using Scikit-learn to identify unusual employee behaviour.

Before applying the model, the selected numerical features were scaled using `StandardScaler`.

Model configuration:

| Parameter | Value |
|---|---|
| Algorithm | Isolation Forest |
| Number of estimators | 100 |
| Contamination | 0.05 |
| Random state | 42 |
| Input features | 15 |

The model returns:

- `-1`: Anomaly
- `1`: Normal observation

**Result:**
- 200 anomalous employees
- 3,800 normal employees

Isolation Forest is an unsupervised anomaly-detection algorithm. An anomaly does not necessarily indicate malicious behaviour.

### Step 5: Hybrid Detection

The system combines two detection approaches:

1. Isolation Forest anomaly detection.
2. Role-aware policy violation detection.

The comparison produced the following results:

| Detection category | Employees |
|---|---:|
| Neither method | 3,228 |
| Isolation Forest only | 46 |
| Policy only | 572 |
| Both methods | 154 |

Therefore:

**Total hybrid alerts = 772 unique employees.**

The counts are based on the union of the two detection methods, avoiding double-counting employees detected by both.

### Step 6: Explainable Risk Scoring

A risk-scoring mechanism was implemented to prioritise flagged employees.

The scoring formula is:

`Risk Score = Isolation Forest Points + Policy Violation Points`

Where:

- Isolation Forest anomaly: 40 points
- Each policy violation: 7.5 points
- Maximum policy contribution: 60 points
- Maximum risk score: 100

Risk classification:

| Risk Score | Risk Level |
|---|---|
| 75–100 | Critical |
| 50–74.99 | High |
| 25–49.99 | Medium |
| 0–24.99 | Low |

The risk score is accompanied by detection flags, policy violations and recommended actions to help analysts understand why an employee was flagged.

### Step 7: Temporal Correlation Analysis

Temporal correlation was implemented to identify suspicious sequences of employee activities.

The detection rule searches for:

1. Employee login.
2. Device connection.
3. Removable-media file copy.
4. Subsequent email send or web upload.

Conditions:

- Events must belong to the same employee.
- Events must involve the same computer.
- Events must follow the specified order.
- The sequence must occur within four hours.

**Results:**

| Metric | Result |
|---|---:|
| Suspicious sequences | 38 |
| Unique employees involved | 35 |
| Email-send sequences | 33 |
| Web-upload sequences | 5 |

These results represent suspicious behavioural patterns requiring investigation, not confirmed data theft.

### Step 8: Event Correlation

Individual events were combined into a correlation dataset for investigation and timeline analysis.

The event types include:

- Login
- Device connection
- Removable-media file copy
- Email send
- Web upload

Total correlated event records: **10,474**.

### Step 9: Final Employee-Level Integration

Hybrid detection results were combined with temporal sequence summaries.

The final employee results include:

- Employee identifier
- Role and department information
- Hybrid risk score
- Hybrid risk level
- Isolation Forest flag
- Policy detection flag
- Temporal detection flag
- Sequence counts
- Email sequence counts
- Web-upload sequence counts
- Average sequence duration
- Final detection flag

The final employee-level dataset contains 4,000 records.

The overall flagged count is:

- Hybrid detection: 772 employees
- Additional temporal-only employees: 4
- Final flagged employees: **776**

---

## 📊 5. Experimental Results

### Overall Risk Distribution

| Risk Level | Employees |
|---|---:|
| Critical | 16 |
| High | 117 |
| Medium | 87 |
| Low | 3,780 |
| **Total** | **4,000** |

### Detection Results

| Detection Method | Employees |
|---|---:|
| Isolation Forest | 200 |
| Role-based policy detection | 726 |
| Hybrid detection | 772 |
| Temporal detection | 35 unique employees |
| Final combined detection | 776 |

The detection categories overlap. Therefore, individual method counts must not be added directly to calculate the number of unique flagged employees.

### Exported Output Files

Four CSV files were generated from the Kaggle notebook.

| File | Records | Purpose |
|---|---:|---|
| `final_employee_risk_results.csv` | 4,000 | Final employee-level risk information |
| `hybrid_alerts.csv` | 772 | Hybrid detection alerts |
| `temporal_sequence_alerts.csv` | 38 | Detected suspicious sequences |
| `correlation_events.csv` | 10,474 | Individual correlated events |

---

## 🏗️ 6. System Architecture

```text
             CERT INSIDER THREAT DATASET
                         |
                         v
                DATA PREPROCESSING
                         |
                         v
                 FEATURE ENGINEERING
                         |
                         v
              ROLE-AWARE POLICY ANALYSIS
                         |
                         v
               ISOLATION FOREST MODEL
                         |
                         v
                 HYBRID DETECTION
                         |
                         v
                 RISK SCORE GENERATION
                         |
                         v
               TEMPORAL CORRELATION
                         |
                         v
                 FINAL CSV OUTPUTS
                         |
                         v
                  FASTAPI BACKEND
                         |
                         v
                  REACT FRONTEND
                         |
                         v
                 SOC DASHBOARD
                         |
                         v
                SECURITY ANALYST
                         |
                         v
              SIMULATED INCIDENT RESPONSE
```

---

## 🖥️ 7. Technology Stack

| Component | Technologies |
|---|---|
| Programming language | Python, JavaScript |
| Data processing | Pandas, NumPy |
| Machine learning | Scikit-learn |
| Data visualisation | Matplotlib and dashboard charts |
| Backend | FastAPI |
| API server | Uvicorn |
| Frontend | React |
| Development environment | Kaggle, VS Code |
| Data exchange | CSV, JSON |
| Version control | Git and GitHub |

---

## 🔌 8. FastAPI Backend

The backend loads the exported CSV files and provides data through REST API endpoints.

### Backend Structure

```text
backend/
│
├── data/
│   ├── final_employee_risk_results.csv
│   ├── hybrid_alerts.csv
│   ├── temporal_sequence_alerts.csv
│   └── correlation_events.csv
│
├── routes/
├── venv/
├── main.py
├── data_loader.py
└── requirements.txt
```

### API Endpoints

| Endpoint | Description |
|---|---|
| `GET /` | Backend health check |
| `GET /api/summary` | Dashboard summary |
| `GET /api/employees` | Employee risk records |
| `GET /api/alerts` | Hybrid detection alerts |
| `GET /api/sequences` | Temporal sequences |
| `GET /api/events` | Correlated event records |

The backend was tested successfully, and the API endpoints returned HTTP 200 responses.

### Install Backend Dependencies

From the backend directory:

```bash
python -m venv venv
```

Activate the environment on Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the backend:

```bash
uvicorn main:app --reload
```

Backend URL:

`http://127.0.0.1:8000`

Interactive API documentation:

`http://127.0.0.1:8000/docs`

**Data requirement:** Place the four exported CSV files inside `backend/data/` before starting the backend.

---

## 📊 9. React SOC Dashboard

The React frontend communicates with the FastAPI backend to display the employee risk results and detection information.

### Dashboard Modules

| Module | Functionality |
|---|---|
| SOC Overview | Employee monitoring and risk summary |
| Detection Analytics | Detection-method and risk analysis |
| Security Alerts | Review flagged employees |
| Temporal Correlation | Inspect suspicious activity sequences |
| Employee Investigation | Examine employee-level risk information |
| Incident Response | Approve or reject proposed simulated restrictions |

### Demo Mode and API Mode

The dashboard supports two data modes:

**Demo Mode**
- Uses synthetic demonstration data.
- Uses a separate employee identifier format.
- Provides sample data for interface demonstrations.

**API Mode**
- Connects to the FastAPI backend.
- Loads the exported CERT analysis results.
- Displays the actual experiment's employee and alert records.

### Start the Frontend

From the frontend directory:

```bash
npm install
npm run dev
```

Open the local URL displayed by the development server. The current development setup uses:

`http://localhost:5173`

The FastAPI backend must also be running for API mode.

---

## 🚨 10. Incident Response

The prototype includes an analyst-controlled incident-response workflow.

The workflow is:

1. Identify a suspicious employee.
2. Review the employee's risk information.
3. Inspect related detection reasons and activity sequences.
4. Approve or reject the proposed response.
5. Record the analyst decision and investigation notes.

The system simulates proposed restrictions rather than actually blocking employee accounts.

This keeps human review in the decision-making process and avoids treating every anomaly as a confirmed security incident.

---

## ⚠️ 11. Limitations

The current prototype has the following limitations:

- The analysis uses the first 100,000 rows from each of the five main activity logs.
- The data represents historical activity, not live monitoring.
- Isolation Forest is the implemented machine-learning algorithm.
- The role-based thresholds are derived from the analysed dataset.
- Verified ground-truth labels were not established.
- Accuracy, precision, recall and F1-score are therefore not reported.
- The temporal correlation rule uses a predefined four-hour window.
- Suspicious activity patterns do not prove malicious intent or confirmed data theft.
- Incident-response restrictions are simulated and require analyst approval.
- The backend serves exported CSV results rather than continuously ingesting live enterprise logs.

---

## 🔮 12. Future Enhancements

Potential future improvements include:

- Live employee activity log ingestion.
- Continuous behavioural monitoring.
- More machine-learning model comparisons.
- Evaluation using verified ground-truth labels.
- Improved role-specific behavioural baselines.
- More advanced temporal sequence detection.
- Configurable detection thresholds.
- Persistent incident and analyst decision management.
- Authentication and role-based access control.
- Deployment in a controlled SOC environment.

---

## 👨‍💻 13. Project Repository

**GitHub:** https://github.com/nandish123-tech/insider-threat-SOC

The repository contains the backend and frontend implementation.

---

## 📄 14. Disclaimer

This project is developed for academic, research and demonstration purposes.

It uses the CERT Insider Threat dataset and historical sampled activity records. The system identifies potentially suspicious behavioural patterns and provides risk indicators for investigation. It does not establish malicious intent, confirm data exfiltration or perform automatic employee account restrictions.

---

## 🙌 Acknowledgement

The project uses the CERT Insider Threat dataset for research and experimentation.

