import React, { useEffect, useState } from 'react';
import { ClienteCola } from '../types/cola'; // Ajusta la ruta según donde lo guardes
import { db } from '../firebaseConfig'; 
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc 
} from "firebase/firestore";

interface ClienteCola {
  id: string;
  cliente: string;
  servicio: string;
  estado: 'esperando' | 'atendiendo' | 'finalizado';
}

const PanelBarbero: React.FC = () => {
  const [proximos, setProximos] = useState<ClienteCola[]>([]);

  useEffect(() => {
    // 1. Quitamos el orderBy temporalmente para descartar errores de índices
    // 2. Traemos todos los que NO estén finalizados
    const q = query(
      collection(db, "cola_atencion"),
      where("estado", "!=", "finalizado")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: ClienteCola[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ClienteCola));
      
      // Ordenamos manualmente por aquí si es necesario
      setProximos(docs);
      console.log("Datos recibidos en panel:", docs); // Mira esto en la consola (F12)
    }, (error) => {
      console.error("Error en el snapshot:", error);
    });

    return () => unsubscribe();
  }, []);

  const cambiarEstado = async (id: string, nuevoEstado: 'atendiendo' | 'finalizado') => {
    const clienteRef = doc(db, "cola_atencion", id);
    try {
      await updateDoc(clienteRef, { estado: nuevoEstado });
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  return (
    <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800">
      <h2 className="text-2xl font-bold text-white mb-6">Panel de Control (Barbero)</h2>
      
      {proximos.length === 0 ? (
        <p className="text-slate-500 italic">No hay clientes en espera en la base de datos.</p>
      ) : (
        <div className="grid gap-4">
          {proximos.map((cliente) => (
            <div key={cliente.id} className="p-4 bg-slate-800 rounded-xl border border-slate-700 flex justify-between items-center">
              <div>
                <p className="text-white font-bold text-lg">{cliente.cliente}</p>
                <p className="text-amber-500 text-sm">{cliente.servicio}</p>
                <span className={`text-xs uppercase px-2 py-1 rounded ${
                  cliente.estado === 'atendiendo' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {cliente.estado}
                </span>
              </div>
              
              <div className="flex gap-2">
                {cliente.estado === 'esperando' && (
                  <button 
                    onClick={() => cambiarEstado(cliente.id, 'atendiendo')}
                    className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                  >
                    Atender
                  </button>
                )}
                <button 
                  onClick={() => cambiarEstado(cliente.id, 'finalizado')}
                  className="bg-slate-700 hover:bg-red-900 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                  Finalizar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PanelBarbero;