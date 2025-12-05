import React, { useRef, useEffect } from 'react';
import { Message, MessageRole, VRAState } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Layers, Box, ChevronDown, ChevronRight, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface HolographicConsoleProps {
  messages: Message[];
  vraState: VRAState;
}

const HolographicConsole: React.FC<HolographicConsoleProps> = ({ messages, vraState }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, vraState]);

  return (
    <div className="flex-1 relative flex flex-col overflow-hidden bg-slate-950/80 backdrop-blur-md">
      {/* Scanlines Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] bg-[length:100%_2px,3px_100%] opacity-20"></div>

      {/* Header */}
      <div className="h-10 border-b border-slate-800 flex items-center justify-between px-4 bg-void z-10">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-neon-cyan" />
          <span className="text-xs font-mono text-slate-400">COCKPIT_V3 :: MAIN_FEED</span>
        </div>
        <div className="text-[10px] font-mono text-slate-600">
          SECURE_CONN_ESTABLISHED
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 z-10 scroll-smooth">
        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 ${msg.role === MessageRole.User ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar / Icon */}
            <div className={`w-8 h-8 rounded border flex items-center justify-center shrink-0 ${
              msg.role === MessageRole.User 
                ? 'border-slate-700 bg-slate-800 text-slate-300' 
                : 'border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan'
            }`}>
              {msg.role === MessageRole.User ? <User size={14} /> : <Box size={14} />}
            </div>

            {/* Content Bubble */}
            <div className={`flex flex-col max-w-[80%] ${msg.role === MessageRole.User ? 'items-end' : 'items-start'}`}>
              
              {msg.role === MessageRole.User ? (
                // User Message
                <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 font-sans shadow-lg">
                  {msg.content}
                </div>
              ) : (
                // System/Assistant Message (D-ND Output)
                <div className="w-full space-y-2">
                  
                  {/* If layers exist, render structured output */}
                  {msg.layers && msg.layers.length > 0 ? (
                     msg.layers.map((layer) => (
                      <LayerBlock key={`${msg.id}-${layer.id}`} layer={layer} />
                    ))
                  ) : (
                    // Fallback or Raw content if parsing failed or generic error
                    <div className="bg-void border border-red-900/50 rounded p-4 text-red-400 font-mono text-xs">
                       {msg.content}
                    </div>
                  )}

                </div>
              )}
              
              <span className="text-[10px] text-slate-600 mt-1 font-mono">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Loading/Processing State Indicator */}
        {vraState !== VRAState.Idle && vraState !== VRAState.Manifested && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4"
          >
             <div className="w-8 h-8 rounded border border-neon-cyan/20 bg-neon-cyan/5 flex items-center justify-center">
               <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse"></div>
             </div>
             <div className="flex items-center gap-2 h-8">
               <span className="text-xs font-mono text-neon-cyan/70 animate-pulse">
                 {vraState}...
               </span>
             </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Sub-component for rendering a D-ND Layer
const LayerBlock: React.FC<{ layer: any }> = ({ layer }) => {
  const [expanded, setExpanded] = React.useState(true);
  
  // Styling based on layer type
  const config = {
    direct: {
      color: 'border-neon-cyan',
      bg: 'bg-neon-cyan/5',
      icon: <Terminal size={12} className="text-neon-cyan" />,
      label: 'L1: DIRECT MANIFESTATION'
    },
    structural: {
      color: 'border-neon-purple',
      bg: 'bg-neon-purple/5',
      icon: <Box size={12} className="text-neon-purple" />,
      label: 'L2: STRUCTURAL ABSTRACTION'
    },
    inferential: {
      color: 'border-neon-emerald',
      bg: 'bg-neon-emerald/5',
      icon: <Layers size={12} className="text-neon-emerald" />,
      label: 'L3: INFERENTIAL TRANSPARENCY'
    }
  };

  // @ts-ignore
  const style = config[layer.type];

  return (
    <div className={`border-l-2 ${style.color} ${style.bg} rounded-r pl-3 pr-2 py-2 overflow-hidden transition-all duration-300`}>
      <button 
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full hover:bg-white/5 p-1 rounded transition-colors mb-2"
      >
        {expanded ? <ChevronDown size={12} className="text-slate-400" /> : <ChevronRight size={12} className="text-slate-400" />}
        {style.icon}
        <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
          {style.label}
        </span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="text-sm text-slate-300 font-sans prose prose-invert prose-p:leading-tight prose-headings:text-slate-200 prose-headings:font-mono prose-code:text-neon-cyan prose-code:bg-black/50 prose-code:px-1 prose-code:rounded max-w-none"
          >
             <ReactMarkdown>{layer.content}</ReactMarkdown>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HolographicConsole;