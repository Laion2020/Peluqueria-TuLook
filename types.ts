
export interface Barber {
  id: string;
  name: string;
  specialty: string;
  emoji: string;
  waitingCount: number;
  estimatedMinutes: number;
  bio: string;
}

export interface GeminiResponse {
  advice: string;
  reasoning: string;
}
