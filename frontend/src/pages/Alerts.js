import React,{useState,useEffect,useRef,useMemo} from 'react';
import {html} from '../html.js';
import {CONFIG,RC,ORD,PU,PUS,norm,find,truthy,title,fmt,cat,FILES,guess,store,ts,EMPID,T_,cnt,tcols} from '../lib/shared.js';
import {Card,Note,Tag,Plot,Table,Chips} from '../components/ui.js';

export function Alerts({d,lv,setLv,open}){const [q,setQ]=useState(''),[ms,setMs]=useState([]);
 const rows=useMemo(()=>d.emp.filter(x=>x.flag&&lv.includes(x.level)&&ms.every(m=>x.src.includes(m))&&(!q||(x.id+x.role+x.why).toLowerCase().includes(q.toLowerCase()))),[d,lv,ms,q]);
 return html`<div><h2 style=${{marginTop:0}}>Security alerts</h2><div class="bar"><input placeholder="Search Employee ID / Role / explanation" value=${q} onInput=${e=>setQ(e.target.value)} style=${{width:300}}/></div>
 <div class="bar"><b style=${{fontSize:12}}>Severity</b><${Chips} opts=${ORD} sel=${lv} set=${setLv} color=${true}/><b style=${{fontSize:12}}>Method</b><${Chips} opts=${['Isolation Forest','Role Policy','Temporal']} sel=${ms} set=${setMs}/></div>
 <${Table} rows=${rows} sort0=${{k:'score',d:-1}} onRow=${r=>open(r.id)} cols=${[{k:'id',l:'Employee ID'},{k:'role',l:'Role'},{k:'score',l:'Risk Score',r:r=>r.score.toFixed(3)},{k:'level',l:'Severity',r:r=>html`<${Tag} lv=${r.level}/>`},{k:'src',l:'Detection Source',r:r=>r.src2||r.src},{k:'why',l:'Alert Explanation',r:r=>r.why2||r.why},{k:'action',l:'Recommended Action'}]}/>
 <div class="pg" style=${{justifyContent:'flex-start'}}>Click a row to investigate. Low severity is hidden by default — toggle it in the filter. ${d.hyb?'hybrid_alerts.csv: '+fmt(d.hyb.rows.length)+' alert rows loaded.':''}</div></div>`}
