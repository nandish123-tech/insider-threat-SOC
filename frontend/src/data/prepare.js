import {find,title,truthy,cat,EMPID} from '../lib/shared.js';

export function prepare(res,tmp,hyb){
 if(!res||!res.rows.length)return{emp:[],vcols:[]};
 const c=res.cols,g=(...k)=>find(c,...k),idc=g('employee_id','user','employee','id')||c[0];
 const role=g('role','job'),lvl=g('risklevel','risk_level','level'),act=g('recommended','action','response'),sc=g('hybrid_risk','risk_score','score'),ifc=g('isolation','iforest','anomaly','if_'),cc=g('violation_count','total_violations','num_violations');
 const vcols=c.filter(x=>(/viol/i.test(x)||/^policy/i.test(x))&&!/count|total|num/i.test(x)&&x!==idc);
 const u=find(tmp&&tmp.cols,'user','employee'),tc={};if(u)tmp.rows.forEach(r=>{const k=String(r[u]);tc[k]=(tc[k]||0)+1});
 const hid=hyb&&find(hyb.cols,...EMPID),hm={};if(hid)hyb.rows.forEach(r=>hm[String(r[hid])]=r);const hsrc=hyb&&find(hyb.cols,'detection_source','source','method'),hwhy=hyb&&find(hyb.cols,'explanation','reason','alert'),hsc=hyb&&find(hyb.cols,'hybrid_risk','risk_score','score'),hlv=hyb&&find(hyb.cols,'risklevel','risk_level','level');
 const numIF=ifc&&res.rows.every(r=>[-1,1].includes(Number(r[ifc])));
 const emp=res.rows.map(r=>{const v={};vcols.forEach(x=>{const n=Number(r[x]);v[x]=r[x]!==''&&!isNaN(n)?n>0:truthy(r[x])});const id=String(r[idc]);
  const e={id,role:role?r[role]:'N/A',score:sc?Number(r[sc])||0:(hm[id]&&hsc?Number(hm[id][hsc])||0:0),level:lvl?title(r[lvl]):(hm[id]&&hlv?title(hm[id][hlv]):'Unknown'),iso:ifc?(numIF?Number(r[ifc])===-1:truthy(r[ifc])):false,viol:cc?Number(r[cc])||0:vcols.filter(x=>v[x]).length,v,seq:tc[id]||0,action:act?r[act]:'N/A'};
  const cs=[...new Set(vcols.filter(x=>v[x]).map(cat))].sort();
  e.why=[e.viol?`${e.viol} policy violations (${cs.join(', ')})`:'',e.iso?'Isolation Forest anomaly':'',e.seq?`${e.seq} suspicious temporal sequence(s)`:''].filter(Boolean).join('; ')||'No detection flags';
  e.src=[e.iso?'Isolation Forest':'',e.viol?'Role Policy':'',e.seq?'Temporal':''].filter(Boolean).join(' + ')||'—';e.flag=e.src!=='—';e.inHyb=!!hm[id];if(hm[id]){if(hsrc&&hm[id][hsrc])e.src2=hm[id][hsrc];if(hwhy&&hm[id][hwhy])e.why2=hm[id][hwhy]}return e});
 return{emp,vcols}}

