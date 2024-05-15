import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'
import { signOut } from 'firebase/auth'
import { auth } from '../../resource/firebase'

const NavBar = () => {
    const { currentUser } = useAuth()
    const navigate = useNavigate()

    const mantenerLogout = async () => {
        try {
            await signOut(auth)
            navigate("/login")
        } catch (error) {
            console.error("Error signing out: ",error)
        }
    }

    return (
        <>
            <nav class="bg-gray-50 dark:bg-gray-700">
                <div class="max-w-screen-xl px-4 py-3 mx-auto">
                    <div class="flex items-center">
                        <ul class="flex flex-row font-medium mt-0 space-x-8 rtl:space-x-reverse text-sm">
                            <li>
                                <NavLink to="/" class="text-gray-900 dark:text-white hover:underline" aria-current="page">Home</NavLink>
                            </li>
                            <li>
                                <NavLink to="#" class="text-gray-900 dark:text-white hover:underline">Company</NavLink>
                            </li>
                            <li>
                                <NavLink to="#" class="text-gray-900 dark:text-white hover:underline">Team</NavLink>
                            </li>
                            <li>
                                <NavLink to="#" class="text-gray-900 dark:text-white hover:underline">Features</NavLink>
                            </li>
                            {currentUser ? (
                                <li>
                                    <button
                                        onClick={mantenerLogout}
                                        className="text-sm text-blue-600 dark:text-blue-500 hover:underline"
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
                    </div>
                </div>
            </nav>
        </>
    )
}

export default NavBar
