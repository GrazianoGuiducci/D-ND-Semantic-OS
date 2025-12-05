import { GoogleGenAI } from "@google/genai";
import { Message, MessageRole, DNDLayer } from "../types";
import { MMSP_CORE } from "../lib/kernel";

// Initialize the client with the API key from the environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const sendMessageToDND = async (
  currentInput: string,
  history: Message[]
): Promise<string> => {
  try {
    // Map internal history to the API's expected format, excluding system messages
    const historyMessages = history
      .filter(m => m.role !== MessageRole.System)
      .map(m => ({
        role: m.role === MessageRole.User ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

    // Create a chat session with the system instruction injected
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: MMSP_CORE,
      },
      history: historyMessages
    });

    const result = await chat.sendMessage({
        message: currentInput
    });

    return result.text || "ERRORE: Collasso del campo fallito. Nessuna risultante generata.";
  } catch (error) {
    console.error("VRA CONNECTION ERROR:", error);
    throw error;
  }
};

export const parseDNDResponse = (text: string) => {
  // Regex to extract the main <R> block
  const rBlockRegex = /<R>([\s\S]*?)<\/R>/;
  const match = text.match(rBlockRegex);

  if (!match) {
    // Fallback: No <R> block found, treat everything as L1 and add warning in L3
    const fallbackLayers: DNDLayer[] = [
        { id: 'l1', type: 'direct', content: text },
        { id: 'l3', type: 'inferential', content: "WARNING: Axiomatic Collapse Failed. Raw output manifested." }
    ];
    return {
      raw: text,
      layers: fallbackLayers
    };
  }

  const innerContent = match[1];

  // Extract layers using regex
  const l1Match = innerContent.match(/<L1>([\s\S]*?)<\/L1>/);
  const l2Match = innerContent.match(/<L2>([\s\S]*?)<\/L2>/);
  const l3Match = innerContent.match(/<L3>([\s\S]*?)<\/L3>/);

  const layers: DNDLayer[] = [];

  if (l1Match) layers.push({ id: 'l1', type: 'direct', content: l1Match[1].trim() });
  if (l2Match) layers.push({ id: 'l2', type: 'structural', content: l2Match[1].trim() });
  if (l3Match) layers.push({ id: 'l3', type: 'inferential', content: l3Match[1].trim() });

  return {
    raw: text,
    layers: layers
  };
};
