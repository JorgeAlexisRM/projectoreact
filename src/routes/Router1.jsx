import React from 'react'
import { Routes, Route } from 'react-router-dom'
import RutasPublicas from './RutasPublicas'
import RutasPrivadas from './RutasPrivadas'
import Admin from "../pages/Admin"
import Carro from "../pages/Carro"

const Router1 = () => {
  return (
    <>
      <Routes>
        <Route path="/*" element={<RutasPublicas/>}/>
        <Route path="/admin/*" element={<RutasPrivadas/>}>
          <Route path='' element={<Admin/>} />
        </Route>
        <Route path="/cart" element={<Carro/>}/>
      </Routes>
    </>
  )
}

export default Router1
