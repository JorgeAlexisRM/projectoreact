import React from 'react'
import { Routes, Route } from 'react-router-dom'
import RutasPublicas from './RutasPublicas'
import RutasPrivadas from './RutasPrivadas'
import Admin from "../pages/Admin"
import Carro from "../pages/Carro"
import Ventas from '../pages/Ventas'
import Tarjeta from '../pages/Tarjeta'

const Router1 = () => {
  return (
    <>
      <Routes>
        <Route path="/*" element={<RutasPublicas/>}/>
        <Route path="/admin/*" element={<RutasPrivadas/>}>
          <Route path='' element={<Admin/>} />
          <Route path='ventas' element={<Ventas/>}/>
        </Route>
        <Route path="/cart" element={<Carro/>}/>
        <Route path="/tarjeta" element={<Tarjeta />} />
      </Routes>
    </>
  )
}

export default Router1
