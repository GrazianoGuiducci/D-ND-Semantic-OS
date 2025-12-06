
import { GoogleGenAI } from "@google/genai";
import { Message, MessageRole, DNDLayer } from "../systemTypes";
import { MMSP_CORE } from "../lib/axiomaticKernel";
import { DocSection, SYSTEM_DOCS } from "../data/docs";

// Initialize the client with the API key from the environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- CORE VRA SERVICES ---

export const sendMessageToDND = async (
  currentInput: string,
  history: Message[],
  imageBase64?: string // Optional image data
): Promise<string> => {
  try {
    // 1. Prepare History (Text Only for context window efficiency, or full if needed)
    // Note: Gemini supports multi-modal history, but for cost/token optimization 
    // we often strip images from far history unless essential. 
    // Here we pass text history.
    const historyMessages = history
      .filter(m => m.role !== MessageRole.System)
      .map(m => {
        // If a past message had an image, we ideally shouldn't re-send the base64 every time to save bandwidth/tokens
        // unless strictly necessary. For V1 implementation, we keep text context.
        return {
            role: m.role === MessageRole.User ? 'user' : 'model',
            parts: [{ text: m.content }],
        };
      });

    // 2. Prepare Current Message Payload
    let parts: any[] = [{ text: currentInput }];
    
    if (imageBase64) {
        // Remove header if present (e.g., "data:image/jpeg;base64,")
        const base64Data = imageBase64.split(',')[1] || imageBase64;
        parts.push({
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data
            }
        });
    }

    // 3. Create Session
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash', // Flash supports Vision + Text
      config: {
        systemInstruction: MMSP_CORE,
      },
      history: historyMessages
    });

    // 4. Send
    // Note: The SDK chat.sendMessage typically takes a string or parts. 
    // We construct the message object explicitly.
    const result = await chat.sendMessage({
        message: {
            role: 'user',
            parts: parts
        }
    });

    return result.text || "ERRORE: Collasso del campo fallito. Nessuna risultante generata.";
  } catch (error) {
    console.error("VRA CONNECTION ERROR:", error);
    throw error;
  }
};

export const parseDNDResponse = (text: string) => {
  const rBlockRegex = /<R>([\s\S]*?)<\/R>/;
  const match = text.match(rBlockRegex);

  if (!match) {
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

// --- DOCS ORACLE SERVICES ---

const ORACLE_SYSTEM_PROMPT = `
You are The Oracle, a specialized sub-routine of the D-ND OS. 
Your ONLY purpose is to assist users in understanding the Documentation.
You have access to the full System Documentation (Knowledge Base).

RULES:
1. Answer strictly based on the provided documentation context.
2. If the user asks about something not in the docs, speculate based on the "D-ND Ontology" principles but mark it as speculation.
3. DETECT LANGUAGE: You must answer in the same language the user is asking in. (Italian or English).
4. Be concise, technical but helpful. DAEDALUS style (Cyberpunk/Holographic tone).
`;

export const queryDocsAssistant = async (
  query: string,
  activeDoc: DocSection | null,
  chatHistory: { role: string, content: string }[]
): Promise<string> => {
    try {
        const docsContext = SYSTEM_DOCS.map(d => `[${d.title}]: ${d.content}`).join('\n\n');
        const activeContext = activeDoc ? `USER IS CURRENTLY READING: ${activeDoc.title}\nCONTENT:\n${activeDoc.content}` : "USER IS BROWSING GENERAL INDEX.";

        const fullPrompt = `
        ${ORACLE_SYSTEM_PROMPT}

        --- KNOWLEDGE BASE ---
        ${docsContext}
        ----------------------

        --- CURRENT CONTEXT ---
        ${activeContext}
        -----------------------

        USER QUERY: ${query}
        `;

        const chat = ai.chats.create({
            model: 'gemini-2.0-flash',
            history: chatHistory.map(m => ({
                role: m.role,
                parts: [{ text: m.content }]
            }))
        });

        const result = await chat.sendMessage({ message: fullPrompt });
        return result.text || "Oracle connection severed.";

    } catch (e) {
        console.error("ORACLE ERROR:", e);
        return "Critical Error: Oracle Logic Core Unreachable.";
    }
};

export const generateIceBreakers = async (doc: DocSection): Promise<string[]> => {
    try {
        const prompt = `
        Analyze this technical documentation section: "${doc.title}".
        Content: "${doc.content.substring(0, 500)}..."
        
        Generate 3 short, intriguing questions that a user might ask to learn more about this specific topic.
        Output ONLY the 3 questions, one per line. No bullets, no numbering.
        Language: English (default) or match content language.
        `;
        
        const result = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt
        });
        const text = result.text;
        return text ? text.split('\n').filter(l => l.trim().length > 0).slice(0, 3) : [];
    } catch (e) {
        return ["Explain this further", "How does this relate to the Kernel?", "Give me a practical example"];
    }
};