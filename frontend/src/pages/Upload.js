import React,{useState,useEffect,useRef,useMemo} from 'react';
import {html} from '../html.js';
import {CONFIG,RC,ORD,PU,PUS,norm,find,truthy,title,fmt,cat,FILES,guess,store,ts,EMPID,T_,cnt,tcols} from '../lib/shared.js';
import {Card,Note,Tag,Plot,Table,Chips} from '../components/ui.js';
import {DataService} from '../services/dataService.js';

export function Upload({st,csv,onFiles,clear,mode,go}){const [over,setOver]=useState(false),S=DataService.SPEC,ready=!!csv.res;
 return html`<div><h2 style=${{marginTop:0}}>Data source · upload actual CERT results</h2>
 ${mode==='demo'?html`<${Note}>Demo mode is active. Files uploaded here are validated and kept ready; choose <b>Actual CERT</b> in the sidebar to view them.<//>`:null}
 <div class="drop" onDragOver=${e=>{e.preventDefault();setOver(true)}} onDragLeave=${()=>setOver(false)} onDrop=${e=>{e.preventDefault();setOver(false);onFiles(e.dataTransfer.files)}} style=${over?{background:'#ede9fe'}:{}}>
  <h3 style=${{fontSize:16}}>Drop all four CSV files here</h3><p style=${{color:'#6b7280',margin:'4px 0 12px'}}>Files are matched by filename and parsed locally in your browser — nothing is sent to a server.</p>
  <input type="file" multiple accept=".csv" onChange=${e=>{onFiles(e.target.files);e.target.value=''}}/></div>
 <div class="grid g2" style=${{marginTop:14}}>${Object.entries(S).map(([k,s])=>{const r=st[k],ok=!!csv[k];return html`<div class="card slot" key=${k}>
  <div style=${{display:'flex',justifyContent:'space-between',gap:8,flexWrap:'wrap'}}><b>${s.file}</b><span class=${'badge '+(ok?'ok2':r&&!r.ok?'er':'no')}>${ok?`✓ Loaded · ${fmt(csv[k].rows.length)} rows · ${csv[k].cols.length} columns`:r&&!r.ok?'✗ Not loaded':'○ Not loaded'}</span></div>
  <div style=${{fontSize:12,color:'#6b7280'}}>${s.desc}. Required columns: ${s.req.map(x=>x[0]).join(', ')}.</div>
  ${r&&r.errors.map((m,i)=>html`<div key=${'e'+i} class="er" style=${{fontSize:12}}>✗ ${m}</div>`)}
  ${r&&r.warns.map((m,i)=>html`<div key=${'w'+i} class="wn" style=${{fontSize:12}}>⚠ ${m}</div>`)}
  <input type="file" accept=".csv" onChange=${e=>{onFiles(e.target.files,k);e.target.value=''}}/></div>`})}</div>
 <div class="bar" style=${{marginTop:14}}><button class="btn" disabled=${!ready} onClick=${go}>Open actual-data dashboard</button><button class="btn ghost" onClick=${clear}>Clear loaded files</button>${ready?null:html`<span style=${{color:'#6b7280',fontSize:12}}>final_employee_risk_results.csv is required to open the dashboard; the other files unlock their pages.</span>`}</div></div>`}
