import Papa from 'papaparse';
import {find,ts,EMPID,tcols} from '../lib/shared.js';

/* CSV parsing + validation for ACTUAL files (never mixed with synthetic data) */
export const DataService={
 SPEC:{
  res:{file:'final_employee_risk_results.csv',pat:/final_employee|risk_results|employee_risk/i,desc:'Per-employee results: role, hybrid score, risk level, Isolation Forest, policy violations',req:[['employee ID',EMPID],['risk level',['risk_level','risklevel','level']],['hybrid risk score',['hybrid_risk','risk_score','score']]],opt:[['role',['role','job']],['Isolation Forest result',['isolation','iforest','anomaly']],['policy violation columns',['viol','policy']],['recommended action',['recommended','action']]]},
  hyb:{file:'hybrid_alerts.csv',pat:/hybrid/i,desc:'Hybrid alert list used to enrich Security Alerts',req:[['employee ID',EMPID]],opt:[['detection source',['source','method','detection']],['alert explanation',['explanation','reason','alert']],['risk score',['hybrid_risk','risk_score','score']]]},
  tmp:{file:'temporal_sequence_alerts.csv',pat:/temporal/i,desc:'Suspicious Login → Device → File Copy → Email/Web sequences',req:[['employee ID',EMPID],['login time',['login']],['transfer time',['transfertime','transfer_time','transfer']]],opt:[['PC',['pc']],['device connection time',['device','usb','connect']],['file copy time',['file','copy']],['transfer type',['transfertype','type','method']],['sequence duration',['duration']]]},
  evt:{file:'correlation_events.csv',pat:/correlation|events/i,desc:'Event log behind the temporal sequences',req:[['employee ID',EMPID],['event type',['event','type','activity']],['event timestamp',['timestamp','time','date']]],opt:[['PC',['pc']]]}},
 guess(name){for(const[k,s]of Object.entries(this.SPEC))if(s.pat.test(name))return k;return null},
 parse(file,key){const s=this.SPEC[key];return new Promise(done=>{
  if(!s.pat.test(file.name))return done({ok:false,name:file.name,errors:[`Filename “${file.name}” does not match the expected ${s.file}.`],warns:[]});
  if(!/\.csv$/i.test(file.name))return done({ok:false,name:file.name,errors:['Only .csv files are supported.'],warns:[]});
  Papa.parse(file,{header:true,skipEmptyLines:true,transformHeader:h=>h.trim(),complete:r=>{const cols=r.meta.fields||[],errors=[],warns=[];
   if(!r.data.length)errors.push('The file has no data rows.');
   s.req.forEach(([n,alts])=>{if(!find(cols,...alts))errors.push(`Missing required column: ${n} (looked for ${alts.join(' / ')}). Columns found: ${cols.slice(0,10).join(', ')}${cols.length>10?'…':''}`)});
   s.opt.forEach(([n,alts])=>{if(!alts.some(a=>find(cols,a)))warns.push(`No ${n} column found — related views will be limited.`)});
   if(key==='res'&&!errors.length){const c=find(cols,...EMPID),seen=new Set();let dup=0;r.data.forEach(x=>{const k=String(x[c]);if(seen.has(k))dup++;seen.add(k)});if(dup)warns.push(`${dup} duplicate employee IDs found.`)}
   if(r.errors.length&&!r.data.length)errors.push('CSV parse error: '+r.errors[0].message);
   done({ok:!errors.length,name:file.name,cols,rows:r.data,errors,warns})},error:e=>done({ok:false,name:file.name,errors:['Could not read file: '+e.message],warns:[]})})})},
 enrich(t){ // derive sequence duration from real timestamps when the file has none (no invented values)
  if(!t)return t;const M=tcols(t);if(M.dur||!M.login||!M.xf)return t;
  return{cols:[...t.cols,'sequence_duration_min'],rows:t.rows.map(r=>{const a=ts(r[M.login]),b=ts(r[M.xf]);return{...r,sequence_duration_min:isFinite(b-a)?((b-a)/60000).toFixed(1):''}})}}};
