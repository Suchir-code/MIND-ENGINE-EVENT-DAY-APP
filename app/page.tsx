"use client";

import { useEffect, useMemo, useState } from "react";

const SHEETS_API = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL || "https://script.google.com/macros/s/AKfycbzMD5srAVZhWoamjxSzi-35sjSK3-jtv8u2b_0h752rKPes0ty7fddxL2nJFKfQUXjQ/exec";
const SHEET_URL = "https://docs.google.com/spreadsheets/d/1qJZQIpmhnWsTNRzKKJkHq0sTDlAxtumq-bfviREMCdE/edit?gid=1945222951#gid=1945222951";

const companies: Record<number, string[]> = {
  1: ["Tawk Sdn Bhd","bp","Rooftop Energy Tech Sdn Bhd","Shopee","Deloitte","Gamuda Berhad","Nokia Services and Networks Malaysia Sdn Bhd","Ant International","Food Panda","Reactive Energy","Maistorage","SPX Express (Malaysia)","Netizen Testing Sdn Bhd","Core Consulting","KTA Tenaga Sdn Bhd","JJ-Lurgi Engineering Sdn Bhd","Advanced Semiconductor Academy of Malaysia (ASEM)","IGB Berhad"],
  2: ["Tawk Sdn Bhd","bp","Rooftop Energy Tech Sdn Bhd","Inchz IoT Sdn Bhd","AT&S Austria Technologie & Systemtechnik","Deloitte","Ant International","Food Panda","Reactive Energy","Maistorage","Gamuda Berhad","Shortcut Asia","Configura Pacific Sdn Bhd","Juris Technologies Sdn Bhd","Averis","Bio to Business Sdn Bhd","JKS Engineering (M) Sdn Bhd"],
  3: ["Tawk Sdn Bhd","Inchz IoT Sdn Bhd","AT&S Austria Technologie & Systemtechnik","AMD","WD","Chuan Sin Sdn Bhd (Spritzer)","Shortcut Asia","Configura Pacific Sdn Bhd","Juris Technologies Sdn Bhd","Mi Equipment","Alliance Precasr Industries Sdn Bhd","ExxonMobil Business Support Centre Malaysia Sdn Bhd","Solarvest Holdings Berhad (Atlantic Blue Sdn Bhd)","GlobeOSS Sdn Bhd","JKS Engineering (M) Sdn Bhd","Nestle Manufacturing Malaysia","Inno Lab Engineering Sdn Bhd","PwC in Malaysia","Deriv"],
  4: ["Tawk Sdn Bhd","AMD","WD","Chuan Sin Sdn Bhd (Spritzer)","Shopee","Mi Equipment","Alliance Precasr Industries Sdn Bhd","ExxonMobil Business Support Centre Malaysia Sdn Bhd","Solarvest Holdings Berhad (Atlantic Blue Sdn Bhd)","GlobeOSS Sdn Bhd","Nokia Services and Networks Malaysia Sdn Bhd","Micron Malaysia","Aonic","HSS Engineers Berhad","RIFHAN Teknologi Sdn BHd (Tech D)","Baltimore Aircoil Malaysia Sdn Bhd","SPX Express (Malaysia)"],
};

