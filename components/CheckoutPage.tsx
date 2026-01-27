import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [procesando, setProcesando] = useState(false);
  const [aliasBarbero, setAliasBarbero] = useState<string>('');
  const [copiado, setCopiado] = useState(false);

  const { ticketId, nombre, servicio, precio, barbero } = location.state || {};

  useEffect(() => {
    const fetchAlias = async () => {
      try {
        const docSnap = await getDoc(doc(db, "configuracion", "alias_barberos"));
        if (docSnap.exists()) {
          const todosLosAlias = docSnap.data();
          setAliasBarbero(todosLosAlias[barbero] || '');
        }
      } catch (error) {
        console.error("Error al obtener alias:", error);
      }
    };
    if (barbero) fetchAlias();
  }, [barbero]);

  const handleCopiarAlias = () => {
    if (!aliasBarbero) return;
    navigator.clipboard.writeText(aliasBarbero);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handlePagoDigital = async () => {
    if (!ticketId || !barbero || !aliasBarbero) return;
    setProcesando(true);
    try {
      const ticketRef = doc(db, "cola_atencion", ticketId);
      await updateDoc(ticketRef, { pagado: "procesando" });
      const monto = precio;
      const referencia = encodeURIComponent(`Barberia: ${nombre}`);
      const aliasLimpio = aliasBarbero.trim();
      const mpLink = `https://link.mercadopago.com.ar/transfer/checkout?alias=${aliasLimpio}&amount=${monto}&reference=${referencia}`;
      window.location.href = mpLink;
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un error al conectar con la App de pago.");
      setProcesando(false);
    }
  };

  if (!ticketId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-6 text-center">
        <div>
          <p className="text-slate-500 mb-4 italic">No se encontró una sesión de pago activa.</p>
          <button onClick={() => navigate('/')} className="text-amber-500 font-bold underline">Volver al Inicio</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl"></div>
        
        <div className="text-center mb-8 relative z-10">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
            <span className="text-3xl">💳</span>
          </div>
          <h2 className="text-3xl font-bold text-white heading-font mb-2">Finalizar Reserva</h2>
          <p className="text-slate-400 text-sm">Hola <span className="text-white font-semibold">{nombre}</span>, vas a pagarle a <span className="text-amber-500 font-bold">{barbero}</span>:</p>
        </div>

        <div className="bg-slate-800/40 rounded-3xl p-6 mb-8 border border-slate-700/50 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Servicio</span>
            <span className="text-white font-bold">{servicio}</span>
          </div>
          <div className="h-[1px] bg-slate-700/50 w-full mb-4"></div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Total a pagar</span>
            <span className="text-amber-500 text-3xl font-black">${precio}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 relative z-10">

          {/* Sección de Alias / Transferencia Manual */}
          {aliasBarbero && (
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 flex flex-col items-center gap-3">
              <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">O transferí al Alias:</span>
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <span className="text-amber-500 font-mono font-bold text-sm tracking-tight">{aliasBarbero}</span>
                </div>
                <button 
                  onClick={handleCopiarAlias}
                  className={`p-3 rounded-xl font-bold transition-all ${
                    copiado ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {copiado ? "✓" : "📋"}
                </button>
              </div>
            </div>
          )}

          <button 
            onClick={() => navigate('/')}
            disabled={procesando}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 p-5 rounded-2xl font-bold transition-all border border-slate-700 shadow-lg active:scale-95 disabled:opacity-50"
          >
            Pagar en el Local
          </button>
        </div>

        <div className="mt-8 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              Tu lugar ya está reservado en la fila
            </p>
        </div>
      </div>
      
      <button 
        onClick={() => navigate(-1)}
        className="mt-6 w-full text-slate-600 text-xs font-bold uppercase tracking-widest hover:text-slate-400 transition-colors"
      >
        ← Volver y corregir datos
      </button>
    </div>
  );
};

export default CheckoutPage;