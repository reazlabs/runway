import { useState, useMemo } from "react";

/* ── Fonts + Tailwind v4 ──────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <>
    <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet"/>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"/>
    <style>{`
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      :root {
        --radius: 0.5rem;
        --background: #ffffff;
        --foreground: #09090b;
        --muted: #f4f4f5;
        --muted-foreground: #71717a;
        --border: #e4e4e7;
        --input: #e4e4e7;
        --primary: #18181b;
        --primary-fg: #fafafa;
        --accent: #f4f4f5;
        --accent-fg: #18181b;
        --destructive: #ef4444;
        --ring: #a1a1aa;
      }
      body { font-family: 'Geist', sans-serif; background: #fafafa; color: var(--foreground); }
      .mono { font-family: 'Geist Mono', monospace; }

      /* Scrollbar */
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }

      /* Table row hover */
      .trow:hover { background-color: var(--muted) !important; }
      .trow:hover .row-actions { opacity: 1; }
      .row-actions { opacity: 0; transition: opacity 0.1s; }

      /* Badge cycling */
      .step-badge { cursor: pointer; user-select: none; transition: opacity 0.1s; }
      .step-badge:hover { opacity: 0.75; }
      .step-badge:active { opacity: 0.5; }

      /* Modal */
      @keyframes overlayShow { from { opacity: 0; } to { opacity: 1; } }
      @keyframes contentShow { from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
      .overlay { animation: overlayShow 0.15s ease; }
      .dialog  { animation: contentShow 0.2s cubic-bezier(0.16,1,0.3,1); }

      /* Input / Select */
      input, select, button { font-family: 'Geist', sans-serif; }
      input:focus, select:focus { outline: 2px solid var(--foreground); outline-offset: 2px; }

      /* Shadcn-like button focus ring */
      button:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }

      /* Stat card hover */
      .stat-card:hover { background: var(--muted); }
    `}</style>
  </>
);

/* ── Data ─────────────────────────────────────────────────────────────────── */
const STEP_KEYS    = ["medical","mofa","pc","finger","visa","manpower","flight","iqamah"];
const STEP_CYCLE   = ["—","Pending","Done","Failed"];
const MAIN_STATUSES= ["Processing","Completed","On Hold","Cancelled"];
const AGENTS       = ["AI-BOT-01","AI-BOT-02","AI-BOT-03"];

const STEP_STYLE = {
  "—":       { cls: "border border-zinc-200 text-zinc-400 bg-transparent",                 label: "—"       },
  "Pending": { cls: "border border-amber-200 bg-amber-50 text-amber-700",                  label: "Pending" },
  "Done":    { cls: "border border-emerald-200 bg-emerald-50 text-emerald-700",            label: "Done"    },
  "Failed":  { cls: "border border-red-200 bg-red-50 text-red-600",                        label: "Failed"  },
};

const STATUS_STYLE = {
  "Processing": { cls: "border border-blue-200 bg-blue-50 text-blue-700",       dot: "bg-blue-500"    },
  "Completed":  { cls: "border border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  "On Hold":    { cls: "border border-amber-200 bg-amber-50 text-amber-700",    dot: "bg-amber-500"   },
  "Cancelled":  { cls: "border border-red-200 bg-red-50 text-red-600",          dot: "bg-red-500"     },
};

function mkRow(id, name, pp, date, agent, status, steps) {
  return { id, name, passportNo: pp, receivedDate: date, agent, status, ...steps };
}
const SEED = [
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
const EMPTY_FORM = { name:"", passportNo:"", receivedDate:"", agent:"AI-BOT-01", status:"Processing", ...Object.fromEntries(STEP_KEYS.map(k=>[k,"—"])) };

/* ── Icons (Lucide-style) ─────────────────────────────────────────────────── */
const Icon = ({d, s=14, sw=1.75}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);
const ISearch     = () => <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>;
const IPlus       = () => <Icon d="M12 5v14M5 12h14"/>;
const IPencil     = () => <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" s={13}/>;
const ITrash      = () => <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" s={13}/>;
const IChevronUp  = () => <Icon d="M18 15l-6-6-6 6" s={12}/>;
const IChevronDown= () => <Icon d="M6 9l6 6 6-6" s={12}/>;
const IChevronsUD = () => <Icon d="M7 15l5 5 5-5M7 9l5-5 5 5" s={12}/>;
const IX          = () => <Icon d="M18 6L6 18M6 6l12 12" s={14}/>;
const ICheck      = () => <Icon d="M20 6L9 17l-5-5" s={14} sw={2.2}/>;
const IFilter     = () => <Icon d="M4 6h16M8 12h8M11 18h2" s={14}/>;
const IRefresh    = () => <Icon d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M3 21v-5h5" s={13}/>;

/* ── shadcn-like primitive components ────────────────────────────────────── */

// Button variants
const Btn = ({variant="default", size="default", className="", children, ...p}) => {
  const base = "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 cursor-pointer";
  const variants = {
    default:   "bg-zinc-900 text-zinc-50 shadow hover:bg-zinc-800",
    outline:   "border border-zinc-200 bg-white shadow-sm hover:bg-zinc-100 hover:text-zinc-900",
    ghost:     "hover:bg-zinc-100 hover:text-zinc-900 text-zinc-500",
    destructive:"bg-red-500 text-white shadow-sm hover:bg-red-600",
  };
  const sizes = {
    default: "h-9 px-4 py-2",
    sm:      "h-7 px-3 text-xs",
    icon:    "h-8 w-8",
    xs:      "h-6 px-2 text-[11px]",
  };
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...p}>{children}</button>;
};

// Input
const Input = ({className="", ...p}) => (
  <input className={`flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 disabled:opacity-50 ${className}`} {...p}/>
);

// Select
const Select = ({className="", children, ...p}) => (
  <select className={`flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-950 disabled:opacity-50 appearance-none cursor-pointer ${className}`} {...p}>
    {children}
  </select>
);

// Label
const Label = ({children, className=""}) => (
  <label className={`text-xs font-medium text-zinc-700 leading-none ${className}`}>{children}</label>
);

// Badge
const Badge = ({variant="default", className="", children}) => {
  const v = {
    default:   "border-transparent bg-zinc-900 text-zinc-50",
    secondary: "border-transparent bg-zinc-100 text-zinc-900",
    outline:   "text-zinc-700",
  };
  return <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors ${v[variant]||""} ${className}`}>{children}</span>;
};

