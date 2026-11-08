import React,{useState,useEffect,useRef,useMemo} from 'react';
import {html} from '../html.js';
import {CONFIG,RC,ORD,PU,PUS,norm,find,truthy,title,fmt,cat,FILES,guess,store,ts,EMPID,T_,cnt,tcols} from '../lib/shared.js';
import {Card,Note,Tag,Plot,Table,Chips} from '../components/ui.js';
import Papa from 'papaparse';
import {demoHistory} from '../data/demoData.js';

const PROP={Critical:'Temporarily disable removable-media writes and external email/web uploads',High:'Require manager sign-off for removable-media use',Medium:'Enhanced monitoring only (no restriction)',Low:'None'};
export function Response({d,sel,setSel,mode}){const key='soc_decisions_'+mode;
 const [rec,setRec]=useState(()=>store.get(key)||(mode==='demo'?demoHistory(d.emp):{})),[dec,setDec]=useState('Approve'),[who,setWho]=useState(''),[txt,setTxt]=useState(''),[msg,setMsg]=useState('');
 const pool=useMemo(()=>{const p=d.emp.filter(x=>x.level==='Critical'||x.level==='High').sort((a,b)=>b.score-a.score);return p.length?p:[...d.emp].sort((a,b)=>b.score-a.score).slice(0,50)},[d]);
 const id=sel&&d.emp.some(x=>x.id===sel)?sel:(pool[0]&&pool[0].id),e=d.emp.find(x=>x.id===id),cur=rec[id];
 const save=()=>{if(!who.trim())return setMsg('Analyst name is required.');const n={...rec,[id]:{employee_id:id,risk_level:e.level,risk_score:e.score.toFixed(4),decision:dec,status:dec==='Approve'?'Restriction Approved (Simulated)':'Restriction Rejected',analyst:who.trim(),note:txt.trim(),timestamp:new Date().toLocaleString('sv-SE')}};setRec(n);store.set(key,n);setMsg('Decision recorded for '+id+'.');setTxt('')};
 const log=Object.values(rec).sort((a,b)=>b.timestamp.localeCompare(a.timestamp));
 const copy=()=>{try{navigator.clipboard.writeText(Papa.unparse(log));setMsg('Decision log copied as CSV.')}catch(x){setMsg('Copy blocked by the browser.')}};
 if(!e)return html`<${Note} warn>No employees loaded.<//>`;
 return html`<div><h2 style=${{marginTop:0}}>Incident response & analyst approval</h2><${Note}><b>Simulation only.</b> No account is ever disabled or blocked. Every restriction needs explicit analyst approval. Responses are <b>simulated</b> and stored in this browser (localStorage) in a separate ${mode==='demo'?'demo':'actual-data'} log.<//>
 <div class="bar"><select value=${id} onChange=${x=>setSel(x.target.value)} style=${{minWidth:280}}>${pool.map(x=>html`<option key=${x.id} value=${x.id}>${x.id} · ${x.level} · ${x.score.toFixed(2)}${rec[x.id]?' ✓':''}</option>`)}</select></div>
 <div class="grid g4"><${Card} l="Role" v=${html`<span style=${{fontSize:18}}>${e.role}</span>`} s=${e.id}/><${Card} l="Risk Score" v=${e.score.toFixed(3)} s=${e.level}/><${Card} l="Violations" v=${e.viol} s=${e.seq+' temporal sequences'}/><${Card} l="Response Status" v=${html`<span style=${{fontSize:15}}>${cur?cur.status:'Pending Review'}</span>`} s=${cur?cur.analyst+' · '+cur.timestamp:'Awaiting analyst'}/></div>
 <div class="grid g2" style=${{marginTop:14}}><div class="card"><h3>Incident details</h3><${Note}><b>${e.src}</b> — ${e.why}<//><h3>Recommended response</h3><${Note}>${e.action}<//><h3>Proposed restriction (simulated)</h3><${Note}>${PROP[e.level]||'None'} — <i>nothing is actually blocked</i><//></div>
 <div class="card"><h3>Analyst decision</h3><div class="bar">${['Approve','Reject'].map(x=>html`<label key=${x}><input type="radio" checked=${dec===x} onChange=${()=>setDec(x)}/> ${x} restriction</label>`)}</div>
 <div class="bar"><input placeholder="Analyst name (required)" value=${who} onInput=${x=>setWho(x.target.value)}/></div>
 <textarea rows="4" placeholder="Investigation note" value=${txt} onInput=${x=>setTxt(x.target.value)} style=${{width:'100%'}}></textarea>
 <div class="bar" style=${{marginTop:10}}><button class="btn" onClick=${save}>Record decision</button><span style=${{color:'#6b7280'}}>${msg}</span></div></div></div>
 <h2>Decision history</h2>${log.length?html`<div><${Table} rows=${log} page=${10} cols=${['timestamp','employee_id','risk_level','decision','status','analyst','note'].map(k=>({k,l:k}))}/><div class="bar" style=${{marginTop:8}}><button class="btn ghost" onClick=${copy}>Copy log as CSV</button></div></div>`:html`<span style=${{color:'#9ca3af'}}>No decisions recorded yet.</span>`}</div>`}
