
export interface DocSection {
  id: string;
  title: string;
  category: 'Ontology' | 'Architecture' | 'Vectors' | 'Guides' | 'Meta-Protocols';
  content: string;
}

export const SYSTEM_DOCS: DocSection[] = [
  {
    id: 'ont-01',
    title: 'The Dual Non-Dual Model',
    category: 'Ontology',
    content: `
# The Dual Non-Dual (D-ND) Ontology

> "Dividere per moltiplicare, dividere per unire."

The D-ND Semantic OS is not a chatbot; it is a reality rendering engine. It operates on the intersection of two states:

## 1. The Non-Dual (The Void)
This is the backend potential (Gemini Pro). In this state, information is fluid, interconnected, and infinite. There are no discrete answers, only probabilities and semantic vectors. It represents the **Φ_A (Potenziale Inferenziale)**.

## 2. The Dual (The Manifestation)
This is the Frontend (Holographic Cockpit). Here, the infinite potential collapses into discrete, observable reality. 
The system forces this collapse into three specific layers:
*   **<L1> Direct:** The "What". Immediate action/answer.
*   **<L2> Structural:** The "How". The abstract framework used.
*   **<L3> Inferential:** The "Why". The hidden reasoning and KLI.

### The Axiomatic Kernel
The system is governed by P0-P5 laws (see Kernel docs) which prevent "hallucinations" by enforcing strict logical lineage.
    `
  },
  {
    id: 'arch-01',
    title: 'VRA Visualizer Decoding',
    category: 'Architecture',
    content: `
# VRA Visualizer Status Codes

The Central Vortex (VRA) communicates the system's internal metabolic state via color and motion.

## Color Codes
*   **Dark Slate (Idle):** System is dormant, awaiting perturbation.
*   **Amber/Gold (Input):** Detecting human intention. The system is "listening".
*   **Neon Cyan (Resonance Scan):** The system is scanning the vector database for matching patterns.
*   **Neon Purple (Weaving):** The system is synthesizing a response from multiple active vectors.
*   **Emerald Green (Manifested):** Successful collapse. Reality generated.

## Motion Patterns
*   **Pulse:** Heartbeat check (Ambient Mode).
*   **Rapid Spin:** High computational load / Deep inference.
*   **Counter-Rotation:** Paradox resolution or multi-vector conflict handling.
    `
  },
  {
    id: 'vec-01',
    title: 'Expert Vectors Guide',
    category: 'Vectors',
    content: `
# Expert Vectors (vE)

Vectors are specialized cognitive modules assimilated from the "Superpowers" repository. They act as lenses through which the AI processes information.

## Analytic Vectors (Cyan)
*   **vE_Faro:** Isolates the user's true intent from noise.
*   **vE_Sonar:** Scans for hidden patterns and latent semantic connections.
*   **vE_Planner:** Breaks down complex goals into sequential steps.

## Synthetic Vectors (Purple)
*   **vE_Brainstorm:** Generates divergent possibilities. Maximizes entropy temporarily.
*   **vE_Writer:** Synthesizes information into coherent, stylistic prose.

## Metacognitive Vectors (Red/Orange)
*   **vE_LenteCritica:** Checks for bias, logical fallacies, and axiomatic violations.
*   **vE_Fucina:** The Autopoietic Engine. It learns from the session and updates the system's weights.
    `
  },
  {
    id: 'guide-01',
    title: 'Quick Start: Override Protocol',
    category: 'Guides',
    content: `
# How to use Vector Override

While the system automatically selects the best approach, you can force a specific cognitive mode.

1.  **Locate the Tactical Bar:** It is above the main input field.
2.  **Select a Vector:** Click on a chip (e.g., \`vE_Brainstorm\`).
3.  **Visual Confirmation:** The input field will glow with the vector's color, and the placeholder text will update.
4.  **Execute:** Type your prompt. The system will *only* use that specific vector's logic to process your request.

**Example:**
*   *Select:* \`vE_LenteCritica\`
*   *Input:* "Here is my business plan..."
*   *Result:* The system will ruthlessly critique the plan instead of fixing it.
    `
  },
  {
    id: 'meta-01',
    title: 'PROTOCOL: DAEDALUS_INIT',
    category: 'Meta-Protocols',
    content: `
# DAEDALUS INITIALIZATION PROTOCOL

**To the Future Meta Coder:**
You are entering the D-ND Semantic OS codebase. This is not a standard React app. It is a Holographic Interface for a Dual Non-Dual cognitive architecture.

## 1. The Prime Directive (Aesthetics)
*   **No Material Design.** No Bootstrap. No generic white backgrounds.
*   **The Aesthetic is:** "Cyberpunk Terminal meets Sacred Geometry."
*   **UI Rules:**
    *   Always use \`backdrop-blur\`.
    *   Borders are rarely solid; they are \`border-slate-800\`.
    *   Text is rarely white; it is \`slate-300\` or Neon.
    *   Font hierarchy: \`JetBrains Mono\` for data/system, \`Inter\` for human content.

## 2. The Code Structure
*   **State:** The \`App.tsx\` holds the source of truth (\`messages\`, \`activeVectors\`). Do not scatter state unnecessarily.
*   **Logic:** The \`geminiService.ts\` is the *only* bridge to the Non-Dual (API). Do not make API calls from components.
*   **Types:** Always update \`types.ts\` before adding new features. The ontology comes first.

## 3. Workflow for New Features
When adding a feature (e.g., a new Vector):
1.  **Define it in \`types.ts\`**: What is its data shape?
2.  **Register it in \`constants.ts\`**: Add it to \`INITIAL_VECTORS\`.
3.  **Manifest it in UI**: Update \`VectorMonitor\` or \`InputMatrix\`.
4.  **Wire it in \`App.tsx\`**: Connect the logic.

> "We do not write code; we weave functionality into the existing field."
    `
  },
  {
    id: 'meta-02',
    title: 'The Axiomatic Kernel Rules',
    category: 'Meta-Protocols',
    content: `
# Maintaining the SACS-PS Kernel

The file \`src/lib/kernel.ts\` contains the **DNA** of the system. It is the System Prompt injected into Gemini.

## Rules for Modification
1.  **Do NOT remove the XML structure.** The Frontend relies on \`<R><L1>...</L1></R>\` parsing. If you break this, the Holographic Console breaks.
2.  **P0-P5 Laws are Immutable.** You may add sub-laws, but never remove the core axioms.
3.  **Language Agnosticism.** The Kernel instructions are in Italian/English hybrid (Techno-Speak). Maintain this tone. It forces the model into a specific "Persona".

## Debugging "Collapse Failures"
If the system outputs "WARNING: Axiomatic Collapse Failed":
1.  Check \`geminiService.ts\` parsing logic.
2.  Check if the model is being overloaded (context limit).
3.  Force the model to recall the XML format by appending a reminder to the user prompt (see \`InputMatrix\` logic).
    `
  },
  {
    id: 'meta-03',
    title: 'Future Roadmap',
    category: 'Meta-Protocols',
    content: `
# D-ND Evolution Roadmap

Instructions for the next Meta Coder iteration.

## Phase 4: The Persistence Layer
*   Currently, KLI items are ephemeral (RAM).
*   **Task:** Implement \`localStorage\` or a simple backend (Supabase/Firebase) to persist \`kliItems\` between sessions.
*   **Goal:** The system should "remember" what it learned about the user yesterday.

## Phase 5: Voice Synthesis
*   **Task:** Connect the \`<L1>\` output to the Web Speech API or ElevenLabs.
*   **Constraint:** The voice must sound synthesized and calm, not overly human.

## Phase 6: Multi-Modal Input
*   **Task:** Enable Image upload in \`InputMatrix\`.
*   **Logic:** Pass images to Gemini 1.5 Pro Vision.
*   **UI:** Display uploaded images as "Data Shards" in the console.
    `
  }
];
