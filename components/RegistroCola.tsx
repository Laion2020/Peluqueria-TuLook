import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig'; 
import { BARBERS } from '../constants'; 
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from "firebase/firestore";

const BARBERIA_COORDS = {
  lat: -32.22187635718116,
  lon: -58.143683239991255
};

const RADIO_PERMITIDO_METROS = 200;

const RegistroCola: React.FC = () => {
  const [nombre, setNombre] = useState<string>('');
  const [servicio, setServicio] = useState<'corte' | 'barba' | 'ambos'>('corte');
  const [barberoElegido, setBarberoElegido] = useState<string>(BARBERS[0].name);
  const [validandoUbicacion, setValidandoUbicacion] = useState<boolean>(false);
  
  // NUEVO: Estado para los precios dinámicos
  const [preciosActuales, setPreciosActuales] = useState({ corte: 8000, barba: 4000, ambos: 10000 });

  const location = useLocation();
  const navigate = useNavigate();

  // Escuchar precios en tiempo real desde Firebase
  useEffect(() => {
    const unsubPrecios = onSnapshot(doc(db, "configuracion", "precios"), (docSnap) => {
      if (docSnap.exists()) {
        setPreciosActuales(docSnap.data() as any);
      }
    });

    const params = new URLSearchParams(location.search);
    const barberoUrl = params.get('barbero');
    if (barberoUrl && BARBERS.some(b => b.name === barberoUrl)) {
      setBarberoElegido(barberoUrl);
    }

    return () => unsubPrecios();
  }, [location]);

  const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; 
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return alert("Por favor, ingresa tu nombre");

    setValidandoUbicacion(true);

    // --- EL GPS ESTABA AQUÍ, LO SALTAMOS PARA PRUEBAS ---

    const serviciosInfo = {
      corte: { tiempo: 30, etiqueta: "Corte", precio: preciosActuales.corte },
      barba: { tiempo: 15, etiqueta: "Barba", precio: preciosActuales.barba },
      ambos: { tiempo: 45, etiqueta: "Corte + Barba", precio: preciosActuales.ambos }
    };

    try {
      const docRef = await addDoc(collection(db, "cola_atencion"), {
        cliente: nombre,
        barbero: barberoElegido,
        servicio: serviciosInfo[servicio].etiqueta,
        minutosEstimados: serviciosInfo[servicio].tiempo,
        precio: serviciosInfo[servicio].precio,
        estado: "esperando",
        pagado: false,
        fechaLlegada: serverTimestamp()
      });
      
      setNombre('');
      
      navigate('/checkout', { 
        state: { 
          ticketId: docRef.id, 
          nombre: nombre, 
          servicio: serviciosInfo[servicio].etiqueta,
          precio: serviciosInfo[servicio].precio,
          barbero: barberoElegido
        } 
      });

    } catch (error) {
      console.error("Error al registrar:", error);
      alert("Hubo un error al anotarte.");
    } finally {
      // Dejamos esto en false para que el botón se reactive si hay error
      setValidandoUbicacion(false);
    }
    
    // --- EL CIERRE DEL GPS ESTABA AQUÍ, YA NO ES NECESARIO ---
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
          Solo Presencial
        </div>
        <h2 className="text-3xl font-bold text-white heading-font mb-2">Entrar a la Fila</h2>
        <p className="text-slate-400 text-sm">Validaremos tu ubicación al confirmar.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="text-xs uppercase tracking-widest text-amber-500 font-bold ml-1 mb-2 block">Tu Nombre</label>
          <input 
            className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl text-white focus:outline-none focus:border-amber-500 transition-colors"
            type="text" 
            value={nombre} 
            onChange={(e) => setNombre(e.target.value)} 
            placeholder="Ej: Juan Pérez"
            disabled={validandoUbicacion}
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-amber-500 font-bold ml-1 mb-2 block">Elegir Barbero</label>
          <select 
            className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl text-white focus:outline-none focus:border-amber-500 appearance-none transition-colors"
            value={barberoElegido} 
            onChange={(e) => setBarberoElegido(e.target.value)}
            disabled={validandoUbicacion}
          >
            {BARBERS.map(b => (
              <option key={b.id} value={b.name}>{b.emoji} {b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-amber-500 font-bold ml-1 mb-2 block">Servicio</label>
          <select 
            className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl text-white focus:outline-none focus:border-amber-500 appearance-none transition-colors"
            value={servicio} 
            onChange={(e) => setServicio(e.target.value as any)}
            disabled={validandoUbicacion}
          >
            {/* Ahora los labels muestran el precio real dinámico */}
            <option value="corte">Corte Clásico (${preciosActuales.corte})</option>
            <option value="barba">Ritual de Barba (${preciosActuales.barba})</option>
            <option value="ambos">Combo TuLook (${preciosActuales.ambos})</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={validandoUbicacion}
          className={`mt-4 p-4 rounded-2xl font-bold uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-lg flex items-center justify-center gap-3 ${
            validandoUbicacion 
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
              : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/20'
          }`}
        >
          {validandoUbicacion ? (
            <>
              <svg className="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verificando GPS...
            </>
          ) : 'Confirmar Turno'}
        </button>
      </form>
    </div>
  );
};

export default RegistroCola;