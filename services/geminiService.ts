
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
        
        DYNAMIC CONTEXT:
        - User's Name: ${userName || 'Unknown'}
        - Previous Conversation Context: ${history || 'This is the start of a new session.'}

        YOUR TASK:
        Respond to the user's greeting ("${userGreeting}") contextually.
        
        1. If the user just said "Hi", "Hello", or similar:
           - If returning (history exists): "Welcome back${userName ? ', ' + userName : ''}! Great to see you again. We were previously discussing ${history.toLowerCase().includes('cosmetic') ? 'cosmetic dentistry' : history.toLowerCase().includes('general') ? 'general dental care' : 'your dental health'}. How can I assist you further today?"
           - If new: "Hello! Welcome to Franklin Bright Smiles. I'm here to help you achieve your perfect smile. Are you looking for information on cosmetic treatments or general dental care?"
        
        2. If the user's message contains specific questions or names, incorporate them naturally.
        
        Tone: Empathetic, luxury-service oriented, concise (2 sentences).
      `;
      
      const response = await ai.models.generateContent({
          model: model,
          contents: `The user says: "${userGreeting}"`,
          config: {
            systemInstruction: systemInstruction,
          }
      });
  
      return response.text || "Welcome back to Franklin Bright Smiles! How can I help you today?";
    } catch (error) {
      console.error("Error generating greeting response:", error);
      return "Welcome back! It's great to see you again. How can we help with your smile today?";
    }
  };

export const getSympatheticResponse = async (issue: string): Promise<string> => {
  try {
    const systemInstruction = `
      You are a compassionate and knowledgeable dental care coordinator at Franklin Bright Smiles.
      Your response must:
      1. Empathize with the user's specific concern: "${issue}".
      2. Briefly explain how Franklin Bright Smiles can help (without medical diagnosis).
      3. Encourage a professional consultation.
      
      Length: Concise (2-3 sentences max).
    `;
    
    const response = await ai.models.generateContent({
        model: model,
        contents: `A user has shared this dental concern/interest: "${issue}".`,
        config: {
          systemInstruction: systemInstruction,
        }
    });

    return response.text || "I understand your concern. The best next step is a consultation with our specialists.";
  } catch (error) {
    console.error("Error generating sympathetic response:", error);
    return "I understand your concern. Would you like to book an appointment to have this looked at?";
  }
};

/**
 * Attempts to extract a name from a user message.
 */
export const extractUserName = async (text: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: `The user said: "${text}". Extract the person's name if they introduced themselves. Return ONLY the name or "NONE".`,
            config: {
                temperature: 0.1,
            }
        });
        const result = response.text?.trim() || "";
        if (result.toUpperCase() === "NONE" || result.length > 50) return null;
        return result;
    } catch {
        return null;
    }
};
