import React,{useState,useEffect,useRef,useMemo} from 'react';
import {html} from '../html.js';
import {CONFIG,RC,ORD,PU,PUS,norm,find,truthy,title,fmt,cat,FILES,guess,store,ts,EMPID,T_,cnt,tcols} from '../lib/shared.js';
import {Card,Note,Tag,Plot,Table,Chips} from '../components/ui.js';

export function Temporal({d,open}){const t=d.tmp,ev=d.evt,[i,setI]=useState(0),[fe,setFe]=useState(''),[ft,setFt]=useState(''),[d1,setD1]=useState(''),[d2,setD2]=useState('');
 const M=useMemo(()=>tcols(t),[t]),E=useMemo(()=>{if(!ev)return{};const c=ev.cols;return{emp:find(c,'user','employee'),pc:find(c,'pc'),typ:find(c,'event','type','activity'),ts:find(c,'timestamp','time','date')}},[ev]);
 const evRows=useMemo(()=>ev?ev.rows.filter(r=>(!fe||String(r[E.emp]).toLowerCase().includes(fe.toLowerCase()))&&(!ft||r[E.typ]===ft)&&(!d1||ts(r[E.ts])>=Date.parse(d1))&&(!d2||ts(r[E.ts])<Date.parse(d2)+864e5)):[],[ev,fe,ft,d1,d2]);
 const types=useMemo(()=>ev&&E.typ?[...new Set(ev.rows.map(r=>r[E.typ]))].sort():[],[ev]);
 let tl=null;if(t&&t.rows.length){const r=t.rows[Math.min(i,t.rows.length-1)],st=[['Login',M.login],['Device Connection',M.dev],['Removable Media Copy',M.file],['Email / Web Upload',M.xf]].map(([n,c])=>[n,c&&ts(r[c])]).filter(x=>x[1]);
  if(st.length)tl=html`<${Plot} h=${230} data=${[{type:'scatter',mode:'lines+markers+text',x:st.map(x=>new Date(x[1])),y:st.map(()=>0),text:st.map(x=>x[0]),textposition:st.map((_,j)=>j%2?'bottom center':'top center'),marker:{size:14,color:PU},line:{color:'#c4b5fd'},hoverinfo:'x+text'}]} layout=${{yaxis:{visible:false,range:[-1,1]},margin:{t:20,b:30,l:20,r:20}}}/>`}
 const ty=t&&M.typ?Object.entries(t.rows.reduce((a,r)=>(a[r[M.typ]]=(a[r[M.typ]]||0)+1,a),{})):[],dur=t&&M.dur?(a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null)(t.rows.map(r=>Number(r[M.dur])).filter(Number.isFinite)):null;
 return html`<div><h2 style=${{marginTop:0}}>Temporal event correlation</h2><${Note}>These are <b>suspicious behavioural patterns</b>, not confirmed data theft or exfiltration.<//>
 ${!t||!t.rows.length?html`<${Note} warn>No temporal sequences loaded.<//>`:html`<div><div class="grid g4"><${Card} l="Suspicious Sequences" v=${t.rows.length} s="Detected patterns"/><${Card} l="Employees" v=${new Set(t.rows.map(r=>r[M.emp])).size} s="Unique"/><${Card} l="Avg Duration" v=${dur==null?'—':dur.toFixed(0)+' min'} s="Login → transfer"/><${Card} l="Email / Web" v=${ty.map(x=>x[1]).join(' / ')} s=${ty.map(x=>x[0]).join(' / ')}/></div>
 <div class="grid g2" style=${{marginTop:14}}>${ty.length?html`<${Plot} data=${[{type:'bar',x:ty.map(x=>x[0]),y:ty.map(x=>x[1]),text:ty.map(x=>x[1]),textposition:'outside',marker:{color:[PU,'#a78bfa']}}]} layout=${T_('Email-send vs web-upload sequences')}/>`:null}
 <div class="card"><h3>Sequence timeline</h3><select value=${i} onChange=${e=>setI(+e.target.value)}>${t.rows.map((r,j)=>html`<option key=${j} value=${j}>${r[M.emp]} · ${r[M.pc]} · #${j+1}</option>`)}</select>
 <div style=${{color:'#6b7280',fontSize:12,margin:'8px 0'}}>Login → Device Connection → Removable Media File Copy → Email Send / Web Upload</div>${tl}</div></div>
 <h3 style=${{marginTop:14}}>Sequences <small style=${{color:'#9ca3af',fontWeight:400}}>(click to investigate)</small></h3><${Table} rows=${t.rows} page=${10} cols=${t.cols.map(c=>({k:c,l:c}))} onRow=${r=>M.emp&&open(String(r[M.emp]))}/></div>`}
 <h2>Event monitoring</h2>${!ev||!ev.rows.length?html`<${Note} warn>No events loaded.<//>`:html`<div><div class="bar"><input placeholder="Employee ID" value=${fe} onInput=${e=>setFe(e.target.value)}/>
 <select value=${ft} onChange=${e=>setFt(e.target.value)}><option value="">All event types</option>${types.map(x=>html`<option key=${x}>${x}</option>`)}</select>
 <label>From <input type="date" value=${d1} onChange=${e=>setD1(e.target.value)}/></label><label>To <input type="date" value=${d2} onChange=${e=>setD2(e.target.value)}/></label></div>
 <${Table} rows=${evRows} page=${15} cols=${[['emp','Employee ID'],['pc','PC'],['typ','Event Type'],['ts','Event Timestamp']].map(([k,l])=>({k,l,r:r=>String(r[E[k]]??'')}))}/></div>`}</div>`}
