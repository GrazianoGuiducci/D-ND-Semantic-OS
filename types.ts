export enum MessageRole {
  System = 'system',
  User = 'user',
  Assistant = 'model'
}

export enum VRAState {
  Idle = 'IDLE',
  ResonanceScan = 'RESONANCE_SCAN',
  Weaving = 'WEAVING_VECTORS',
  Collapsing = 'FIELD_COLLAPSE',
  Manifested = 'MANIFESTED'
}

export type LayerType = 'direct' | 'structural' | 'inferential';

export interface DNDLayer {
  id: string;
  type: LayerType;
  content: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string; // Raw content or fallback
  layers?: DNDLayer[]; // The structured D-ND output
  timestamp: number;
}

export interface ExpertVector {
  id: string;
  name: string;
  description: string;
  color: string;
  active: boolean;
  category: 'analytic' | 'synthetic' | 'metacognitive';
}

export interface DNDContextState {
  vraState: VRAState;
  messages: Message[];
  activeVectors: ExpertVector[];
  addMessage: (msg: Message) => void;
  setVRAState: (state: VRAState) => void;
  toggleVector: (id: string) => void;
}