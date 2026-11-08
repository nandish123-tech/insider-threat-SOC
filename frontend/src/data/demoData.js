
/*
 * DATA LAYER: Synthetic Demonstration Data
 *
 * IMPORTANT:
 * This is generated demonstration data.
 * It is NOT actual CERT dataset data.
 *
 * Demo dataset:
 * Employees          : 1,200
 * Critical           : 8
 * High               : 32
 * Medium             : 60
 * Low                : 1,100
 * Policy flagged     : 240
 * Isolation Forest   : 78
 * Temporal employees : 14
 */

// ==========================================
// 1. RECOMMENDED ACTIONS
// ==========================================

export const ACTION = {
  Critical:
    'Immediate analyst review; propose temporary restriction of removable media and external transfers (simulated)',

  High:
    'Priority review within 24h; confirm activity with line manager',

  Medium:
    'Add to watch-list; review at next cycle',

  Low:
    'No action required; routine monitoring'
};


// ==========================================
// 2. POLICY VIOLATION COLUMNS
// ==========================================

export const POL = [
  'after_hours_logon_violation',
  'after_hours_device_use_violation',
  'usb_device_violation',
  'restricted_file_access_violation',
  'large_file_copy_violation',
  'external_email_violation',
  'large_attachment_email_violation',
  'restricted_http_violation',
  'cloud_upload_http_violation'
];


// ==========================================
// 3. GENERATE DEMONSTRATION DATA
// ==========================================

export function buildDemo() {

  // Fixed-seed random number generator
  let sd = 42;

  const R = () => {
    sd |= 0;
    sd = sd + 0x6D2B79F5 | 0;

    let t = Math.imul(sd ^ sd >>> 15, 1 | sd);

    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;

    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };

  const ri = (a, b) =>
    a + Math.floor(R() * (b - a));

  const ru = (a, b) =>
    a + R() * (b - a);

  const sh = a => {
    a = [...a];

    for (let i = a.length - 1; i > 0; i--) {
      const j = ri(0, i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
  };

  const pick = (a, k) =>
    sh(a).slice(0, k);

  const S = a => new Set(a);

  // Different employee count from actual CERT data
  const N = 1200;


  // ========================================
  // 4. GENERATE DEMO EMPLOYEE IDs
  // ========================================

  const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const ids = new Set();

  while (ids.size < N) {
    ids.add(
      'DEMO-' +
      L[ri(0, 26)] +
      L[ri(0, 26)] +
      ri(1000, 9999)
    );
  }

  const id = sh([...ids]);


  // ========================================
  // 5. EMPLOYEE ROLE DISTRIBUTION
  // ========================================

  const RW = [
    ['Software Engineer', 0.26],
    ['Customer Support', 0.16],
    ['Sales Representative', 0.14],
    ['Finance Analyst', 0.10],
    ['Operations Manager', 0.10],
    ['IT Administrator', 0.08],
    ['HR Specialist', 0.06],
    ['Executive', 0.05],
    ['Legal Counsel', 0.05]
  ];

  const role = id.map(() => {
    let u = R();
    let a = 0;

    for (const [n, w] of RW) {
      a += w;

      if (u < a) return n;
    }

    return RW[0][0];
  });


  // ========================================
  // 6. ROLE-BASED ACTIVITY WEIGHTS
  // ========================================

  const BASE = [
    0.9, 0.4, 0.6, 0.7, 0.5,
    0.8, 0.4, 0.9, 0.5
  ];

  const BO = {
    'Sales Representative': {
      5: 2.5,
      6: 2
    },

    'IT Administrator': {
      0: 2,
      1: 2.5,
      2: 2.5
    },

    'Finance Analyst': {
      3: 2,
      4: 1.5
    },

    'Customer Support': {
      7: 1.8
    },

    'Software Engineer': {
      2: 1.5,
      4: 1.5,
      8: 1.5
    },

    'HR Specialist': {
      3: 1.8
    },

    'Executive': {
      5: 1.5
    }
  };


  // ========================================
  // 7. RISK LEVEL DISTRIBUTION
  // ========================================

  const perm = sh([...Array(N).keys()]);

  // Different risk counts from actual CERT data
  const crit = perm.slice(0, 8);
  const high = perm.slice(8, 40);
  const med = perm.slice(40, 100);
  const low = perm.slice(100);

  const level = Array(N).fill('Low');

  crit.forEach(i => level[i] = 'Critical');
  high.forEach(i => level[i] = 'High');
  med.forEach(i => level[i] = 'Medium');


  // ========================================
  // 8. DETECTION FLAGS
  // ========================================

  const lowP = pick(low, 140);

  const lp = S(lowP);

  const lowN = low.filter(i => !lp.has(i));

  // Isolation Forest: 78 employees
  const IF = S([
    ...crit,
    ...pick(high, 20),
    ...pick(med, 10),
    ...pick(lowP, 20),
    ...pick(lowN, 20)
  ]);

  // Temporal detection: 14 employees
  const T = [
    ...crit,
    ...pick(high, 6)
  ];

  // Policy detection: 240 employees
  const P = [
    ...crit,
    ...high,
    ...med,
    ...lowP
  ];


  // ========================================
  // 9. GENERATE RISK SCORES
  // ========================================

  const score = level.map(l =>
    l === 'Critical'
      ? ru(0.86, 0.99)
      : l === 'High'
        ? ru(0.62, 0.86)
        : l === 'Medium'
          ? ru(0.42, 0.62)
          : (R() + R() + R()) / 3 * 0.4 * 0.9
  );


  // ========================================
  // 10. GENERATE POLICY VIOLATIONS
  // ========================================

  const viol = Array.from(
    { length: N },
    () => Array(9).fill(0)
  );

  const KR = {
    Critical: [5, 8],
    High: [3, 6],
    Medium: [2, 4],
    Low: [1, 3]
  };

  P.forEach(i => {

    const w = BASE.map((b, j) =>
      b * ((BO[role[i]] || {})[j] || 1)
    );

    const k = ri(...KR[level[i]]);

    for (let n = 0; n < k; n++) {

      const tot = w.reduce((a, b) => a + b, 0);

      let u = R() * tot;
      let j = 0;

      while (u >= w[j] && j < 8) {
        u -= w[j];
        j++;
      }

      viol[i][j] = 1;
      w[j] = 0;
    }
  });

  // Add USB violation to temporal employees
  T.forEach(i => {
    viol[i][2] = 1;
  });


  // ========================================
  // 11. CREATE EMPLOYEE RESULTS
  // ========================================

  const res = id.map((u, i) => {

    const r = {
      user: u,
      role: role[i],
      hybrid_risk_score: score[i].toFixed(4),
      risk_level: level[i],
      iforest_anomaly: IF.has(i) ? -1 : 1
    };

    POL.forEach((c, j) => {
      r[c] = viol[i][j];
    });

    r.violation_count = viol[i].reduce(
      (a, b) => a + b,
      0
    );

    r.recommended_action = ACTION[level[i]];

    return r;
  });


  // ========================================
  // 12. TIMESTAMP UTILITIES
  // ========================================

  const p2 = n =>
    String(n).padStart(2, '0');

  const f = t =>
    t.getFullYear() + '-' +
    p2(t.getMonth() + 1) + '-' +
    p2(t.getDate()) + ' ' +
    p2(t.getHours()) + ':' +
    p2(t.getMinutes()) + ':' +
    p2(t.getSeconds());

  const add = (t, m) =>
    new Date(t.getTime() + m * 60000);


  // ========================================
  // 13. GENERATE TEMPORAL SEQUENCES
  // ========================================

  const seqE = [
    ...T,
    ...pick(T, 3)
  ];

  const rows = [];
  const ev = [];

  seqE.forEach((i, k) => {

    const hs = [19, 20, 21, 22, 23, 10, 14];

    // Demo dates are different from the CERT period
    const lg = new Date(
      2024,
      0,
      1 + ri(0, 300),
      hs[ri(0, 7)],
      ri(0, 60),
      ri(0, 60)
    );

    const dv = add(lg, ri(3, 16));
    const fc = add(dv, ri(2, 11));
    const tr = add(fc, ri(1, 21));

    // Ten email events and seven web-upload events
    const typ = k < 10
      ? 'Email Send'
      : 'Web Upload';

    const pc = 'DEMO-PC-' + ri(1000, 9999);

    rows.push({
      user: id[i],
      pc,
      login_time: f(lg),
      device_connect_time: f(dv),
      file_copy_time: f(fc),
      transfer_time: f(tr),
      transfer_type: typ,
      sequence_duration_min: ((tr - lg) / 60000).toFixed(1)
    });

    [
      ['Logon', lg],
      ['Device Connect', dv],
      ['File Copy to Removable Media', fc],
      [typ, tr]
    ].forEach(([n, t]) => {

      ev.push({
        user: id[i],
        pc,
        event_type: n,
        timestamp: f(t)
      });

    });

  });


  // Sort events by timestamp
  ev.sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp)
  );


  // ========================================
  // 14. RETURN GENERATED DATA
  // ========================================

  return {

    res: {
      cols: Object.keys(res[0]),
      rows: res
    },

    tmp: {
      cols: Object.keys(rows[0]),
      rows: sh(rows)
    },

    evt: {
      cols: Object.keys(ev[0]),
      rows: ev
    }

  };

}


