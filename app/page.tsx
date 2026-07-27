"use client";

import { useEffect, useMemo, useState } from "react";

const SHEETS_API = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL
  || "https://script.google.com/macros/s/AKfycbzMD5srAVZhWoamjxSzi-35sjSK3-jtv8u2b_0h752rKPes0ty7fddxL2nJFKfQUXjQ/exec";
const SHEET_URL = "https://docs.google.com/spreadsheets/d/1qJZQIpmhnWsTNRzKKJkHq0sTDlAxtumq-bfviREMCdE/edit?gid=1945222951#gid=1945222951";

const companies: Record<number, string[]> = {
  1: ["Tawk Sdn Bhd","bp","Rooftop Energy Tech Sdn Bhd","Shopee","Deloitte","Gamuda Berhad","Nokia Services and Networks Malaysia Sdn Bhd","Ant International","Food Panda","Reactive Energy","Maistorage","SPX Express (Malaysia)","Netizen Testing Sdn Bhd","Core Consulting","KTA Tenaga Sdn Bhd","JJ-Lurgi Engineering Sdn Bhd","Advanced Semiconductor Academy of Malaysia (ASEM)","IGB Berhad"],
  2: ["Tawk Sdn Bhd","bp","Rooftop Energy Tech Sdn Bhd","Inchz IoT Sdn Bhd","AT&S Austria Technologie & Systemtechnik","Deloitte","Ant International","Food Panda","Reactive Energy","Maistorage","Gamuda Berhad","Shortcut Asia","Configura Pacific Sdn Bhd","Juris Technologies Sdn Bhd","Averis","Bio to Business Sdn Bhd","JKS Engineering (M) Sdn Bhd"],
  3: ["Tawk Sdn Bhd","Inchz IoT Sdn Bhd","AT&S Austria Technologie & Systemtechnik","AMD","WD","Chuan Sin Sdn Bhd (Spritzer)","Shortcut Asia","Configura Pacific Sdn Bhd","Juris Technologies Sdn Bhd","Mi Equipment","Alliance Precasr Industries Sdn Bhd","ExxonMobil Business Support Centre Malaysia Sdn Bhd","Solarvest Holdings Berhad (Atlantic Blue Sdn Bhd)","GlobeOSS Sdn Bhd","JKS Engineering (M) Sdn Bhd","Nestle Manufacturing Malaysia","Inno Lab Engineering Sdn Bhd","PwC in Malaysia","Deriv"],
  4: ["Tawk Sdn Bhd","AMD","WD","Chuan Sin Sdn Bhd (Spritzer)","Shopee","Mi Equipment","Alliance Precasr Industries Sdn Bhd","ExxonMobil Business Support Centre Malaysia Sdn Bhd","Solarvest Holdings Berhad (Atlantic Blue Sdn Bhd)","GlobeOSS Sdn Bhd","Nokia Services and Networks Malaysia Sdn Bhd","Micron Malaysia","Aonic","HSS Engineers Berhad","RIFHAN Teknologi Sdn BHd (Tech D)","Baltimore Aircoil Malaysia Sdn Bhd","SPX Express (Malaysia)"],
};

type RecordRow = {
  day: number; company: string; student_number: string; resume_collected: boolean;
  feedback: string; chat_time_1: string; pic_1: string; chat_time_2: string; pic_2: string;
};

const blank = (day: number, company: string): RecordRow => ({
  day, company, student_number: "", resume_collected: false, feedback: "",
  chat_time_1: "", pic_1: "", chat_time_2: "", pic_2: "",
});

