import React from 'react'
import { Routes, Route } from 'react-router-dom'
import RutasPublicas from './RutasPublicas'
import RutasPrivadas from './RutasPrivadas'
import Admin from "../pages/Admin"

const Router1 = () => {
  return (
    <>
      <Routes>
        <Route path="/*" element={<RutasPublicas/>}/>
        <Route path="/admin/*" element={<RutasPrivadas/>}>
          <Route path='' element={<Admin/>} />
        </Route>
      </Routes>
    </>
  )
}

export default Router1
