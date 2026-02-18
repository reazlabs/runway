import { useState, useMemo } from "react";

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
const STEP_KEYS = ["medical","mofa","pc","finger","visa","manpower","flight","iqamah"];
const STEP_STATUS = ["—", "Pending", "Done", "Failed"];
const STEP_STYLE = {
  "—":       { bg:"#F1F5F9", color:"#94a3b8" },
  "Pending": { bg:"#FEF3C7", color:"#92400E" },
  "Done":    { bg:"#D1FAE5", color:"#065F46" },
  "Failed":  { bg:"#FEE2E2", color:"#991B1B" },
};
const MAIN_STATUS = ["Processing","Completed","On Hold","Cancelled"];
const MAIN_STATUS_STYLE = {
  Processing: { bg:"#DBEAFE", color:"#1E3A8A", dot:"#3B82F6" },
  Completed:  { bg:"#D1FAE5", color:"#065F46",  dot:"#10B981" },
  "On Hold":  { bg:"#FEF3C7", color:"#92400E",  dot:"#F59E0B" },
  Cancelled:  { bg:"#FEE2E2", color:"#991B1B",  dot:"#EF4444" },
};
const AGENTS = ["AI-BOT-01","AI-BOT-02","AI-BOT-03"];

function makeRow(id, name, pp, date, agent, status, steps) {
  return { id, name, passportNo:pp, receivedDate:date, agent, status, ...steps };
}

const INITIAL_DATA = [
  makeRow(1,"Rahim Uddin",     "AB1234567","2025-01-10","AI-BOT-01","Processing",  {medical:"Done",   mofa:"Done",   pc:"Pending", finger:"Pending", visa:"—",      manpower:"—",     flight:"—",   iqamah:"—"   }),
  makeRow(2,"Fatema Begum",    "BC2345678","2025-01-12","AI-BOT-02","Processing",  {medical:"Done",   mofa:"Pending",pc:"—",       finger:"—",        visa:"—",      manpower:"—",     flight:"—",   iqamah:"—"   }),
  makeRow(3,"Karim Hossain",   "CD3456789","2025-01-08","AI-BOT-01","Completed",   {medical:"Done",   mofa:"Done",   pc:"Done",    finger:"Done",     visa:"Done",   manpower:"Done",  flight:"Done",iqamah:"Done"}),
  makeRow(4,"Nasrin Akter",    "DE4567890","2025-01-15","AI-BOT-03","Cancelled",   {medical:"Done",   mofa:"Failed", pc:"—",       finger:"—",        visa:"—",      manpower:"—",     flight:"—",   iqamah:"—"   }),
  makeRow(5,"Sohel Rana",      "EF5678901","2025-01-17","AI-BOT-02","Processing",  {medical:"Pending",mofa:"—",      pc:"—",       finger:"—",        visa:"—",      manpower:"—",     flight:"—",   iqamah:"—"   }),
  makeRow(6,"Mitu Islam",      "FG6789012","2025-01-19","AI-BOT-01","On Hold",     {medical:"Done",   mofa:"Done",   pc:"Done",    finger:"Failed",   visa:"—",      manpower:"—",     flight:"—",   iqamah:"—"   }),
  makeRow(7,"Jahir Ahmed",     "GH7890123","2025-01-05","AI-BOT-03","Completed",   {medical:"Done",   mofa:"Done",   pc:"Done",    finger:"Done",     visa:"Done",   manpower:"Done",  flight:"Done",iqamah:"Done"}),
  makeRow(8,"Roksana Khanam",  "HI8901234","2025-02-01","AI-BOT-01","Processing",  {medical:"Done",   mofa:"Done",   pc:"Done",    finger:"Done",     visa:"Pending",manpower:"—",     flight:"—",   iqamah:"—"   }),
  makeRow(9,"Tofazzal Hossain","IJ9012345","2025-02-03","AI-BOT-02","Processing",  {medical:"Done",   mofa:"Done",   pc:"Done",    finger:"Done",     visa:"Done",   manpower:"Pending",flight:"—",  iqamah:"—"   }),
];

const EMPTY_FORM = {
  name:"", passportNo:"", receivedDate:"", agent:"AI-BOT-01", status:"Processing",
  medical:"—", mofa:"—", pc:"—", finger:"—", visa:"—", manpower:"—", flight:"—", iqamah:"—",
};

