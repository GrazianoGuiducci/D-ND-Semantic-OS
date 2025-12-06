import React, { useState, useCallback, useEffect } from 'react';
// STRICT RELATIVE IMPORTS
import { Message, MessageRole, VRAState, ExpertVector, KLIItem } from './systemTypes';
import { INITIAL_VECTORS } from './constants';
import { sendMessageToDND, parseDNDResponse } from './services/vraService';
import { saveMemory, loadMemory, clearMemory } from './services/storageService';
import HolographicConsole from './components/HolographicConsole';
import InputMatrix from './components/InputMatrix';
import VRAVisualizer from './components/VRAVisualizer';
import VectorMonitor from './components/VectorMonitor';
import KLIRepository from './components/KLIRepository';
import AmbientPulse from './components/AmbientPulse';
import Guide from './Guide'; 
import { Cpu, Menu, Database, X, BookOpen, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

console.log("D-ND OS :: MAIN LINK ESTABLISHED [CLEAN v4.3 - UX REFACTOR]");

const DEFAULT_INIT_MESSAGE: Message = {
    id: 'init-1',
    role: MessageRole.System,
    content: 'SYSTEM INITIALIZED. VRA CORE ONLINE. WAITING FOR INPUT VECTOR.',
    timestamp: Date.now(),
    layers: [
      { id: 'l1', type: 'direct', content: 'System Ready. Awaiting perturbation vector.' },
      { id: 'l2', type: 'structural', content: 'Kernel: SACS-PS v14.0\nArchitecture: Aethelred v3.1\nMode: Idle' },
    ]
};

const Main: React.FC = () => {
  // --- STATE INITIALIZATION WITH MEMORY CHECK ---
  const [messages, setMessages] = useState<Message[]>(() => {
      const memory = loadMemory();
      if (memory && memory.messages.length > 0) {
          // Inject a meta-message indicating restoration
          const restoreMsg: Message = {
              id: `restore-${Date.now()}`,
              role: MessageRole.System,
              content: 'MEMORY RESTORED FROM LOCAL STORAGE.',
              timestamp: Date.now(),
              layers: []
          };
          // Don't duplicate if already restored recently? Naive check.
          return [...memory.messages, restoreMsg];
      }
      return [DEFAULT_INIT_MESSAGE];
  });

  const [kliItems, setKliItems] = useState<KLIItem[]>(() => {
      const memory = loadMemory();
      return memory ? memory.kliItems : [];
  });

  // --- PERSISTENCE HOOK ---
  useEffect(() => {
      saveMemory(messages, kliItems);
  }, [messages, kliItems]);

  const [vraState, setVraState] = useState<VRAState>(VRAState.Idle);
  const [activeVectors, setActiveVectors] = useState<ExpertVector[]>(INITIAL_VECTORS);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [isSystemIdle, setIsSystemIdle] = useState(false);

  useEffect(() => {
    const heartbeat = setInterval(() => {
        const isIdleNow = Date.now() - lastInteraction > 5000;
        if (isIdleNow !== isSystemIdle) {
            setIsSystemIdle(isIdleNow);
        }
    }, 1000);
    return () => clearInterval(heartbeat);
  }, [lastInteraction, isSystemIdle]);

  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [activeDocId, setActiveDocId] = useState<string | undefined>(undefined);

  const handleOpenDocs = (id?: string) => {
      setActiveDocId(id);
      setIsGuideOpen(true);
      updateInteraction();
  };

  // --- SYSTEM PURGE ---
  const handleSystemPurge = () => {
      if (window.confirm("WARNING: INITIATING SYSTEM PURGE.\n\nThis will wipe all Axiomatic RAM (Chat History & KLI). Are you sure?")) {
          clearMemory();
          setMessages([DEFAULT_INIT_MESSAGE]);
          setKliItems([]);
          setVraState(VRAState.Idle);
          // Visual feedback
          alert("SYSTEM MEMORY PURGED.");
      }
  };

  const [leftWidth, setLeftWidth] = useState(260);
  const [rightWidth, setRightWidth] = useState(280);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState<'left' | 'right' | null>(null);
  
  const [showMobileLeft, setShowMobileLeft] = useState(false);
  const [showMobileRight, setShowMobileRight] = useState(false);

  const sidebarMin = 72; 
  const sidebarThreshold = 180; 

  const updateInteraction = () => setLastInteraction(Date.now());

  const startResize = (direction: 'left' | 'right') => {
    setIsDragging(direction);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const stopResize = useCallback(() => {
    setIsDragging(null);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  const handleResize = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    if (isDragging === 'left') {
      const newWidth = e.clientX;
      if (newWidth < sidebarThreshold) {
        if (!isLeftCollapsed) setIsLeftCollapsed(true);
        setLeftWidth(sidebarMin);
      } else {
        if (isLeftCollapsed) setIsLeftCollapsed(false);
        setLeftWidth(Math.min(450, Math.max(sidebarThreshold, newWidth)));
      }
    } else {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth < sidebarThreshold) {
        if (!isRightCollapsed) setIsRightCollapsed(true);
        setRightWidth(sidebarMin);
      } else {
        if (isRightCollapsed) setIsRightCollapsed(false);
        setRightWidth(Math.min(450, Math.max(sidebarThreshold, newWidth)));
      }
    }
  }, [isDragging, isLeftCollapsed, isRightCollapsed]);

  useEffect(() => {
    window.addEventListener('mousemove', handleResize);
    window.addEventListener('mouseup', stopResize);
    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', stopResize);
    };
  }, [handleResize, stopResize]);

  const handleSendMessage = async (text: string, overrideVectorName?: string) => {
    updateInteraction();
    const finalContent = overrideVectorName 
        ? `[OVERRIDE_VECTOR: ${overrideVectorName}] ${text}` 
        : text;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: MessageRole.User,
      content: text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);

    setVraState(VRAState.ResonanceScan);
    
    setTimeout(() => {
      setVraState(VRAState.Weaving);
      const weavingVectors = activeVectors.map(v => ({
          ...v, 
          active: overrideVectorName ? v.name === overrideVectorName : Math.random() > 0.6
      }));
      setActiveVectors(weavingVectors);
    }, 1200);

    try {
      const responseText = await sendMessageToDND(finalContent, [...messages, { ...userMsg, content: finalContent }]);

      setVraState(VRAState.Collapsing);
      
      setTimeout(() => {
        const parsed = parseDNDResponse(responseText);
        const msgId = (Date.now() + 1).toString();
        
        const systemMsg: Message = {
          id: msgId,
          role: MessageRole.Assistant,
          content: parsed.raw,
          layers: parsed.layers,
          timestamp: Date.now()
        };

        setMessages(prev => [...prev, systemMsg]);
        setVraState(VRAState.Manifested);

        const l3Layer = parsed.layers?.find(l => l.type === 'inferential');
        if (l3Layer) {
            const insightText = l3Layer.content.replace(/KLI:|Key Learning Insight:/i, '').trim().substring(0, 180) + (l3Layer.content.length > 180 ? '...' : '');
            const newKli: KLIItem = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                insight: insightText,
                sourceId: msgId
            };
            setKliItems(prev => [...prev, newKli]);
        }
        
        setTimeout(() => {
           setVraState(VRAState.Idle);
           setActiveVectors(INITIAL_VECTORS.map(v => ({...v, active: false})));
        }, 3000);

      }, 800); 

    } catch (error) {
      setVraState(VRAState.Idle);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: MessageRole.System,
        content: "CRITICAL ERROR: " + (error instanceof Error ? error.message : "Unknown error"),
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  return (
    <div 
      className="relative flex h-[100dvh] w-full bg-void text-slate-100 overflow-hidden font-sans selection:bg-neon-cyan/30 selection:text-neon-cyan"
      onMouseMove={updateInteraction}
      onClick={updateInteraction}
      onKeyPress={updateInteraction}
    >
      
      {/* --- DESKTOP LEFT SIDEBAR (RESIZABLE) --- */}
      <div 
        className="hidden md:flex flex-col relative shrink-0 transition-[width] duration-100 ease-out border-r border-slate-700 bg-slate-950/90 z-20 overflow-hidden"
        style={{ width: isLeftCollapsed ? sidebarMin : leftWidth }}
      >
        <VectorMonitor 
            vectors={activeVectors} 
            vraState={vraState} 
            collapsed={isLeftCollapsed} 
            onOpenDocs={() => handleOpenDocs('vec-01')}
            onToggle={() => setIsLeftCollapsed(!isLeftCollapsed)}
        />
        
        {/* Resize Handle */}
        <div 
            className="absolute -right-1 top-0 bottom-0 w-3 cursor-col-resize hover:bg-neon-cyan/20 z-30 flex items-center justify-center group opacity-0 hover:opacity-100 transition-opacity"
            onMouseDown={() => startResize('left')}
        >
            <div className="w-[2px] h-8 bg-neon-cyan group-hover:h-full transition-all duration-300 shadow-[0_0_5px_#22d3ee]" />
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col relative min-w-0 z-10 bg-slate-950/50 overflow-hidden">
        
        <div className="h-40 shrink-0 border-b border-slate-700 bg-[url('https://picsum.photos/seed/nebula/1200/400')] bg-cover bg-center relative flex items-center justify-center shadow-2xl shadow-black/80 z-20">
           <div className="absolute inset-0 bg-void/70 backdrop-blur-[1px]"></div>
           
           {/* Mobile Toggles */}
           <div className="absolute top-4 left-4 md:hidden z-50">
                <button onClick={() => setShowMobileLeft(true)} className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-600 text-neon-cyan shadow-lg active:scale-95 transition-transform">
                    <Menu size={20} />
                </button>
           </div>
           
           <div className="absolute bottom-4 right-4 md:hidden z-50">
                <button 
                  onClick={() => handleOpenDocs()}
                  className="p-2.5 bg-slate-900/90 rounded-full border border-slate-600 text-slate-200 shadow-lg active:scale-95 transition-transform"
                >
                    <BookOpen size={18} />
                </button>
           </div>

           <div className="absolute top-4 right-4 md:hidden z-50">
                <button onClick={() => setShowMobileRight(true)} className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-600 text-neon-emerald shadow-lg active:scale-95 transition-transform relative">
                    <Database size={20} />
                    {kliItems.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-neon-emerald rounded-full border-2 border-slate-900 animate-pulse" />}
                </button>
           </div>

           <VRAVisualizer state={vraState} />
           
           <div className="hidden md:flex absolute top-4 left-4 items-center gap-4">
              <h1 className="text-2xl font-bold font-mono tracking-tighter text-white flex items-center gap-2 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                 <Cpu className="text-neon-cyan" size={24} /> D-ND OS
              </h1>
           </div>

           <div className="hidden md:flex absolute top-4 right-4 items-center gap-3">
              <button
                onClick={handleSystemPurge}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-950/60 border border-red-500/50 rounded-lg text-xs font-mono text-red-300 font-bold hover:text-white hover:bg-red-900 hover:border-red-400 transition-all group shadow-lg z-50"
                title="Purge System Memory"
              >
                  <Trash2 size={14} />
                  <span className="hidden lg:inline group-hover:tracking-wider transition-all">PURGE</span>
              </button>

              <button 
                onClick={() => handleOpenDocs()}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-600 rounded-lg text-xs font-mono text-slate-300 font-bold hover:text-neon-cyan hover:border-neon-cyan transition-all group shadow-lg z-50"
              >
                  <BookOpen size={14} />
                  <span className="group-hover:tracking-wider transition-all">ARCHIVES</span>
              </button>
           </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
            <HolographicConsole messages={messages} vraState={vraState} />
            
            <AmbientPulse 
               history={messages} 
               isIdle={vraState === VRAState.Idle && isSystemIdle} 
               onSuggestionClick={(txt) => handleSendMessage(txt)}
            />
        </div>

        <InputMatrix 
            onSend={handleSendMessage} 
            disabled={vraState !== VRAState.Idle && vraState !== VRAState.Manifested && vraState !== VRAState.Input} 
            vectors={INITIAL_VECTORS}
            onFocus={() => {
                updateInteraction();
                setVraState(VRAState.Input);
            }}
            onBlur={() => setVraState(prev => prev === VRAState.Input ? VRAState.Idle : prev)}
            onOpenDocs={() => handleOpenDocs('guide-01')}
        />
      </div>

      {/* --- DESKTOP RIGHT SIDEBAR (RESIZABLE) --- */}
      <div 
        className="hidden md:flex flex-col relative shrink-0 transition-[width] duration-100 ease-out border-l border-slate-700 bg-slate-950/90 z-20 overflow-hidden"
        style={{ width: isRightCollapsed ? sidebarMin : rightWidth }}
      >
        <KLIRepository 
            items={kliItems} 
            collapsed={isRightCollapsed} 
            onToggle={() => setIsRightCollapsed(!isRightCollapsed)}
        />

        <div 
            className="absolute -left-1 top-0 bottom-0 w-3 cursor-col-resize hover:bg-neon-emerald/20 z-30 flex items-center justify-center group opacity-0 hover:opacity-100 transition-opacity"
            onMouseDown={() => startResize('right')}
        >
             <div className="w-[2px] h-8 bg-neon-emerald group-hover:h-full transition-all duration-300 shadow-[0_0_5px_#34d399]" />
        </div>
      </div>

      {/* --- MOBILE DRAWERS --- */}
      <AnimatePresence>
        {showMobileLeft && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setShowMobileLeft(false)}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9990] md:hidden"
                />
                <motion.div 
                    initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="fixed inset-y-0 left-0 w-[85vw] max-w-sm bg-slate-950 border-r border-slate-700 z-[9999] md:hidden shadow-2xl flex flex-col"
                >
                    <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-900/90">
                        <div className="flex items-center gap-2 text-neon-cyan">
                            <Cpu size={20} />
                            <span className="font-mono tracking-widest font-bold text-white">VECTOR MONITOR</span>
                        </div>
                        <button onClick={() => setShowMobileLeft(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"><X size={24} /></button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                       <VectorMonitor vectors={activeVectors} vraState={vraState} onOpenDocs={() => { setShowMobileLeft(false); handleOpenDocs('vec-01'); }} />
                    </div>
                </motion.div>
            </>
        )}
        
        {showMobileRight && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setShowMobileRight(false)}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9990] md:hidden"
                />
                <motion.div 
                    initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="fixed inset-y-0 right-0 w-[85vw] max-w-sm bg-slate-950 border-l border-slate-700 z-[9999] md:hidden shadow-2xl flex flex-col"
                >
                    <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-900/90">
                         <div className="flex items-center gap-2 text-neon-emerald">
                            <Database size={20} />
                            <span className="font-mono tracking-widest font-bold text-white">KLI REPOSITORY</span>
                        </div>
                        <button onClick={() => setShowMobileRight(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"><X size={24} /></button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                       <KLIRepository items={kliItems} />
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isGuideOpen && <Guide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} initialDocId={activeDocId} />}
      </AnimatePresence>

      {isDragging && (
        <div className="fixed inset-0 z-[1000] cursor-col-resize" />
      )}

    </div>
  );
};

export default Main;