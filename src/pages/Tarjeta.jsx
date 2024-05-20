import React, { useEffect, useState } from 'react';
import { doc, getDoc } from "firebase/firestore";
import { database } from '../resource/firebase'; // Asegúrate de importar tu configuración de Firebase
import { useAuth } from '../context/AuthContext'; // Ajusta según tu contexto de autenticación

const Tarjeta = () => {
  const { currentUser } = useAuth();
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const fetchUserPoints = async () => {
      if (currentUser) {
        const userRef = doc(database, 'usuarios', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setPoints(userData.points || 0);
        }
      }
    };

    fetchUserPoints();
  }, [currentUser]);

  return (
    <div className="container mx-auto my-8">
      <h1 className="text-2xl font-bold mb-4">My Points</h1>
      <p className="text-lg">You have <span className="font-semibold">{points}</span> points.</p>
    </div>
  );
};

export default Tarjeta;
