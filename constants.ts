
import { Barber } from './types';

export const BARBERS: Barber[] = [
  {
    id: '1',
    name: 'Gonzalo',
    specialty: 'Old school, Cortes Especiales y Barba',
    emoji: '💇‍♂️',
    waitingCount: 4,
    estimatedMinutes: 35,
    bio: 'Con 15 años de experiencia, Gonzalo es el maestro de la perfección estructural.'
  },
  {
    id: '2',
    name: 'Lautaro',
    specialty: 'Cortes clasicos y Estilos Modernos',
    emoji: '🧔',
    waitingCount: 2,
    estimatedMinutes: 45,
    bio: 'Lautaro aporta un toque contemporáneo a cada corte, especializándose en texturas de cabello largo.'
  },
  {
    id: '3',
    name: 'Agustín',
    specialty: 'New school y Diseños Creativos',
    emoji: '✂️',
    waitingCount: 5,
    estimatedMinutes: 30,
    bio: 'Agustín es nuestro especialista en cortes clásicos renovados, enfocado en la armonía facial y el detalle.'
  }
];
