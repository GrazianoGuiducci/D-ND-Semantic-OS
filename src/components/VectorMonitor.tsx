import React from 'react';
import { ExpertVector, VRAState } from '../systemTypes';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Cpu, Hexagon, HelpCircle, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface VectorMonitorProps {
  vectors: ExpertVector[];
  vraState: VRAState;
  collapsed?: boolean;
  onOpenDocs?: () => void;
  onToggle?: () => void;
}

const VectorMonitor: React.FC<VectorMonitorProps> = ({ vectors, vraState, collapsed = false, onOpenDocs, onToggle }) => {
  const isProcessing = vraState !== VRAState.Idle && vraState !== VRAState.Manifested;

  const hideScrollbarStyle: React.CSSProperties = {
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  };

  // --- COLLAPSED VIEW ---
  if (collapsed) {
    return (
      <div className="h-full w-full flex flex-col items-center py-4 gap-4 overflow-hidden bg-slate-950 border-r border-slate-700">
         <button 
            onClick={onToggle}
            className="p-3 rounded-xl bg-slate-900 text-neon-cyan mb-2 border border-slate-700 shadow-lg shrink-0 hover:bg-slate-800 hover:border-neon-cyan transition-all group" 
            title="Expand Vector Monitor"
         >
            <Hexagon size={22} className="group-hover:scale-110 transition-transform" />
         </button>
         
         <div 
            className="flex-1 w-full flex flex-col items-center gap-4 overflow-y-auto overflow-x-hidden py-2"
            style={hideScrollbarStyle}
         >
            <style>{`
              .no-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {vectors.map(v => (
                <div key={v.id} className="relative group shrink-0 w-10 h-10 flex items-center justify-center">
                    <motion.div
                        layoutId={`vector-icon-${v.id}`}
                        className={`absolute inset-0 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${
                            v.active 
                            ? 'border-slate-400 bg-slate-800 opacity-100 shadow-lg shadow-neon-cyan/20' 
                            : 'border-slate-700 bg-slate-900 opacity-80 grayscale hover:opacity-100 hover:grayscale-0 hover:bg-slate-800 hover:border-slate-500'
                        }`}
                        animate={isProcessing && v.active ? { 
                            borderColor: ['rgba(148,163,184,1)', v.color.replace('text-', 'rgba(') + ',0.8)', 'rgba(148,163,184,1)'],
                            boxShadow: ['0 0 0px rgba(0,0,0,0)', `0 0 20px ${v.color.replace('text-', 'rgba(') + ',0.4)'}`, '0 0 0px rgba(0,0,0,0)']
                        } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <div className={`w-3 h-3 rounded-full ${v.color.replace('text-', 'bg-')}`} />
                        
                        {isProcessing && v.active && (
                             <span className={`absolute inline-flex h-full w-full rounded-xl opacity-75 animate-ping ${v.color.replace('text-', 'bg-')}`}></span>
                        )}
                    </motion.div>
                    
                    <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] shadow-xl text-white">
                        {v.name}
                    </div>
                </div>
            ))}
         </div>

         {onOpenDocs && (
             <button 
                onClick={onOpenDocs}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg shrink-0 mb-2" 
                title="Open Archives"
             >
                 <HelpCircle size={20} />
             </button>
         )}

         <div className="mt-auto text-slate-500 p-2 shrink-0">
             <Cpu size={20} />
         </div>
      </div>
    );
  }

  // --- EXPANDED VIEW ---
  return (
    <div className="h-full w-full p-4 flex flex-col gap-4 overflow-hidden bg-slate-950 border-r border-slate-700">
      <div className="flex items-center gap-3 mb-2 border-b border-slate-700 pb-3 shrink-0 justify-between">
        <div className="flex items-center gap-3">
             <button 
                onClick={onToggle}
                className="p-2 bg-neon-cyan/10 rounded-lg hover:bg-neon-cyan/20 transition-colors cursor-pointer group border border-transparent hover:border-neon-cyan/30"
                title="Collapse Sidebar"
             >
                <Hexagon className="w-4 h-4 text-neon-cyan group-hover:scale-90 transition-transform" />
            </button>
            <div>
                <h2 className="text-sm font-mono text-white font-bold uppercase tracking-widest whitespace-nowrap">Active Vectors</h2>
                <p className="text-[10px] text-slate-400 font-mono font-semibold">NEURAL STATUS: ONLINE</p>
            </div>
        </div>
        
        {onOpenDocs && (
             <button onClick={onOpenDocs} className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-slate-800 rounded" title="Vector Documentation">
                 <HelpCircle size={16} />
             </button>
        )}
      </div>

      <div 
        className="flex-1 space-y-3 overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-slate-700 hover:scrollbar-thumb-slate-600 pb-10"
      >
        <AnimatePresence>
        {vectors.map((vector) => {
          const isPulse = isProcessing && vector.active;
          return (
            <motion.div 
              key={vector.id}
              layout
              className={`relative p-4 rounded-xl border-2 backdrop-blur-sm ${
                vector.active 
                ? 'border-slate-500 bg-slate-800 shadow-xl' 
                : 'border-slate-800 bg-slate-900 opacity-90 hover:opacity-100 hover:bg-slate-800 hover:border-slate-600'
              } transition-all cursor-default group w-full`}
              animate={isPulse ? { borderColor: ['rgba(100,116,139,1)', 'rgba(34,211,238,0.8)', 'rgba(100,116,139,1)'] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-bold font-mono tracking-tight ${vector.color} group-hover:brightness-125 transition-all`}>
                  {vector.name}
                </span>
                {vector.active && <Activity className="w-4 h-4 text-emerald-400" />}
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                   <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-black/40 ${
                      vector.category === 'analytic' ? 'text-neon-cyan' :
                      vector.category === 'synthetic' ? 'text-neon-purple' : 'text-neon-danger'
                  }`}>
                      {vector.category}
                  </span>
              </div>

              <p className="text-xs text-slate-400 font-medium leading-relaxed group-hover:text-slate-300 transition-colors">
                {vector.description}
              </p>
              
              {/* Activity Bar */}
              {vector.active && (
                <div className="mt-4 h-1.5 w-full bg-slate-950 overflow-hidden rounded-full border border-slate-600">
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

      <div className="mt-auto pt-4 border-t border-slate-700 shrink-0">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900 border border-slate-700">
          <Cpu className="w-5 h-5 text-slate-400" />
          <div className="flex flex-col">
              <span className="text-xs font-mono font-bold text-slate-300">KERNEL</span>
              <span className="text-[10px] font-mono text-slate-500 font-bold">SACS-PS v14.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VectorMonitor;