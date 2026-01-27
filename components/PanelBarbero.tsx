import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig'; 
import { BARBERS } from '../constants'; 
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc,
  deleteDoc,
  setDoc 
} from "firebase/firestore";

// --- SEGURIDAD ALFANUMÉRICA ---
const ADMIN_PIN = "AdminBarber68"; // Puedes poner letras y números. Es sensible a mayúsculas.

interface ClienteCola {
  id: string;
  cliente: string;
  servicio: string;
  barbero: string;
  estado: 'esperando' | 'atendiendo' | 'finalizado';
  pagado: boolean | 'procesando';
  precio: number;
}

const PanelBarbero: React.FC = () => {
  const [proximos, setProximos] = useState<ClienteCola[]>([]);
  const [filtroBarbero, setFiltroBarbero] = useState<string>('todos');
  
  const [precios, setPrecios] = useState({ corte: 0, barba: 0, ambos: 0 });
  const [aliasBarberos, setAliasBarberos] = useState<Record<string, string>>({});
  const [editandoPrecios, setEditandoPrecios] = useState(false);
  const [mostrarAjustes, setMostrarAjustes] = useState(false);

  // ESTADOS DE SEGURIDAD
  const [pinIngresado, setPinIngresado] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [errorPin, setErrorPin] = useState(false);
  const [verPassword, setVerPassword] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "cola_atencion"), where("estado", "!=", "finalizado"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: ClienteCola[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClienteCola));
      setProximos(docs);
    });

    const precioUnsub = onSnapshot(doc(db, "configuracion", "precios"), (docSnap) => {
      if (docSnap.exists()) setPrecios(docSnap.data() as any);
    });

    const aliasUnsub = onSnapshot(doc(db, "configuracion", "alias_barberos"), (docSnap) => {
      if (docSnap.exists()) setAliasBarberos(docSnap.data() as any);
    });

    return () => { unsubscribe(); precioUnsub(); aliasUnsub(); };
  }, []);

  const verificarPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinIngresado === ADMIN_PIN) {
      setAutenticado(true);
      setMostrarAjustes(true);
      setErrorPin(false);
      setPinIngresado("");
    } else {
      setErrorPin(true);
      setPinIngresado("");
      setTimeout(() => setErrorPin(false), 2000);
    }
  };

  const cerrarAjustes = () => {
    setMostrarAjustes(false);
    setAutenticado(false);
    setEditandoPrecios(false);
  };

  const guardarTodo = async () => {
    try {
      await setDoc(doc(db, "configuracion", "precios"), precios);
      await setDoc(doc(db, "configuracion", "alias_barberos"), aliasBarberos);
      setEditandoPrecios(false);
      alert("✅ Configuración guardada correctamente.");
    } catch (error) {
      alert("Error al guardar la configuración.");
    }
  };

  const cambiarEstado = async (id: string, nuevoEstado: 'atendiendo' | 'finalizado') => {
    const clienteRef = doc(db, "cola_atencion", id);
    try { await updateDoc(clienteRef, { estado: nuevoEstado }); } catch (error) { console.error(error); }
  };

  const marcarComoPagadoManual = async (id: string) => {
    await updateDoc(doc(db, "cola_atencion", id), { pagado: true });
  };

  const eliminarCliente = async (id: string) => {
    if (window.confirm("¿Seguro que quieres eliminar a este cliente?")) {
      try { await deleteDoc(doc(db, "cola_atencion", id)); } catch (error) { console.error(error); }
    }
  };

  const clientesFiltrados = filtroBarbero === 'todos' ? proximos : proximos.filter(c => c.barbero === filtroBarbero);

  return (
    <div className="p-6 bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl relative">
      
      {/* MODAL DE LOGIN ALFANUMÉRICO */}
      {!autenticado && mostrarAjustes && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 transition-all ${errorPin ? 'bg-red-500/10 border-red-500 text-red-500 scale-110' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
              <i className={`fa-solid ${errorPin ? 'fa-circle-xmark' : 'fa-shield-halved'}`}></i>
            </div>
            <h3 className="text-white font-bold text-xl mb-1">Área Restringida</h3>
            <p className="text-slate-500 text-xs mb-8">Ingresá la clave de administrador</p>
            
            <form onSubmit={verificarPin} className="space-y-4">
              <div className="relative">
                <input 
                  type={verPassword ? "text" : "password"} 
                  autoFocus
                  value={pinIngresado}
                  onChange={(e) => setPinIngresado(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-2xl p-4 text-center text-lg text-white outline-none transition-all ${errorPin ? 'border-red-500 shadow-lg shadow-red-500/10' : 'border-slate-800 focus:border-amber-500/50'}`}
                  placeholder="Contraseña"
                />
                <button 
                  type="button"
                  onClick={() => setVerPassword(!verPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  <i className={`fa-solid ${verPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white rounded-2xl text-xs font-black uppercase py-4 transition-all shadow-lg shadow-amber-900/20 active:scale-95">
                  Verificar Acceso
                </button>
                <button type="button" onClick={() => setMostrarAjustes(false)} className="w-full text-slate-500 text-[10px] font-bold uppercase py-2 hover:text-slate-300">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white heading-font">Panel de Control</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-slate-500 text-sm">Gestión de cobros y turnos</p>
            <button 
              onClick={() => autenticado ? cerrarAjustes() : setMostrarAjustes(true)}
              className="text-amber-500 text-xs hover:underline ml-2 flex items-center gap-1"
            >
              <i className="fa-solid fa-gear"></i>
              {autenticado && mostrarAjustes ? "Cerrar Ajustes" : "Configurar Precios y Alias"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {['todos', ...BARBERS.map(b => b.name)].map(name => (
            <button 
              key={name}
              onClick={() => setFiltroBarbero(name)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                filtroBarbero === name ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-500'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* SECCIÓN DE AJUSTES (Autenticada) */}
      {autenticado && mostrarAjustes && (
        <div className="mb-8 p-6 bg-slate-800/30 rounded-3xl border border-amber-500/20 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold flex items-center gap-2 italic">
              <i className="fa-solid fa-sliders text-amber-500"></i> Configuración Desbloqueada
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={cerrarAjustes} 
                className="bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold uppercase hover:bg-slate-600 transition-all"
              >
                Cerrar Sesión
              </button>
              {editandoPrecios ? (
                <button onClick={guardarTodo} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase shadow-lg shadow-emerald-900/20">💾 Guardar Cambios</button>
              ) : (
                <button onClick={() => setEditandoPrecios(true)} className="bg-slate-800 text-amber-500 border border-amber-500/30 px-4 py-2 rounded-xl text-xs font-bold uppercase hover:bg-amber-500/10 transition-all">✏️ Editar Todo</button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] text-amber-500 uppercase font-black mb-4 tracking-widest">Precios de Servicios</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.entries(precios).map(([key, val]) => (
                  <div key={key}>
                    <label className="text-[9px] text-slate-500 uppercase font-bold mb-1 block ml-1">{key}</label>
                    <input 
                      type="number"
                      disabled={!editandoPrecios}
                      value={val}
                      onChange={(e) => setPrecios({...precios, [key]: Number(e.target.value)})}
                      className={`w-full bg-slate-950 p-3 rounded-xl font-bold text-sm transition-all ${editandoPrecios ? 'text-white border border-amber-500/30' : 'text-slate-500 border border-slate-900'}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] text-amber-500 uppercase font-black mb-4 tracking-widest">Alias de Mercado Pago</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BARBERS.map(b => (
                  <div key={b.id}>
                    <label className="text-[9px] text-slate-500 uppercase font-bold mb-1 block ml-1">{b.name}</label>
                    <input 
                      type="text"
                      disabled={!editandoPrecios}
                      value={aliasBarberos[b.name] || ''}
                      placeholder="Alias.MP"
                      onChange={(e) => setAliasBarberos({...aliasBarberos, [b.name]: e.target.value})}
                      className={`w-full bg-slate-950 p-3 rounded-xl font-bold text-sm transition-all ${editandoPrecios ? 'text-white border border-amber-500/30' : 'text-slate-500 border border-slate-900'}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* LISTADO DE CLIENTES */}
      <div className="grid gap-4">
          {clientesFiltrados.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
              <p className="text-slate-600 italic">No hay clientes esperando.</p>
            </div>
          ) : (
            clientesFiltrados.map((cliente) => (
              <div key={cliente.id} className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-slate-600 transition-colors relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${cliente.pagado === true ? 'bg-emerald-500' : cliente.pagado === 'procesando' ? 'bg-blue-500' : 'bg-amber-500/20'}`}></div>
                <div className="flex flex-col items-center md:items-start w-full md:w-auto text-center md:text-left">
                  <div className="flex items-center gap-3 mb-1 flex-wrap justify-center md:justify-start">
                    <p className="text-white font-bold text-xl">{cliente.cliente}</p>
                    {cliente.pagado === true ? (
                      <span className="bg-emerald-500/10 text-emerald-500 text-[9px] px-2 py-0.5 rounded-full border border-emerald-500/20 font-black uppercase flex items-center gap-1">✓ Pagado</span>
                    ) : cliente.pagado === 'procesando' ? (
                      <button onClick={() => marcarComoPagadoManual(cliente.id)} className="bg-blue-500/10 text-blue-400 text-[9px] px-2 py-0.5 rounded-full border border-blue-500/20 font-black uppercase flex items-center gap-1 hover:bg-blue-500 hover:text-white transition-all">Verificar Transf.</button>
                    ) : (
                      <span className="bg-slate-700 text-slate-400 text-[9px] px-2 py-0.5 rounded-full font-black uppercase">Pendiente: ${cliente.precio}</span>
                    )}
                    <span className="bg-amber-500/10 text-amber-500 text-[10px] px-2 py-0.5 rounded-full border border-amber-500/20 font-black uppercase">✂️ {cliente.barbero}</span>
                  </div>
                  <p className="text-slate-400 text-sm">{cliente.servicio} • <span className="text-slate-500 italic">{cliente.estado}</span></p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  {cliente.estado === 'esperando' && (
                    <button onClick={() => cambiarEstado(cliente.id, 'atendiendo')} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-900/20">Atender</button>
                  )}
                  <button onClick={() => cambiarEstado(cliente.id, 'finalizado')} className="flex-1 md:flex-none bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all">Finalizar</button>
                  <button onClick={() => eliminarCliente(cliente.id)} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-3 py-3 rounded-xl text-sm transition-all"><i className="fa-solid fa-trash-can"></i></button>
                </div>
              </div>
            ))
          )}
      </div>
    </div>
  );
};

export default PanelBarbero;