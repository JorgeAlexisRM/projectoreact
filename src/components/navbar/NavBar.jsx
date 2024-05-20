import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'
import { signOut } from 'firebase/auth'
import { auth } from '../../resource/firebase'
import { CartContext } from '../../context/CartContext'

const NavBar = () => {
    const { currentUser, logout } = useAuth()
    const { tempCart } = useContext(CartContext)
    const navigate = useNavigate()

    const mantenerLogout = async () => {
        try {
            await signOut(auth)
            navigate("/login")
        } catch (error) {
            console.error("Error signing out: ", error)
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
                                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 56 56">
                                    <path fill="currentColor" d="M20.008 39.649H47.36c.913 0 1.71-.75 1.71-1.758s-.797-1.758-1.71-1.758H20.406c-1.336 0-2.156-.938-2.367-2.367l-.375-2.461h29.742c3.422 0 5.18-2.11 5.672-5.461l1.875-12.399a7.2 7.2 0 0 0 .094-.89c0-1.125-.844-1.899-2.133-1.899H14.641l-.446-2.976c-.234-1.805-.89-2.72-3.28-2.72H2.687c-.937 0-1.734.822-1.734 1.76c0 .96.797 1.781 1.735 1.781h7.921l3.75 25.734c.493 3.328 2.25 5.414 5.649 5.414m31.054-25.454L49.4 25.422c-.188 1.453-.961 2.344-2.344 2.344l-29.906.023l-1.993-13.594ZM21.86 51.04a3.766 3.766 0 0 0 3.797-3.797a3.781 3.781 0 0 0-3.797-3.797c-2.132 0-3.82 1.688-3.82 3.797c0 2.133 1.688 3.797 3.82 3.797m21.914 0c2.133 0 3.82-1.664 3.82-3.797c0-2.11-1.687-3.797-3.82-3.797c-2.109 0-3.82 1.688-3.82 3.797c0 2.133 1.711 3.797 3.82 3.797" />
                                </svg>
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
