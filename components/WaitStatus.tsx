import React from 'react';
import { Barber } from '../types';
import { Link } from 'react-router-dom';

interface WaitStatusProps {
  barber: Barber;
  aiComment: string;
  loadingAi: boolean;
  // Añadimos estas dos props para recibir los datos reales de Firebase
  realCount?: number; 
  realMinutes?: number;
}

const WaitStatus: React.FC<WaitStatusProps> = ({ 
  barber, 
  aiComment, 
  loadingAi, 
  realCount = 0, 
  realMinutes = 0 
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2.5rem] p-8 md:p-12 border border-slate-800 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
      {/* Elemento decorativo de fondo */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full"></div>
      
      {/* Cambiamos a 12 columnas para mayor precisión en el diseño */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
        
        {/* Lado Izquierdo: Info y Stats (Colspan 7) */}
        <div className="lg:col-span-7">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-5xl drop-shadow-lg">{barber.emoji}</span>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold heading-font text-white leading-tight">
                Disponibilidad de {barber.name}
              </h2>
              <p className="text-amber-500 font-semibold tracking-wide">{barber.specialty}</p>
            </div>
          </div>
          
          <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
            {barber.bio}
          </p>
          
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            <div className="bg-slate-800/40 p-5 md:p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
              <span className="block text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-2 font-bold">Gente en cola</span>
              <div className="flex items-baseline gap-2">
                {/* Usamos realCount si viene de Firebase, sino el estático */}
                <span className="text-3xl md:text-4xl font-bold text-white">{realCount}</span>
                <span className="text-slate-500 text-sm">personas</span>
              </div>
            </div>
            <div className="bg-slate-800/40 p-5 md:p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
              <span className="block text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-2 font-bold">Espera estimada</span>
              <div className="flex items-baseline gap-2">
                {/* Usamos realMinutes si viene de Firebase */}
                <span className="text-3xl md:text-4xl font-bold text-amber-500">{realMinutes}</span>
                <span className="text-slate-500 text-sm">minutos</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Lado Derecho: IA y Acción (Colspan 5) */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-slate-800/30 border border-white/5 p-8 rounded-[2rem] relative flex flex-col h-full">
            <i className="fas fa-quote-left text-amber-500/10 text-6xl absolute -top-4 -left-2"></i>
            
            <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
              Mensaje del Estilista
            </h4>
            
            <div className="min-h-[120px] flex flex-col justify-center mb-6">
              {loadingAi ? (
                <div className="space-y-3">
                  <div className="h-3 bg-slate-700/50 rounded-full w-full animate-pulse"></div>
                  <div className="h-3 bg-slate-700/50 rounded-full w-5/6 animate-pulse"></div>
                  <div className="h-3 bg-slate-700/50 rounded-full w-4/6 animate-pulse"></div>
                </div>
              ) : (
                <p className="text-lg md:text-xl italic text-slate-200 leading-relaxed font-light">
                  "{aiComment}"
                </p>
              )}
            </div>
            
            <Link 
              to={`/registro?barbero=${encodeURIComponent(barber.name)}`}
              className="w-full bg-white hover:bg-amber-500 text-slate-950 hover:text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-xl hover:shadow-amber-500/20 uppercase tracking-[0.2em] text-xs flex items-center justify-center"
            >
              Confirmar Turno
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WaitStatus;