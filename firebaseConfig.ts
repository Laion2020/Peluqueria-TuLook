// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5AVzxWM-ZdKd6P_D0smBJWh3ggXDsMp8",
  authDomain: "peluqueria-tulook.firebaseapp.com",
  projectId: "peluqueria-tulook",
  storageBucket: "peluqueria-tulook.firebasestorage.app",
  messagingSenderId: "824189067451",
  appId: "1:824189067451:web:19f6a2cacd03aa7299c99e",
  measurementId: "G-QPD73JSLRS"
};

const app = initializeApp(firebaseConfig);

// Al exportarlo así, los componentes .tsx sabrán que 'db' es de tipo Firestore
export const db: Firestore = getFirestore(app);