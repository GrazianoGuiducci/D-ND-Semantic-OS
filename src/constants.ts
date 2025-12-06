
import { ExpertVector } from './systemTypes';

export const INITIAL_VECTORS: ExpertVector[] = [
  // --- NUCLEO SACS-PS ---
  {
    id: 've-faro',
    name: 'vE_Faro',
    description: 'Intent Isolation & Focus Anchoring',
    color: 'text-neon-cyan',
    active: false,
    category: 'analytic'
  },
  {
    id: 've-sonar',
    name: 'vE_Sonar',
    description: 'Deep Semantic Scan & Latent Pattern Detection',
    color: 'text-neon-cyan',
    active: false,
    category: 'analytic'
  },
  {
    id: 've-crit',
    name: 'vE_LenteCritica',
    description: 'Axiomatic Integrity & Bias Filter',
    color: 'text-neon-danger',
    active: false,
    category: 'metacognitive'
  },
  
  // --- SUPERPOWERS INTEGRATION (OBRA) ---
  {
    id: 've-brainstorm',
    name: 'vE_Brainstorm',
    description: 'Divergent Generator (Superpower: Brainstorming)',
    color: 'text-neon-purple',
    active: false,
    category: 'synthetic'
  },
  {
    id: 've-planner',
    name: 'vE_Planner',
    description: 'Sequential Architect (Superpower: Planning)',
    color: 'text-neon-emerald',
    active: false,
    category: 'analytic'
  },
  {
    id: 've-writer',
    name: 'vE_Writer',
    description: 'Content Synthesizer (Superpower: Writing)',
    color: 'text-neon-purple',
    active: false,
    category: 'synthetic'
  },
  {
    id: 've-fucina',
    name: 'vE_Fucina',
    description: 'Autopoietic Evolution Engine',
    color: 'text-orange-500',
    active: false,
    category: 'metacognitive'
  }
];
