import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { ClienteCola } from '../types/cola'; // Asegúrate de tener la interfaz

const VistaEspera: React.FC = () => {
  const [clientes, setClientes] = useState<ClienteCola[]>([]);
  const [totalMinutos, setTotalMinutos] = useState<number>(0);

  useEffect(() => {
    // IMPORTANTE: Traemos "esperando" y "atendiendo" 
    // para que la gente vea quién está en el sillón ahora mismo
    const q = query(
      collection(db, "cola_atencion"),
      where("estado", "in", ["esperando", "atendiendo"]),
      orderBy("fechaLlegada", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let minutosSuma = 0;
      const docs: ClienteCola[] = snapshot.docs.map(doc => {
        const data = doc.data() as ClienteCola;
        // Solo sumamos minutos de los que están "esperando"
        // El que ya está en el sillón ("atendiendo") ya no suma demora extra
        if (data.estado === "esperando") {
          minutosSuma += data.minutosEstimados || 0;
        }
        return { ...data, id: doc.id };
      });
      
      setClientes(docs);
      setTotalMinutos(minutosSuma);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm">
      <div className="text-center mb-8">
        <h3 className="text-amber-500 font-bold uppercase tracking-widest text-sm mb-2">Tiempo de Espera</h3>
        <div className="text-6xl font-bold text-white mb-2">{totalMinutos} <span className="text-2xl text-slate-500">min</span></div>
        <p className="text-slate-400">Hay {clientes.filter(c => c.estado === 'esperando').length} personas en fila</p>
      </div>

      <div className="space-y-4">
        {clientes.map((c, i) => (
          <div key={c.id} className={`flex justify-between items-center p-4 rounded-xl border ${
            c.estado === 'atendiendo' ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-800/50 border-slate-700'
          }`}>
            <div>
              <span className="text-slate-500 text-xs font-mono mr-3">#{i + 1}</span>
              <span className="text-white font-medium">{c.cliente}</span>
              {c.estado === 'atendiendo' && (
                <span className="ml-3 text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded-full font-bold uppercase">
                  En el sillón
                </span>
              )}
            </div>
            <span className="text-slate-500 text-sm">{c.servicio}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VistaEspera;