
const API_BASE_URL = "http://127.0.0.1:8000";

async function fetchEndpoint(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(
      `API error (${response.status}) while fetching ${endpoint}`
    );
  }

  return response.json();
}

// Convert API records into the format used by your existing dashboard
function convertRecords(records) {
  return {
    cols: records.length > 0 ? Object.keys(records[0]) : [],
    rows: records
  };
}

export async function fetchCertData() {
  const [employees, alerts, sequences, events] = await Promise.all([
    fetchEndpoint("/api/employees"),
    fetchEndpoint("/api/alerts"),
    fetchEndpoint("/api/sequences"),
    fetchEndpoint("/api/events")
  ]);

  return {
    res: convertRecords(employees),
    hyb: convertRecords(alerts),
    tmp: convertRecords(sequences),
    evt: convertRecords(events)
  };
}
