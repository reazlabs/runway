import { supabase } from './supabaseClient'
import './App.css'
import { useEffect, useState } from 'react'
import { Icon, Plus, Search } from 'lucide-react';

function App() {
  const stats = [
    {label: "Total", data: 10},
    {label: "Total", data: 10},
    {label: "Total", data: 10},
    {label: "Total", data: 10},
    {label: "Total", data: 10},
  ]
  const [name,setName]= useState("");
  const [passportNumber,setPassportNumber] = useState("");
  const [passports,setPassport] = useState([]);

  useEffect(()=>{
    fetchpassport();
  },[])

  async function fetchpassport() {
  const { data, error } = await supabase
    .from("passports")
    .select("*")
    .order("sl", { ascending: false }) 

  if (!error) setPassport(data)
}
  async function addPassport(e) {
    e.preventDefault();
    const {error} = await supabase
      .from("passports")
      .insert([
        {
          name: name,
          passport_number: passportNumber
        }
      ])
      if(error){
        alert(error.message)
      }else{
        alert("passport added")
        setName("")
        setPassportNumber("")
        fetchpassport()
      }
  }
  return (
    <div className='p-10'>
      <div className=''>
      <h1 className='text-3xl bg-gray-950 text-white p-1 sticky'>Runway passport Management</h1>
      <form 
      className='p-5 gap-3'
      onSubmit={addPassport}>
        <input
          placeholder='Name'
          value={name}
          onChange={(e)=>setName(e.target.value)}
          className='p-2'
          required
          />
        <input
          placeholder='passport number'
          value={passportNumber}
          onChange={(e)=>setPassportNumber(e.target.value)}
          className='p-2'
          required
        />
        <button type='submit' className='p-2 bg-black text-white'>add</button>
      </form>
      </div>
      {/* Stat card */}
      <div className='grid grid-cols-5 gap-4 mb-6'>
        {stats.map(s=>(
          <div className='bg-white rounded-2xl px-5 py-4 border-1'>
            <p className='mono text-3xl font-bold'>{s.data}</p>
            <p className='text-[10px] text-gray-400 mt-1 uppercase '>{s.label}</p>
          </div>
        ))}
      </div>
      {/* Toolbar */}
      <div className='flex flex-wrap items-center gap-2.5 px-5 py-3.5 border-b border-gray-100'>
        <div className='relative flex-1 min-w-48'>
          <span className='absolute  left-3 top-1/2 -translate-y-0.5'><Search /></span>
          <input className='w-full  h-9 pl-9 pr-3  border border-gray-500 rounded-xl text-sm text-gray-800 bg-gray-50 focus:outline-none '/>
        </div>
        {["All","Pending","Complete"].map(s=>(
          <button className='px-3 py-1.5 rounded-full  font-semibold border transition-all duration-150'>{s}</button>
        ))}
        <select className='h-9 border border-gray-200 rounded-xl px-3 text-gray-600 bg-gray-50 '>
          <option>All Agent</option>
          <option>Rahman</option>
          <option>Tarek</option>
          <option>Lokman</option>
        </select>
        <span>Badge</span>
        <button className='ml-auto flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-semibold shadow-md'>
          <Plus /> New
        </button>
      </div>
      <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
        <table className='min-w-full divide-y divide-gray-200 p-10'>
          <thead className='bg-gray-50'>
          <tr>
            {["SL","Name","Passport Number","Received","Med","Mofa","PC","Finger","Visa","Manpower","Flight","Iqamah","Action"].map((label) => {
            return <th
              className='px-6 py-3.5 text-left text-sm font-semibold text-gray-900'
            key={label}>{label}</th>;
          })}
          </tr>
          </thead>
          <tbody className='divide-y divide-gray-200 bg-white'>
            {passports.map(p =>(
              <tr 
                className=''
              key={p.id}>
                <td className='whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900'>{p.sl}</td>
                <td className='whitespace-nowrap py-4 pl-6 pr-3 text-sm  text-gray-900'>{p.name}</td>
                <td className='whitespace-nowrap py-4 pl-6 pr-3 text-sm  text-gray-900'>{p.passport_number}</td>
                <td className='whitespace-nowrap py-4 pl-6 pr-3 text-sm  text-gray-900'>{p.received_date || "-"}</td>
                <td className='whitespace-nowrap py-4 pl-6 pr-3 text-sm  text-gray-900'>{p.received_date || "-"}</td>
                <td className='whitespace-nowrap py-4 pl-6 pr-3 text-sm  text-gray-900'>{p.received_date || "-"}</td>
                <td className='whitespace-nowrap py-4 pl-6 pr-3 text-sm  text-gray-900'>{p.received_date || "-"}</td>
                <td className='whitespace-nowrap py-4 pl-6 pr-3 text-sm  text-gray-900'>{p.received_date || "-"}</td>
                <td className='whitespace-nowrap py-4 pl-6 pr-3 text-sm  text-gray-900'>{p.received_date || "-"}</td>
                <td className='whitespace-nowrap py-4 pl-6 pr-3 text-sm  text-gray-900'>{p.received_date || "-"}</td>
                <td className='whitespace-nowrap py-4 pl-6 pr-3 text-sm  text-gray-900'>{p.received_date || "-"}</td>
                <td className='whitespace-nowrap py-4 pl-6 pr-3 text-sm  text-gray-900'>{p.received_date || "-"}</td>
                <td className='whitespace-nowrap py-4 pl-6 pr-3 text-sm  text-gray-900'>:</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className='flex justify-between'>

      <div className='mt-6 text-center text-sm text-gray-500'>
        Last updated: {new Date().toLocaleDateString}
      </div>
      <div className='flex items-center justify-between px-5 py-3 border-t border-gray-500'>
        <p>Total</p>
        <div className='flex gap-1.5'>
          <button>prev</button>
          <button>1</button>
          <button>2</button>
          <button>3</button>
          <button>4</button>
          <button>Next</button>
        </div>
      </div>
      </div>
    </div>
  )
}

export default App
