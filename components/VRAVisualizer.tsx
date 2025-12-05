import React from 'react';
import { motion } from 'framer-motion';
import { VRAState } from '../types';

interface VRAVisualizerProps {
  state: VRAState;
}

const VRAVisualizer: React.FC<VRAVisualizerProps> = ({ state }) => {
  const isIdle = state === VRAState.Idle;
  const isScanning = state === VRAState.ResonanceScan;
  const isWeaving = state === VRAState.Weaving;
  const isCollapsing = state === VRAState.Collapsing;

  // Colors based on state
  const coreColor = isIdle ? '#1e293b' : isScanning ? '#06b6d4' : isWeaving ? '#8b5cf6' : '#10b981';
  
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Outer Ring - Static Framework */}
      <div className="absolute inset-0 border border-slate-800 rounded-full opacity-30" />
      
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
        className="relative z-10 w-12 h-12 rounded-full blur-[2px]"
        style={{ backgroundColor: coreColor }}
        animate={{ 
          scale: isCollapsing ? [1, 0.5, 1.5, 1] : [1, 1.05, 1],
          opacity: isIdle ? 0.5 : 1
        }}
        transition={{ duration: isCollapsing ? 0.5 : 2, repeat: Infinity }}
      >
        <div className="absolute inset-0 bg-white opacity-20 rounded-full blur-sm" />
      </motion.div>

      {/* Status Text Label */}
      <div className="absolute -bottom-8 w-full text-center">
        <span className="text-[10px] uppercase tracking-widest font-mono text-slate-500">
          {state}
        </span>
      </div>
    </div>
  );
};

export default VRAVisualizer;
