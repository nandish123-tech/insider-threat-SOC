
import React, {useState, useEffect, useRef, useMemo} from 'react';
import {html} from './html.js';

import {
  CONFIG, RC, ORD, PU, PUS, norm, find, truthy, title, fmt,
  cat, FILES, guess, store, ts, EMPID, T_, cnt, tcols
} from './lib/shared.js';

import {MODE_DEFAULT} from './config.js';
import {DataService} from './services/dataService.js';
import {buildDemo} from './data/demoData.js';
import {prepare} from './data/prepare.js';

import {Card, Note, Tag, Plot, Table, Chips} from './components/ui.js';

import {Overview} from './pages/Overview.js';
import {Analytics} from './pages/Analytics.js';
import {Alerts} from './pages/Alerts.js';
import {Temporal} from './pages/Temporal.js';
import {Investigate} from './pages/Investigate.js';
import {Response} from './pages/Response.js';
import {Upload} from './pages/Upload.js';

import {fetchCertData} from './services/apiService.js';

const API_BASE_URL = 'http://127.0.0.1:8000';

const PAGES = [
  ['overview', 'SOC Overview'],
  ['analytics', 'Detection Analytics'],
  ['alerts', 'Security Alerts'],
  ['temporal', 'Temporal Correlation'],
  ['invest', 'Employee Investigation'],
  ['response', 'Incident Response']
];

