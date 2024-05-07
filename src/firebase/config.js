import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Agrega esta importación para obtener el módulo de almacenamiento

const firebaseConfig = {
  apiKey: "AIzaSyDExZ-p2t_W2znUPFoMpfImICemwumCZaE",
  authDomain: "producto-28ecc.firebaseapp.com",
  projectId: "producto-28ecc",
  storageBucket: "producto-28ecc.appspot.com",
  messagingSenderId: "509007319526",
  appId: "1:509007319526:web:091fce036a61c5a7220627"
};

const app = initializeApp(firebaseConfig);
const database = getFirestore(app);
const storage = getStorage(app); // Incluye el objeto de almacenamiento en tus exportaciones

export { app, database, storage }; // Exporta app, database y storage para que puedan ser importados en otros archivos

/*Reglas de la BD

  rules_version = '2';

  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if true;
      }
    }
  }


  Regla de Storage

  service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
 */