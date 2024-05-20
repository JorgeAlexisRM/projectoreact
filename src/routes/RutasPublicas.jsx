import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import { useAuth } from '../context/AuthContext'
import Registro from '../pages/Registro'

const RutasPublicas = () => {
    const {currentUser} = useAuth();

    return (
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login/>}/>
            <Route path='/registro' element={currentUser ? <Navigate to="/" /> : <Registro/>} />
        </Routes>
    )
}

export default RutasPublicas
