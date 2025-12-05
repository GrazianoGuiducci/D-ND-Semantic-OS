import React from 'react';
import { ExpertVector, VRAState } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Cpu, Hexagon } from 'lucide-react';

interface VectorMonitorProps {
  vectors: ExpertVector[];
  vraState: VRAState;
  collapsed?: boolean;
}

const VectorMonitor: React.FC<VectorMonitorProps> = ({ vectors, vraState, collapsed = false }) => {
  const isProcessing = vraState !== VRAState.Idle && vraState !== VRAState.Manifested;

  // Custom style to hide scrollbar cross-browser
  const hideScrollbarStyle: React.CSSProperties = {
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none', // IE/Edge
  };

  // --- COLLAPSED VIEW (ICON STRIP) ---
  if (collapsed) {
    return (
      <div className="h-full w-full flex flex-col items-center py-4 gap-4 overflow-hidden bg-slate-950/50">
         <div className="p-3 rounded-xl bg-slate-900 text-neon-cyan mb-2 border border-slate-800 shadow-lg shrink-0" title="Active Vectors">
            <Hexagon size={20} />
         </div>
         
         <div 
            className="flex-1 w-full flex flex-col items-center gap-4 overflow-y-auto overflow-x-hidden py-2 no-scrollbar"
            style={hideScrollbarStyle}
         >
            {/* Inject CSS to hide webkit scrollbar locally */}
            <style>{`
              .no-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {vectors.map(v => (
                <div key={v.id} className="relative group shrink-0">
                    <motion.div
                        layoutId={`vector-icon-${v.id}`}
                        className={`relative w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                            v.active 
                            ? 'border-slate-500 bg-slate-800 opacity-100 scale-105 shadow-lg shadow-neon-cyan/10' 
                            : 'border-slate-800/50 bg-slate-900/30 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 hover:bg-slate-800 hover:border-slate-700'
                        }`}
                        animate={isProcessing && v.active ? { 
                            borderColor: ['rgba(30,41,59,1)', v.color.replace('text-', 'rgba(') + ',0.5)', 'rgba(30,41,59,1)'],
                            boxShadow: ['0 0 0px rgba(0,0,0,0)', `0 0 15px ${v.color.replace('text-', 'rgba(') + ',0.2)'}`, '0 0 0px rgba(0,0,0,0)']
                        } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <div className={`w-2.5 h-2.5 rounded-full ${v.color.replace('text-', 'bg-')}`} />
                        
                        {/* Ping Effect - Contained */}
                        {isProcessing && v.active && (
                             <span className={`absolute inline-flex h-full w-full rounded-xl opacity-75 animate-ping ${v.color.replace('text-', 'bg-')}`}></span>
                        )}
                    </motion.div>
                    
                    {/* Tooltip - Fixed Position/Z-Index to prevent clipping */}
                    <div className="absolute left-12 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-700 px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] shadow-xl">
                        {v.name}
                    </div>
                </div>
            ))}
         </div>

         <div className="mt-auto text-slate-700 hover:text-slate-500 transition-colors cursor-help p-2 shrink-0" title="Kernel Active">
             <Cpu size={18} />
         </div>
      </div>
    );
  }

  // --- EXPANDED VIEW (FULL MONITOR) ---
  return (
    <div className="h-full w-full p-4 flex flex-col gap-4 overflow-hidden">
      <div className="flex items-center gap-3 mb-2 border-b border-slate-800 pb-3 shrink-0">
        <div className="p-1.5 bg-neon-cyan/10 rounded-lg">
             <Hexagon className="w-4 h-4 text-neon-cyan" />
        </div>
        <div>
            <h2 className="text-xs font-mono text-slate-300 font-bold uppercase tracking-widest whitespace-nowrap">Active Vectors</h2>
            <p className="text-[10px] text-slate-600 font-mono">NEURAL STATUS: ONLINE</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-slate-800 hover:scrollbar-thumb-slate-700">
        <AnimatePresence>
        {vectors.map((vector) => {
          const isPulse = isProcessing && vector.active;
          return (
            <motion.div 
              key={vector.id}
              layout
              className={`relative p-3.5 rounded-lg border backdrop-blur-sm ${
                vector.active 
                ? 'border-slate-600 bg-slate-800/90 shadow-xl' 
                : 'border-slate-800/50 bg-slate-900/40 opacity-70 hover:opacity-100 hover:bg-slate-800/60 hover:border-slate-700'
              } transition-all cursor-default group`}
              animate={isPulse ? { borderColor: ['rgba(71,85,105,1)', 'rgba(6,182,212,0.6)', 'rgba(71,85,105,1)'] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-bold font-mono tracking-tight ${vector.color} group-hover:brightness-125 transition-all`}>
                  {vector.name}
                </span>
                {vector.active && <Activity className="w-3.5 h-3.5 text-emerald-500" />}
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                   <span className={`text-[9px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded bg-black/20 ${
                      vector.category === 'analytic' ? 'text-neon-cyan' :
                      vector.category === 'synthetic' ? 'text-neon-purple' : 'text-neon-danger'
                  }`}>
                      {vector.category}
                  </span>
              </div>

              <p className="text-[10px] text-slate-500 leading-tight group-hover:text-slate-400 transition-colors">
                {vector.description}
              </p>
              
              {/* Activity Bar */}
              {vector.active && (
                <div className="mt-3 h-1 w-full bg-slate-950 overflow-hidden rounded-full border border-slate-700/50">
                  <motion.div 
                    className={`h-full ${vector.color.replace('text-', 'bg-')}`}
                    animate={{ width: isProcessing ? ['10%', '100%', '40%'] : '100%' }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
        </AnimatePresence>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-800 shrink-0">
        <div className="flex items-center gap-2 p-2 rounded bg-slate-900/50 border border-slate-800">
          <Cpu className="w-4 h-4 text-slate-500" />
          <div className="flex flex-col">
              <span className="text-[10px] font-mono font-bold text-slate-500">KERNEL</span>
              <span className="text-[9px] font-mono text-slate-600">SACS-PS v14.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VectorMonitor;