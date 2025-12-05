import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { DND_SYSTEM_PROMPT } from "../constants";
import { Message, MessageRole } from "../types";

// Initialize client securely
// Note: In a real production app, this should be proxied through a backend.
// For this generation task, we assume process.env.API_KEY is available as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const sendMessageToDND = async (
  currentInput: string,
  history: Message[]
): Promise<string> => {
  try {
    const modelId = "gemini-2.5-flash"; // Using the recommended flash model for responsiveness

    // Convert history to format expected by Gemini 
    // (Note: @google/genai simplifies chat, but here we use single-turn generation with context 
    // to enforce the System Prompt strictly on every turn for stability of the <R> tag)
    
    const contextPrompt = history
      .slice(-5) // Keep last 5 turns for context window efficiency
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    const fullPrompt = `
      ${DND_SYSTEM_PROMPT}
      
      HISTORY:
      ${contextPrompt}
      
      USER INPUT:
      ${currentInput}
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: fullPrompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });

    return response.text || "ERRORE: Collasso del campo fallito. Nessuna risultante generata.";
  } catch (error) {
    console.error("D-ND Engine Error:", error);
    return "CRITICAL FAILURE: Connessione al Campo di Potenziale interrotta.";
  }
};

// Parser to extract the layers from the XML-like structure
export const parseDNDResponse = (rawText: string) => {
  const rTagRegex = /<R>([\s\S]*?)<\/R>/;
  const match = rawText.match(rTagRegex);
  
  if (!match) return { raw: rawText, layers: [] };
  
  const content = match[1];
  
  const layers = [];
  
  // Regex to find sections [L1...], [L2...], [L3...]
  const l1 = content.match(/\[L1: DIRECT\]([\s\S]*?)(?=\[L2|$)/);
  const l2 = content.match(/\[L2: STRUCTURAL\]([\s\S]*?)(?=\[L3|$)/);
  const l3 = content.match(/\[L3: INFERENTIAL\]([\s\S]*?)(?=$)/);

  if (l1) layers.push({ id: 'l1', type: 'direct', content: l1[1].trim() });
  if (l2) layers.push({ id: 'l2', type: 'structural', content: l2[1].trim() });
  if (l3) layers.push({ id: 'l3', type: 'inferential', content: l3[1].trim() });

  return { raw: rawText, layers };
};