// ── ICONS ─────────────────────────────────────────────────────────────────────
const Icon = ({d,size=16}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);
const SearchIcon   = () => <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>;
const PlusIcon     = () => <Icon d="M12 5v14M5 12h14"/>;
const EditIcon     = () => <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" size={13}/>;
const TrashIcon    = () => <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" size={13}/>;
const CloseIcon    = () => <Icon d="M18 6L6 18M6 6l12 12" size={18}/>;
const PassportIcon = () => <Icon d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5zm10 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM6 17h12" size={20}/>;

// Clickable step badge — cycles through statuses
function StepBadge({ value, onClick }) {
  const st = STEP_STYLE[value] || STEP_STYLE["—"];
  const icon = value==="Done" ? "✓" : value==="Failed" ? "✕" : value==="Pending" ? "…" : "–";
  return (
    <span
      onClick={onClick}
      title={`${value} — ক্লিক করে বদলান`}
      style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:28, height:28, borderRadius:8, background:st.bg, color:st.color, fontSize:13, fontWeight:700, cursor:"pointer", userSelect:"none", transition:"transform 0.1s, box-shadow 0.1s" }}
      onMouseEnter={e=>{ e.currentTarget.style.transform="scale(1.22)"; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.15)"; }}
      onMouseLeave={e=>{ e.currentTarget.style.transform="scale(1)";    e.currentTarget.style.boxShadow="none"; }}
    >{icon}</span>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function PassportManager() {
  const [data,         setData]         = useState(INITIAL_DATA);
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterAgent,  setFilterAgent]  = useState("All");
  const [modal,        setModal]        = useState(null);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [delConfirm,   setDelConfirm]   = useState(null);
  const [sortKey,      setSortKey]      = useState("id");
  const [sortDir,      setSortDir]      = useState("asc");
  const [page,         setPage]         = useState(1);
  const PER_PAGE = 8;

  // Stats
  const stats = useMemo(()=>({
    total:      data.length,
    processing: data.filter(d=>d.status==="Processing").length,
    completed:  data.filter(d=>d.status==="Completed").length,
    onHold:     data.filter(d=>d.status==="On Hold").length,
    cancelled:  data.filter(d=>d.status==="Cancelled").length,
  }),[data]);

  // Filtered + sorted
  const filtered = useMemo(()=>{
    let d = data;
    if(search) d = d.filter(r =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.passportNo.toLowerCase().includes(search.toLowerCase())
    );
    if(filterStatus!=="All") d = d.filter(r=>r.status===filterStatus);
    if(filterAgent!=="All")  d = d.filter(r=>r.agent===filterAgent);
    return [...d].sort((a,b)=>{
      let av=a[sortKey]??0, bv=b[sortKey]??0;
      if(typeof av==="string") { av=av.toLowerCase(); bv=bv.toLowerCase(); }
      return sortDir==="asc" ? (av>bv?1:-1) : (av<bv?1:-1);
    });
  },[data,search,filterStatus,filterAgent,sortKey,sortDir]);

  const pages    = Math.max(1, Math.ceil(filtered.length/PER_PAGE));
  const pageData = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const handleSort = k => {
    if(sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc");
    else { setSortKey(k); setSortDir("asc"); }
    setPage(1);
  };

  const openAdd  = ()    => { setForm(EMPTY_FORM); setModal({mode:"add"}); };
  const openEdit = row   => { setForm({...row});   setModal({mode:"edit", row}); };

  const cycleStep = (rowId, stepKey) =>
    setData(d => d.map(r => {
      if(r.id!==rowId) return r;
      const idx  = STEP_STATUS.indexOf(r[stepKey]);
      const next = STEP_STATUS[(idx+1) % STEP_STATUS.length];
      return {...r, [stepKey]:next};
    }));

  const saveForm = () => {
    if(!form.name||!form.passportNo||!form.receivedDate) return alert("নাম, পাসপোর্ট নং ও তারিখ আবশ্যক");
    if(modal.mode==="add") {
      const newId = Math.max(0,...data.map(d=>d.id))+1;
      setData(d=>[...d, {...form, id:newId}]);
    } else {
      setData(d=>d.map(r=>r.id===modal.row.id ? {...form, id:r.id} : r));
    }
    setModal(null);
  };

  const deleteRow = id => { setData(d=>d.filter(r=>r.id!==id)); setDelConfirm(null); };

  const SortArrow = ({k}) => (
    <span style={{opacity:sortKey===k?1:0.22, fontSize:9, marginLeft:3}}>
      {sortKey===k && sortDir==="desc" ? "▼":"▲"}
    </span>
  );

  // Column definitions — order matches the user's request
  const COLS = [
    {k:"id",           label:"SL",           step:false},
    {k:"name",         label:"Name",         step:false},
    {k:"passportNo",   label:"Passport No",  step:false},
    {k:"receivedDate", label:"Received Date",step:false},
    {k:"agent",        label:"Agent",        step:false},
    {k:"medical",      label:"Medical",      step:true},
    {k:"mofa",         label:"Mofa",         step:true},
    {k:"pc",           label:"PC",           step:true},
    {k:"finger",       label:"Finger",       step:true},
    {k:"visa",         label:"Visa",         step:true},
    {k:"manpower",     label:"Manpower",     step:true},
    {k:"flight",       label:"Flight",       step:true},
    {k:"status",       label:"Status",       step:false},
    {k:"iqamah",       label:"Iqamah",       step:true},
  ];

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif", background:"#EDF0F7", minHeight:"100vh", color:"#1a1a2e"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700&family=Space+Mono:wght@700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        button{cursor:pointer;border:none;outline:none;}
        input,select{outline:none;font-family:inherit;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-thumb{background:#c5c7d4;border-radius:4px;}
        .trow:hover{background:#EEF2FF !important;}
        .act{opacity:0;transition:opacity 0.15s;}
        .trow:hover .act{opacity:1;}
        .scard{transition:transform 0.18s,box-shadow 0.18s;}
        .scard:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(0,0,0,0.12) !important;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .modal-box{animation:fadeUp 0.2s ease;}
        th{user-select:none;}
      `}</style>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{background:"linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f3460 100%)", padding:"0 28px", height:62, display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 4px 20px rgba(0,0,0,0.35)"}}>
        <div style={{display:"flex", alignItems:"center", gap:12}}>
          <div style={{background:"linear-gradient(135deg,#e94560,#f5a623)", borderRadius:10, padding:"8px 10px", display:"flex"}}>
            <PassportIcon/>
          </div>
          <div>
            <div style={{fontFamily:"'Space Mono',monospace", fontSize:15, fontWeight:700, color:"#fff", letterSpacing:1}}>PASSPORT AI MANAGER</div>
            <div style={{fontSize:10, color:"#64748b", letterSpacing:2, textTransform:"uppercase"}}>Candidate Tracking System · v1.0</div>
          </div>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:14}}>
          <div style={{fontSize:11, color:"#64748b"}}><span style={{color:"#10b981"}}>● </span>Supabase Ready</div>
          <div style={{width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#e94560,#f5a623)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:13}}>AI</div>
        </div>
      </div>

      <div style={{maxWidth:1700, margin:"0 auto", padding:"22px 20px"}}>

        {/* ── STAT CARDS ─────────────────────────────────────────────────── */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14, marginBottom:20}}>
          {[
            {label:"Total",      value:stats.total,      accent:"#6366F1", tc:"#3730A3"},
            {label:"Processing", value:stats.processing, accent:"#3B82F6", tc:"#1E3A8A"},
            {label:"Completed",  value:stats.completed,  accent:"#10B981", tc:"#065F46"},
            {label:"On Hold",    value:stats.onHold,     accent:"#F59E0B", tc:"#92400E"},
            {label:"Cancelled",  value:stats.cancelled,  accent:"#EF4444", tc:"#991B1B"},
          ].map(s=>(
            <div key={s.label} className="scard" onClick={()=>{setFilterStatus(s.label==="Total"?"All":s.label);setPage(1);}} style={{background:"#fff", borderRadius:14, padding:"16px 18px", boxShadow:"0 2px 8px rgba(0,0,0,0.05)", borderLeft:`4px solid ${s.accent}`, cursor:"pointer"}}>
              <div style={{fontFamily:"'Space Mono',monospace", fontSize:26, fontWeight:700, color:s.tc}}>{s.value}</div>
              <div style={{fontSize:11, color:"#94a3b8", marginTop:3, textTransform:"uppercase", letterSpacing:1}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── MAIN TABLE CARD ─────────────────────────────────────────────── */}
        <div style={{background:"#fff", borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", overflow:"hidden"}}>

          {/* TOOLBAR */}
          <div style={{padding:"14px 18px", borderBottom:"1px solid #F1F5F9", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap"}}>
            <div style={{position:"relative", flex:"1", minWidth:200}}>
              <span style={{position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"#94a3b8"}}><SearchIcon/></span>
              <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="নাম বা পাসপোর্ট নং খুঁজুন…" style={{width:"100%", paddingLeft:36, paddingRight:12, height:36, border:"1.5px solid #E2E8F0", borderRadius:9, fontSize:13, color:"#1a1a2e", background:"#F8FAFC"}}/>
            </div>

            {["All",...MAIN_STATUS].map(s=>(
              <button key={s} onClick={()=>{setFilterStatus(s);setPage(1);}} style={{padding:"5px 13px", borderRadius:18, fontSize:12, fontWeight:500, border:"1.5px solid", borderColor:filterStatus===s?"#4F46E5":"#E2E8F0", background:filterStatus===s?"#4F46E5":"transparent", color:filterStatus===s?"#fff":"#64748b", transition:"all 0.15s"}}>
                {s==="All"?"সব":s}
              </button>
            ))}

            <select value={filterAgent} onChange={e=>{setFilterAgent(e.target.value);setPage(1);}} style={{height:36, border:"1.5px solid #E2E8F0", borderRadius:9, padding:"0 12px", fontSize:12, color:"#475569", background:"#F8FAFC"}}>
              <option value="All">All Agents</option>
              {AGENTS.map(a=><option key={a}>{a}</option>)}
            </select>

            <span style={{fontSize:11, color:"#94a3b8"}}>💡 ব্যাজে ক্লিক = স্ট্যাটাস চেঞ্জ</span>

            <button onClick={openAdd} style={{height:36, padding:"0 16px", background:"linear-gradient(135deg,#4F46E5,#7C3AED)", color:"#fff", borderRadius:9, fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:5, boxShadow:"0 4px 12px rgba(79,70,229,0.28)", marginLeft:"auto"}}>
              <PlusIcon/> নতুন
            </button>
          </div>

          {/* TABLE */}
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%", borderCollapse:"collapse", fontSize:12}}>
              <thead>
                <tr style={{background:"#F8FAFC", borderBottom:"2px solid #E2E8F0"}}>
                  {COLS.map(({k,label,step})=>(
                    <th key={k} onClick={()=>handleSort(k)} style={{padding:"11px 12px", textAlign:step?"center":"left", fontWeight:700, color:"#475569", fontSize:10, textTransform:"uppercase", letterSpacing:0.8, cursor:"pointer", whiteSpace:"nowrap"}}>
                      {label}<SortArrow k={k}/>
                    </th>
                  ))}
                  <th style={{padding:"11px 12px", color:"#475569", fontSize:10, textTransform:"uppercase", letterSpacing:0.8}}>Edit</th>
                </tr>
              </thead>
              <tbody>
                {pageData.length===0 && (
                  <tr><td colSpan={COLS.length+1} style={{padding:40, textAlign:"center", color:"#94a3b8", fontSize:13}}>কোনো ডেটা পাওয়া যায়নি</td></tr>
                )}
                {pageData.map((row, i)=>{
                  const mst = MAIN_STATUS_STYLE[row.status] || MAIN_STATUS_STYLE["Processing"];
                  return (
                    <tr key={row.id} className="trow" style={{borderBottom:"1px solid #F1F5F9", background:i%2===0?"#fff":"#FDFEFF"}}>

                      {/* SL */}
                      <td style={{padding:"11px 12px", fontFamily:"'Space Mono',monospace", fontSize:11, color:"#94a3b8", fontWeight:700}}>{(page-1)*PER_PAGE+i+1}</td>

                      {/* Name */}
                      <td style={{padding:"11px 12px", fontWeight:600, color:"#1e293b", whiteSpace:"nowrap"}}>{row.name}</td>

                      {/* Passport No */}
                      <td style={{padding:"11px 12px"}}>
                        <span style={{fontFamily:"'Space Mono',monospace", fontSize:11, color:"#4F46E5", fontWeight:700}}>{row.passportNo}</span>
                      </td>

                      {/* Received Date */}
                      <td style={{padding:"11px 12px", color:"#64748b", whiteSpace:"nowrap", fontSize:12}}>{row.receivedDate}</td>

                      {/* Agent */}
                      <td style={{padding:"11px 12px"}}>
                        <span style={{padding:"3px 8px", borderRadius:6, background:"#EEF2FF", color:"#4338CA", fontSize:10, fontWeight:600, whiteSpace:"nowrap"}}>{row.agent}</span>
                      </td>

                      {/* Step columns: medical, mofa, pc, finger, visa, manpower, flight */}
                      {["medical","mofa","pc","finger","visa","manpower","flight"].map(k=>(
                        <td key={k} style={{padding:"11px 12px", textAlign:"center"}}>
                          <StepBadge value={row[k]} onClick={()=>cycleStep(row.id,k)}/>
                        </td>
                      ))}

                      {/* Status */}
                      <td style={{padding:"11px 12px", whiteSpace:"nowrap"}}>
                        <span style={{display:"inline-flex", alignItems:"center", gap:4, padding:"4px 9px", borderRadius:20, background:mst.bg, color:mst.color, fontSize:11, fontWeight:600}}>
                          <span style={{width:5,height:5,borderRadius:"50%",background:mst.dot,display:"inline-block"}}/>
                          {row.status}
                        </span>
                      </td>

                      {/* Iqamah */}
                      <td style={{padding:"11px 12px", textAlign:"center"}}>
                        <StepBadge value={row.iqamah} onClick={()=>cycleStep(row.id,"iqamah")}/>
                      </td>

                      {/* Edit / Delete */}
                      <td style={{padding:"11px 12px"}}>
                        <div style={{display:"flex", gap:5}}>
                          <button className="act" onClick={()=>openEdit(row)} style={{width:28,height:28,borderRadius:7,background:"#EEF2FF",color:"#4F46E5",display:"flex",alignItems:"center",justifyContent:"center"}}><EditIcon/></button>
                          <button className="act" onClick={()=>setDelConfirm(row)} style={{width:28,height:28,borderRadius:7,background:"#FEE2E2",color:"#EF4444",display:"flex",alignItems:"center",justifyContent:"center"}}><TrashIcon/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div style={{padding:"12px 18px", borderTop:"1px solid #F1F5F9", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
            <div style={{fontSize:12, color:"#64748b"}}>মোট <b style={{color:"#1e293b"}}>{filtered.length}</b> জন · পেজ {page}/{pages}</div>
            <div style={{display:"flex", gap:5}}>
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{padding:"5px 12px",borderRadius:7,border:"1.5px solid #E2E8F0",background:"#fff",color:"#475569",fontSize:12,opacity:page===1?0.4:1}}>← আগে</button>
              {Array.from({length:pages},(_,i)=>i+1).map(n=>(
                <button key={n} onClick={()=>setPage(n)} style={{width:30,height:30,borderRadius:7,border:"1.5px solid",borderColor:n===page?"#4F46E5":"#E2E8F0",background:n===page?"#4F46E5":"#fff",color:n===page?"#fff":"#475569",fontSize:12,fontWeight:n===page?700:400}}>{n}</button>
              ))}
              <button onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page===pages} style={{padding:"5px 12px",borderRadius:7,border:"1.5px solid #E2E8F0",background:"#fff",color:"#475569",fontSize:12,opacity:page===pages?0.4:1}}>পরে →</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── ADD / EDIT MODAL ─────────────────────────────────────────────── */}
      {modal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(4px)"}}>
          <div className="modal-box" style={{background:"#fff",borderRadius:20,padding:30,width:"min(560px,96vw)",boxShadow:"0 24px 60px rgba(0,0,0,0.22)",maxHeight:"92vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
              <div>
                <h2 style={{fontFamily:"'Space Mono',monospace",fontSize:15,fontWeight:700,color:"#1a1a2e"}}>{modal.mode==="add"?"নতুন ক্যান্ডিডেট":"তথ্য এডিট করুন"}</h2>
                <p style={{fontSize:11,color:"#94a3b8",marginTop:2}}>পাসপোর্ট প্রসেসিং ট্র্যাকার</p>
              </div>
              <button onClick={()=>setModal(null)} style={{width:34,height:34,borderRadius:9,background:"#F1F5F9",color:"#64748b",display:"flex",alignItems:"center",justifyContent:"center"}}><CloseIcon/></button>
            </div>

            {/* Basic info */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}}>
              {[
                {key:"name",         label:"পূর্ণ নাম",      type:"text", ph:"রহিম উদ্দিন", full:true},
                {key:"passportNo",   label:"পাসপোর্ট নং",    type:"text", ph:"AB1234567"},
                {key:"receivedDate", label:"প্রাপ্তির তারিখ", type:"date"},
              ].map(f=>(
                <div key={f.key} style={{gridColumn:f.full?"span 2":"span 1"}}>
                  <label style={{display:"block",fontSize:11,fontWeight:600,color:"#475569",marginBottom:5,textTransform:"uppercase",letterSpacing:0.5}}>{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph||""} style={{width:"100%",height:38,border:"1.5px solid #E2E8F0",borderRadius:9,padding:"0 12px",fontSize:13,color:"#1e293b",background:"#F8FAFC"}}/>
                </div>
              ))}
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:600,color:"#475569",marginBottom:5,textTransform:"uppercase",letterSpacing:0.5}}>AI এজেন্ট</label>
                <select value={form.agent} onChange={e=>setForm(p=>({...p,agent:e.target.value}))} style={{width:"100%",height:38,border:"1.5px solid #E2E8F0",borderRadius:9,padding:"0 12px",fontSize:13,color:"#1e293b",background:"#F8FAFC"}}>
                  {AGENTS.map(a=><option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:600,color:"#475569",marginBottom:5,textTransform:"uppercase",letterSpacing:0.5}}>মেইন স্ট্যাটাস</label>
                <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} style={{width:"100%",height:38,border:"1.5px solid #E2E8F0",borderRadius:9,padding:"0 12px",fontSize:13,color:"#1e293b",background:"#F8FAFC"}}>
                  {MAIN_STATUS.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Step statuses */}
            <div style={{borderTop:"1px solid #F1F5F9",paddingTop:16,marginBottom:16}}>
              <p style={{fontSize:11,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>প্রসেসিং স্টেপস</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                {STEP_KEYS.map(k=>(
                  <div key={k}>
                    <label style={{display:"block",fontSize:11,fontWeight:600,color:"#475569",marginBottom:5,textTransform:"uppercase",letterSpacing:0.5}}>{k.charAt(0).toUpperCase()+k.slice(1)}</label>
                    <select value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} style={{width:"100%",height:34,border:"1.5px solid #E2E8F0",borderRadius:8,padding:"0 10px",fontSize:12,color:"#1e293b",background:"#F8FAFC"}}>
                      {STEP_STATUS.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button onClick={()=>setModal(null)} style={{padding:"9px 18px",borderRadius:9,border:"1.5px solid #E2E8F0",background:"#fff",color:"#64748b",fontSize:13,fontWeight:500}}>বাতিল</button>
              <button onClick={saveForm} style={{padding:"9px 22px",borderRadius:9,background:"linear-gradient(135deg,#4F46E5,#7C3AED)",color:"#fff",fontSize:13,fontWeight:600,boxShadow:"0 4px 12px rgba(79,70,229,0.28)"}}>
                {modal.mode==="add"?"✓ যোগ করুন":"✓ সংরক্ষণ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ───────────────────────────────────────────────── */}
      {delConfirm && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(4px)"}}>
          <div className="modal-box" style={{background:"#fff",borderRadius:20,padding:30,width:"min(380px,95vw)",boxShadow:"0 24px 60px rgba(0,0,0,0.22)",textAlign:"center"}}>
            <div style={{width:52,height:52,borderRadius:"50%",background:"#FEE2E2",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:22}}>🗑️</div>
            <h3 style={{fontFamily:"'Space Mono',monospace",fontSize:14,fontWeight:700,color:"#1a1a2e",marginBottom:8}}>ডিলিট করবেন?</h3>
            <p style={{fontSize:12,color:"#64748b",marginBottom:22}}><b>{delConfirm.name}</b> ({delConfirm.passportNo}) এর সব তথ্য মুছে যাবে।</p>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button onClick={()=>setDelConfirm(null)} style={{padding:"9px 18px",borderRadius:9,border:"1.5px solid #E2E8F0",background:"#fff",color:"#64748b",fontSize:13}}>বাতিল</button>
              <button onClick={()=>deleteRow(delConfirm.id)} style={{padding:"9px 22px",borderRadius:9,background:"#EF4444",color:"#fff",fontSize:13,fontWeight:600}}>হ্যাঁ, মুছুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