// Separator
const Sep = ({className=""}) => <div className={`shrink-0 bg-zinc-200 h-px w-full ${className}`}/>;

// Card shells
const Card     = ({className="",children,...p}) => <div className={`rounded-lg border border-zinc-200 bg-white text-zinc-950 shadow-sm ${className}`} {...p}>{children}</div>;
const CardHead = ({className="",children})      => <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
const CardTitle= ({className="",children})      => <h3 className={`font-semibold leading-none tracking-tight text-sm ${className}`}>{children}</h3>;
const CardDesc = ({className="",children})      => <p  className={`text-xs text-zinc-500 ${className}`}>{children}</p>;
const CardCont = ({className="",children})      => <div className={`p-6 pt-0 ${className}`}>{children}</div>;

// Table primitives
const Table     = ({className="",children})  => <div className="w-full overflow-x-auto"><table className={`w-full caption-bottom text-sm ${className}`}>{children}</table></div>;
const TableHead = ({children})               => <thead className="[&_tr]:border-b">{children}</thead>;
const TableBody = ({children})               => <tbody className="[&_tr:last-child]:border-0">{children}</tbody>;
const TableRow  = ({className="",children,...p}) => <tr className={`border-b border-zinc-100 transition-colors hover:bg-zinc-50 data-[state=selected]:bg-zinc-100 ${className}`} {...p}>{children}</tr>;
const TH        = ({className="",children,...p}) => <th className={`h-10 px-3 text-left align-middle font-medium text-zinc-500 text-xs [&:has([role=checkbox])]:pr-0 whitespace-nowrap ${className}`} {...p}>{children}</th>;
const TD        = ({className="",children,...p}) => <td className={`px-3 py-2.5 align-middle [&:has([role=checkbox])]:pr-0 ${className}`} {...p}>{children}</td>;

