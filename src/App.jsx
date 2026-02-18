import { supabase } from './supabaseClient'
import './App.css'
import { useEffect, useState } from 'react'

function App() {
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
    <>
      <h1 className='text-3xl bg-gray-950 text-white'>Runway passport Management</h1>
      <form onSubmit={addPassport}>
        <input
          placeholder='Name'
          value={name}
          onChange={(e)=>setName(e.target.value)}
          required
        />
        <input
          placeholder='passport number'
          value={passportNumber}
          onChange={(e)=>setPassportNumber(e.target.value)}
          required
        />
        <button type='submit'>add</button>
      </form>
      <table className='w-full text-xs border-collapse'>
        <thead>
        <tr className='bg-slate-50 border-b-2 border-slate-200'>
          {["SL","Name","Passport Number","Received"].map((label) => {
          return <th
            className='px-3 py-2.5 font-bold text-slate-500 text-[10px] uppercase tracking-widest whitespace-nowrap'
          key={label}>{label}</th>;
        })}
        </tr>
        </thead>
        <tbody>
          {passports.map(p =>(
            <tr 
              className='row-hover border-b border-slate-100 bg-white'
            key={p.id}>
              <td className='px-3 py-2.5 mono text-[10px] text-slate-400'>{p.sl}</td>
              <td className='px-3 py-2.5 mono text-[10px] text-slate-400'>{p.name}</td>
              <td className='px-3 py-2.5 mono text-[10px] text-slate-400'>{p.passport_number}</td>
              <td className='px-3 py-2.5 mono text-[10px] text-slate-400'>{p.received_date || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default App
