
import React from 'react';
import { motion } from 'framer-motion';
import { VRAState } from '../systemTypes';

interface VRAVisualizerProps {
  state: VRAState;
}

const VRAVisualizer: React.FC<VRAVisualizerProps> = ({ state }) => {
  const isIdle = state === VRAState.Idle;
  const isInput = state === VRAState.Input;
  const isScanning = state === VRAState.ResonanceScan;
  const isWeaving = state === VRAState.Weaving;
  const isCollapsing = state === VRAState.Collapsing;
  const isManifested = state === VRAState.Manifested;

  // Colors based on state
  // Idle: Dark Slate
  // Input: White/Gold (Human Intention)
  // Scanning/Weaving: Cyan/Purple (System Thinking)
  // Manifested: Emerald (Success)
  
  let coreColor = '#1e293b'; // Idle
  let glowColor = 'rgba(255,255,255,0)';

  if (isInput) {
      coreColor = '#fbbf24'; // Amber/Gold
      glowColor = 'rgba(251, 191, 36, 0.4)';
  } else if (isScanning) {
      coreColor = '#06b6d4'; // Cyan
      glowColor = 'rgba(6, 182, 212, 0.4)';
  } else if (isWeaving) {
      coreColor = '#8b5cf6'; // Purple
      glowColor = 'rgba(139, 92, 246, 0.4)';
  } else if (isManifested) {
      coreColor = '#10b981'; // Emerald
  }

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Outer Ring - Static Framework */}
      <div className="absolute inset-0 border border-slate-800 rounded-full opacity-30" />
      
      {/* Input Ring (Pulse when user is active) */}
      {isInput && (
        <motion.div 
            className="absolute inset-0 border border-amber-400/50 rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Scanning Ring */}
      {(isScanning || isWeaving) && (
        <motion.div 
          className="absolute inset-0 border-2 border-dashed border-neon-cyan rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Weaving Ring - Counter Rotate */}
      {isWeaving && (
        <motion.div 
          className="absolute inset-2 border border-neon-purple rounded-full opacity-60"
          animate={{ rotate: -360, scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Core - The Singularity */}
      <motion.div 
        className="relative z-10 w-12 h-12 rounded-full blur-[1px] shadow-[0_0_20px_var(--glow-color)]"
        style={{ backgroundColor: coreColor, '--glow-color': glowColor } as any}
        animate={{ 
          scale: isCollapsing ? [1, 0.5, 1.5, 1] : isInput ? [1, 1.1, 1] : [1, 1.05, 1],
          opacity: isIdle ? 0.5 : 1
        }}
        transition={{ duration: isCollapsing ? 0.5 : isInput ? 1.5 : 2, repeat: Infinity }}
      >
        <div className="absolute inset-0 bg-white opacity-20 rounded-full blur-sm" />
      </motion.div>

      {/* Status Text Label */}
      <div className="absolute -bottom-8 w-full text-center">
        <span className="text-[10px] uppercase tracking-widest font-mono text-slate-500">
          {state.replace('_', ' ')}
        </span>
      </div>
    </div>
  );
};

export default VRAVisualizer;