const PIC_NAMES = ["Suchir","Daphne","Jet Shen","Thenmolly","Tiraa","Pui Yeng","Jin Hong","Joash","Brandon"];
const sponsorInfo: Record<string,{tier:string;lead:string}> = {
  "Nestle Manufacturing Malaysia":{tier:"BRONZE",lead:"Daphne"},"bp":{tier:"GOLD",lead:"Daphne"},"Inchz IoT Sdn Bhd":{tier:"GOLD",lead:"Daphne"},"AMD":{tier:"GOLD",lead:"Daphne"},"Gamuda Berhad":{tier:"SILVER",lead:"Daphne"},"Shortcut Asia":{tier:"SILVER",lead:"Daphne"},"Nokia Services and Networks Malaysia Sdn Bhd":{tier:"SILVER",lead:"Daphne"},
  "Inno Lab Engineering Sdn Bhd":{tier:"BRONZE",lead:"Jet Shen"},"Micron Malaysia":{tier:"BRONZE",lead:"Jet Shen"},"Rooftop Energy Tech Sdn Bhd":{tier:"GOLD",lead:"Jet Shen"},"WD":{tier:"GOLD",lead:"Jet Shen"},"Ant International":{tier:"SILVER",lead:"Jet Shen"},"Mi Equipment":{tier:"SILVER",lead:"Jet Shen"},"Alliance Precasr Industries Sdn Bhd":{tier:"SILVER",lead:"Jet Shen"},
  "Netizen Testing Sdn Bhd":{tier:"BRONZE",lead:"Pui Yeng"},"PwC in Malaysia":{tier:"BRONZE",lead:"Pui Yeng"},"Deriv":{tier:"BRONZE",lead:"Pui Yeng"},"Aonic":{tier:"BRONZE",lead:"Pui Yeng"},"HSS Engineers Berhad":{tier:"BRONZE",lead:"Pui Yeng"},"Shopee":{tier:"GOLD",lead:"Pui Yeng"},"Configura Pacific Sdn Bhd":{tier:"SILVER",lead:"Pui Yeng"},"ExxonMobil Business Support Centre Malaysia Sdn Bhd":{tier:"SILVER",lead:"Pui Yeng"},
  "Core Consulting":{tier:"BRONZE",lead:"Suchir"},"RIFHAN Teknologi Sdn BHd (Tech D)":{tier:"BRONZE",lead:"Suchir"},"AT&S Austria Technologie & Systemtechnik":{tier:"GOLD",lead:"Suchir"},"Tawk Sdn Bhd":{tier:"OFFICIAL",lead:"Suchir"},"Juris Technologies Sdn Bhd":{tier:"SILVER",lead:"Suchir"},"Solarvest Holdings Berhad (Atlantic Blue Sdn Bhd)":{tier:"SILVER",lead:"Suchir"},"Food Panda":{tier:"SILVER",lead:"Suchir"},
  "KTA Tenaga Sdn Bhd":{tier:"BRONZE",lead:"Thenmolly"},"JJ-Lurgi Engineering Sdn Bhd":{tier:"BRONZE",lead:"Thenmolly"},"Advanced Semiconductor Academy of Malaysia (ASEM)":{tier:"BRONZE",lead:"Thenmolly"},"Deloitte":{tier:"GOLD",lead:"Thenmolly"},"Reactive Energy":{tier:"SILVER",lead:"Thenmolly"},"JKS Engineering (M) Sdn Bhd":{tier:"TWO DAY BRONZE",lead:"Thenmolly"},"SPX Express (Malaysia)":{tier:"TWO DAY BRONZE",lead:"Thenmolly"},
  "Averis":{tier:"BRONZE",lead:"Tiraa"},"Bio to Business Sdn Bhd":{tier:"BRONZE",lead:"Tiraa"},"IGB Berhad":{tier:"BRONZE",lead:"Tiraa"},"Baltimore Aircoil Malaysia Sdn Bhd":{tier:"BRONZE",lead:"Tiraa"},"Chuan Sin Sdn Bhd (Spritzer)":{tier:"GOLD",lead:"Tiraa"},"Maistorage":{tier:"SILVER",lead:"Tiraa"},"GlobeOSS Sdn Bhd":{tier:"SILVER",lead:"Tiraa"}
};

type RecordRow = {day:number;company:string;student_number:string;resume_collected:boolean;feedback:string;lunch_collected:boolean;lanyard_returned:boolean;tier?:string;assigned_pic?:string;latest_time?:string;latest_pic?:string};
type InteractionLog = {timestamp:string;day:number;company:string;pic:string;log_id?:string};
const blank = (day:number,company:string):RecordRow => ({day,company,student_number:"",resume_collected:false,feedback:"",lunch_collected:false,lanyard_returned:false});

