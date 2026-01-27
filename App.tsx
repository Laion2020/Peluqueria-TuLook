import React, { useState, useCallback, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { BARBERS } from './constants';
import { Barber } from './types';
import BarberCard from './components/BarberCard';
import PanelBarbero from './components/PanelBarbero';
import RegistroCola from './components/RegistroCola';
import VistaEspera from './components/VistaEspera';
import ScrollToTop from './components/ScrollToTop';
import WaitStatus from './components/WaitStatus';
import CheckoutPage from './components/CheckoutPage';
import { getBarberWisdom } from './services/geminiService';

// Constantes de contacto actualizadas
const INSTAGRAM_URL = "https://www.instagram.com/tulook_colon?igsh=OG5yZjdrNm9yM3ps";
// Google Maps usando coordenadas exactas para que el pin caiga justo en el local
const GOOGLE_MAPS_URL = "https://www.google.com/maps?q=-32.2200877,-58.1390588";

const LandingPage: React.FC<{
  selectedBarber: Barber | null;
  handleSelectBarber: (barber: Barber) => void;
  aiComment: string;
  loadingAi: boolean;
  statusRef: React.RefObject<HTMLDivElement>;
  realCount: number;
  realMinutes: number;
}> = ({ selectedBarber, handleSelectBarber, aiComment, loadingAi, statusRef, realCount, realMinutes }) => (
  <>
    <section id="inicio" className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-5xl bg-amber-500/5 blur-[120px] rounded-full -z-10"></div>
      <div className="max-w-7xl mx-auto text-center">
        <div className="inline-block p-2 px-4 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-[0.3em] mb-6">
          Elegancia y Precisión desde 2021
        </div>
        <h1 className="text-6xl md:text-8xl font-bold heading-font text-white mb-8 leading-[1.1] tracking-tight">
          Redefiniendo el <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Estilo Masculino</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-xl font-light leading-relaxed mb-10">
          En TuLook combinamos técnicas tradicionales con las últimas tendencias. Consulta la fila en tiempo real.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#estilistas" className="w-full sm:w-auto bg-white text-slate-950 px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all text-center">
            Ver Tiempos de Espera
          </a>
          <Link to="/registro" className="w-full sm:w-auto border border-amber-500 text-amber-500 px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-amber-500/10 transition-all text-center">
            Anotarme en la Fila
          </Link>
        </div>
      </div>
    </section>

    <section id="estilistas" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-amber-500 uppercase tracking-[0.3em] mb-3">Nuestros Maestros</h2>
          <h3 className="text-4xl md:text-5xl font-bold heading-font text-white mb-6">Elige a tu Profesional</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {BARBERS.map((barber) => (
            <BarberCard
              key={barber.id}
              barber={barber}
              isSelected={selectedBarber?.id === barber.id}
              onSelect={handleSelectBarber}
            />
          ))}
        </div>

        <div ref={statusRef} className="scroll-mt-32">
          {selectedBarber ? (
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
              <WaitStatus 
                barber={selectedBarber} 
                aiComment={aiComment} 
                loadingAi={loadingAi} 
                realCount={realCount}
                realMinutes={realMinutes}
              />
              <VistaEspera barberId={selectedBarber.id} />
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl">
              <p className="text-slate-500 italic">Selecciona un barbero arriba para ver la fila en vivo.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  </>
);

const App: React.FC = () => {
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [aiComment, setAiComment] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [realStats, setRealStats] = useState({ count: 0, minutes: 0 });
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedBarber) return;
    const q = query(
      collection(db, "cola_atencion"),
      where("barbero", "==", selectedBarber.name),
      where("estado", "==", "esperando")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const count = snapshot.docs.length;
      const minutes = snapshot.docs.reduce((acc, doc) => acc + (doc.data().minutosEstimados || 0), 0);
      setRealStats({ count, minutes });
    });
    return () => unsubscribe();
  }, [selectedBarber]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleSelectBarber = useCallback(async (barber: Barber) => {
    setSelectedBarber(barber);
    setLoadingAi(true);
    setAiComment("");
    setTimeout(() => { statusRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
    try {
      const wisdom = await getBarberWisdom(barber);
      setAiComment(wisdom);
    } catch (err) {
      setAiComment("La excelencia requiere tiempo. Agradecemos tu paciencia.");
    } finally {
      setLoadingAi(false);
    }
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-amber-500/30 flex flex-col">
        <nav className="fixed top-0 w-full z-50 bg-[#0f172a]/80 backdrop-blur-lg border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link to="/" onClick={scrollToTop} className="flex items-center gap-2 group cursor-pointer">
              <span className="text-2xl font-bold heading-font text-white tracking-tighter transition-transform group-hover:scale-105">
                Tu<span className="text-amber-500">Look</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest">
              <Link to="/" onClick={scrollToTop} className="hover:text-amber-500 transition-colors">Inicio</Link>
              <a href="#estilistas" className="hover:text-amber-500 transition-colors">Fila en Vivo</a>
            </div>
            <Link to="/registro" className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all">
              Anotarme
            </Link>
          </div>
        </nav>

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={
              <LandingPage 
                selectedBarber={selectedBarber} 
                handleSelectBarber={handleSelectBarber}
                aiComment={aiComment}
                loadingAi={loadingAi}
                statusRef={statusRef}
                realCount={realStats.count}
                realMinutes={realStats.minutes}
              />
            } />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/registro" element={<div className="pt-32 pb-20 px-6 max-w-xl mx-auto"><RegistroCola /></div>} />
            <Route path="/peluquero" element={<div className="pt-32 pb-20 px-6 max-w-4xl mx-auto"><PanelBarbero /></div>} />
          </Routes>
        </main>

        <footer className="bg-slate-950 pt-16 pb-12 border-t border-slate-900 text-center px-6">
            <div className="max-w-md mx-auto mb-10">
              <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-bold mb-6">Seguinos y Visitanos</p>
              <div className="flex justify-center gap-8 mb-8">
                {/* Instagram */}
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-3">
                  <div className="w-14 h-14 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-2xl group-hover:border-pink-500/50 group-hover:bg-pink-500/5 transition-all">
                    <span className="text-2xl transition-transform group-hover:scale-110">📸</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Instagram</span>
                </a>
                {/* Ubicación Exacta */}
                <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-3">
                  <div className="w-14 h-14 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-2xl group-hover:border-emerald-500/50 group-hover:bg-emerald-500/5 transition-all">
                    <span className="text-2xl transition-transform group-hover:scale-110">📍</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Ubicación</span>
                </a>
              </div>
              <p className="text-slate-300 text-sm font-medium">Sarmiento 68</p>
              <p className="text-slate-500 text-xs">Colón, Entre Ríos</p>
            </div>

            <button onClick={scrollToTop} className="text-xl font-bold heading-font text-white mb-4 inline-block hover:text-amber-500 transition-colors">
              Tu<span className="text-amber-500">Look</span>
            </button>
            <p className="text-slate-700 text-[10px] uppercase tracking-widest">© 2026 Barbería Profesional</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;