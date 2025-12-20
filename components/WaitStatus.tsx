
import React from 'react';
import { Barber } from '../types';

interface WaitStatusProps {
  barber: Barber;
  aiComment: string;
  loadingAi: boolean;
}

const WaitStatus: React.FC<WaitStatusProps> = ({ barber, aiComment, loadingAi }) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2.5rem] p-10 md:p-14 border border-slate-800 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
      {/* Elemento decorativo de fondo */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full"></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
        <div className="lg:col-span-3">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-5xl">{barber.emoji}</span>
            <div>
              <h2 className="text-4xl font-bold heading-font text-white">Disponibilidad de {barber.name}</h2>
              <p className="text-amber-500 font-medium">{barber.specialty}</p>
            </div>
          </div>
          
          <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-xl">
            {barber.bio}
          </p>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
              <span className="block text-slate-500 text-xs uppercase tracking-[0.2em] mb-2">Gente en cola</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">{barber.waitingCount}</span>
                <span className="text-slate-400 font-medium">personas</span>
              </div>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
              <span className="block text-slate-500 text-xs uppercase tracking-[0.2em] mb-2">Espera estimada</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-amber-500">{barber.estimatedMinutes}</span>
                <span className="text-slate-400 font-medium">minutos</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-slate-800/30 border border-white/5 p-8 rounded-3xl relative">
            <i className="fas fa-quote-left text-amber-500/10 text-6xl absolute -top-4 -left-2"></i>
            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
              Mensaje del Estilista
            </h4>
            
            <div className="min-h-[100px] flex flex-col justify-center">
              {loadingAi ? (
                <div className="space-y-3">
                  <div className="h-4 bg-slate-700 rounded-full w-full animate-pulse"></div>
                  <div className="h-4 bg-slate-700 rounded-full w-3/4 animate-pulse"></div>
                </div>
              ) : (
                <p className="text-xl italic text-slate-200 leading-relaxed font-light">
                  "{aiComment}"
                </p>
              )}
            </div>
            
            <button className="mt-10 w-full bg-white text-slate-950 font-bold py-4 rounded-xl hover:bg-amber-500 hover:text-white transition-all shadow-xl shadow-black/20 uppercase tracking-[0.2em] text-sm">
              Confirmar Turno
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitStatus;
