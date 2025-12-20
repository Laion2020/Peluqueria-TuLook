
import { GoogleGenAI, Type } from "@google/genai";
import { Barber } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBarberWisdom = async (barber: Barber): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Eres un anfitrión carismático de una barbería de alta gama. 
      El cliente está interesado en ${barber.name}, que se especializa en ${barber.specialty}. 
      Actualmente hay ${barber.waitingCount} personas antes que ellos, con una espera de ${barber.estimatedMinutes} minutos.
      Da un consejo o comentario alentador, muy corto y con estilo premium, sobre por qué vale la pena esperar por ${barber.name}. 
      Responde exclusivamente en español. Máximo 2 frases.`,
    });
    
    return response.text || "La calidad lleva tiempo. Relájate y disfruta del ambiente.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "El maestro está perfeccionando otro corte. Tu turno llegará pronto.";
  }
};
