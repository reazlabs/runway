import { useState, useMemo } from "react";

/* ─── Tailwind v4 CDN + Google Fonts ────────────────────────────────────── */
const Head = () => (
  <>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=Space+Mono:wght@700&display=swap" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <style>{`
      body { font-family: 'DM Sans', sans-serif; }
      .mono { font-family: 'Space Mono', monospace; }
      .badge-hover { transition: transform 0.12s, box-shadow 0.12s; }
      .badge-hover:hover { transform: scale(1.22); box-shadow: 0 2px 8px rgba(0,0,0,0.18); }
      .row-hover:hover { background-color: #eef2ff !important; }
      .act-btn { opacity: 0; transition: opacity 0.15s; }
      .row-hover:hover .act-btn { opacity: 1; }
      @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      .modal-anim { animation: fadeUp 0.2s ease; }
    `}</style>
  </>
);

/* ─── Data ───────────────────────────────────────────────────────────────── */
const STEP_KEYS    = ["medical","mofa","pc","finger","visa","manpower","flight","iqamah"];
const STEP_CYCLE   = ["—","Pending","Done","Failed"];
const MAIN_STATUS  = ["Processing","Completed","On Hold","Cancelled"];
const AGENTS       = ["AI-BOT-01","AI-BOT-02","AI-BOT-03"];

const STEP_CLS = {
  "—":       "bg-slate-100 text-slate-400",
  "Pending": "bg-amber-100 text-amber-800",
  "Done":    "bg-emerald-100 text-emerald-800",
  "Failed":  "bg-red-100 text-red-800",
};
const STATUS_CLS = {
  Processing: { wrap:"bg-blue-100 text-blue-900",  dot:"bg-blue-500"  },
  Completed:  { wrap:"bg-emerald-100 text-emerald-900", dot:"bg-emerald-500" },
  "On Hold":  { wrap:"bg-amber-100 text-amber-800", dot:"bg-amber-500" },
  Cancelled:  { wrap:"bg-red-100 text-red-900",     dot:"bg-red-500"   },
};

function mkRow(id,name,pp,date,agent,status,steps){
  return {id,name,passportNo:pp,receivedDate:date,agent,status,...steps};
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
const EMPTY = {name:"",passportNo:"",receivedDate:"",agent:"AI-BOT-01",status:"Processing",medical:"—",mofa:"—",pc:"—",finger:"—",visa:"—",manpower:"—",flight:"—",iqamah:"—"};

/* ─── Icons ──────────────────────────────────────────────────────────────── */
const Ico = ({d,s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;
const IcoSearch   = () => <Ico d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>;
const IcoPlus     = () => <Ico d="M12 5v14M5 12h14"/>;
const IcoEdit     = () => <Ico d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" s={13}/>;
const IcoTrash    = () => <Ico d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" s={13}/>;
const IcoClose    = () => <Ico d="M18 6L6 18M6 6l12 12" s={18}/>;
const IcoPassport = () => <Ico d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5zm10 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM6 17h12" s={20}/>;

/* ─── Step Badge ─────────────────────────────────────────────────────────── */
function StepBadge({value, onClick}){
  const cls = STEP_CLS[value] ?? STEP_CLS["—"];
  const icon = value==="Done"?"✓":value==="Failed"?"✕":value==="Pending"?"…":"–";
  return (
    <span onClick={onClick} title={`${value} — ক্লিক করে বদলান`}
      className={`badge-hover inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm font-bold cursor-pointer select-none ${cls}`}>
      {icon}
    </span>
  );
}

/* ─── Label/Input/Select helpers ─────────────────────────────────────────── */
const Lbl = ({children}) => <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{children}</label>;
const Inp = ({...p}) => <input {...p} className="w-full h-9 border border-slate-200 rounded-lg px-3 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"/>;
const Sel = ({children,...p}) => <select {...p} className="w-full h-9 border border-slate-200 rounded-lg px-3 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">{children}</select>;

/* ─── Main ───────────────────────────────────────────────────────────────── */
const PER_PAGE = 8;

export default function PassportManager(){
  const [data,setData]               = useState(SEED);
  const [search,setSearch]           = useState("");
  const [filterStatus,setFilterStatus]= useState("All");
  const [filterAgent,setFilterAgent]  = useState("All");
  const [modal,setModal]             = useState(null);
  const [form,setForm]               = useState(EMPTY);
  const [delRow,setDelRow]           = useState(null);
  const [sortKey,setSortKey]         = useState("id");
  const [sortDir,setSortDir]         = useState("asc");
  const [page,setPage]               = useState(1);

  const stats = useMemo(()=>({
    total:      data.length,
    processing: data.filter(d=>d.status==="Processing").length,
    completed:  data.filter(d=>d.status==="Completed").length,
    onHold:     data.filter(d=>d.status==="On Hold").length,
    cancelled:  data.filter(d=>d.status==="Cancelled").length,
  }),[data]);

  const filtered = useMemo(()=>{
    let d=[...data];
    if(search) d=d.filter(r=>r.name.toLowerCase().includes(search.toLowerCase())||r.passportNo.toLowerCase().includes(search.toLowerCase()));
    if(filterStatus!=="All") d=d.filter(r=>r.status===filterStatus);
    if(filterAgent!=="All")  d=d.filter(r=>r.agent===filterAgent);
    return d.sort((a,b)=>{
      let av=a[sortKey]??"", bv=b[sortKey]??"";
      if(typeof av==="string"){av=av.toLowerCase();bv=bv.toLowerCase();}
      return sortDir==="asc"?(av>bv?1:-1):(av<bv?1:-1);
    });
  },[data,search,filterStatus,filterAgent,sortKey,sortDir]);

  const pages    = Math.max(1,Math.ceil(filtered.length/PER_PAGE));
  const pageData = filtered.slice((page-1)*PER_PAGE,page*PER_PAGE);

  const sort = k=>{if(sortKey===k)setSortDir(d=>d==="asc"?"desc":"asc");else{setSortKey(k);setSortDir("asc");}setPage(1);};
  const Arrow= ({k})=><span className={`ml-0.5 text-[9px] ${sortKey===k?"opacity-100":"opacity-20"}`}>{sortKey===k&&sortDir==="desc"?"▼":"▲"}</span>;

  const openAdd  = ()  =>{setForm(EMPTY);setModal({mode:"add"});};
  const openEdit = row =>{setForm({...row});setModal({mode:"edit",row});};

  const cycleStep=(id,k)=>setData(d=>d.map(r=>{
    if(r.id!==id) return r;
    const next=STEP_CYCLE[(STEP_CYCLE.indexOf(r[k])+1)%STEP_CYCLE.length];
    return {...r,[k]:next};
  }));

  const save=()=>{
    if(!form.name||!form.passportNo||!form.receivedDate){alert("নাম, পাসপোর্ট নং ও তারিখ আবশ্যক");return;}
    if(modal.mode==="add"){
      const id=Math.max(0,...data.map(d=>d.id))+1;
      setData(d=>[...d,{...form,id}]);
    } else {
      setData(d=>d.map(r=>r.id===modal.row.id?{...form,id:r.id}:r));
    }
    setModal(null);
  };

  const del=id=>{setData(d=>d.filter(r=>r.id!==id));setDelRow(null);};

  const COLS=[
    {k:"id",          label:"SL"},
    {k:"name",        label:"Name"},
    {k:"passportNo",  label:"Passport No"},
    {k:"receivedDate",label:"Received Date"},
    {k:"agent",       label:"Agent"},
    {k:"medical",     label:"Medical",  step:true},
    {k:"mofa",        label:"Mofa",     step:true},
    {k:"pc",          label:"PC",       step:true},
    {k:"finger",      label:"Finger",   step:true},
    {k:"visa",        label:"Visa",     step:true},
    {k:"manpower",    label:"Manpower", step:true},
    {k:"flight",      label:"Flight",   step:true},
    {k:"status",      label:"Status"},
    {k:"iqamah",      label:"Iqamah",   step:true},
  ];

  return (
    <>
      <Head/>
      <div className="min-h-screen bg-slate-100">

        {/* ── HEADER ── */}
        <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 h-16 flex items-center justify-between px-7 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-rose-500 to-amber-400 rounded-xl p-2 flex">
              <IcoPassport/>
            </div>
            <div>
              <p className="mono text-white text-sm font-bold tracking-widest">PASSPORT AI MANAGER</p>
              <p className="text-slate-500 text-[10px] tracking-[0.2em] uppercase">Candidate Tracking System · v1.0</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-slate-500"><span className="text-emerald-400">●</span> Supabase Ready</span>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-amber-400 flex items-center justify-center text-white font-bold text-sm">AI</div>
          </div>
        </header>

        <div className="max-w-screen-2xl mx-auto px-5 py-6">

          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            {[
              {label:"Total",      value:stats.total,      border:"border-indigo-500", num:"text-indigo-800",  filter:"All"},
              {label:"Processing", value:stats.processing, border:"border-blue-500",   num:"text-blue-900",    filter:"Processing"},
              {label:"Completed",  value:stats.completed,  border:"border-emerald-500",num:"text-emerald-900", filter:"Completed"},
              {label:"On Hold",    value:stats.onHold,     border:"border-amber-500",  num:"text-amber-800",   filter:"On Hold"},
              {label:"Cancelled",  value:stats.cancelled,  border:"border-red-500",    num:"text-red-900",     filter:"Cancelled"},
            ].map(s=>(
              <div key={s.label} onClick={()=>{setFilterStatus(s.filter);setPage(1);}} className={`bg-white rounded-2xl px-5 py-4 border-l-4 ${s.border} shadow-sm cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-200`}>
                <p className={`mono text-3xl font-bold ${s.num}`}>{s.value}</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── TABLE CARD ── */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
              <div className="relative flex-1 min-w-48">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><IcoSearch/></span>
                <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="নাম বা পাসপোর্ট নং খুঁজুন…" className="w-full h-9 pl-9 pr-3 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"/>
              </div>

              {["All",...MAIN_STATUS].map(s=>(
                <button key={s} onClick={()=>{setFilterStatus(s);setPage(1);}} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${filterStatus===s?"bg-indigo-600 border-indigo-600 text-white":"border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"}`}>
                  {s==="All"?"সব":s}
                </button>
              ))}

              <select value={filterAgent} onChange={e=>{setFilterAgent(e.target.value);setPage(1);}} className="h-9 border border-slate-200 rounded-xl px-3 text-xs text-slate-600 bg-slate-50 focus:outline-none focus:border-indigo-400">
                <option value="All">All Agents</option>
                {AGENTS.map(a=><option key={a}>{a}</option>)}
              </select>

              <span className="text-[11px] text-slate-400 hidden lg:block">💡 ব্যাজে ক্লিক = স্ট্যাটাস চেঞ্জ</span>

              <button onClick={openAdd} className="ml-auto flex items-center gap-1.5 h-9 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-200 transition-all">
                <IcoPlus/> নতুন
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b-2 border-slate-200">
                    {COLS.map(({k,label,step})=>(
                      <th key={k} onClick={()=>sort(k)} className={`px-3 py-2.5 font-bold text-slate-500 text-[10px] uppercase tracking-widest cursor-pointer whitespace-nowrap ${step?"text-center":"text-left"}`}>
                        {label}<Arrow k={k}/>
                      </th>
                    ))}
                    <th className="px-3 py-2.5 text-[10px] text-slate-500 uppercase tracking-widest text-left">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.length===0 && (
                    <tr><td colSpan={COLS.length+1} className="py-12 text-center text-slate-400 text-sm">কোনো ডেটা পাওয়া যায়নি</td></tr>
                  )}
                  {pageData.map((row,i)=>{
                    const mst = STATUS_CLS[row.status]??STATUS_CLS["Processing"];
                    return (
                      <tr key={row.id} className={`row-hover border-b border-slate-100 ${i%2===0?"bg-white":"bg-slate-50/60"}`}>
                        {/* SL */}
                        <td className="px-3 py-2.5 mono text-[10px] font-bold text-slate-400">{(page-1)*PER_PAGE+i+1}</td>
                        {/* Name */}
                        <td className="px-3 py-2.5 font-semibold text-slate-800 whitespace-nowrap">{row.name}</td>
                        {/* Passport No */}
                        <td className="px-3 py-2.5"><span className="mono text-[11px] font-bold text-indigo-600">{row.passportNo}</span></td>
                        {/* Received Date */}
                        <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{row.receivedDate}</td>
                        {/* Agent */}
                        <td className="px-3 py-2.5"><span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-semibold whitespace-nowrap">{row.agent}</span></td>
                        {/* Steps: medical mofa pc finger visa manpower flight */}
                        {["medical","mofa","pc","finger","visa","manpower","flight"].map(k=>(
                          <td key={k} className="px-3 py-2.5 text-center">
                            <StepBadge value={row[k]} onClick={()=>cycleStep(row.id,k)}/>
                          </td>
                        ))}
                        {/* Status */}
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${mst.wrap}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${mst.dot}`}/>
                            {row.status}
                          </span>
                        </td>
                        {/* Iqamah */}
                        <td className="px-3 py-2.5 text-center">
                          <StepBadge value={row.iqamah} onClick={()=>cycleStep(row.id,"iqamah")}/>
                        </td>
                        {/* Actions */}
                        <td className="px-3 py-2.5">
                          <div className="flex gap-1.5">
                            <button className="act-btn w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100" onClick={()=>openEdit(row)}><IcoEdit/></button>
                            <button className="act-btn w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100" onClick={()=>setDelRow(row)}><IcoTrash/></button>
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
              <p className="text-xs text-slate-500">মোট <b className="text-slate-800">{filtered.length}</b> জন · পেজ {page}/{pages}</p>
              <div className="flex gap-1.5">
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-3 h-8 rounded-lg border border-slate-200 text-xs text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 transition-all">← আগে</button>
                {Array.from({length:pages},(_,i)=>i+1).map(n=>(
                  <button key={n} onClick={()=>setPage(n)} className={`w-8 h-8 rounded-lg border text-xs font-semibold transition-all ${n===page?"bg-indigo-600 border-indigo-600 text-white":"border-slate-200 text-slate-600 bg-white hover:bg-slate-50"}`}>{n}</button>
                ))}
                <button onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page===pages} className="px-3 h-8 rounded-lg border border-slate-200 text-xs text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 transition-all">পরে →</button>
              </div>
            </div>
          </div>
        </div>

        {/* ── ADD / EDIT MODAL ── */}
        {modal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="modal-anim bg-white rounded-2xl p-7 w-full max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="mono text-sm font-bold text-slate-900">{modal.mode==="add"?"নতুন ক্যান্ডিডেট":"তথ্য এডিট করুন"}</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">পাসপোর্ট প্রসেসিং ট্র্যাকার</p>
                </div>
                <button onClick={()=>setModal(null)} className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"><IcoClose/></button>
              </div>

              {/* Basic */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="col-span-2"><Lbl>পূর্ণ নাম</Lbl><Inp type="text" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="রহিম উদ্দিন"/></div>
                <div><Lbl>পাসপোর্ট নং</Lbl><Inp type="text" value={form.passportNo} onChange={e=>setForm(p=>({...p,passportNo:e.target.value}))} placeholder="AB1234567"/></div>
                <div><Lbl>প্রাপ্তির তারিখ</Lbl><Inp type="date" value={form.receivedDate} onChange={e=>setForm(p=>({...p,receivedDate:e.target.value}))}/></div>
                <div>
                  <Lbl>AI এজেন্ট</Lbl>
                  <Sel value={form.agent} onChange={e=>setForm(p=>({...p,agent:e.target.value}))}>
                    {AGENTS.map(a=><option key={a}>{a}</option>)}
                  </Sel>
                </div>
                <div>
                  <Lbl>মেইন স্ট্যাটাস</Lbl>
                  <Sel value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>
                    {MAIN_STATUS.map(s=><option key={s}>{s}</option>)}
                  </Sel>
                </div>
              </div>

              {/* Steps */}
              <div className="border-t border-slate-100 pt-4 mb-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">প্রসেসিং স্টেপস</p>
                <div className="grid grid-cols-4 gap-2.5">
                  {STEP_KEYS.map(k=>(
                    <div key={k}>
                      <Lbl>{k.charAt(0).toUpperCase()+k.slice(1)}</Lbl>
                      <Sel value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}>
                        {STEP_CYCLE.map(s=><option key={s}>{s}</option>)}
                      </Sel>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5 justify-end">
                <button onClick={()=>setModal(null)} className="px-5 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 bg-white hover:bg-slate-50 font-medium">বাতিল</button>
                <button onClick={save} className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-md shadow-indigo-200 transition-all">
                  {modal.mode==="add"?"✓ যোগ করুন":"✓ সংরক্ষণ"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DELETE CONFIRM ── */}
        {delRow && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="modal-anim bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-2xl">🗑️</div>
              <h3 className="mono text-sm font-bold text-slate-900 mb-2">ডিলিট করবেন?</h3>
              <p className="text-xs text-slate-500 mb-6"><b>{delRow.name}</b> ({delRow.passportNo}) এর সব তথ্য মুছে যাবে।</p>
              <div className="flex gap-2.5 justify-center">
                <button onClick={()=>setDelRow(null)} className="px-5 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 bg-white hover:bg-slate-50">বাতিল</button>
                <button onClick={()=>del(delRow.id)} className="px-6 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all">হ্যাঁ, মুছুন</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
