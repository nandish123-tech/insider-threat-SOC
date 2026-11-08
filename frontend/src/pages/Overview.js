
import React, {useState, useEffect, useRef, useMemo} from 'react';
import {html} from '../html.js';
import {
  CONFIG, RC, ORD, PU, PUS, norm, find, truthy, title, fmt,
  cat, FILES, guess, store, ts, EMPID, T_, cnt, tcols
} from '../lib/shared.js';
import {Card, Note, Tag, Plot, Table, Chips} from '../components/ui.js';

export function Overview({d, go, setLv, summary}) {
  const e = d.emp;
  const t = d.tmp;

  if (!e.length) {
    return html`<${Note} warn>No employee results loaded.<//>`;
  }

  // Risk-level counts
  const lc = l => {
    if (summary) {
      if (l === 'Critical') return summary.critical_alerts;
      if (l === 'High') return summary.high_risk_alerts;
    }
    return cnt(e, x => x.level === l);
  };

  // Detection method comparison
  const m = [
    ['Isolation Forest', summary?.isolation_forest ?? cnt(e, x => x.iso)],
    ['Role-Based Policy', summary?.role_policy ?? cnt(e, x => x.viol > 0)],
    ['Temporal Correlation', summary?.temporal_employees ?? cnt(e, x => x.seq > 0)]
  ];

  const lv = ORD.filter(lc);

  // Policy violation categories
  const cats = [...new Set(d.vcols.map(cat))];

  const cv = cats.map(k => [
    k,
    cnt(e, x => d.vcols.some(c => cat(c) === k && x.v[c]))
  ]).sort((a, b) => a[1] - b[1]);

  const pv = d.vcols.map(c => [
    c.replace('_violation', '').replace(/_/g, ' '),
    cnt(e, x => x.v[c])
  ]).sort((a, b) => a[1] - b[1]).slice(-8);

  // Temporal sequence information
  const M = tcols(t);
  const ty = t && M.typ
    ? t.rows.map(r => String(r[M.typ]))
    : [];

  // Top five high-risk employees
  const top = [...e]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return html`
    <div>
      <div class="grid g4">
        <${Card}
          l="Employees Monitored"
          v=${fmt(summary?.total_employees ?? e.length)}
          s="Logon · device · file · email · HTTP"
        />

        <${Card}
          l="Flagged Employees"
          v=${fmt(summary?.flagged_employees ?? cnt(e, x => x.flag))}
          s="Unique, any detection method"
        />

        <${Card}
          l="Critical Alerts"
          v=${fmt(summary?.critical_alerts ?? lc('Critical'))}
          s="Immediate review"
        />

        <${Card}
          l="High Risk Alerts"
          v=${fmt(summary?.high_risk_alerts ?? lc('High'))}
          s="Priority review"
        />
      </div>

      <h2>Detection overview</h2>

      <div class="grid g2">
        <${Plot}
          h=${330}
          data=${[{
            type: 'pie',
            hole: .62,
            labels: lv,
            values: lv.map(lc),
            marker: {colors: lv.map(l => RC[l])},
            textinfo: 'value+percent',
            sort: false
          }]}
          layout=${T_('Risk distribution (click a slice to open alerts)')}
          onClick=${ev => {
            setLv([ev.points[0].label]);
            go('alerts');
          }}
        />

        <${Plot}
          h=${330}
          data=${[{
            type: 'bar',
            x: m.map(x => x[0]),
            y: m.map(x => x[1]),
            text: m.map(x => x[1]),
            textposition: 'outside',
            marker: {color: PU}
          }]}
          layout=${T_('Detection method comparison')}
        />
      </div>

      <${Note}>
        Detection categories <b>overlap</b>: one employee can be flagged
        by several methods, so these counts must not be added to get
        unique employees.
      <//>

      <h2>Top violated activities</h2>

      <div class="grid g2">
        <${Plot}
          data=${[{
            type: 'bar',
            orientation: 'h',
            y: cv.map(x => x[0]),
            x: cv.map(x => x[1]),
            text: cv.map(x => x[1]),
            textposition: 'outside',
            marker: {color: PU}
          }]}
          layout=${T_('By activity type (employees)')}
        />

        <${Plot}
          data=${[{
            type: 'bar',
            orientation: 'h',
            y: pv.map(x => x[0]),
            x: pv.map(x => x[1]),
            marker: {color: '#a78bfa'}
          }]}
          layout=${{
            ...T_('Top policies'),
            margin: {l: 190, t: 44, b: 40, r: 10}
          }}
        />
      </div>

      <h2>Top 5 high-risk incidents</h2>

      <${Table}
        rows=${top}
        page=${5}
        cols=${[
          {k: 'id', l: 'Employee ID'},
          {k: 'role', l: 'Role'},
          {
            k: 'score',
            l: 'Risk Score',
            r: r => r.score.toFixed(3)
          },
          {
            k: 'level',
            l: 'Risk Level',
            r: r => html`<${Tag} lv=${r.level}/>`
          },
          {k: 'why', l: 'Incident Reason'}
        ]}
        onRow=${r => go('invest', r.id)}
      />

      <h2>Temporal incident summary</h2>

      ${
        !t || !t.rows.length
          ? html`<${Note} warn>No temporal sequences.<//>`
          : html`
            <div>
              <div class="grid g4">
                <${Card}
                  l="Suspicious Sequences"
                  v=${summary?.temporal_sequences ?? t.rows.length}
                  s="Copy → send / upload"
                />

                <${Card}
                  l="Employees Involved"
                  v=${summary?.temporal_employees ?? new Set(t.rows.map(r => r[M.emp])).size}
                  s="Unique"
                />

                <${Card}
                  l="Email Sends"
                  v=${cnt(ty, x => /mail/i.test(x))}
                  s="After removable-media copy"
                />

                <${Card}
                  l="Web Uploads"
                  v=${cnt(ty, x => /web|upload/i.test(x))}
                  s="After removable-media copy"
                />
              </div>

              <${Note}>
                Suspicious behavioural patterns only —
                <b>not confirmed data theft</b>.
                Open Temporal Correlation for timelines.
              <//>
            </div>
          `
      }
    </div>
  `;
}
