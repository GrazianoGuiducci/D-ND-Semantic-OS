
import React, { useState } from 'react';
import { Send, Mic, Command, Zap, HelpCircle } from 'lucide-react';
import { ExpertVector } from '../systemTypes';

interface InputMatrixProps {
  onSend: (text: string, overrideVector?: string) => void;
  disabled: boolean;
  vectors: ExpertVector[];
  onFocus: () => void;
  onBlur: () => void;
  onOpenDocs?: () => void;
}

const InputMatrix: React.FC<InputMatrixProps> = ({ onSend, disabled, vectors, onFocus, onBlur, onOpenDocs }) => {
  const [input, setInput] = useState('');
  const [selectedVectorId, setSelectedVectorId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      const vectorName = selectedVectorId ? vectors.find(v => v.id === selectedVectorId)?.name : undefined;
      onSend(input, vectorName);
      setInput('');
      setSelectedVectorId(null);
      onBlur(); // Reset state
    }
  };

  return (
    <div className="p-4 border-t border-slate-800 bg-void/95 backdrop-blur-xl flex flex-col gap-3 z-50 shadow-2xl shadow-neon-cyan/5">
      
      {/* Vector Selector (Tactical Bar) */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mask-fade-right">
        <div className="flex items-center gap-1 pr-2 border-r border-slate-800 mr-2 shrink-0">
            <Zap size={14} className="text-slate-500" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Override Protocol</span>
        </div>
        {vectors.map(v => (
            <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVectorId(selectedVectorId === v.id ? null : v.id)}
                className={`
                    shrink-0 px-3 py-1.5 rounded text-[10px] font-mono border transition-all duration-300
                    ${selectedVectorId === v.id 
                        ? `border-${v.color.replace('text-', '')} bg-${v.color.replace('text-', '')}/10 text-white shadow-[0_0_10px_rgba(0,0,0,0.5)]` 
                        : 'border-slate-800 bg-slate-900/50 text-slate-500 hover:border-slate-600 hover:text-slate-300'}
                `}
            >
                {v.name}
            </button>
        ))}
      </div>

      {/* Input Field */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className={`absolute inset-0 bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 rounded-lg blur opacity-0 transition-opacity duration-500 ${!disabled ? 'group-hover:opacity-30 group-focus-within:opacity-50' : ''}`} />
        
        <div className={`relative flex items-center bg-slate-950 border rounded-lg overflow-hidden transition-all duration-300 ${!disabled ? 'focus-within:border-neon-cyan/50 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'border-slate-800 opacity-50'}`}>
          <div className="pl-3 text-slate-500">
            <Command size={16} />
          </div>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={selectedVectorId 
                ? `Vector [${vectors.find(v => v.id === selectedVectorId)?.name}] Active. Awaiting Command...` 
                : "Initialize Perturbation Vector..."}
            className="flex-1 bg-transparent border-none text-slate-200 px-4 py-3 focus:ring-0 font-mono text-sm placeholder:text-slate-600"
          />

          <div className="flex items-center pr-2 gap-1">
            <button
              type="button"
              className="p-2 text-slate-500 hover:text-neon-cyan transition-colors rounded hover:bg-slate-800"
              title="Voice Input (Simulated)"
            >
              <Mic size={18} />
            </button>
            <button
              type="submit"
              disabled={!input.trim() || disabled}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-neon-cyan/20 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </form>
      
      <div className="flex justify-between items-center px-1">
        <span className="text-[9px] text-slate-600 font-mono">D-ND ENGINE :: AETHELRED ARCHITECTURE :: ONLINE</span>
        <div className="flex items-center gap-2">
             {selectedVectorId && (
                <span className="text-[9px] text-neon-cyan font-mono animate-pulse">
                    OVERRIDE ACTIVE
                </span>
            )}
            {onOpenDocs && (
                <button onClick={onOpenDocs} className="text-slate-600 hover:text-slate-400" title="Open Field Guide">
                    <HelpCircle size={12} />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default InputMatrix;