export default function Home(){
  const [day,setDay]=useState(1),[query,setQuery]=useState("");
  const [rows,setRows]=useState<Record<string,RecordRow>>({});
  const [logs,setLogs]=useState<InteractionLog[]>([]);
  const [editing,setEditing]=useState<RecordRow|null>(null);
  const [checkInPerson,setCheckInPerson]=useState("");
  const [status,setStatus]=useState<"loading"|"live"|"local"|"saving">("loading");
  const key=(d:number,c:string)=>`${d}::${c}`;

  useEffect(()=>{
    const local=JSON.parse(localStorage.getItem("mind-engine-records")||"{}");setRows(local);
    fetch(`${SHEETS_API}?action=list`).then(async r=>{if(!r.ok)throw Error();const result=await r.json();if(!result.ok)throw Error();const mapped={...local};result.records.forEach((row:RecordRow)=>mapped[key(row.day,row.company)]=row);setRows(mapped);setLogs(result.logs||[]);setStatus("live")}).catch(()=>setStatus("local"));
  },[]);

  const visible=useMemo(()=>companies[day].filter(c=>c.toLowerCase().includes(query.toLowerCase())),[day,query]);
  const done=companies[day].filter(c=>rows[key(day,c)]?.resume_collected).length;
  const engaged=companies[day].filter(c=>{const r=rows[key(day,c)];return r&&(r.student_number||r.feedback||r.latest_pic)}).length;
  const progress=Math.round(done/companies[day].length*100);

  async function save(row:RecordRow){
    const updated={...rows,[key(row.day,row.company)]:row};setRows(updated);localStorage.setItem("mind-engine-records",JSON.stringify(updated));setEditing(null);setStatus("saving");
    try{const res=await fetch(SHEETS_API,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action:"upsert",record:row})});const result=await res.json();if(!res.ok||!result.ok)throw Error();setStatus("live")}catch{setStatus("local")}
  }

  async function refreshFromSheet(){
    const res=await fetch(`${SHEETS_API}?action=list&ts=${Date.now()}`);
    const result=await res.json();
    if(!res.ok||!result.ok)throw Error();
    const mapped={...rows};result.records.forEach((row:RecordRow)=>mapped[key(row.day,row.company)]=row);
    setRows(mapped);setLogs(result.logs||[]);
    return mapped;
  }

  function openRecord(row:RecordRow){setEditing(row);setCheckInPerson(sponsorInfo[row.company]?.lead||"")}
  async function checkInNow(){
    if(!editing||!checkInPerson)return;
    const timestamp=new Date().toLocaleString("en-MY",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:false});
    const updated={...editing,latest_time:timestamp,latest_pic:checkInPerson};
    setEditing(updated);setRows({...rows,[key(updated.day,updated.company)]:updated});setLogs([{timestamp,day:updated.day,company:updated.company,pic:checkInPerson},...logs]);setStatus("saving");
    try{const res=await fetch(SHEETS_API,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action:"checkin",day:updated.day,company:updated.company,pic:checkInPerson})});const result=await res.json();if(!res.ok||!result.ok)throw Error();await refreshFromSheet();setStatus("live")}catch{setStatus("local")}
  }

  async function undoLog(log:InteractionLog){
    if(!log.log_id)return;
    setStatus("saving");
    try{const res=await fetch(SHEETS_API,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action:"undo_checkin",log_id:log.log_id})});const result=await res.json();if(!res.ok||!result.ok)throw Error();const refreshed=await refreshFromSheet();setEditing(current=>current?(refreshed[key(current.day,current.company)]||current):current);setStatus("live")}catch{setStatus("local")}
  }

  return <main>
    <header className="topbar">
      <div className="brand"><span className="mark">ME</span><div><b>MIND ENGINE</b><small>EXPO 2026 · TEAM HQ</small></div></div>
      <div className="header-actions"><div className={`sync-pill ${status}`}><span className="pulse"/><span>{status==="live"?"Sheet synced":status==="saving"?"Saving…":status==="loading"?"Connecting…":"Device mode"}</span></div><a className="sheet-link" href={SHEET_URL} target="_blank" rel="noreferrer"><span className="sheet-icon">▦</span><span className="sheet-label">Master sheet</span><span>↗</span></a></div>
    </header>

    <section className="hero">
      <div className="hero-copy"><span className="eyebrow"><i/> Live company engagement tracker</span><h1>Move every<br/>conversation <em>forward.</em></h1><p>A shared field guide for capturing student interest, resumes, feedback and follow-ups across the expo.</p></div>
      <div className="overview"><div className="overview-head"><span>DAY {day} PULSE</span><strong>{progress}%</strong></div><div className="progress-track"><span style={{width:`${progress}%`}}/></div><div className="metrics"><div><strong>{companies[day].length}</strong><span>Companies</span></div><div><strong>{engaged}</strong><span>Engaged</span></div><div><strong>{done}</strong><span>Resumes</span></div></div></div>
    </section>

    <nav className="days" aria-label="Expo days">{[1,2,3,4].map(d=>{const dayDone=companies[d].filter(c=>rows[key(d,c)]?.resume_collected).length;return <button key={d} onClick={()=>setDay(d)} className={day===d?"active":""} aria-current={day===d?"page":undefined}><span className="day-index">0{d}</span><span className="day-copy"><b>Day {d}</b><small>{dayDone}/{companies[d].length} complete</small></span><span className="day-arrow">→</span></button>})}</nav>

    <section className="workspace">
      <div className="toolbar"><div><span className="section-kicker">COMPANY ROSTER</span><h2>Day {day} conversations</h2><p>Tap any company card to capture an update.</p></div><label className="search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search companies" aria-label="Search companies"/>{query&&<button onClick={()=>setQuery("")} type="button" aria-label="Clear search">×</button>}</label></div>
      <section className="grid">{visible.map((company,i)=>{const row=rows[key(day,company)]||blank(day,company);const touched=!!(row.student_number||row.feedback||row.latest_pic);const sponsor=sponsorInfo[company];return <article key={company} onClick={()=>openRecord(row)} tabIndex={0} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openRecord(row)}}}>
        <div className="card-top"><span className="number">{String(i+1).padStart(2,"0")}</span><span className={`tier ${(sponsor?.tier||"").toLowerCase().replaceAll(" ","-")}`}>{sponsor?.tier||"PARTNER"}</span></div>
        <h3>{company}</h3><div className="lead-line"><span>Assigned PIC</span><b>{sponsor?.lead||"Unassigned"}</b></div><div className="card-meta"><span><small>RECENT CHECK-IN</small><b>{row.latest_pic||"No check-in"}</b></span><span><small>TIME</small><b>{row.latest_time||"—"}</b></span><span><small>LUNCH</small><b>{row.lunch_collected?"Collected ✓":"Pending"}</b></span><span><small>LANYARD</small><b>{row.lanyard_returned?"Returned ✓":"Pending"}</b></span></div><button className="edit" type="button">Open & check in <span>↗</span></button>
      </article>})}</section>
      {visible.length===0&&<div className="empty"><span>⌕</span><h3>No companies found</h3><p>Try a shorter search term.</p><button onClick={()=>setQuery("")}>Clear search</button></div>}
    </section>

    {editing&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setEditing(null)}><form className="drawer" onSubmit={e=>{e.preventDefault();save(editing)}}>
      <div className="drawer-head"><div><small>DAY {editing.day} · COMPANY RECORD</small><h2>{editing.company}</h2></div><button type="button" className="close" onClick={()=>setEditing(null)} aria-label="Close form">×</button></div>
      <div className="company-brief"><span className={`tier ${(sponsorInfo[editing.company]?.tier||"").toLowerCase().replaceAll(" ","-")}`}>{sponsorInfo[editing.company]?.tier||"PARTNER"}</span><p>Assigned lead <b>{sponsorInfo[editing.company]?.lead||"Unassigned"}</b></p></div>
      <div className="quick-checkin"><div><small>QUICK CHECK-IN</small><b>Who spoke to them now?</b></div><select value={checkInPerson} onChange={e=>setCheckInPerson(e.target.value)} aria-label="PIC checking in"><option value="">Select PIC</option>{PIC_NAMES.map(name=><option key={name}>{name}</option>)}</select><button type="button" onClick={checkInNow} disabled={!checkInPerson}>Check in now</button></div>
      <div className="recent-interaction"><span>Most recent interaction</span><strong>{editing.latest_pic||"No one has checked in yet"}</strong><small>{editing.latest_time||"Waiting for the first conversation"}</small></div>
      <div className="form-grid">
        <label><span>Student number</span><input inputMode="numeric" value={editing.student_number} onChange={e=>setEditing({...editing,student_number:e.target.value})} placeholder="e.g. 12"/></label>
        <label className="check"><input type="checkbox" checked={editing.resume_collected} onChange={e=>setEditing({...editing,resume_collected:e.target.checked})}/><span><b>Resume collected</b><small>Mark this company complete</small></span></label>
        <label className="check"><input type="checkbox" checked={editing.lunch_collected} onChange={e=>setEditing({...editing,lunch_collected:e.target.checked})}/><span><b>Lunch collected</b><small>Tick when the company receives lunch</small></span></label>
        <label className="check"><input type="checkbox" checked={editing.lanyard_returned} onChange={e=>setEditing({...editing,lanyard_returned:e.target.checked})}/><span><b>Lanyard returned</b><small>Tick when the company returns its lanyard</small></span></label>
        <label className="full"><span>Feedback & notes</span><textarea rows={5} value={editing.feedback} onChange={e=>setEditing({...editing,feedback:e.target.value})} placeholder={"1. Key feedback\n2. Student interests\n3. Follow-up notes"}/></label>
      </div><div className="actions"><button type="button" onClick={()=>setEditing(null)}>Cancel</button><button type="submit"><span>Save update</span><span>→</span></button></div>
      <section className="interaction-history"><div><small>INTERACTION HISTORY</small><h3>All check-ins</h3></div>{logs.filter(log=>log.day===editing.day&&log.company===editing.company).length?<ul>{logs.filter(log=>log.day===editing.day&&log.company===editing.company).map((log,index)=><li key={log.log_id||`${log.timestamp}-${index}`}><span>{log.pic.slice(0,1)}</span><b>{log.pic}</b><time>{log.timestamp}</time>{log.log_id&&<button type="button" onClick={()=>undoLog(log)} aria-label={`Undo ${log.pic} check-in`}>Undo</button>}</li>)}</ul>:<p>No interactions logged yet.</p>}</section>
    </form></div>}
    <footer><span>MIND ENGINE EXPO 2026</span><span>Built for the team · Malaysia</span></footer>
  </main>
}
