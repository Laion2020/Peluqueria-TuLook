import React, { useState } from 'react';
import { db } from '../firebaseConfig'; 
import { ClienteCola } from '../types/cola'; // Ajusta la ruta según donde lo guardes
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const RegistroCola: React.FC = () => {
  const [nombre, setNombre] = useState<string>('');
  const [servicio, setServicio] = useState<'corte' | 'barba' | 'ambos'>('corte');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return alert("Ingresa tu nombre");

    const serviciosInfo = {
      corte: { tiempo: 30, etiqueta: "Corte" },
      barba: { tiempo: 15, etiqueta: "Barba" },
      ambos: { tiempo: 45, etiqueta: "Corte + Barba" }
    };

    try {
      await addDoc(collection(db, "cola_atencion"), {
        cliente: nombre,
        servicio: serviciosInfo[servicio].etiqueta,
        minutosEstimados: serviciosInfo[servicio].tiempo,
        estado: "esperando",
        fechaLlegada: serverTimestamp()
      });
      setNombre('');
      alert("¡Anotado!");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="p-4 border rounded shadow-sm">
      <h2 className="text-xl font-bold mb-4">Anotarse</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input 
          className="p-2 border rounded"
          type="text" 
          value={nombre} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)} 
          placeholder="Tu nombre"
        />
        <select 
          className="p-2 border rounded"
          value={servicio} 
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setServicio(e.target.value as any)}
        >
          <option value="corte">Corte (30 min)</option>
          <option value="barba">Barba (15 min)</option>
          <option value="ambos">Ambos (45 min)</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">Entrar a la Fila</button>
      </form>
    </div>
  );
};

export default RegistroCola;