// ==========================================
// 15. DEMONSTRATION INCIDENT HISTORY
// ==========================================

export function demoHistory(emp) {

  const top = emp
    .filter(x =>
      x.level === 'Critical' ||
      x.level === 'High'
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, 7);


  const sp = [

    [
      'Approve',
      'demo.analyst01',
      'Removable-media copy followed by external email matches a suspicious pattern; restriction proposed.'
    ],

    [
      'Approve',
      'demo.analyst02',
      'Repeated after-hours device use; manager could not justify. Approved (simulated).'
    ],

    [
      'Reject',
      'demo.analyst03',
      'Manager confirmed approved project work; no restriction needed.'
    ],

    [
      'Approve',
      'demo.analyst01',
      'Large web uploads to cloud storage outside business hours.'
    ],

    [
      'Reject',
      'demo.analyst02',
      'Role requires USB use for field deployments; added to watch-list instead.'
    ],

    [
      'Approve',
      'demo.analyst03',
      'Pattern matches earlier Critical case; escalated.'
    ],

    [
      'Reject',
      'demo.analyst01',
      'False positive after HR check.'
    ]

  ];


  const o = {};

  top.forEach((e, i) => {

    const [dc, an, nt] = sp[i];

    o[e.id] = {

      employee_id: e.id,

      risk_level: e.level,

      risk_score: e.score.toFixed(4),

      decision: dc,

      status: dc === 'Approve'
        ? 'Restriction Approved (Simulated)'
        : 'Restriction Rejected',

      analyst: an,

      note: nt,

      timestamp: new Date(
        Date.now() -
        (7 - i) * 86400000 -
        i * 3600000
      ).toLocaleString('sv-SE')

    };

  });

  return o;
}
