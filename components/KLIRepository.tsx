import React, { useRef, useEffect } from 'react';
import { KLIItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Sparkles, Brain } from 'lucide-react';

interface KLIRepositoryProps {
  items: KLIItem[];
  collapsed?: boolean;
}

const KLIRepository: React.FC<KLIRepositoryProps> = ({ items, collapsed = false }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [items]);

  // --- COLLAPSED VIEW ---
  if (collapsed) {
    return (
        <div className="h-full w-full flex flex-col items-center py-4 overflow-hidden bg-slate-950/50">
            <div className="relative p-3 rounded-xl bg-slate-900 text-neon-emerald mb-4 border border-slate-800 shadow-lg" title="Autopoietic Memory">
                <Database size={20} />
                {items.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-neon-emerald text-slate-900 text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-950">
                        {items.length}
                    </span>
                )}
            </div>
            
            {/* Visual indicators for items */}
            <div className="flex-1 flex flex-col gap-2 items-center w-full px-2 overflow-y-auto scrollbar-hide py-2">
                {items.slice(-15).reverse().map((item, idx) => (
                    <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        key={item.id} 
                        className={`w-2 h-2 rounded-full transition-all cursor-pointer group relative ${idx === 0 ? 'bg-neon-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-neon-emerald/40 hover:bg-neon-emerald'}`}
                    >
                         <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-700 px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 max-w-[150px] truncate">
                            {item.insight}
                        </div>
                    </motion.div>
                ))}
            </div>
            
             <div className="mt-auto text-slate-700 p-2">
                <Brain size={18} />
             </div>
        </div>
    );
  }

  // --- EXPANDED VIEW ---
  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b border-slate-800 flex items-center px-4 bg-slate-950/20 shrink-0 gap-3 justify-between">
        <div className="flex items-center gap-3">
             <div className="p-1.5 bg-neon-emerald/10 rounded-lg">
                <Database className="w-4 h-4 text-neon-emerald" />
            </div>
            <div>
                <h2 className="text-xs font-mono text-slate-300 font-bold uppercase tracking-widest whitespace-nowrap">Autopoietic RAM</h2>
                <p className="text-[10px] text-slate-600 font-mono">MEMORY STORAGE</p>
            </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">
             <span className="text-[10px] font-mono text-neon-emerald font-bold">{items.length}</span>
        </div>
      </div>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 relative scrollbar-thin scrollbar-thumb-slate-800 hover:scrollbar-thumb-slate-700">
         {items.length === 0 && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 p-8 text-center opacity-50">
                 <Sparkles className="w-8 h-8 mb-2" />
                 <span className="text-[10px] font-mono">NO INSIGHTS YET</span>
                 <p className="text-[9px] text-slate-600 mt-2 max-w-[150px]">
                     System automatically distills KLI from L3 inference layers.
                 </p>
             </div>
         )}

         <AnimatePresence>
            {items.map((item) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    className="group relative pl-3"
                >
                    {/* Timeline Line */}
                    <div className="absolute left-0 top-3 bottom-[-12px] w-[1px] bg-slate-800 group-last:bottom-auto group-last:h-full" />
                    
                    {/* Node Dot */}
                    <div className="absolute -left-[3px] top-3.5 w-1.5 h-1.5 bg-slate-900 border border-neon-emerald rounded-full z-10 shadow-[0_0_5px_rgba(16,185,129,0.5)] group-hover:bg-neon-emerald transition-colors" />
                    
                    <div className="ml-2 bg-slate-900/60 border border-slate-800 rounded-lg p-3 hover:bg-slate-800 hover:border-neon-emerald/30 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg hover:shadow-neon-emerald/5 backdrop-blur-sm group-hover:-translate-y-0.5">
                        <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-slate-800/50">
                            <span className="text-[9px] font-mono text-neon-emerald/70 font-bold">
                                KLI::{item.id.slice(-4)}
                            </span>
                            <span className="text-[9px] font-mono text-slate-600">
                                {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                        <p className="text-xs text-slate-300 font-sans line-clamp-4 leading-relaxed group-hover:line-clamp-none transition-all group-hover:text-slate-200">
                            {item.insight}
                        </p>
                    </div>
                </motion.div>
            ))}
         </AnimatePresence>
      </div>
      
       {/* Footer Status */}
      <div className="p-2 border-t border-slate-800 bg-slate-950/30 shrink-0">
        <div className="flex justify-between items-center text-[9px] font-mono text-slate-600 px-2">
            <span>STATUS: ACTIVE</span>
            <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-neon-emerald rounded-full animate-pulse"></span>
                SYNCED
            </span>
        </div>
      </div>
    </div>
  );
};

export default KLIRepository;