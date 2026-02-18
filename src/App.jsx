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
    <div className='p-10'>
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
      <table className='min-w-full divide-y divide-gray-200 p-10'>
        <thead className='bg-gray-50'>
        <tr>
          {["SL","Name","Passport Number","Received"].map((label) => {
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App
