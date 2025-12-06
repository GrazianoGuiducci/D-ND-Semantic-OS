import React, { useRef, useEffect } from 'react';
import { KLIItem } from '../systemTypes';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Sparkles, Brain } from 'lucide-react';

interface KLIRepositoryProps {
  items: KLIItem[];
  collapsed?: boolean;
  onToggle?: () => void;
}

const KLIRepository: React.FC<KLIRepositoryProps> = ({ items, collapsed = false, onToggle }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [items]);

  // --- COLLAPSED VIEW ---
  if (collapsed) {
    return (
        <div className="h-full w-full flex flex-col items-center py-4 overflow-hidden bg-slate-950 border-l border-slate-700">
            <button 
                onClick={onToggle}
                className="relative p-3 rounded-xl bg-slate-900 text-neon-emerald mb-4 border border-slate-700 shadow-lg hover:bg-slate-800 hover:border-neon-emerald transition-all group" 
                title="Expand Memory Storage"
            >
                <Database size={22} className="group-hover:scale-110 transition-transform" />
                {items.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-neon-emerald text-slate-900 text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-950">
                        {items.length}
                    </span>
                )}
            </button>
            
            {/* Visual indicators for items */}
            <div className="flex-1 flex flex-col gap-2 items-center w-full px-2 overflow-y-auto scrollbar-hide py-2">
                {items.slice(-15).reverse().map((item, idx) => (
                    <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        key={item.id} 
                        className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer group relative ${idx === 0 ? 'bg-neon-emerald shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-neon-emerald/50 hover:bg-neon-emerald'}`}
                    >
                         <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-600 px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 max-w-[150px] truncate text-white">
                            {item.insight}
                        </div>
                    </motion.div>
                ))}
            </div>
            
             <div className="mt-auto text-slate-500 p-2">
                <Brain size={20} />
             </div>
        </div>
    );
  }

  // --- EXPANDED VIEW ---
  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-slate-950 border-l border-slate-700">
      {/* Header */}
      <div className="h-14 border-b border-slate-700 flex items-center px-4 bg-slate-950 shrink-0 gap-3 justify-between">
        <div className="flex items-center gap-3">
             <button 
                onClick={onToggle}
                className="p-2 bg-neon-emerald/10 rounded-lg hover:bg-neon-emerald/20 transition-colors cursor-pointer group border border-transparent hover:border-neon-emerald/30"
                title="Collapse Sidebar"
            >
                <Database className="w-4 h-4 text-neon-emerald group-hover:scale-90 transition-transform" />
            </button>
            <div>
                <h2 className="text-sm font-mono text-white font-bold uppercase tracking-widest whitespace-nowrap">Autopoietic RAM</h2>
                <p className="text-[10px] text-slate-400 font-mono font-bold">MEMORY STORAGE</p>
            </div>
        </div>
        <div className="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded">
             <span className="text-xs font-mono text-neon-emerald font-bold">{items.length}</span>
        </div>
      </div>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 relative scrollbar-thin scrollbar-thumb-slate-700 hover:scrollbar-thumb-slate-600">
         {items.length === 0 && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 p-8 text-center opacity-70">
                 <Sparkles className="w-10 h-10 mb-3" />
                 <span className="text-xs font-mono font-bold">NO INSIGHTS YET</span>
                 <p className="text-[10px] text-slate-500 mt-2 max-w-[150px]">
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
                    <div className="absolute left-0 top-3 bottom-[-16px] w-[2px] bg-slate-800 group-last:bottom-auto group-last:h-full" />
                    
                    {/* Node Dot */}
                    <div className="absolute -left-[4px] top-3.5 w-2 h-2 bg-slate-900 border-2 border-neon-emerald rounded-full z-10 shadow-[0_0_8px_rgba(52,211,153,0.5)] group-hover:bg-neon-emerald transition-colors" />
                    
                    <div className="ml-3 bg-slate-900 border border-slate-700 rounded-lg p-3.5 hover:bg-slate-800 hover:border-neon-emerald/50 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg hover:shadow-neon-emerald/10 backdrop-blur-sm group-hover:-translate-y-0.5">
                        <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800">
                            <span className="text-[10px] font-mono text-neon-emerald font-bold tracking-wider">
                                KLI::{item.id.slice(-4)}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 font-bold">
                                {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                        <p className="text-xs text-slate-300 font-sans font-medium line-clamp-4 leading-relaxed group-hover:line-clamp-none transition-all group-hover:text-white">
                            {item.insight}
                        </p>
                    </div>
                </motion.div>
            ))}
         </AnimatePresence>
      </div>
      
       {/* Footer Status */}
      <div className="p-2 border-t border-slate-700 bg-slate-950 shrink-0">
        <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 font-bold px-2">
            <span>STATUS: ACTIVE</span>
            <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-neon-emerald rounded-full animate-pulse shadow-[0_0_5px_#34d399]"></span>
                SYNCED
            </span>
        </div>
      </div>
    </div>
  );
};

export default KLIRepository;