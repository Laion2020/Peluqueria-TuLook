import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig'; 
import { BARBERS } from '../constants'; 
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from "firebase/firestore";
// Si usas Lucide-react (común en Vite), puedes importar estos íconos:
// import { Instagram, MapPin, Navigation } from 'lucide-react';

const BARBERIA_COORDS = {
  lat: -32.2202053528977,
  lon: -58.13871290604671
};

const RADIO_PERMITIDO_METROS = 200;
const INSTAGRAM_URL = "https://www.instagram.com/tulook_colon"; // Cambia por tu user real
const GOOGLE_MAPS_URL = `https://www.google.com/maps/dir/?api=1&destination=${BARBERIA_COORDS.lat},${BARBERIA_COORDS.lon}`;

const RegistroCola: React.FC = () => {
  const [nombre, setNombre] = useState<string>('');
  const [servicio, setServicio] = useState<'corte' | 'barba' | 'ambos'>('corte');
  const [barberoElegido, setBarberoElegido] = useState<string>(BARBERS[0].name);
  const [validandoUbicacion, setValidandoUbicacion] = useState<boolean>(true);
  const [estaCerca, setEstaCerca] = useState<boolean | null>(null);
  const [distanciaActual, setDistanciaActual] = useState<number>(0);
  const [preciosActuales, setPreciosActuales] = useState({ corte: 8000, barba: 4000, ambos: 10000 });

  const location = useLocation();
  const navigate = useNavigate();

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

  const validarUbicacionReal = () => {
    setValidandoUbicacion(true);
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.");
      setValidandoUbicacion(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const d = calcularDistancia(
          position.coords.latitude, 
          position.coords.longitude, 
          BARBERIA_COORDS.lat, 
          BARBERIA_COORDS.lon
        );
        setDistanciaActual(Math.round(d));
        setEstaCerca(d <= RADIO_PERMITIDO_METROS);
        setValidandoUbicacion(false);
      },
      (error) => {
        setEstaCerca(false);
        setValidandoUbicacion(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    validarUbicacionReal();
    const unsubPrecios = onSnapshot(doc(db, "configuracion", "precios"), (docSnap) => {
      if (docSnap.exists()) setPreciosActuales(docSnap.data() as any);
    });
    return () => unsubPrecios();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return alert("Por favor, ingresa tu nombre");
    setValidandoUbicacion(true);
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
      navigate('/checkout', { state: { ticketId: docRef.id, nombre, servicio: serviciosInfo[servicio].etiqueta, precio: serviciosInfo[servicio].precio, barbero: barberoElegido } });
    } catch (error) {
      alert("Hubo un error al anotarte.");
    } finally {
      setValidandoUbicacion(false);
    }
  };

  if (validandoUbicacion && estaCerca === null) {
    return (
      <div className="bg-slate-900 p-12 rounded-[2.5rem] shadow-2xl max-w-md mx-auto text-center border border-slate-800">
        <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Validando ubicación...</p>
      </div>
    );
  }

  if (estaCerca === false) {
    return (
      <div className="bg-slate-900 border border-red-500/30 p-8 rounded-[2.5rem] shadow-2xl max-w-md mx-auto text-center">
        <div className="text-red-500 text-5xl mb-4">📍</div>
        <h2 className="text-2xl font-bold text-white mb-2">Fuera de Rango</h2>
        <p className="text-slate-400 text-sm mb-6">
          Debes estar en el local para entrar en la fila. Estás a <span className="text-white font-bold">{distanciaActual}m</span>.
        </p>
        <div className="flex flex-col gap-3">
          <a 
            href={GOOGLE_MAPS_URL} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full p-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
          >
            🚗 Cómo llegar
          </a>
          <button 
            onClick={validarUbicacionReal}
            className="w-full p-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-colors"
          >
            🔄 Reintentar Validar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl max-w-md mx-auto">
      {/* HEADER CON REDES Y UBICACIÓN */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors text-pink-500">
            📸
          </a>
          <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors text-emerald-500">
            📍
          </a>
        </div>
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
          En el Local
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white heading-font mb-2">Barber's TuLook</h2>
        <p className="text-slate-400 text-xs tracking-widest uppercase">Elegí tu servicio y barbero</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="text-xs uppercase tracking-widest text-amber-500 font-bold ml-1 mb-2 block">Tu Nombre</label>
          <input 
            className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl text-white focus:outline-none focus:border-amber-500 transition-colors"
            type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Juan Pérez"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-amber-500 font-bold ml-1 mb-2 block">Elegir Barbero</label>
          <select 
            className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl text-white focus:outline-none focus:border-amber-500 appearance-none"
            value={barberoElegido} onChange={(e) => setBarberoElegido(e.target.value)}
          >
            {BARBERS.map(b => <option key={b.id} value={b.name}>{b.emoji} {b.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-amber-500 font-bold ml-1 mb-2 block">Servicio</label>
          <select 
            className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl text-white focus:outline-none focus:border-amber-500 appearance-none"
            value={servicio} onChange={(e) => setServicio(e.target.value as any)}
          >
            <option value="corte">Corte Clásico (${preciosActuales.corte})</option>
            <option value="barba">Ritual de Barba (${preciosActuales.barba})</option>
            <option value="ambos">Combo TuLook (${preciosActuales.ambos})</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={validandoUbicacion}
          className="mt-4 p-4 rounded-2xl font-bold uppercase tracking-[0.2em] bg-amber-600 hover:bg-amber-500 text-white shadow-lg active:scale-95 transition-all"
        >
          {validandoUbicacion ? 'Procesando...' : 'Confirmar Turno'}
        </button>
      </form>
    </div>
  );
};

export default RegistroCola;