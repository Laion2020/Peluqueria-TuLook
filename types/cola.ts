export interface ClienteCola {
  id?: string;
  cliente: string;
  servicio: string;
  minutosEstimados: number;
  estado: 'esperando' | 'atendiendo' | 'finalizado';
  fechaLlegada: any;
}