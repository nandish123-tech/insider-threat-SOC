// Shared constants and pure helper functions
export const CONFIG={mode:'demo'}; // 'demo' = synthetic data layer below; 'csv' = user-loaded files (same schema)
export const RC={Critical:'#DC2626',High:'#F97316',Medium:'#EAB308',Low:'#22C55E'},ORD=Object.keys(RC),PU='#7C3AED',PUS=['#4C1D95','#7C3AED','#A78BFA','#C4B5FD','#DDD6FE'];
export const norm=s=>String(s).toLowerCase().replace(/[^a-z0-9]/g,'');
export const find=(cols,...keys)=>{if(!cols)return null;for(const k of keys){const c=cols.find(c=>norm(c)===norm(k));if(c)return c}for(const k of keys){const c=cols.find(c=>norm(c).includes(norm(k)));if(c)return c}return null};
export const truthy=v=>['1','1.0','true','yes','y','anomaly','flagged','suspicious'].includes(String(v).trim().toLowerCase());
export const title=s=>String(s||'').trim().toLowerCase().replace(/^./,c=>c.toUpperCase());
export const fmt=n=>Number(n).toLocaleString();
export const cat=c=>{c=c.toLowerCase();return c.includes('after')?'After-hours':/device|usb/.test(c)?'Device':c.includes('file')?'File':c.includes('email')?'Email':c.includes('http')?'HTTP':'Other'};
export const FILES={res:'final_employee_risk_results.csv',hyb:'hybrid_alerts.csv',tmp:'temporal_sequence_alerts.csv',evt:'correlation_events.csv'};
export const guess=n=>{n=n.toLowerCase();return n.includes('final_employee')||n.includes('risk_results')?'res':n.includes('hybrid')?'hyb':n.includes('temporal')?'tmp':n.includes('correlation')?'evt':null};
export const store={get(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};



/* ========== DATA SERVICE: parsing + validation of ACTUAL CSV files (never mixed with synthetic data) ========== */
export const ts=v=>{const x=String(v).trim();let t=Date.parse(x.replace(' ','T'));return isNaN(t)?Date.parse(x):t};
export const EMPID=['employee_id','user','employee','id'];

export const T_=t=>({title:{text:t,font:{size:13}}});
export const cnt=(a,f)=>a.filter(f).length,tcols=t=>{if(!t)return{};const c=t.cols,f=(...k)=>find(c,...k);return{emp:f('user','employee'),pc:f('pc'),login:f('login'),dev:f('device','usb','connect'),file:f('file','copy'),xf:f('transfertime','transfer_time','transfer'),typ:f('transfertype','type','method'),dur:f('duration')}};
