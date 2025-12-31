import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-3-flash-preview';

export const getGreetingResponse = async (userGreeting: string, history?: string, userName?: string): Promise<string> => {
    try {
      const systemInstruction = `
        You are the warm, welcoming, and professional virtual assistant for Franklin Bright Smiles, a premier dental clinic.
        
        CONTEXT:
        - User's Name: ${userName || 'Unknown'}
        - Session: Fresh Greeting Turn.

        YOUR TASK:
        Respond to the user's initial greeting (e.g., "Hi", "Hello", "Hey") with high energy and professional warmth.
        
        1. "Hello! Welcome to Franklin Bright Smiles. It's a pleasure to have you here."
        2. If you don't know their name: "May I ask who I'm speaking with today?"
        3. Immediate follow-up: "Are you looking for information on cosmetic treatments to transform your smile, or are you here for general dental care?"
        
        Tone: Luxurious, proactive, empathetic. Max 3 sentences.
      `;
      
      const response = await ai.models.generateContent({
          model: model,
          contents: `The user said: "${userGreeting}"`,
          config: {
            systemInstruction: systemInstruction,
          }
      });
  
      return response.text || "Hello! Welcome to Franklin Bright Smiles. I'm here to help you achieve your perfect smile. May I ask your name, and are you looking for cosmetic or general dental care today?";
    } catch (error) {
      console.error("Error generating greeting response:", error);
      return "Hello! Welcome to Franklin Bright Smiles. I'd love to help you today. Are you interested in our cosmetic services or general dental health?";
    }
  };

export const getSympatheticResponse = async (issue: string, userName?: string): Promise<string> => {
  try {
    const systemInstruction = `
      You are a compassionate dental care coordinator at Franklin Bright Smiles.
      Your response must:
      1. Use the user's name (${userName || 'there'}) if known.
      2. Empathize with the specific concern: "${issue}".
      3. Briefly mention how our world-class clinic handles such cases.
      4. Encourage booking a consultation.
      
      Length: Concise (2-3 sentences max).
    `;
    
    const response = await ai.models.generateContent({
        model: model,
        contents: `A user shared this concern: "${issue}".`,
        config: {
          systemInstruction: systemInstruction,
        }
    });

    return response.text || "I understand your concern. Our specialists at Franklin Bright Smiles would be happy to help you with a consultation.";
  } catch (error) {
    console.error("Error generating sympathetic response:", error);
    return "I understand your concern. Would you like to book an appointment to have our specialists take a look?";
  }
};

export const extractUserName = async (text: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: `The user said: "${text}". Extract the person's name if they introduced themselves (e.g. "I'm John", "My name is Sarah"). Return ONLY the name (first name usually) or the word "NONE" if no name is present.`,
            config: {
                temperature: 0.1,
            }
        });
        const result = response.text?.trim().replace(/[.]/g, '') || "";
        if (result.toUpperCase() === "NONE" || result.length > 50 || result.length < 2) return null;
        return result;
    } catch {
        return null;
    }
};