export function App() {

  // Main data states
  const demo = useMemo(buildDemo, []);

  const [mode, setMode] = useState(MODE_DEFAULT);
  const [csv, setCsv] = useState({});
  const [st, setSt] = useState({});
  const [apiCsv, setApiCsv] = useState({});
  const [apiSummary, setApiSummary] = useState(null);

  // Application states
  const [apiStatus, setApiStatus] = useState('idle');
  const [gerr, setGerr] = useState('');
  const [pg, setPg] = useState('overview');
  const [lv, setLv] = useState(['Critical', 'High', 'Medium']);
  const [sel, setSel] = useState(null);
  const [now, setNow] = useState(new Date());

  // Update current time
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  // Connect to FastAPI when API mode is selected
  useEffect(() => {

    if (mode !== 'api') return;

    let active = true;

    async function loadApiData() {
      try {
        setApiStatus('loading');
        setGerr('');

        // Fetch all employee, alert, sequence and event records
        const result = await fetchCertData();

        // Fetch verified dashboard summary
        const response = await fetch(`${API_BASE_URL}/api/summary`);

        if (!response.ok) {
          throw new Error('Could not fetch dashboard summary');
        }

        const summary = await response.json();

        if (active) {
          setApiCsv(result);
          setApiSummary(summary);
          setApiStatus('success');
        }

      } catch (error) {

        if (active) {
          setApiStatus('error');
          setGerr('Backend connection failed: ' + error.message);
        }

      }
    }

    loadApiData();

    return () => {
      active = false;
    };

  }, [mode]);

  // Handle CSV uploads
  const onFiles = (fs, force) => {

    setGerr('');

    [...fs].forEach(async f => {

      const k = force || DataService.guess(f.name);

      if (!k) {
        setGerr(
          'Unrecognised filename: ' + f.name +
          '. Expected: ' +
          Object.values(DataService.SPEC).map(x => x.file).join(', ')
        );
        return;
      }

      const r = await DataService.parse(f, k);

      setSt(p => ({...p, [k]: r}));

      if (r.ok) {
        setCsv(p => ({
          ...p,
          [k]: {
            cols: r.cols,
            rows: r.rows
          }
        }));
      }

    });
  };

  // Clear uploaded CSV files
  const clear = () => {
    setCsv({});
    setSt({});
    setGerr('');
  };

  // Change data mode
  const chooseMode = m => {

    setMode(m);
    setSel(null);

    if (m === 'csv' && !csv.res) {
      setPg('data');
    } else {
      setPg('overview');
    }

  };

  // Select the correct data source
  const raw = mode === 'demo'
    ? demo
    : mode === 'api'
      ? apiCsv
      : csv;

  // Prepare dashboard data
  const d = useMemo(() => {

    const t = DataService.enrich(raw.tmp);

    return {
      ...raw,
      tmp: t,
      ...prepare(raw.res, t, raw.hyb)
    };

  }, [raw]);

  // Dashboard readiness
  const ready = !!raw.res && d.emp.length > 0;

  // Navigation functions
  const open = (p, id) => {
    if (id) setSel(id);
    setPg(p);
  };

  const openEmp = id => open('invest', id);

  // Upload page
  const upload = html`
    <${Upload}
      st=${st}
      csv=${csv}
      onFiles=${onFiles}
      clear=${clear}
      mode=${mode}
      go=${() => {
        setMode('csv');
        setPg('overview');
      }}
    />
  `;

  // Dashboard page selection
  const body = pg === 'data' || !ready
    ? upload

    : pg === 'overview'
      ? html`
          <${Overview}
            d=${d}
            go=${open}
            setLv=${setLv}
            summary=${mode === 'api' ? apiSummary : null}
          />
        `

      : pg === 'analytics'
        ? html`<${Analytics} d=${d}/>`

        : pg === 'alerts'
          ? html`
              <${Alerts}
                d=${d}
                lv=${lv}
                setLv=${setLv}
                open=${openEmp}
              />
            `

          : pg === 'temporal'
            ? html`<${Temporal} d=${d} open=${openEmp}/>`

            : pg === 'invest'
              ? html`
                  <${Investigate}
                    d=${d}
                    sel=${sel}
                    setSel=${setSel}
                  />
                `

              : html`
                  <${Response}
                    key=${mode}
                    d=${d}
                    sel=${sel}
                    setSel=${setSel}
                    mode=${mode}
                  />
                `;

  // Missing CSV files
  const missing = Object.entries(DataService.SPEC)
    .filter(([k]) => !csv[k])
    .map(([, s]) => s.file);

  // Header data mode label
  const modeLabel = mode === 'demo'
    ? 'DEMO DATA'
    : mode === 'api'
      ? 'LIVE API DATA'
      : 'ACTUAL CERT DATA';

  return html`

    <div class="app">

      <aside class="side">

        <div class="logo">
          🛡️ Insider Threat SOC
        </div>

        ${PAGES.map(([k, l]) => html`
          <button
            key=${k}
            class=${'nav' + (pg === k ? ' on' : '')}
            onClick=${() => setPg(k)}
          >
            ${l}
          </button>
        `)}

        <div class="navsec">
          Data
        </div>

        <button
          class=${'nav' + (pg === 'data' ? ' on' : '')}
          onClick=${() => setPg('data')}
        >
          Data Upload
        </button>

        <div style=${{margin: '14px 8px 0'}}>

          <div style=${{
            color: '#6b7280',
            fontSize: 12,
            marginBottom: 6
          }}>
            Data mode
          </div>

          <div class="bar" style=${{
            gap: 6,
            marginBottom: 6,
            flexWrap: 'wrap'
          }}>

            <button
              class=${'chip' + (mode === 'demo' ? ' on' : '')}
              onClick=${() => chooseMode('demo')}
            >
              Demo
            </button>

            <button
              class=${'chip' + (mode === 'csv' ? ' on' : '')}
              onClick=${() => chooseMode('csv')}
            >
              Actual CERT
            </button>

            <button
              class=${'chip' + (mode === 'api' ? ' on' : '')}
              onClick=${() => chooseMode('api')}
            >
              API
            </button>

          </div>

          ${
            mode === 'api'
              ? html`
                  <div style=${{
                    fontSize: 11,
                    color: apiStatus === 'success'
                      ? '#16a34a'
                      : apiStatus === 'error'
                        ? '#dc2626'
                        : '#9ca3af'
                  }}>
                    ${
                      apiStatus === 'loading'
                        ? 'Connecting to backend...'
                        : apiStatus === 'success'
                          ? '✓ Backend connected'
                          : apiStatus === 'error'
                            ? '✗ Backend connection failed'
                            : 'Waiting for connection'
                    }
                  </div>
                `
              : Object.entries(DataService.SPEC).map(([k, s]) => html`
                  <div
                    key=${k}
                    style=${{
                      fontSize: 11,
                      color: csv[k] ? '#16a34a' : '#9ca3af'
                    }}
                  >
                    ${csv[k] ? '✓' : '○'}
                    ${s.file.replace('.csv', '')}
                  </div>
                `)
          }

        </div>

        <div style=${{
          margin: '18px 8px 0',
          fontSize: 11,
          color: '#9ca3af'
        }}>
          Prototype · no ground-truth labels, so no accuracy metrics are reported.
        </div>

      </aside>

      <main class="main">

        <div class="hdr">

          <div>
            <h1>Insider Threat Detection SOC</h1>
            <p>
              Role-Aware Security Monitoring and Incident Response
            </p>
          </div>

          <div style=${{textAlign: 'right'}}>

            <span class=${'pill ' + (mode === 'demo' ? 'demo' : 'act')}>
              ${modeLabel}
            </span>

            <span class="pill">
              Prototype Active
            </span>

            <p>
              ${now.toLocaleString([], {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </p>

          </div>

        </div>

        ${
          mode === 'demo'
            ? html`
                <${Note}>
                  <b>DEMONSTRATION DATA</b> —
                  every employee, alert and sequence is synthetic
                  and is not CERT observations.
                <//>
              `

            : mode === 'api' && apiStatus === 'loading'
              ? html`
                  <${Note}>
                    Connecting to FastAPI backend and loading CERT data...
                  <//>
                `

              : mode === 'api' && apiStatus === 'success'
                ? html`
                    <${Note}>
                      <b>BACKEND CONNECTED</b> —
                      ${fmt(d.emp.length)} employees loaded from FastAPI.
                      ${apiSummary?.flagged_employees ?? 0} employees flagged.
                    <//>
                  `

                : mode === 'csv' && ready && pg !== 'data'
                  ? html`
                      <${Note} warn=${missing.length > 0}>
                        <b>ACTUAL CERT DATA</b> —
                        ${fmt(d.emp.length)} employees from
                        ${Object.keys(csv).length}/4 files.
                        ${
                          missing.length
                            ? ' Not loaded: ' + missing.join(', ') +
                              ' (related views will be empty).'
                            : ''
                        }
                      <//>
                    `
                  : null
        }

        ${
          gerr
            ? html`
                <${Note} warn>
                  ${gerr}
                <//>
              `
            : null
        }

        ${body}

      </main>

    </div>

  `;
}
