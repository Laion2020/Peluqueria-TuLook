
import { Barber } from './types';

export const BARBERS: Barber[] = [
  {
    id: '1',
    name: 'Gonzalo',
    specialty: 'Degradados Clásicos y Perfiles',
    emoji: '💇‍♂️',
    waitingCount: 4,
    estimatedMinutes: 35,
    bio: 'Con 15 años de experiencia, Gonzalo es el maestro de la perfección estructural.'
  },
  {
    id: '2',
    name: 'Lautaro',
    specialty: 'Esculpido de Barba y Textura Moderna',
    emoji: '🧔',
    waitingCount: 2,
    estimatedMinutes: 45,
    bio: 'Lautaro aporta un toque contemporáneo a cada corte, especializándose en texturas de cabello largo.'
  },
  {
    id: '3',
    name: 'Julián',
    specialty: 'Corte Ejecutivo y Estilismo Funcional',
    emoji: '✂️',
    waitingCount: 5,
    estimatedMinutes: 30,
    bio: 'Julián es nuestro especialista en cortes clásicos renovados, enfocado en la armonía facial y el detalle.'
  }
];
