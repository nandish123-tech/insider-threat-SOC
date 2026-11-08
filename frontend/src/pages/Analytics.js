import React,{useState,useEffect,useRef,useMemo} from 'react';
import {html} from '../html.js';
import {CONFIG,RC,ORD,PU,PUS,norm,find,truthy,title,fmt,cat,FILES,guess,store,ts,EMPID,T_,cnt,tcols} from '../lib/shared.js';
import {Card,Note,Tag,Plot,Table,Chips} from '../components/ui.js';

export function Analytics({d}){const e=d.emp,vc=d.vcols;if(!e.length)return html`<${Note} warn>No data.<//>`;
 const iso=e.filter(x=>x.iso),mean=a=>a.length?a.reduce((s,x)=>s+x.score,0)/a.length:0,roles=[...new Set(e.map(x=>x.role))];
 const g=roles.map(r=>{const a=e.filter(x=>x.role===r),v=cnt(a,x=>x.viol>0);return{r,v,rate:+(v/a.length*100).toFixed(1)}}),cats=[...new Set(vc.map(cat))];
 const ov={};e.filter(x=>x.flag).forEach(x=>ov[x.src]=(ov[x.src]||0)+1);const ovs=Object.entries(ov).sort((a,b)=>a[1]-b[1]);
 return html`<div><h2 style=${{marginTop:0}}>Isolation Forest detection summary</h2><div class="grid g4"><${Card} l="IF Detections" v=${fmt(iso.length)} s=${(iso.length/e.length*100).toFixed(1)+'% of monitored'}/><${Card} l="Also Policy-Flagged" v=${fmt(cnt(iso,x=>x.viol>0))} s="Overlap with role policy"/><${Card} l="IF-Only" v=${fmt(cnt(iso,x=>!x.viol))} s="Outliers without a rule breach"/><${Card} l="Mean Score (IF)" v=${mean(iso).toFixed(2)} s=${'vs '+mean(e.filter(x=>!x.iso)).toFixed(2)+' others'}/></div>
 <h2>Role-based policy violations</h2><div class="grid g2">
 <${Plot} data=${[{type:'bar',orientation:'h',y:g.map(x=>x.r),x:g.map(x=>x.v),text:g.map(x=>x.v),textposition:'outside',marker:{color:PU}}]} layout=${{...T_('Employees with ≥1 violation, by role'),margin:{l:150,t:44,b:40,r:30}}}/>
 <${Plot} data=${[{type:'bar',orientation:'h',y:g.map(x=>x.r),x:g.map(x=>x.rate),text:g.map(x=>x.rate+'%'),textposition:'outside',marker:{color:'#a78bfa'}}]} layout=${{...T_('Violation rate by role (% of role)'),margin:{l:150,t:44,b:40,r:30}}}/></div>
 <h2>Activity distribution by role</h2><${Plot} h=${360} data=${cats.map((k,i)=>({type:'bar',name:k,x:roles,y:roles.map(r=>e.filter(x=>x.role===r).reduce((s,x)=>s+vc.filter(c=>cat(c)===k&&x.v[c]).length,0)),marker:{color:PUS[i%5]}}))} layout=${{...T_('Policy violation flags by activity type and role'),barmode:'stack'}}/>
 <h2>Employee behavioural anomalies</h2><${Plot} h=${400} data=${ORD.map(l=>{const a=e.filter(x=>x.level===l);return{type:'scatter',mode:'markers',name:l,x:a.map((x,i)=>x.viol+((i*37)%100)/200-.25),y:a.map(x=>x.score),text:a.map(x=>x.id+' · '+x.role+(x.iso?' · IF anomaly':'')),hoverinfo:'text+y',marker:{color:RC[l],size:6,opacity:.7,symbol:a.map(x=>x.iso?'diamond':'circle')}}})} layout=${{...T_('Risk score vs policy violations (◆ = Isolation Forest anomaly)'),xaxis:{title:'Policy violations'},yaxis:{title:'Risk score'}}}/>
 <div class="grid g2" style=${{marginTop:14}}><${Plot} data=${ORD.map(l=>({type:'histogram',name:l,x:e.filter(x=>x.level===l).map(x=>x.score),xbins:{start:0,end:1,size:.025},marker:{color:RC[l]}}))} layout=${{...T_('Risk score distribution (log scale)'),barmode:'stack',yaxis:{type:'log'}}}/>
 <${Plot} data=${[{type:'bar',orientation:'h',y:ovs.map(x=>x[0]),x:ovs.map(x=>x[1]),text:ovs.map(x=>x[1]),textposition:'outside',marker:{color:PU}}]} layout=${{...T_('Detection overlap (unique employees per combination)'),margin:{l:230,t:44,b:40,r:30}}}/></div>
 <${Note}>Each flagged employee sits in exactly one combination bar, so these bars <b>do</b> sum to the unique flagged total, unlike the per-method counts on the overview.<//></div>`}
