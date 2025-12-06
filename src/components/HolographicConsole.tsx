
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
    <div className="flex-1 relative flex flex-col overflow-hidden bg-slate-950/80 backdrop-blur-md">
      {/* Scanlines Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] bg-[length:100%_2px,3px_100%] opacity-20"></div>

      {/* Header */}
      <div className="h-10 border-b border-slate-800 flex items-center justify-between px-4 bg-void z-10 shrink-0">
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
        {messages.map((msg, index) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 ${msg.role === MessageRole.User ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar / Icon */}
            <div className={`w-8 h-8 rounded border flex items-center justify-center shrink-0 mt-1 ${
              msg.role === MessageRole.User 
                ? 'border-slate-700 bg-slate-800 text-slate-300' 
                : 'border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan shadow-[0_0_10px_rgba(6,182,212,0.2)]'
            }`}>
              {msg.role === MessageRole.User ? <User size={14} /> : <Cpu size={14} />}
            </div>

            {/* Content Bubble */}
            <div className={`flex flex-col max-w-[85%] ${msg.role === MessageRole.User ? 'items-end' : 'items-start'}`}>
              
              {msg.role === MessageRole.User ? (
                // User Message
                <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 font-sans shadow-lg">
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
                    <div className="bg-slate-900/50 border border-red-900/50 rounded p-4 text-red-400 font-mono text-xs">
                       {msg.content}
                    </div>
                  )}

                </div>
              )}
              
              <span className="text-[10px] text-slate-600 mt-1 font-mono flex items-center gap-2">
                {msg.role === MessageRole.Assistant && <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-pulse"></span>}
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
            className="flex gap-4"
          >
             <div className="w-8 h-8 rounded border border-neon-cyan/20 bg-neon-cyan/5 flex items-center justify-center">
               <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse"></div>
             </div>
             <div className="flex items-center gap-2 h-8">
               <span className="text-xs font-mono text-neon-cyan/70 animate-pulse uppercase">
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

  // Handle Typewriter effect only for L1 and only if it's the latest message being rendered for the first time
  // Note: simplified logic here, assuming if content differs it needs typing or instant show
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

  // Determine delay for animation entrance
  const entranceDelay = layer.type === 'direct' ? 0 : layer.type === 'structural' ? DELAY_L2 : DELAY_L3;

  // Styling
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

  const style = config[layer.type];

  // Logic to prevent L2/L3 from showing until their delay is passed (only for last message)
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
        className={`border-l-2 ${style.color} ${style.bg} rounded-r pl-3 pr-2 py-2 overflow-hidden`}
    >
      <button 
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full hover:bg-white/5 p-1 rounded transition-colors mb-2 select-none"
      >
        <div className={`transition-transform duration-200 ${expanded ? 'rotate-0' : '-rotate-90'}`}>
             <span className="text-[10px] text-slate-500">▼</span>
        </div>
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
            className="text-sm text-slate-300 font-sans prose prose-invert prose-p:leading-relaxed prose-headings:text-slate-200 prose-headings:font-mono prose-headings:text-sm prose-code:text-neon-cyan prose-code:bg-black/50 prose-code:px-1 prose-code:rounded max-w-none"
          >
             <ReactMarkdown>{displayedContent}</ReactMarkdown>
             {layer.type === 'direct' && displayedContent.length < layer.content.length && (
                 <span className="inline-block w-2 h-4 bg-neon-cyan ml-1 animate-pulse align-middle"></span>
             )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HolographicConsole;
