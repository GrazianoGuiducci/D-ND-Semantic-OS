import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Message } from '../types';

interface AmbientPulseProps {
  history: Message[];
  onSuggestionClick: (text: string) => void;
  isIdle: boolean;
}

const AmbientPulse: React.FC<AmbientPulseProps> = ({ history, onSuggestionClick, isIdle }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Effetto "Battito Cardiaco"
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    // Trigger only if idle, history exists, and not already generating
    if (isIdle && history.length > 0 && !loading) {
      // Wait for 8 seconds of inactivity before generating suggestions
      timeout = setTimeout(() => {
        setLoading(true);
        try {
           // HEURISTIC MOCKUP FOR INSTANT FEEDBACK & TOKEN EFFICIENCY
           // In a full production env, this would be a specialized API call to a lightweight model.
           // Here we generate context-aware suggestions based on the last message to simulate the effect.
           
           const lastMsg = history[history.length - 1];
           // Don't generate if the last message was a system error or init
           if (lastMsg.role === 'system' && history.length === 1) {
             setSuggestions([
               "Initialize Resonance Scan",
               "Query Axiomatic Kernel",
               "Activate vE_Sonar"
             ]);
           } else {
             const contentSnippet = lastMsg.content.substring(0, 20).replace(/\n/g, ' ');
             setSuggestions([
               `Deepen analysis on "${contentSnippet}..."`,
               "Extract implicit axioms via SACS-PS",
               "Generate an Autopoietic Synthesis"
             ]);
           }

        } catch (e) {
          console.error("Ambient pulse failed", e);
        } finally {
          setLoading(false);
        }
      }, 8000);
    } else {
      // Clear suggestions immediately if user becomes active
      setSuggestions([]);
      setLoading(false);
    }

    return () => clearTimeout(timeout);
  }, [isIdle, history, loading]);

  if (suggestions.length === 0) return null;

  return (
    <div className="absolute bottom-24 left-0 right-0 flex justify-center items-end pointer-events-none z-20">
      <div className="flex gap-2 pointer-events-auto">
        <AnimatePresence>
          {suggestions.map((sugg, i) => (
            <motion.button
              key={`${i}-${sugg}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onSuggestionClick(sugg)}
              className="flex items-center gap-2 px-4 py-2 bg-void/80 border border-neon-purple/30 rounded-full text-xs text-neon-purple hover:bg-neon-purple/10 hover:border-neon-purple transition-all shadow-lg shadow-neon-purple/5 backdrop-blur-md cursor-pointer"
            >
              <Sparkles size={10} />
              {sugg}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AmbientPulse;