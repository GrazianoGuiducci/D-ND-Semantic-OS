import React, { useState } from 'react';
import { Send, Mic, Command } from 'lucide-react';

interface InputMatrixProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

const InputMatrix: React.FC<InputMatrixProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <div className="p-4 border-t border-slate-800 bg-void/90 backdrop-blur">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity" />
        
        <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden focus-within:border-neon-cyan transition-colors">
          <div className="pl-3 text-slate-500">
            <Command size={16} />
          </div>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={disabled}
            placeholder="Initialize Perturbation Vector..."
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
      <div className="text-center mt-2">
        <span className="text-[10px] text-slate-600 font-mono">D-ND ENGINE :: AETHELRED ARCHITECTURE :: READY</span>
      </div>
    </div>
  );
};

export default InputMatrix;
