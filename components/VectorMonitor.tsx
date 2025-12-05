import React from 'react';
import { ExpertVector, VRAState } from '../types';
import { motion } from 'framer-motion';
import { Activity, Cpu, Hexagon } from 'lucide-react';

interface VectorMonitorProps {
  vectors: ExpertVector[];
  vraState: VRAState;
}

const VectorMonitor: React.FC<VectorMonitorProps> = ({ vectors, vraState }) => {
  const isProcessing = vraState !== VRAState.Idle && vraState !== VRAState.Manifested;

  return (
    <div className="border-l border-slate-800/50 bg-slate-900/20 w-64 p-4 flex flex-col gap-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-2 border-b border-slate-800 pb-2">
        <Hexagon className="w-4 h-4 text-neon-cyan" />
        <h2 className="text-xs font-mono text-slate-400 uppercase tracking-widest">Active Vectors</h2>
      </div>

      <div className="space-y-3">
        {vectors.map((vector) => {
          // Simulate dynamic activation based on state (simplified visual logic)
          const isPulse = isProcessing && vector.active;
          
          return (
            <motion.div 
              key={vector.id}
              className={`relative p-3 rounded border ${vector.active ? 'border-slate-700 bg-slate-800/50' : 'border-transparent opacity-50'} transition-colors`}
              animate={isPulse ? { borderColor: ['rgba(30,41,59,1)', 'rgba(6,182,212,0.5)', 'rgba(30,41,59,1)'] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold font-mono ${vector.color}`}>
                  {vector.name}
                </span>
                {vector.active && <Activity className="w-3 h-3 text-emerald-500" />}
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                {vector.description}
              </p>
              
              {/* Activity Bar */}
              {vector.active && (
                <div className="mt-2 h-0.5 w-full bg-slate-700 overflow-hidden rounded-full">
                  <motion.div 
                    className={`h-full ${vector.color.replace('text-', 'bg-')}`}
                    animate={{ width: isProcessing ? ['10%', '80%', '40%'] : '5%' }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-slate-600" />
          <span className="text-[10px] font-mono text-slate-600">KERNEL: SACS-PS v14.0</span>
        </div>
      </div>
    </div>
  );
};

export default VectorMonitor;
