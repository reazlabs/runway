import { supabase } from './supabaseClient'
import './App.css'
import { useEffect, useState } from 'react'

function App() {
  const [name,setName]= useState("");
  const [passportNumber,setPassportNumber] = useState("");
  const [passports,setPassport] = useState([]);

  useEffect(()=>{
    fetchpassport();
  })

  async function fetchpassport() {
    const {data,error} = await supabase
      .from("passports")
      .select("*")
      .order("id",{ascending:false})
      if(!error) setPassport(data)
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
      <table>
        <thead>
        <tr>
          <th>SL</th>
          <th>name</th>
          <th>Passport Number</th>
        </tr>
        </thead>
        <tbody>
          {passports.map(p =>(
            <tr key={p.id}>
              <td>{p.sl}</td>
              <td>{p.name}</td>
              <td>{p.passport_number}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default App