/* ── Step badge ───────────────────────────────────────────────────────────── */
function StepBadge({value, onClick}) {
  const s = STEP_STYLE[value] ?? STEP_STYLE["—"];
  const icons = {"—":"—","Pending":"○","Done":"✓","Failed":"✕"};
  return (
    <span onClick={onClick} title="Click to cycle status"
      className={`step-badge inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${s.cls}`}>
      <span>{icons[value]}</span>
      {value !== "—" && <span>{value}</span>}
    </span>
  );
}

/* ── Sort button ──────────────────────────────────────────────────────────── */
function SortBtn({label, sortKey, currentKey, currentDir, onSort}) {
  const active = currentKey === sortKey;
  return (
    <button onClick={() => onSort(sortKey)}
      className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors group whitespace-nowrap">
      {label}
      <span className="text-zinc-300 group-hover:text-zinc-500 transition-colors">
        {active ? (currentDir === "asc" ? <IChevronUp/> : <IChevronDown/>) : <IChevronsUD/>}
      </span>
    </button>
  );
}

/* ── Progress ─────────────────────────────────────────────────────────────── */
function Progress({row}) {
  const done  = STEP_KEYS.filter(k => row[k] === "Done").length;
  const total = STEP_KEYS.length;
  const pct   = Math.round((done/total)*100);
  return (
    <div className="flex items-center gap-2 min-w-[72px]">
      <div className="relative flex-1 h-1.5 overflow-hidden rounded-full bg-zinc-100">
        <div className="h-full rounded-full bg-zinc-900 transition-all duration-300" style={{width:`${pct}%`}}/>
      </div>
      <span className="mono text-[10px] text-zinc-400 tabular-nums">{done}/{total}</span>
    </div>
  );
}

