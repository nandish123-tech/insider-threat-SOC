import React,{useState,useEffect,useRef,useMemo} from 'react';
import {html} from '../html.js';
import {CONFIG,RC,ORD,PU,PUS,norm,find,truthy,title,fmt,cat,FILES,guess,store,ts,EMPID,T_,cnt,tcols} from '../lib/shared.js';
import {Card,Note,Tag,Plot,Table,Chips} from '../components/ui.js';

export function Investigate({d,sel,setSel}){const [q,setQ]=useState(sel||'');useEffect(()=>{if(sel)setQ(sel)},[sel]);
 const m=useMemo(()=>q?d.emp.filter(x=>x.id.toLowerCase().includes(q.toLowerCase())).slice(0,10):[...d.emp].sort((a,b)=>b.score-a.score).slice(0,10),[d,q]);
 const e=d.emp.find(x=>x.id===sel),t=d.tmp,u=t&&find(t.cols,'user','employee'),seqs=e&&u?t.rows.filter(r=>String(r[u])===e.id):[],ev=d.evt,eu=ev&&find(ev.cols,'user','employee'),hist=e&&eu?ev.rows.filter(r=>String(r[eu])===e.id):[],ec=ev&&find(ev.cols,'event','type','activity'),ets=ev&&find(ev.cols,'timestamp','time','date'),epc=ev&&find(ev.cols,'pc'),TM=tcols(t);
 return html`<div><h2 style=${{marginTop:0}}>Employee investigation</h2><div class="bar"><input placeholder="Search Employee ID" value=${q} onInput=${x=>setQ(x.target.value)} style=${{width:260}}/>
 ${m.map(x=>html`<button key=${x.id} class=${'chip'+(sel===x.id?' on':'')} onClick=${()=>setSel(x.id)}>${x.id} · ${x.role}</button>`)}</div>
 ${!e?html`<${Note}>${q?'Pick an employee from the matches above.':'Showing the highest-risk employees; pick one to investigate.'}<//>`:html`<div>
 <div class="grid g4"><${Card} l="Employee" v=${e.id} s=${e.role}/><${Card} l="Risk Score" v=${e.score.toFixed(3)} s=${e.level}/><${Card} l="Isolation Forest" v=${e.iso?'Anomaly':'Normal'} s="Behavioural outlier model"/><${Card} l="Violations / Sequences" v=${e.viol+' / '+e.seq} s="Policy · temporal"/></div>
 <div class="grid g2" style=${{marginTop:14}}><div class="card"><h3>Risk level: <${Tag} lv=${e.level}/></h3><${Note}><b>${e.src}</b> — ${e.why}<//><h3 style=${{marginTop:14}}>Policy violation details</h3>
 ${d.vcols.length?d.vcols.map(c=>html`<div class="fl" key=${c}><span>${c.replace(/_/g,' ')} <small style=${{color:'#9ca3af'}}>${cat(c)}</small></span><b style=${{color:e.v[c]?'#dc2626':'#d1d5db'}}>${e.v[c]?'Violated':'—'}</b></div>`):'No violation columns available.'}</div>
 <div class="card"><h3>Suspicious event history</h3>${hist.length?hist.map((r,j)=>html`<div class="fl" key=${j}><span>${r[ec]}</span><span style=${{color:'#6b7280'}}>${r[ets]} · ${epc?r[epc]:''}</span></div>`):html`<span style=${{color:'#9ca3af'}}>No suspicious events recorded.</span>`}
 ${seqs.length?html`<div><h3 style=${{margin:'12px 0 4px'}}>Related event sequences (${seqs.length})</h3>${seqs.map((r,j)=>html`<${Note} key=${'s'+j}>${[['Login',TM.login],['Device',TM.dev],['File copy',TM.file],[(TM.typ&&r[TM.typ])||'Transfer',TM.xf]].filter(x=>x[1]).map(x=>x[0]+': '+r[x[1]]).join(' → ')}${TM.pc?' · '+r[TM.pc]:''}${TM.dur?' · '+r[TM.dur]+' min':''}<//>`)}</div>`:null}
 <h3 style=${{marginTop:14}}>Recommended security action</h3><${Note}>${e.action}<//></div></div></div>`}</div>`}
