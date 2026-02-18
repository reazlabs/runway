import { useState, useMemo } from "react";

const Head = () => (
  <>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@600&display=swap" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <style>{`
      * { font-family: 'Inter', sans-serif; }
      .mono { font-family: 'JetBrains Mono', monospace; }

      /* Scrollbar */
      ::-webkit-scrollbar { width: 4px; height: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }

      /* Badge hover */
      .step-badge { transition: transform 0.12s cubic-bezier(.34,1.56,.64,1), box-shadow 0.12s; }
      .step-badge:hover { transform: scale(1.3); box-shadow: 0 4px 12px rgba(0,0,0,0.12); }

      /* Row hover */
      .data-row { transition: background 0.1s; }
      .data-row:hover { background: #f8faff !important; }
      .data-row:hover .row-actions { opacity: 1; }
      .row-actions { opacity: 0; transition: opacity 0.15s; }

      /* Stat card */
      .stat-card { transition: transform 0.2s cubic-bezier(.34,1.2,.64,1), box-shadow 0.2s; }
      .stat-card:hover { transform: translateY(-4px); }

      /* Modal */
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(16px) scale(0.98); }
        to   { opacity: 1; transform: translateY(0)   scale(1); }
      }
      .modal-enter { animation: slideUp 0.24s cubic-bezier(.34,1.1,.64,1); }

      /* Overlay */
      @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
      .overlay-enter { animation: fadeIn 0.18s ease; }

      /* Focus ring */
      input:focus, select:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }

      /* Sidebar progress dots */
      .progress-dot { transition: all 0.2s; }
    `}</style>
  </>
);

/* ─── Constants ──────────────────────────────────────────────────────────── */
const STEP_KEYS   = ["medical","mofa","pc","finger","visa","manpower","flight","iqamah"];
const STEP_CYCLE  = ["—","Pending","Done","Failed"];
const MAIN_STATUS = ["Processing","Completed","On Hold","Cancelled"];
const AGENTS      = ["AI-BOT-01","AI-BOT-02","AI-BOT-03"];

const STEP_META = {
  "—":       { cls:"bg-slate-100 text-slate-400",          icon:"–",  dot:"bg-slate-300"   },
  "Pending": { cls:"bg-amber-50 text-amber-600 ring-1 ring-amber-200",  icon:"○",  dot:"bg-amber-400"   },
  "Done":    { cls:"bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200",icon:"✓", dot:"bg-emerald-500" },
  "Failed":  { cls:"bg-red-50 text-red-500 ring-1 ring-red-200",       icon:"✕",  dot:"bg-red-400"     },
};

const STATUS_META = {
  "Processing": { badge:"bg-blue-50 text-blue-700 ring-1 ring-blue-200",     dot:"bg-blue-500",    label:"Processing" },
  "Completed":  { badge:"bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot:"bg-emerald-500", label:"Completed"  },
  "On Hold":    { badge:"bg-amber-50 text-amber-600 ring-1 ring-amber-200",   dot:"bg-amber-400",   label:"On Hold"    },
  "Cancelled":  { badge:"bg-red-50 text-red-600 ring-1 ring-red-200",         dot:"bg-red-400",     label:"Cancelled"  },
};

const STAT_CARDS = [
  { label:"Total",      key:"total",      color:"indigo",  icon:"📋" },
  { label:"Processing", key:"processing", color:"blue",    icon:"⚙️"  },
  { label:"Completed",  key:"completed",  color:"emerald", icon:"✅"  },
  { label:"On Hold",    key:"onHold",     color:"amber",   icon:"⏸️"  },
  { label:"Cancelled",  key:"cancelled",  color:"red",     icon:"❌"  },
];

const COLOR_MAP = {
  indigo:  { bar:"bg-indigo-500",  txt:"text-indigo-700",  bg:"bg-indigo-50",  ring:"ring-indigo-100" },
  blue:    { bar:"bg-blue-500",    txt:"text-blue-700",    bg:"bg-blue-50",    ring:"ring-blue-100"   },
  emerald: { bar:"bg-emerald-500", txt:"text-emerald-700", bg:"bg-emerald-50", ring:"ring-emerald-100"},
  amber:   { bar:"bg-amber-400",   txt:"text-amber-700",   bg:"bg-amber-50",   ring:"ring-amber-100"  },
  red:     { bar:"bg-red-400",     txt:"text-red-700",     bg:"bg-red-50",     ring:"ring-red-100"    },
};

/* ─── Seed data ──────────────────────────────────────────────────────────── */
function mkRow(id,name,pp,date,agent,status,steps){
  return {id,name,passportNo:pp,receivedDate:date,agent,status,...steps};
}
const SEED=[
  mkRow(1,"Rahim Uddin",     "AB1234567","2025-01-10","AI-BOT-01","Processing", {medical:"Done",   mofa:"Done",    pc:"Pending",finger:"Pending",visa:"—",      manpower:"—",      flight:"—",   iqamah:"—"   }),
  mkRow(2,"Fatema Begum",    "BC2345678","2025-01-12","AI-BOT-02","Processing", {medical:"Done",   mofa:"Pending", pc:"—",      finger:"—",      visa:"—",      manpower:"—",      flight:"—",   iqamah:"—"   }),
  mkRow(3,"Karim Hossain",   "CD3456789","2025-01-08","AI-BOT-01","Completed",  {medical:"Done",   mofa:"Done",    pc:"Done",   finger:"Done",   visa:"Done",   manpower:"Done",   flight:"Done",iqamah:"Done"}),
  mkRow(4,"Nasrin Akter",    "DE4567890","2025-01-15","AI-BOT-03","Cancelled",  {medical:"Done",   mofa:"Failed",  pc:"—",      finger:"—",      visa:"—",      manpower:"—",      flight:"—",   iqamah:"—"   }),
  mkRow(5,"Sohel Rana",      "EF5678901","2025-01-17","AI-BOT-02","Processing", {medical:"Pending",mofa:"—",       pc:"—",      finger:"—",      visa:"—",      manpower:"—",      flight:"—",   iqamah:"—"   }),
  mkRow(6,"Mitu Islam",      "FG6789012","2025-01-19","AI-BOT-01","On Hold",    {medical:"Done",   mofa:"Done",    pc:"Done",   finger:"Failed", visa:"—",      manpower:"—",      flight:"—",   iqamah:"—"   }),
  mkRow(7,"Jahir Ahmed",     "GH7890123","2025-01-05","AI-BOT-03","Completed",  {medical:"Done",   mofa:"Done",    pc:"Done",   finger:"Done",   visa:"Done",   manpower:"Done",   flight:"Done",iqamah:"Done"}),
  mkRow(8,"Roksana Khanam",  "HI8901234","2025-02-01","AI-BOT-01","Processing", {medical:"Done",   mofa:"Done",    pc:"Done",   finger:"Done",   visa:"Pending",manpower:"—",      flight:"—",   iqamah:"—"   }),
  mkRow(9,"Tofazzal Hossain","IJ9012345","2025-02-03","AI-BOT-02","Processing", {medical:"Done",   mofa:"Done",    pc:"Done",   finger:"Done",   visa:"Done",   manpower:"Pending",flight:"—",   iqamah:"—"   }),
];
const EMPTY={name:"",passportNo:"",receivedDate:"",agent:"AI-BOT-01",status:"Processing",...Object.fromEntries(STEP_KEYS.map(k=>[k,"—"]))};

/* ─── Tiny components ────────────────────────────────────────────────────── */
const Ico=({d,s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;
const ISearch  =()=><Ico d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>;
const IPlus    =()=><Ico d="M12 5v14M5 12h14"/>;
const IEdit    =()=><Ico d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" s={13}/>;
const ITrash   =()=><Ico d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" s={13}/>;
const IClose   =()=><Ico d="M18 6L6 18M6 6l12 12"/>;
const IChevron =({dir="down"})=><Ico d={dir==="down"?"M6 9l6 6 6-6":"M18 15l-6-6-6 6"} s={14}/>;
const IFilter  =()=><Ico d="M4 6h16M8 12h8M11 18h2" s={15}/>;

/* ─── Step Badge ─────────────────────────────────────────────────────────── */
function StepBadge({value,onClick}){
  const m=STEP_META[value]??STEP_META["—"];
  return(
    <span onClick={onClick} title={`${value} — click to cycle`}
      className={`step-badge inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-semibold cursor-pointer select-none ${m.cls}`}>
      {m.icon}
    </span>
  );
}

/* ─── Progress bar for steps ─────────────────────────────────────────────── */
function StepProgress({row}){
  const done=STEP_KEYS.filter(k=>row[k]==="Done").length;
  const total=STEP_KEYS.length;
  const pct=Math.round((done/total)*100);
  return(
    <div className="flex items-center gap-2 min-w-[72px]">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500" style={{width:`${pct}%`}}/>
      </div>
      <span className="text-[10px] text-slate-400 mono">{done}/{total}</span>
    </div>
  );
}

/* ─── Field wrapper ──────────────────────────────────────────────────────── */
const Field=({label,children})=>(
  <div>
    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
    {children}
  </div>
);
const Input=({...p})=><input {...p} className="w-full h-9 border border-slate-200 rounded-xl px-3 text-sm text-slate-800 bg-white placeholder:text-slate-300 transition-all"/>;
const Select=({children,...p})=><select {...p} className="w-full h-9 border border-slate-200 rounded-xl px-3 text-sm text-slate-700 bg-white transition-all appearance-none cursor-pointer">{children}</select>;

/* ─── Main ───────────────────────────────────────────────────────────────── */
const PER=8;

export default function App(){
  const[data,setData]                 =useState(SEED);
  const[search,setSearch]             =useState("");
  const[filterStatus,setFilterStatus] =useState("All");
  const[filterAgent,setFilterAgent]   =useState("All");
  const[modal,setModal]               =useState(null);
  const[form,setForm]                 =useState(EMPTY);
  const[delRow,setDelRow]             =useState(null);
  const[sortKey,setSortKey]           =useState("id");
  const[sortDir,setSortDir]           =useState("asc");
  const[page,setPage]                 =useState(1);
  const[showFilters,setShowFilters]   =useState(false);

  const stats=useMemo(()=>({
    total:data.length,
    processing:data.filter(d=>d.status==="Processing").length,
    completed:data.filter(d=>d.status==="Completed").length,
    onHold:data.filter(d=>d.status==="On Hold").length,
    cancelled:data.filter(d=>d.status==="Cancelled").length,
  }),[data]);

  const filtered=useMemo(()=>{
    let d=[...data];
    if(search) d=d.filter(r=>r.name.toLowerCase().includes(search.toLowerCase())||r.passportNo.toLowerCase().includes(search.toLowerCase()));
    if(filterStatus!=="All") d=d.filter(r=>r.status===filterStatus);
    if(filterAgent!=="All")  d=d.filter(r=>r.agent===filterAgent);
    return d.sort((a,b)=>{
      let av=a[sortKey]??"",bv=b[sortKey]??"";
      if(typeof av==="string"){av=av.toLowerCase();bv=bv.toLowerCase();}
      return sortDir==="asc"?(av>bv?1:-1):(av<bv?1:-1);
    });
  },[data,search,filterStatus,filterAgent,sortKey,sortDir]);

  const pages=Math.max(1,Math.ceil(filtered.length/PER));
  const pageData=filtered.slice((page-1)*PER,page*PER);

  const doSort=k=>{
    if(sortKey===k)setSortDir(d=>d==="asc"?"desc":"asc");
    else{setSortKey(k);setSortDir("asc");}
    setPage(1);
  };

  const cycleStep=(id,k)=>setData(d=>d.map(r=>{
    if(r.id!==id)return r;
    const next=STEP_CYCLE[(STEP_CYCLE.indexOf(r[k])+1)%STEP_CYCLE.length];
    return{...r,[k]:next};
  }));

  const save=()=>{
    if(!form.name||!form.passportNo||!form.receivedDate){alert("নাম, পাসপোর্ট নং ও তারিখ আবশ্যক");return;}
    if(modal.mode==="add"){
      setData(d=>[...d,{...form,id:Math.max(0,...data.map(d=>d.id))+1}]);
    }else{
      setData(d=>d.map(r=>r.id===modal.row.id?{...form,id:r.id}:r));
    }
    setModal(null);
  };

  const TH=({k,children,center=false})=>(
    <th onClick={()=>doSort(k)} className={`px-3 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest cursor-pointer select-none whitespace-nowrap ${center?"text-center":"text-left"} hover:text-slate-600 transition-colors`}>
      <span className="inline-flex items-center gap-1">
        {children}
        {sortKey===k
          ?<span className="text-indigo-500">{sortDir==="asc"?"↑":"↓"}</span>
          :<span className="opacity-0 group-hover:opacity-40">↑</span>}
      </span>
    </th>
  );

  return(
    <>
      <Head/>
      <div className="min-h-screen bg-[#f5f6fa]">

        {/* ── NAV ── */}
        <nav className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5zm10 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM6 17h12"/></svg>
            </div>
            <div>
              <span className="font-semibold text-slate-800 text-sm">Passport Manager</span>
              <span className="ml-2 text-[10px] bg-indigo-50 text-indigo-600 font-semibold px-1.5 py-0.5 rounded-md">AI</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"/>
              Supabase
            </div>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">A</div>
          </div>
        </nav>

        <div className="max-w-screen-2xl mx-auto px-5 pt-6 pb-10">

          {/* ── PAGE TITLE ── */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Dashboard</p>
              <h1 className="text-xl font-semibold text-slate-800">Candidate Overview</h1>
            </div>
            <button onClick={()=>{setForm(EMPTY);setModal({mode:"add"});}} className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-md shadow-indigo-200/60 transition-all active:scale-95">
              <IPlus/> Add Candidate
            </button>
          </div>

          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            {STAT_CARDS.map(s=>{
              const c=COLOR_MAP[s.color];
              const val=stats[s.key];
              const pct=stats.total>0?Math.round((val/stats.total)*100):0;
              const active=filterStatus===(s.key==="total"?"All":s.label);
              return(
                <div key={s.key} onClick={()=>{setFilterStatus(s.key==="total"?"All":s.label);setPage(1);}}
                  className={`stat-card bg-white rounded-2xl p-4 cursor-pointer border transition-all duration-200 ${active?`ring-2 ring-indigo-400 border-indigo-200 shadow-lg shadow-indigo-100/60`:"border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-lg">{s.icon}</span>
                    <span className={`mono text-xs font-semibold ${c.txt} ${c.bg} px-1.5 py-0.5 rounded-md`}>{pct}%</span>
                  </div>
                  <p className={`mono text-2xl font-bold ${c.txt}`}>{val}</p>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">{s.label}</p>
                  <div className="mt-2.5 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${c.bar} rounded-full transition-all duration-500`} style={{width:`${pct}%`}}/>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── TABLE CARD ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            {/* Toolbar */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100">
              {/* Search */}
              <div className="relative flex-1 max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"><ISearch/></span>
                <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search name or passport…"
                  className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-300 transition-all"/>
              </div>

              {/* Status pills */}
              <div className="flex items-center gap-1.5 border-l border-slate-100 pl-3">
                {["All",...MAIN_STATUS].map(s=>{
                  const active=filterStatus===s;
                  return(
                    <button key={s} onClick={()=>{setFilterStatus(s);setPage(1);}}
                      className={`px-3 h-7 rounded-lg text-xs font-medium transition-all ${active?"bg-indigo-600 text-white shadow-sm":"text-slate-500 hover:bg-slate-100 hover:text-slate-700"}`}>
                      {s==="All"?"All":s}
                    </button>
                  );
                })}
              </div>

              {/* Agent */}
              <div className="relative border-l border-slate-100 pl-3">
                <select value={filterAgent} onChange={e=>{setFilterAgent(e.target.value);setPage(1);}}
                  className="h-8 pl-3 pr-7 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl appearance-none cursor-pointer focus:outline-none">
                  <option value="All">All Agents</option>
                  {AGENTS.map(a=><option key={a}>{a}</option>)}
                </select>
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><IChevron/></span>
              </div>

              <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-400">
                <span className="hidden lg:block">click badge to cycle status</span>
                <span className="px-2 h-5 bg-slate-100 rounded text-slate-400 font-mono text-[10px] flex items-center">{filtered.length} rows</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <TH k="id">SL</TH>
                    <TH k="name">Name</TH>
                    <TH k="passportNo">Passport No</TH>
                    <TH k="receivedDate">Received</TH>
                    <TH k="agent">Agent</TH>
                    <TH k="medical" center>Medical</TH>
                    <TH k="mofa" center>Mofa</TH>
                    <TH k="pc" center>PC</TH>
                    <TH k="finger" center>Finger</TH>
                    <TH k="visa" center>Visa</TH>
                    <TH k="manpower" center>Manpower</TH>
                    <TH k="flight" center>Flight</TH>
                    <TH k="status">Status</TH>
                    <TH k="iqamah" center>Iqamah</TH>
                    <th className="px-3 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-left">Progress</th>
                    <th className="px-3"/>
                  </tr>
                </thead>
                <tbody>
                  {pageData.length===0&&(
                    <tr><td colSpan={16} className="py-16 text-center text-slate-300 text-sm">No records found</td></tr>
                  )}
                  {pageData.map((row,i)=>{
                    const st=STATUS_META[row.status]??STATUS_META["Processing"];
                    return(
                      <tr key={row.id} className={`data-row border-b border-slate-50 ${i%2===0?"bg-white":"bg-slate-50/40"}`}>
                        {/* SL */}
                        <td className="px-3 py-3">
                          <span className="mono text-[11px] text-slate-300 font-semibold">{String((page-1)*PER+i+1).padStart(2,"0")}</span>
                        </td>
                        {/* Name */}
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                              {row.name.charAt(0)}
                            </div>
                            <span className="font-medium text-slate-700 whitespace-nowrap">{row.name}</span>
                          </div>
                        </td>
                        {/* Passport No */}
                        <td className="px-3 py-3">
                          <span className="mono text-[11px] font-semibold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg">{row.passportNo}</span>
                        </td>
                        {/* Date */}
                        <td className="px-3 py-3 text-slate-400 whitespace-nowrap">{row.receivedDate}</td>
                        {/* Agent */}
                        <td className="px-3 py-3">
                          <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-lg whitespace-nowrap">{row.agent}</span>
                        </td>
                        {/* Step badges */}
                        {["medical","mofa","pc","finger","visa","manpower","flight"].map(k=>(
                          <td key={k} className="px-2 py-3 text-center">
                            <StepBadge value={row[k]} onClick={()=>cycleStep(row.id,k)}/>
                          </td>
                        ))}
                        {/* Status */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${st.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}/>
                            {row.status}
                          </span>
                        </td>
                        {/* Iqamah */}
                        <td className="px-2 py-3 text-center">
                          <StepBadge value={row.iqamah} onClick={()=>cycleStep(row.id,"iqamah")}/>
                        </td>
                        {/* Progress */}
                        <td className="px-3 py-3"><StepProgress row={row}/></td>
                        {/* Actions */}
                        <td className="px-3 py-3">
                          <div className="row-actions flex items-center gap-1">
                            <button onClick={()=>{setForm({...row});setModal({mode:"edit",row});}} className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-colors"><IEdit/></button>
                            <button onClick={()=>setDelRow(row)} className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"><ITrash/></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
              <p className="text-xs text-slate-400">Showing <b className="text-slate-600">{(page-1)*PER+1}–{Math.min(page*PER,filtered.length)}</b> of <b className="text-slate-600">{filtered.length}</b></p>
              <div className="flex items-center gap-1">
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="w-8 h-8 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center justify-center bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <IChevron dir="up"/>
                </button>
                {Array.from({length:pages},(_,i)=>i+1).map(n=>(
                  <button key={n} onClick={()=>setPage(n)} className={`w-8 h-8 rounded-xl text-xs font-semibold border transition-all ${n===page?"bg-indigo-600 border-indigo-600 text-white shadow-sm":"border-slate-200 text-slate-500 bg-white hover:bg-slate-50"}`}>{n}</button>
                ))}
                <button onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page===pages} className="w-8 h-8 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center justify-center bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <IChevron/>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── ADD/EDIT MODAL ── */}
        {modal&&(
          <div className="overlay-enter fixed inset-0 bg-slate-900/40 backdrop-blur-[3px] flex items-center justify-center z-50 p-4">
            <div className="modal-enter bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">

              {/* Modal header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    {modal.mode==="add"?<IPlus/>:<IEdit/>}
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-800 text-sm">{modal.mode==="add"?"New Candidate":"Edit Record"}</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Passport Processing Tracker</p>
                  </div>
                </div>
                <button onClick={()=>setModal(null)} className="w-8 h-8 rounded-xl text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-colors"><IClose/></button>
              </div>

              {/* Modal body */}
              <div className="p-6 space-y-5">
                {/* Basic */}
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Basic Info</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Field label="Full Name"><Input type="text" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Rahim Uddin"/></Field>
                    </div>
                    <Field label="Passport No"><Input type="text" value={form.passportNo} onChange={e=>setForm(p=>({...p,passportNo:e.target.value}))} placeholder="AB1234567"/></Field>
                    <Field label="Received Date"><Input type="date" value={form.receivedDate} onChange={e=>setForm(p=>({...p,receivedDate:e.target.value}))}/></Field>
                    <Field label="AI Agent">
                      <Select value={form.agent} onChange={e=>setForm(p=>({...p,agent:e.target.value}))}>
                        {AGENTS.map(a=><option key={a}>{a}</option>)}
                      </Select>
                    </Field>
                    <Field label="Status">
                      <Select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>
                        {MAIN_STATUS.map(s=><option key={s}>{s}</option>)}
                      </Select>
                    </Field>
                  </div>
                </div>

                {/* Steps */}
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Processing Steps</p>
                  <div className="grid grid-cols-4 gap-2.5">
                    {STEP_KEYS.map(k=>(
                      <Field key={k} label={k.charAt(0).toUpperCase()+k.slice(1)}>
                        <Select value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}>
                          {STEP_CYCLE.map(s=><option key={s}>{s}</option>)}
                        </Select>
                      </Field>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl">
                <button onClick={()=>setModal(null)} className="h-9 px-5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 bg-white hover:bg-slate-100 transition-colors">Cancel</button>
                <button onClick={save} className="h-9 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-200/60 transition-all active:scale-95">
                  {modal.mode==="add"?"Add Candidate":"Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DELETE CONFIRM ── */}
        {delRow&&(
          <div className="overlay-enter fixed inset-0 bg-slate-900/40 backdrop-blur-[3px] flex items-center justify-center z-50 p-4">
            <div className="modal-enter bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">Delete record?</h3>
                <p className="text-xs text-slate-400 leading-relaxed"><span className="font-medium text-slate-600">{delRow.name}</span> ({delRow.passportNo})<br/>This action cannot be undone.</p>
              </div>
              <div className="flex border-t border-slate-100">
                <button onClick={()=>setDelRow(null)} className="flex-1 h-11 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors border-r border-slate-100">Cancel</button>
                <button onClick={()=>{setData(d=>d.filter(r=>r.id!==delRow.id));setDelRow(null);}} className="flex-1 h-11 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">Delete</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
