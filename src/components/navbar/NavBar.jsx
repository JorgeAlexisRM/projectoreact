import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'
import { signOut } from 'firebase/auth'
import { auth } from '../../resource/firebase'
import {CartContext} from '../../context/CartContext'

const NavBar = () => {
    const { currentUser, logout } = useAuth()
    const { tempCart } = useContext(CartContext)
    const navigate = useNavigate()

    const mantenerLogout = async () => {
        try {
            await signOut(auth)
            navigate("/login")
        } catch (error) {
            console.error("Error signing out: ",error)
        }
    }

    const cartItemCount = tempCart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <>
            <nav class="bg-gray-50 dark:bg-gray-700">
                <div class="max-w-screen-xl px-4 py-3 mx-auto">
                    <div class="flex items-center justify-between">
                        <ul class="flex flex-row font-medium mt-0 space-x-8 rtl:space-x-reverse text-sm">
                            <li>
                                <NavLink to="/" class="text-gray-900 dark:text-white hover:underline" aria-current="page">Home</NavLink>
                            </li>
                            {currentUser && currentUser.rol === 'admin' ? (
                                <li>
                                    <NavLink to="/admin" class="text-gray-900 dark:text-white hover:underline" aria-current="page">CRUD Productos</NavLink>
                                </li>
                            ) : (
                                <li>
                                    
                                </li>
                            )}
                            {currentUser ? (
                                <li>
                                    <button
                                        onClick={mantenerLogout}
                                        className="text-sm text-blue-50 dark:text-blue-500 hover:underline"
                                    >
                                        Logout
                                    </button>
                                </li>
                            ) : (
                                <li>
                                <NavLink to="login" className="text-sm text-blue-600 dark:text-blue-500 hover:underline">Login</NavLink>
                                </li>
                            )}
                        </ul>
                        <div className="flex items-center">
                            <NavLink to="/cart" className="relative text-gray-900 dark:text-white hover:underline">
                                Cart
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                                {cartItemCount}
                                </span>
                            </NavLink>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    )
}

export default NavBar
