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
    <div className="p-5 border-t border-slate-700 bg-slate-950/95 backdrop-blur-xl flex flex-col gap-4 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
      
      {/* Vector Selector (Tactical Bar) */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mask-fade-right">
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700 mr-2 shrink-0">
            <Zap size={16} className="text-slate-400" />
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">Override Protocol</span>
        </div>
        {vectors.map(v => (
            <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVectorId(selectedVectorId === v.id ? null : v.id)}
                className={`
                    shrink-0 px-3 py-1.5 rounded-md text-[11px] font-mono border-2 transition-all duration-300 font-bold
                    ${selectedVectorId === v.id 
                        ? `border-${v.color.replace('text-', '')} bg-${v.color.replace('text-', '')}/20 text-white shadow-[0_0_15px_rgba(0,0,0,0.5)]` 
                        : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500 hover:text-white'}
                `}
            >
                {v.name}
            </button>
        ))}
      </div>

      {/* Input Field */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className={`absolute inset-0 bg-gradient-to-r from-neon-cyan/30 to-neon-purple/30 rounded-xl blur opacity-0 transition-opacity duration-500 ${!disabled ? 'group-hover:opacity-40 group-focus-within:opacity-60' : ''}`} />
        
        <div className={`relative flex items-center bg-slate-900 border-2 rounded-xl overflow-hidden transition-all duration-300 ${!disabled ? 'focus-within:border-neon-cyan/70 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'border-slate-700 opacity-50'}`}>
          <div className="pl-4 text-slate-400">
            <Command size={18} />
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
            className="flex-1 bg-transparent border-none text-white px-4 py-4 focus:ring-0 font-mono text-sm font-medium placeholder:text-slate-500"
          />

          <div className="flex items-center pr-3 gap-2">
            <button
              type="button"
              className="p-2.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
              title="Voice Input (Simulated)"
            >
              <Mic size={20} />
            </button>
            <button
              type="submit"
              disabled={!input.trim() || disabled}
              className="p-2.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-neon-cyan rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </form>
      
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] text-slate-500 font-mono font-bold">D-ND ENGINE :: AETHELRED ARCHITECTURE :: ONLINE</span>
        <div className="flex items-center gap-3">
             {selectedVectorId && (
                <span className="text-[10px] text-neon-cyan font-mono font-bold animate-pulse">
                    OVERRIDE ACTIVE
                </span>
            )}
            {onOpenDocs && (
                <button onClick={onOpenDocs} className="text-slate-500 hover:text-white transition-colors" title="Open Field Guide">
                    <HelpCircle size={14} />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default InputMatrix;