export default function Home() {
  const [day, setDay] = useState(1);
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Record<string, RecordRow>>({});
  const [editing, setEditing] = useState<RecordRow | null>(null);
  const [status, setStatus] = useState<"loading"|"live"|"local"|"saving">("loading");

  const key = (d: number, company: string) => `${d}::${company}`;
  useEffect(() => {
    const local = JSON.parse(localStorage.getItem("mind-engine-records") || "{}");
    setRows(local);
    if (!SHEETS_API) { setStatus("local"); return; }
    fetch(`${SHEETS_API}?action=list`)
      .then(async r => {
        if (!r.ok) throw new Error("not ready");
        const result = await r.json();
        if (!result.ok) throw new Error(result.error || "not ready");
        const data: RecordRow[] = result.records;
        const mapped = { ...local };
        data.forEach(row => mapped[key(row.day, row.company)] = row);
        setRows(mapped); setStatus("live");
      })
      .catch(() => setStatus("local"));
  }, []);

  const visible = useMemo(() => companies[day].filter(c => c.toLowerCase().includes(query.toLowerCase())), [day, query]);
  const done = companies[day].filter(c => rows[key(day, c)]?.resume_collected).length;

  async function save(row: RecordRow) {
    const updated = { ...rows, [key(row.day, row.company)]: row };
    setRows(updated); localStorage.setItem("mind-engine-records", JSON.stringify(updated)); setEditing(null);
    setStatus("saving");
    try {
      if (!SHEETS_API) throw new Error("not configured");
      const res = await fetch(SHEETS_API, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "upsert", record: row }),
      });
      const result = await res.json();
      if (!res.ok || !result.ok) throw new Error(result.error || "save failed");
      setStatus("live");
    } catch { setStatus("local"); }
  }

  return (
    <main>
      <header>
        <div className="brand"><span className="mark">ME</span><div><b>MIND ENGINE</b><small>EXPO 2026 · TEAM HQ</small></div></div>
        <a className="sheet-link" href={SHEET_URL} target="_blank">Open master sheet ↗</a>
      </header>

      <section className="hero">
        <div><span className="eyebrow">Live company engagement tracker</span><h1>Every conversation.<br/><em>One shared pulse.</em></h1><p>Capture student interest, resumes, feedback and follow-up ownership across all four expo days.</p></div>
        <div className="live-card"><span className={`pulse ${status}`}></span><div><small>SYNC STATUS</small><b>{status === "live" ? "Live & shared" : status === "saving" ? "Saving…" : status === "loading" ? "Connecting…" : "Saved on this device"}</b></div></div>
      </section>

      <nav className="days">{[1,2,3,4].map(d => <button key={d} onClick={() => setDay(d)} className={day===d ? "active" : ""}><span>0{d}</span>Day {d}<small>{companies[d].length} companies</small></button>)}</nav>

      <section className="toolbar">
        <div><h2>Day {day} roster</h2><p>{done} of {companies[day].length} companies have collected resumes</p></div>
        <label className="search">⌕<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a company…"/></label>
      </section>

      <section className="grid">
        {visible.map((company, i) => {
          const row = rows[key(day, company)] || blank(day, company);
          const touched = Object.values(row).some(v => v !== "" && v !== false && typeof v !== "number");
          return <article key={company} onClick={()=>setEditing(row)}>
            <div className="card-top"><span className="number">{String(i+1).padStart(2,"0")}</span><span className={`state ${row.resume_collected ? "complete" : touched ? "progress" : ""}`}>{row.resume_collected ? "Resume ✓" : touched ? "In progress" : "Not started"}</span></div>
            <h3>{company}</h3>
            <div className="card-meta"><span><small>STUDENTS</small><b>{row.student_number || "—"}</b></span><span><small>PIC</small><b>{row.pic_1 || row.pic_2 || "Unassigned"}</b></span></div>
            <button className="edit">Update record <span>→</span></button>
          </article>;
        })}
      </section>

      {editing && <div className="overlay" onMouseDown={e=>e.target===e.currentTarget && setEditing(null)}>
        <form className="drawer" onSubmit={e=>{e.preventDefault(); save(editing);}}>
          <div className="drawer-head"><div><small>DAY {editing.day} · COMPANY RECORD</small><h2>{editing.company}</h2></div><button type="button" className="close" onClick={()=>setEditing(null)}>×</button></div>
          <div className="form-grid">
            <label>Student number<input value={editing.student_number} onChange={e=>setEditing({...editing,student_number:e.target.value})} placeholder="e.g. 12"/></label>
            <label className="check"><input type="checkbox" checked={editing.resume_collected} onChange={e=>setEditing({...editing,resume_collected:e.target.checked})}/><span>Resume collected</span></label>
            <label className="full">Feedback / notes<textarea rows={5} value={editing.feedback} onChange={e=>setEditing({...editing,feedback:e.target.value})} placeholder={"1. Key feedback\n2. Student interests\n3. Follow-up notes"}/></label>
            <label>Chat time 1<input type="time" value={editing.chat_time_1} onChange={e=>setEditing({...editing,chat_time_1:e.target.value})}/></label>
            <label>PIC 1<input value={editing.pic_1} onChange={e=>setEditing({...editing,pic_1:e.target.value})} placeholder="Team member name"/></label>
            <label>Chat time 2<input type="time" value={editing.chat_time_2} onChange={e=>setEditing({...editing,chat_time_2:e.target.value})}/></label>
            <label>PIC 2<input value={editing.pic_2} onChange={e=>setEditing({...editing,pic_2:e.target.value})} placeholder="Team member name"/></label>
          </div>
          <div className="actions"><button type="button" onClick={()=>setEditing(null)}>Cancel</button><button type="submit">Save update</button></div>
        </form>
      </div>}
      <footer><span>MIND ENGINE EXPO 2026</span><span>Built for the team · Malaysia</span></footer>
    </main>
  );
}
