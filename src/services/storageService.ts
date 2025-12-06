
import { Message, KLIItem } from '../systemTypes';

const STORAGE_KEYS = {
  MESSAGES: 'DND_MEM_MESSAGES',
  KLI: 'DND_MEM_KLI',
  TIMESTAMP: 'DND_MEM_LAST_ACTIVE'
};

export const saveMemory = (messages: Message[], kliItems: KLIItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    localStorage.setItem(STORAGE_KEYS.KLI, JSON.stringify(kliItems));
    localStorage.setItem(STORAGE_KEYS.TIMESTAMP, Date.now().toString());
  } catch (e) {
    console.warn("D-ND MEMORY WRITE FAILURE:", e);
  }
};

export const loadMemory = () => {
  try {
    const msgRaw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const kliRaw = localStorage.getItem(STORAGE_KEYS.KLI);
    
    if (!msgRaw) return null;

    return {
      messages: JSON.parse(msgRaw) as Message[],
      kliItems: kliRaw ? JSON.parse(kliRaw) as KLIItem[] : []
    };
  } catch (e) {
    console.warn("D-ND MEMORY CORRUPTION DETECTED. RESETTING.", e);
    clearMemory();
    return null;
  }
};

export const clearMemory = () => {
  localStorage.removeItem(STORAGE_KEYS.MESSAGES);
  localStorage.removeItem(STORAGE_KEYS.KLI);
  localStorage.removeItem(STORAGE_KEYS.TIMESTAMP);
};
