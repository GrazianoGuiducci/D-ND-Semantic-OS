export enum MessageRole {
  User = 'user',
  System = 'system',
  Assistant = 'assistant'
}

export interface MessageLayer {
  id: string;
  type: 'direct' | 'structural' | 'inferential';
  content: string;
  isCollapsed?: boolean;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string; // Raw content
  layers?: MessageLayer[]; // Parsed D-ND layers
  timestamp: number;
}

export enum VRAState {
  Idle = 'IDLE',
  ResonanceScan = 'SCANNING', // Phase 1: Diagnosis
  Weaving = 'WEAVING',       // Phase 2: Interaction/Weaving
  Collapsing = 'COLLAPSING', // Phase 3: Manifestation
  Manifested = 'MANIFESTED'
}

export interface ExpertVector {
  id: string;
  name: string;
  description: string;
  active: boolean;
  color: string;
}

export interface DNDContextState {
  vraState: VRAState;
  messages: Message[];
  activeVectors: ExpertVector[];
  addMessage: (msg: Message) => void;
  setVRAState: (state: VRAState) => void;
  toggleVector: (id: string) => void;
}
