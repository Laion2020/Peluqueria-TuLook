
import React from 'react';
import { Barber } from '../types';

interface BarberCardProps {
  barber: Barber;
  isSelected: boolean;
  onSelect: (barber: Barber) => void;
}

const BarberCard: React.FC<BarberCardProps> = ({ barber, isSelected, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(barber)}
      className={`relative cursor-pointer group transition-all duration-500 overflow-hidden rounded-[2rem] border-2 ${
        isSelected ? 'border-amber-500 ring-4 ring-amber-500/10' : 'border-slate-800/50 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900'
      }`}
    >
      <div className="aspect-[4/5] flex items-center justify-center overflow-hidden relative">
        <span className="text-9xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-3">
          {barber.emoji}
        </span>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />
        
        {/* Badge de disponibilidad rápida */}
        <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${barber.waitingCount > 3 ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></span>
          <span className="text-[10px] text-white font-bold uppercase tracking-widest">
            {barber.waitingCount > 3 ? 'Ocupado' : 'Disponible'}
          </span>
        </div>
      </div>
      
      <div className="p-8 text-center">
        <h3 className="text-2xl font-bold text-white heading-font mb-1">{barber.name}</h3>
        <p className="text-amber-500/80 text-sm font-semibold uppercase tracking-widest mb-4">{barber.specialty}</p>
        
        <div className={`mt-2 py-3 px-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
          isSelected ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-slate-700'
        }`}>
          {isSelected ? 'Consultando Fila...' : 'Seleccionar'}
        </div>
      </div>
    </div>
  );
};

export default BarberCard;
