import React,{useState,useEffect,useRef,useMemo} from 'react';
import Plotly from 'plotly.js-dist-min';
import {html} from '../html.js';
import {CONFIG,RC,ORD,PU,PUS,norm,find,truthy,title,fmt,cat,FILES,guess,store,ts,EMPID,T_,cnt,tcols} from '../lib/shared.js';

/* ========== UI primitives ========== */
export const Card=({l,v,s})=>html`<div class="card kpi"><div class="l">${l}</div><div class="v">${v}</div><div class="s">${s}</div></div>`;
export const Note=({children,warn})=>html`<div class=${'note'+(warn?' warn':'')}>${children}</div>`;
export const Tag=({lv})=>html`<span class="tag" style=${{background:(RC[lv]||'#9ca3af')+'22',color:RC[lv]||'#6b7280'}}>${lv}</span>`;
export function Plot({data,layout,h=300,onClick}){const r=useRef();
 useEffect(()=>{if(!Plotly){r.current.textContent='Chart library could not be loaded (check your internet connection and reload).';return}Plotly.react(r.current,data,{margin:{t:44,b:40,l:46,r:10},height:h,paper_bgcolor:'#fff',plot_bgcolor:'#fff',font:{family:'Inter,system-ui',size:12},...layout,xaxis:{automargin:true,...(layout&&layout.xaxis)},yaxis:{automargin:true,...(layout&&layout.yaxis)}},{displayModeBar:false,responsive:true});
  if(onClick){r.current.removeAllListeners&&r.current.removeAllListeners('plotly_click');r.current.on('plotly_click',onClick)}});
 return html`<div class="card" style=${{padding:4}}><div ref=${r}></div></div>`}

export function Table({cols,rows,page=20,onRow,sort0}){
 const [s,setS]=useState(sort0||null),[p,setP]=useState(0);
 const sorted=useMemo(()=>{if(!s)return rows;const k=s.k;return [...rows].sort((a,b)=>{const x=a[k],y=b[k];const r=typeof x==='number'&&typeof y==='number'?x-y:String(x).localeCompare(String(y));return s.d*r})},[rows,s]);
 useEffect(()=>setP(0),[rows.length]);const n=Math.max(1,Math.ceil(sorted.length/page));
 return html`<div><div class="tw"><table><thead><tr>${cols.map(c=>html`<th key=${c.k} onClick=${()=>setS(s&&s.k===c.k?{k:c.k,d:-s.d}:{k:c.k,d:-1})}>${c.l}${s&&s.k===c.k?(s.d>0?' ▲':' ▼'):''}</th>`)}</tr></thead>
 <tbody>${sorted.slice(p*page,(p+1)*page).map((r,i)=>html`<tr key=${i} class=${onRow?'c':''} onClick=${()=>onRow&&onRow(r)}>${cols.map(c=>html`<td key=${c.k} title=${c.r?'':String(r[c.k]??'')}>${c.r?c.r(r):String(r[c.k]??'')}</td>`)}</tr>`)}</tbody></table></div>
 ${sorted.length===0?html`<div class="pg">No matching rows</div>`:html`<div class="pg"><span>${fmt(sorted.length)} rows · page ${p+1}/${n}</span><button class="btn ghost" disabled=${p===0} onClick=${()=>setP(p-1)}>Prev</button><button class="btn ghost" disabled=${p>=n-1} onClick=${()=>setP(p+1)}>Next</button></div>`}</div>`}
export const Chips=({opts,sel,set,color})=>html`<div class="bar">${opts.map(x=>html`<button key=${x} class=${'chip'+(sel.includes(x)?' on':'')} onClick=${()=>set(sel.includes(x)?sel.filter(y=>y!==x):[...sel,x])}>${color&&RC[x]?html`<span style=${{color:RC[x]}}>● </span>`:''}${x}</button>`)}</div>`;
