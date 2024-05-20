import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "../resource/firebase";
import { doc, setDoc } from 'firebase/firestore';

const Registro = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [nombre, setNombre] = useState('')
    const [error, setError] = useState(null)
    const navigate = useNavigate();
    const auth = getAuth()

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Crear documento de usuario en Firestore
            await setDoc(doc(database, 'usuarios', user.uid), {
                nombre: nombre,
                rol: 'user', // Asignar rol por defecto
            });

            navigate('/');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <>
            <div class="relative py-3 sm:max-w-xl sm:mx-auto w-full">
                <div class="relative px-4 py-10 bg-black mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
                    <div class="max-w-md mx-auto text-white">
                        <div class="mt-5">
                            <label
                                for="nombre"
                                class="font-semibold text-sm text-gray-400 pb-1 block"
                            >
                                Nombre
                            </label>
                            <input
                                id="nombre"
                                type="nombre"
                                class="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full bg-gray-700 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                            />
                            <label
                                for="email"
                                class="font-semibold text-sm text-gray-400 pb-1 block"
                            >
                                E-mail
                            </label>
                            <input
                                id="email"
                                type="email"
                                class="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full bg-gray-700 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <label
                                for="password"
                                class="font-semibold text-sm text-gray-400 pb-1 block"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                class="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full bg-gray-700 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div class="mt-5">
                            <button
                                type="submit"
                                class="py-2 px-4 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-blue-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
                                onClick={handleRegister}
                            >
                                Registrarse
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Registro;
