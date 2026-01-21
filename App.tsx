import React, { useState, useCallback, useRef } from 'react';
// Importamos lo necesario para las rutas
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BARBERS } from './constants';
import { Barber } from './types';
import BarberCard from './components/BarberCard';
import PanelBarbero from './components/PanelBarbero';
import RegistroCola from './components/RegistroCola';
import VistaEspera from './components/VistaEspera';
import WaitStatus from './components/WaitStatus';
import { getBarberWisdom } from './services/geminiService';

// Creamos un componente para la Landing Page para no ensuciar el Router
const LandingPage: React.FC<{
  selectedBarber: Barber | null;
  handleSelectBarber: (barber: Barber) => void;
  aiComment: string;
  loadingAi: boolean;
  statusRef: React.RefObject<HTMLDivElement>;
}> = ({ selectedBarber, handleSelectBarber, aiComment, loadingAi, statusRef }) => (
  <>
    {/* Hero Section */}
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
          <a href="#estilistas" className="w-full sm:w-auto bg-white text-slate-950 px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all">
            Ver Tiempos de Espera
          </a>
          {/* Link al registro (Totem del local) */}
          <Link to="/registro" className="w-full sm:w-auto border border-amber-500 text-amber-500 px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-amber-500/10 transition-all text-center">
            Anotarme al Llegar
          </Link>
        </div>
      </div>
    </section>

    {/* Estilistas Section */}
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

        {/* Área de Estado Dinámico con Firebase */}
        <div ref={statusRef} className="scroll-mt-32">
          {selectedBarber ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <WaitStatus 
                barber={selectedBarber} 
                aiComment={aiComment} 
                loadingAi={loadingAi} 
              />
              {/* Aquí inyectamos la lista real de Firebase filtrada por barbero si lo deseas */}
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
  const statusRef = useRef<HTMLDivElement>(null);

  const handleSelectBarber = useCallback(async (barber: Barber) => {
    setSelectedBarber(barber);
    setLoadingAi(true);
    setAiComment("");
    
    setTimeout(() => {
      statusRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

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
      <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-amber-500/30">
        <nav className="fixed top-0 w-full z-50 bg-[#0f172a]/80 backdrop-blur-lg border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold heading-font text-white tracking-tighter">
                Tu<span className="text-amber-500">Look</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest">
              <Link to="/" className="hover:text-amber-500 transition-colors">Inicio</Link>
              <a href="#estilistas" className="hover:text-amber-500 transition-colors">Fila en Vivo</a>
              <Link to="/peluquero" className="text-slate-600 hover:text-amber-500 transition-colors text-[10px]">Admin</Link>
            </div>
            <Link to="/registro" className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all">
              Anotarme
            </Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={
            <LandingPage 
              selectedBarber={selectedBarber} 
              handleSelectBarber={handleSelectBarber}
              aiComment={aiComment}
              loadingAi={loadingAi}
              statusRef={statusRef}
            />
          } />
          
          {/* Vista para el Totem en el local */}
          <Route path="/registro" element={
            <div className="pt-32 pb-20 px-6 max-w-xl mx-auto">
              <RegistroCola />
            </div>
          } />

          {/* Vista para el peluquero */}
          <Route path="/peluquero" element={
            <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
              <PanelBarbero />
            </div>
          } />
        </Routes>

        {/* Footer se mantiene igual */}
        <footer className="bg-slate-950 pt-24 pb-12 border-t border-slate-900 text-center">
            <p className="text-slate-600 text-xs">© 2026 TuLook Barbería - Colón, Entre Ríos.</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;