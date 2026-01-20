
import React, { useState, useCallback, useRef } from 'react';
import { BARBERS } from './constants';
import { Barber } from './types';
import BarberCard from './components/BarberCard';
import WaitStatus from './components/WaitStatus';
import { getBarberWisdom } from './services/geminiService';

const App: React.FC = () => {
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [aiComment, setAiComment] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  
  const statusRef = useRef<HTMLDivElement>(null);

  const handleSelectBarber = useCallback(async (barber: Barber) => {
    setSelectedBarber(barber);
    setLoadingAi(true);
    setAiComment("");
    
    // Scroll suave hacia la sección de estado
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
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-amber-500/30">
      {/* Navegación Sticky */}
      <nav className="fixed top-0 w-full z-50 bg-[#0f172a]/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold heading-font text-white tracking-tighter">
              Tu<span className="text-amber-500">Look</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest">
            <a href="#inicio" className="hover:text-amber-500 transition-colors">Inicio</a>
            <a href="#servicios" className="hover:text-amber-500 transition-colors">Servicios</a>
            <a href="#estilistas" className="hover:text-amber-500 transition-colors">Estilistas</a>
            <a href="#contacto" className="hover:text-amber-500 transition-colors">Contacto</a>
          </div>
          <button className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all">
            Reservar Ahora
          </button>
        </div>
      </nav>

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
            En TuLook combinamos técnicas tradicionales con las últimas tendencias para ofrecerte un servicio inigualable.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#estilistas" className="w-full sm:w-auto bg-white text-slate-950 px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all">
              Ver Tiempos de Espera
            </a>
            <a href="#servicios" className="w-full sm:w-auto border border-slate-700 px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-slate-800 transition-all">
              Nuestros Servicios
            </a>
          </div>
        </div>
      </section>

      {/* Servicios Section */}
      <section id="servicios" className="py-24 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-sm font-bold text-amber-500 uppercase tracking-[0.3em] mb-3">Servicios</h2>
              <h3 className="text-4xl md:text-5xl font-bold heading-font text-white">Lo que hacemos mejor.</h3>
            </div>
            <p className="text-slate-500 max-w-md">
              Cada corte es una obra de arte. Utilizamos productos de primera calidad y herramientas de precisión para asegurar tu satisfacción.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Corte de Autor", desc: "Diseño personalizado según fisonomía.", price: "$12.000", icon: "fa-cut" },
              { title: "Ritual de Barba", desc: "Afeitado clásico con toalla caliente.", price: "$5.000", icon: "fa-cut" },
              { title: "Combo TuLook", desc: "El servicio completo para un cambio total.", price: "$15.000", icon: "fa-crown" }
            ].map((s, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all duration-500">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <i className={`fas ${s.icon} text-xl`}></i>
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">{s.title}</h4>
                <p className="text-slate-500 mb-6">{s.desc}</p>
                <span className="text-amber-500 font-bold text-xl">{s.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Estilistas Section */}
      <section id="estilistas" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-amber-500 uppercase tracking-[0.3em] mb-3">Nuestros Maestros</h2>
            <h3 className="text-4xl md:text-5xl font-bold heading-font text-white mb-6">Elige a tu Profesional</h3>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Haz clic en uno de nuestros estilistas para ver cuántas personas hay en espera y tu tiempo estimado.
            </p>
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

          {/* Área de Estado Dinámico */}
          <div ref={statusRef} className="min-h-[100px] scroll-mt-32">
            {selectedBarber ? (
              <WaitStatus 
                barber={selectedBarber} 
                aiComment={aiComment} 
                loadingAi={loadingAi} 
              />
            ) : (
              <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl">
                <p className="text-slate-500 italic">Selecciona un barbero arriba para ver el tiempo de espera en vivo.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contacto & Footer */}
      <footer id="contacto" className="bg-slate-950 pt-24 pb-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <span className="text-3xl font-bold heading-font text-white mb-6 block">
                Tu<span className="text-amber-500">Look</span>
              </span>
              <p className="text-slate-500 max-w-sm mb-8">
                Llevamos la experiencia de la barbería clásica al siglo XXI. Estilo, comunidad y precisión en cada detalle.
              </p>
              <h5 className = "text-white font-bold uppercase tracking-widest text-sm mb-6">Redes Sociales</h5>
              <div className="flex gap-4">
                {['fa-instagram'].map((icon, i) => (
                  <a key={i} href="https://www.instagram.com/tulook_colon?igsh=OG5yZjdrNm9yM3ps" className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all border border-slate-800">
                    <i className={`fab ${icon}`}></i>
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="text-white font-bold uppercase tracking-widest text-sm mb-6">Ubicación</h5>
              <p className="text-slate-500 text-sm leading-relaxed">
                Sarmiento 68.<br />
                Colon, Entre Rios. <br />
                CP 3280.<br />
              </p>
               <a href="https://maps.app.goo.gl/uXCvu2xt6fTwb5g16" className="hover:text-amber-500">Abrir en Maps</a>
              
            </div>

            <div>
              <h5 className="text-white font-bold uppercase tracking-widest text-sm mb-6">Horarios</h5>
              <p className="text-slate-500 text-sm leading-relaxed">
                Lunes: 16:00 - 21:00<br />
                Mar - Jue: 09:30 - 13:00<br />
                Viernes: 10:00 - 22:00<br />
                Sábados: 10:00 - 22:00<br />
                Domingos: Cerrado
              </p>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-xs">
              © 2024 TuLook Barbería. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-xs text-slate-600 uppercase tracking-widest font-bold">
              <a href="#" className="hover:text-amber-500">Privacidad</a>
              <a href="#" className="hover:text-amber-500">Términos</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