/* ── Dialog ───────────────────────────────────────────────────────────────── */
function Dialog({open, onClose, children}) {
  if(!open) return null;
  return (
    <div className="overlay fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]" onClick={onClose}>
      <div className="dialog fixed left-1/2 top-1/2 z-50 w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

/* ── Main App ─────────────────────────────────────────────────────────────── */
const PER = 8;

export default function PassportManager() {
  const [data,          setData]          = useState(SEED);
  const [search,        setSearch]        = useState("");
  const [filterStatus,  setFilterStatus]  = useState("All");
  const [filterAgent,   setFilterAgent]   = useState("All");
  const [modal,         setModal]         = useState(null); // null | {mode:"add"|"edit", row?}
  const [form,          setForm]          = useState(EMPTY_FORM);
  const [delRow,        setDelRow]        = useState(null);
  const [sortKey,       setSortKey]       = useState("id");
  const [sortDir,       setSortDir]       = useState("asc");
  const [page,          setPage]          = useState(1);

  /* Stats */
  const stats = useMemo(() => ({
    total:      data.length,
    processing: data.filter(d=>d.status==="Processing").length,
    completed:  data.filter(d=>d.status==="Completed").length,
    onHold:     data.filter(d=>d.status==="On Hold").length,
    cancelled:  data.filter(d=>d.status==="Cancelled").length,
  }), [data]);

  /* Filtered + sorted */
  const filtered = useMemo(() => {
    let d = [...data];
    if(search) d = d.filter(r =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.passportNo.toLowerCase().includes(search.toLowerCase())
    );
    if(filterStatus !== "All") d = d.filter(r => r.status === filterStatus);
    if(filterAgent  !== "All") d = d.filter(r => r.agent  === filterAgent);
    return d.sort((a,b) => {
      let av=a[sortKey]??"", bv=b[sortKey]??"";
      if(typeof av==="string"){av=av.toLowerCase();bv=bv.toLowerCase();}
      return sortDir==="asc" ? (av>bv?1:-1) : (av<bv?1:-1);
    });
  }, [data, search, filterStatus, filterAgent, sortKey, sortDir]);

  const pages    = Math.max(1, Math.ceil(filtered.length / PER));
  const pageData = filtered.slice((page-1)*PER, page*PER);

  const doSort = k => {
    if(sortKey===k) setSortDir(d => d==="asc"?"desc":"asc");
    else { setSortKey(k); setSortDir("asc"); }
    setPage(1);
  };

  const cycleStep = (id, k) => setData(d => d.map(r => {
    if(r.id !== id) return r;
    return {...r, [k]: STEP_CYCLE[(STEP_CYCLE.indexOf(r[k])+1) % STEP_CYCLE.length]};
  }));

  const openAdd  = ()    => { setForm(EMPTY_FORM); setModal({mode:"add"}); };
  const openEdit = (row) => { setForm({...row});   setModal({mode:"edit", row}); };

  const save = () => {
    if(!form.name || !form.passportNo || !form.receivedDate) { alert("Name, Passport No & Date are required."); return; }
    if(modal.mode === "add") {
      setData(d => [...d, {...form, id: Math.max(0,...d.map(x=>x.id))+1}]);
    } else {
      setData(d => d.map(r => r.id===modal.row.id ? {...form, id:r.id} : r));
    }
    setModal(null);
  };

  const resetFilters = () => { setSearch(""); setFilterStatus("All"); setFilterAgent("All"); setPage(1); };
  const hasFilters   = search || filterStatus!=="All" || filterAgent!=="All";

  return (
    <>
      <GlobalStyles/>
      <div className="min-h-screen bg-zinc-50/60">

        {/* ── Top nav ── */}
        <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
          <div className="max-w-screen-2xl mx-auto flex h-14 items-center justify-between px-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2"><path d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5zm10 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM6 17h12"/></svg>
              </div>
              <span className="font-semibold text-sm text-zinc-900">Passport Manager</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">AI</Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"/>
                Supabase connected
              </span>
              <div className="h-6 w-px bg-zinc-200"/>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-white text-xs font-semibold">A</div>
            </div>
          </div>
        </header>

        <div className="max-w-screen-2xl mx-auto px-6 py-8 space-y-6">

          {/* ── Page header ── */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">Candidates</h1>
              <p className="text-xs text-zinc-500 mt-0.5">Track and manage passport processing candidates</p>
            </div>
            <Btn onClick={openAdd}><IPlus/> Add Candidate</Btn>
          </div>

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-5 gap-3">
            {[
              {label:"Total",      val:stats.total,      f:"All",        accent:"text-zinc-900"},
              {label:"Processing", val:stats.processing, f:"Processing", accent:"text-blue-600"},
              {label:"Completed",  val:stats.completed,  f:"Completed",  accent:"text-emerald-600"},
              {label:"On Hold",    val:stats.onHold,     f:"On Hold",    accent:"text-amber-600"},
              {label:"Cancelled",  val:stats.cancelled,  f:"Cancelled",  accent:"text-red-600"},
            ].map(s => (
              <Card key={s.f} onClick={()=>{setFilterStatus(s.f);setPage(1);}}
                className={`stat-card cursor-pointer transition-colors ${filterStatus===s.f?"ring-1 ring-zinc-900":""}`}>
                <CardHead className="p-4 pb-2">
                  <CardDesc>{s.label}</CardDesc>
                  <p className={`text-2xl font-semibold mono tracking-tight ${s.accent}`}>{s.val}</p>
                </CardHead>
                <CardCont className="px-4 pb-3 pt-0">
                  <div className="h-1 rounded-full bg-zinc-100 overflow-hidden">
                    <div className="h-full bg-zinc-900 rounded-full transition-all duration-500"
                      style={{width: stats.total>0?`${Math.round((s.val/stats.total)*100)}%`:"0%"}}/>
                  </div>
                </CardCont>
              </Card>
            ))}
          </div>

          {/* ── Table card ── */}
          <Card className="overflow-hidden">

            {/* Toolbar */}
            <div className="flex items-center gap-2 p-4 border-b border-zinc-100">
              {/* Search */}
              <div className="relative w-60">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"><ISearch/></span>
                <Input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
                  placeholder="Search name or passport…" className="pl-8 h-8 text-xs"/>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1 rounded-md border border-zinc-200 bg-white p-0.5">
                {["All",...MAIN_STATUSES].map(s => (
                  <button key={s} onClick={()=>{setFilterStatus(s);setPage(1);}}
                    className={`h-7 rounded px-3 text-xs font-medium transition-colors
                      ${filterStatus===s?"bg-zinc-900 text-white shadow-sm":"text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"}`}>
                    {s==="All"?"All":s}
                  </button>
                ))}
              </div>

              {/* Agent */}
              <div className="relative">
                <Select value={filterAgent} onChange={e=>{setFilterAgent(e.target.value);setPage(1);}} className="h-8 text-xs w-36 pr-7">
                  <option value="All">All Agents</option>
                  {AGENTS.map(a=><option key={a}>{a}</option>)}
                </Select>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400"><IChevronDown/></span>
              </div>

              {hasFilters && (
                <Btn variant="ghost" size="sm" onClick={resetFilters} className="text-zinc-400 text-xs h-8">
                  <IRefresh/> Reset
                </Btn>
              )}

              <div className="ml-auto flex items-center gap-2 text-xs text-zinc-400">
                <span className="italic hidden lg:inline">click step badge to cycle</span>
                <Badge variant="secondary" className="mono font-normal">{filtered.length} rows</Badge>
              </div>
            </div>

            {/* Table */}
            <Table>
              <TableHead>
                <tr className="border-b border-zinc-200 bg-zinc-50/80">
                  <TH className="w-10 pl-4">
                    <SortBtn label="SL" sortKey="id" currentKey={sortKey} currentDir={sortDir} onSort={doSort}/>
                  </TH>
                  <TH className="min-w-36">
                    <SortBtn label="Name" sortKey="name" currentKey={sortKey} currentDir={sortDir} onSort={doSort}/>
                  </TH>
                  <TH>
                    <SortBtn label="Passport No" sortKey="passportNo" currentKey={sortKey} currentDir={sortDir} onSort={doSort}/>
                  </TH>
                  <TH>
                    <SortBtn label="Received" sortKey="receivedDate" currentKey={sortKey} currentDir={sortDir} onSort={doSort}/>
                  </TH>
                  <TH>
                    <SortBtn label="Agent" sortKey="agent" currentKey={sortKey} currentDir={sortDir} onSort={doSort}/>
                  </TH>
                  {/* Step group — subtle separator */}
                  <TH className="border-l border-zinc-200">
                    <SortBtn label="Medical" sortKey="medical" currentKey={sortKey} currentDir={sortDir} onSort={doSort}/>
                  </TH>
                  {["mofa","pc","finger","visa","manpower","flight"].map(k=>(
                    <TH key={k}>
                      <SortBtn label={k.charAt(0).toUpperCase()+k.slice(1)} sortKey={k} currentKey={sortKey} currentDir={sortDir} onSort={doSort}/>
                    </TH>
                  ))}
                  <TH className="border-l border-zinc-200">
                    <SortBtn label="Status" sortKey="status" currentKey={sortKey} currentDir={sortDir} onSort={doSort}/>
                  </TH>
                  <TH>
                    <SortBtn label="Iqamah" sortKey="iqamah" currentKey={sortKey} currentDir={sortDir} onSort={doSort}/>
                  </TH>
                  <TH>Progress</TH>
                  <TH className="w-16 text-right pr-4"/>
                </tr>
              </TableHead>

              <TableBody>
                {pageData.length === 0 && (
                  <tr>
                    <td colSpan={18} className="py-20 text-center text-xs text-zinc-400">
                      No candidates found.{" "}
                      {hasFilters && <button onClick={resetFilters} className="underline hover:text-zinc-700">Clear filters</button>}
                    </td>
                  </tr>
                )}

                {pageData.map((row, i) => {
                  const st = STATUS_STYLE[row.status] ?? STATUS_STYLE["Processing"];
                  return (
                    <TableRow key={row.id} className={`trow group ${i%2===0?"":"bg-zinc-50/40"}`}>

                      {/* SL */}
                      <TD className="pl-4 w-10">
                        <span className="mono text-[11px] text-zinc-400 tabular-nums">{String((page-1)*PER+i+1).padStart(2,"0")}</span>
                      </TD>

                      {/* Name */}
                      <TD>
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-semibold text-zinc-600">
                            {row.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}
                          </span>
                          <span className="font-medium text-zinc-900 text-xs whitespace-nowrap">{row.name}</span>
                        </div>
                      </TD>

                      {/* Passport No */}
                      <TD>
                        <span className="mono text-[11px] font-medium text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded">{row.passportNo}</span>
                      </TD>

                      {/* Date */}
                      <TD>
                        <span className="text-xs text-zinc-500 whitespace-nowrap">{row.receivedDate}</span>
                      </TD>

                      {/* Agent */}
                      <TD>
                        <Badge variant="outline" className="text-[10px] font-medium text-zinc-600 whitespace-nowrap">{row.agent}</Badge>
                      </TD>

                      {/* Steps */}
                      {["medical","mofa","pc","finger","visa","manpower","flight"].map((k,si)=>(
                        <TD key={k} className={si===0?"border-l border-zinc-100":""}>
                          <StepBadge value={row[k]} onClick={()=>cycleStep(row.id,k)}/>
                        </TD>
                      ))}

                      {/* Status */}
                      <TD className="border-l border-zinc-100">
                        <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ${st.cls}`}>
                          <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${st.dot}`}/>
                          {row.status}
                        </span>
                      </TD>

                      {/* Iqamah */}
                      <TD><StepBadge value={row.iqamah} onClick={()=>cycleStep(row.id,"iqamah")}/></TD>

                      {/* Progress */}
                      <TD><Progress row={row}/></TD>

                      {/* Actions */}
                      <TD className="pr-4 text-right">
                        <div className="row-actions inline-flex items-center gap-1">
                          <Btn variant="ghost" size="icon" onClick={()=>openEdit(row)} className="h-7 w-7 text-zinc-400">
                            <IPencil/>
                          </Btn>
                          <Btn variant="ghost" size="icon" onClick={()=>setDelRow(row)} className="h-7 w-7 text-zinc-400 hover:text-red-500 hover:bg-red-50">
                            <ITrash/>
                          </Btn>
                        </div>
                      </TD>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100">
              <p className="text-xs text-zinc-500">
                {filtered.length === 0
                  ? "No results"
                  : <>Showing <b className="font-semibold text-zinc-900">{(page-1)*PER+1}–{Math.min(page*PER, filtered.length)}</b> of <b className="font-semibold text-zinc-900">{filtered.length}</b> results</>
                }
              </p>
              <div className="flex items-center gap-1">
                <Btn variant="outline" size="sm" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="h-8 px-3">
                  Previous
                </Btn>
                {Array.from({length:pages},(_,i)=>i+1).map(n=>(
                  <button key={n} onClick={()=>setPage(n)}
                    className={`h-8 w-8 rounded-md text-xs font-medium border transition-colors
                      ${n===page
                        ?"bg-zinc-900 border-zinc-900 text-white"
                        :"border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"}`}>
                    {n}
                  </button>
                ))}
                <Btn variant="outline" size="sm" onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page===pages} className="h-8 px-3">
                  Next
                </Btn>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Add/Edit Dialog ── */}
        <Dialog open={!!modal} onClose={()=>setModal(null)}>
          <Card className="flex flex-col overflow-hidden shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <div>
                <CardTitle>{modal?.mode==="add"?"Add Candidate":"Edit Candidate"}</CardTitle>
                <CardDesc className="mt-0.5">{modal?.mode==="add"?"Create a new passport processing record.":"Update candidate information."}</CardDesc>
              </div>
              <Btn variant="ghost" size="icon" onClick={()=>setModal(null)} className="text-zinc-400 -mr-2"><IX/></Btn>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Basic */}
              <div className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Basic Info</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1.5">
                    <Label>Full Name</Label>
                    <Input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Rahim Uddin"/>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Passport No</Label>
                    <Input value={form.passportNo} onChange={e=>setForm(p=>({...p,passportNo:e.target.value}))} placeholder="AB1234567" className="mono"/>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Received Date</Label>
                    <Input type="date" value={form.receivedDate} onChange={e=>setForm(p=>({...p,receivedDate:e.target.value}))}/>
                  </div>
                  <div className="space-y-1.5">
                    <Label>AI Agent</Label>
                    <div className="relative">
                      <Select value={form.agent} onChange={e=>setForm(p=>({...p,agent:e.target.value}))} className="pr-7">
                        {AGENTS.map(a=><option key={a}>{a}</option>)}
                      </Select>
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400"><IChevronDown/></span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <div className="relative">
                      <Select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} className="pr-7">
                        {MAIN_STATUSES.map(s=><option key={s}>{s}</option>)}
                      </Select>
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400"><IChevronDown/></span>
                    </div>
                  </div>
                </div>
              </div>

              <Sep/>

              {/* Steps */}
              <div className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Processing Steps</p>
                <div className="grid grid-cols-4 gap-2.5">
                  {STEP_KEYS.map(k=>(
                    <div key={k} className="space-y-1.5">
                      <Label>{k.charAt(0).toUpperCase()+k.slice(1)}</Label>
                      <div className="relative">
                        <Select value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} className="pr-5 text-xs h-8">
                          {STEP_CYCLE.map(s=><option key={s}>{s}</option>)}
                        </Select>
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400"><IChevronDown/></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-zinc-100 bg-zinc-50/60">
              <Btn variant="outline" onClick={()=>setModal(null)}>Cancel</Btn>
              <Btn onClick={save}>{modal?.mode==="add"?<><IPlus/>Add Candidate</>:<><ICheck/>Save Changes</>}</Btn>
            </div>
          </Card>
        </Dialog>

        {/* ── Delete confirm ── */}
        <Dialog open={!!delRow} onClose={()=>setDelRow(null)}>
          <Card className="shadow-lg overflow-hidden">
            <div className="p-6">
              <CardTitle className="text-base mb-1">Are you absolutely sure?</CardTitle>
              <CardDesc className="leading-relaxed mt-2">
                This will permanently delete{" "}
                <span className="font-semibold text-zinc-900">{delRow?.name}</span>{" "}
                (<span className="mono text-zinc-600">{delRow?.passportNo}</span>).
                This action cannot be undone.
              </CardDesc>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 pb-6">
              <Btn variant="outline" onClick={()=>setDelRow(null)}>Cancel</Btn>
              <Btn variant="destructive" onClick={()=>{setData(d=>d.filter(r=>r.id!==delRow.id));setDelRow(null);}}>
                <ITrash/> Delete
              </Btn>
            </div>
          </Card>
        </Dialog>

      </div>
    </>
  );
}
