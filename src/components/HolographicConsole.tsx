import React, { useRef, useEffect, useState } from 'react';
import { Message, MessageRole, VRAState, DNDLayer } from '../systemTypes';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Layers, Box, User, Cpu } from 'lucide-react';
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
    <div className="flex-1 relative flex flex-col overflow-hidden bg-slate-950/90 backdrop-blur-md">
      {/* Scanlines Effect - Reduced opacity for better text readability */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] bg-[length:100%_2px,3px_100%] opacity-10"></div>

      {/* Header */}
      <div className="h-10 border-b border-slate-700 flex items-center justify-between px-4 bg-void z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-neon-cyan" />
          <span className="text-xs font-mono text-slate-200 font-bold">COCKPIT_V3 :: MAIN_FEED</span>
        </div>
        <div className="text-[10px] font-mono text-slate-400 font-bold">
          SECURE_CONN_ESTABLISHED
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 z-10 scroll-smooth">
        {messages.map((msg, index) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 ${msg.role === MessageRole.User ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar / Icon */}
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-1 ${
              msg.role === MessageRole.User 
                ? 'border-slate-500 bg-slate-800 text-white shadow-lg' 
                : 'border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan shadow-[0_0_15px_rgba(34,211,238,0.3)]'
            }`}>
              {msg.role === MessageRole.User ? <User size={16} /> : <Cpu size={16} />}
            </div>

            {/* Content Bubble */}
            <div className={`flex flex-col max-w-[85%] ${msg.role === MessageRole.User ? 'items-end' : 'items-start'}`}>
              
              {msg.role === MessageRole.User ? (
                // User Message
                <div className="bg-slate-800 border border-slate-600 rounded-xl p-3.5 text-sm text-white font-sans font-medium shadow-xl tracking-wide leading-relaxed">
                  {msg.content}
                </div>
              ) : (
                // System/Assistant Message (D-ND Output)
                <div className="w-full space-y-3">
                  
                  {/* If layers exist, render structured output */}
                  {msg.layers && msg.layers.length > 0 ? (
                     msg.layers.map((layer, idx) => (
                      <LayerBlock 
                        key={`${msg.id}-${layer.id}`} 
                        layer={layer} 
                        index={idx} 
                        isLastMessage={index === messages.length - 1}
                      />
                    ))
                  ) : (
                    // Fallback or Raw content
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-200 font-mono text-sm leading-relaxed">
                       {msg.content}
                    </div>
                  )}

                </div>
              )}
              
              <span className="text-[10px] text-slate-400 mt-1 font-mono font-bold flex items-center gap-2">
                {msg.role === MessageRole.Assistant && <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-pulse shadow-[0_0_5px_#22d3ee]"></span>}
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Loading/Processing State Indicator */}
        {vraState !== VRAState.Idle && vraState !== VRAState.Manifested && vraState !== VRAState.Input && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 items-center"
          >
             <div className="w-8 h-8 rounded-lg border border-neon-cyan/40 bg-neon-cyan/10 flex items-center justify-center shadow-[0_0_10px_rgba(34,211,238,0.2)]">
               <div className="w-2.5 h-2.5 bg-neon-cyan rounded-full animate-pulse"></div>
             </div>
             <div className="flex items-center gap-2 h-8">
               <span className="text-sm font-mono text-neon-cyan font-bold animate-pulse uppercase tracking-widest">
                 {vraState.replace('_', ' ')}...
               </span>
             </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Sub-component for rendering a D-ND Layer with Progressive Disclosure
const LayerBlock: React.FC<{ layer: DNDLayer, index: number, isLastMessage: boolean }> = ({ layer, index, isLastMessage }) => {
  const [expanded, setExpanded] = React.useState(true);
  const [displayedContent, setDisplayedContent] = React.useState("");
  
  // Sequencing constants
  const TYPE_SPEED = 5; // ms per char for L1
  const DELAY_L2 = 0.5; // seconds
  const DELAY_L3 = 1.0; // seconds

  useEffect(() => {
    if (layer.type === 'direct' && isLastMessage) {
        let currentText = "";
        let currentIndex = 0;
        
        const interval = setInterval(() => {
            if (currentIndex < layer.content.length) {
                currentText += layer.content[currentIndex];
                setDisplayedContent(currentText);
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, TYPE_SPEED);

        return () => clearInterval(interval);
    } else {
        setDisplayedContent(layer.content);
    }
  }, [layer.content, layer.type, isLastMessage]);

  const entranceDelay = layer.type === 'direct' ? 0 : layer.type === 'structural' ? DELAY_L2 : DELAY_L3;

  // Styling - High Contrast
  const config = {
    direct: {
      color: 'border-neon-cyan',
      bg: 'bg-neon-cyan/10',
      icon: <Terminal size={14} className="text-neon-cyan" />,
      label: 'L1: DIRECT MANIFESTATION'
    },
    structural: {
      color: 'border-neon-purple',
      bg: 'bg-neon-purple/10',
      icon: <Box size={14} className="text-neon-purple" />,
      label: 'L2: STRUCTURAL ABSTRACTION'
    },
    inferential: {
      color: 'border-neon-emerald',
      bg: 'bg-neon-emerald/10',
      icon: <Layers size={14} className="text-neon-emerald" />,
      label: 'L3: INFERENTIAL TRANSPARENCY'
    }
  };

  const style = config[layer.type];

  const [visible, setVisible] = useState(!isLastMessage);
  
  useEffect(() => {
    if (isLastMessage) {
        const timer = setTimeout(() => setVisible(true), entranceDelay * 1000);
        return () => clearTimeout(timer);
    }
  }, [isLastMessage, entranceDelay]);

  if (!visible) return null;

  return (
    <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className={`border-l-[3px] ${style.color} ${style.bg} rounded-r-lg pl-4 pr-3 py-3 overflow-hidden shadow-sm`}
    >
      <button 
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full hover:bg-white/5 p-1.5 rounded transition-colors mb-2 select-none"
      >
        <div className={`transition-transform duration-200 text-slate-400 ${expanded ? 'rotate-0' : '-rotate-90'}`}>
             <span className="text-[10px]">▼</span>
        </div>
        {style.icon}
        <span className="text-[11px] font-mono font-bold tracking-widest text-slate-200 uppercase">
          {style.label}
        </span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="text-sm text-slate-100 font-sans prose prose-invert prose-p:leading-7 prose-headings:text-white prose-headings:font-mono prose-headings:font-bold prose-code:text-neon-cyan prose-code:bg-slate-900 prose-code:border prose-code:border-slate-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded max-w-none"
          >
             <ReactMarkdown>{displayedContent}</ReactMarkdown>
             {layer.type === 'direct' && displayedContent.length < layer.content.length && (
                 <span className="inline-block w-2.5 h-5 bg-neon-cyan ml-1 animate-pulse align-middle shadow-[0_0_8px_#22d3ee]"></span>
             )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HolographicConsole;