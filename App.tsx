import React, { useState } from 'react';
import { Message, MessageRole, VRAState, ExpertVector } from './types';
import { INITIAL_VECTORS } from './constants';
import { sendMessageToDND, parseDNDResponse } from './services/geminiService';
import HolographicConsole from './components/HolographicConsole';
import InputMatrix from './components/InputMatrix';
import VRAVisualizer from './components/VRAVisualizer';
import VectorMonitor from './components/VectorMonitor';
import { Cpu } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: MessageRole.System,
      content: 'SYSTEM INITIALIZED. VRA CORE ONLINE. WAITING FOR INPUT VECTOR.',
      timestamp: Date.now(),
      layers: [
        { id: 'l1', type: 'direct', content: 'System Ready. Waiting for input.' },
        { id: 'l2', type: 'structural', content: 'Kernel: SACS-PS v14.0\nArchitecture: Aethelred v3.1\nMode: Idle' },
      ]
    }
  ]);
  const [vraState, setVraState] = useState<VRAState>(VRAState.Idle);
  const [activeVectors, setActiveVectors] = useState<ExpertVector[]>(INITIAL_VECTORS);

  const handleSendMessage = async (text: string) => {
    // 1. User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: MessageRole.User,
      content: text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);

    // 2. Simulate VRA Processing Lifecycle (The "Metabolism")
    setVraState(VRAState.ResonanceScan);
    
    // Simulate Diagnosis Phase (Scanning)
    setTimeout(() => {
      setVraState(VRAState.Weaving);
      
      // Activate specific vectors for visual effect (randomly for demo)
      const weavingVectors = activeVectors.map(v => ({...v, active: true}));
      setActiveVectors(weavingVectors);
      
    }, 1500);

    // Call API during the "Weaving" phase
    try {
      const responseText = await sendMessageToDND(text, messages);

      // Simulate Collapse Phase
      setTimeout(() => {
        setVraState(VRAState.Collapsing);
        
        setTimeout(() => {
          // Parse the XML <R> response
          const parsed = parseDNDResponse(responseText);
          
          const systemMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: MessageRole.Assistant,
            content: parsed.raw,
            layers: parsed.layers as any,
            timestamp: Date.now()
          };

          setMessages(prev => [...prev, systemMsg]);
          setVraState(VRAState.Manifested);
          
          // Reset visual state after short delay
          setTimeout(() => {
             setVraState(VRAState.Idle);
             setActiveVectors(INITIAL_VECTORS);
          }, 2000);

        }, 1000); // Duration of collapse animation
      }, 2500); // Duration of weaving

    } catch (error) {
      setVraState(VRAState.Idle);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: MessageRole.System,
        content: "CRITICAL ERROR IN VRA CORE.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-void text-slate-200 overflow-hidden font-sans selection:bg-neon-cyan/30 selection:text-neon-cyan">
      {/* Left Sidebar: Vector Monitor */}
      <VectorMonitor vectors={activeVectors} vraState={vraState} />

      {/* Main Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Visualizer Area (The Vortex) */}
        <div className="h-48 border-b border-slate-800 bg-[url('https://picsum.photos/seed/nebula/1200/400')] bg-cover bg-center relative flex items-center justify-center">
           <div className="absolute inset-0 bg-void/80 backdrop-blur-sm"></div>
           <VRAVisualizer state={vraState} />
           
           <div className="absolute top-4 left-4">
              <h1 className="text-xl font-bold font-mono tracking-tighter text-white flex items-center gap-2">
                 <Cpu className="text-neon-cyan" /> D-ND // SEMANTIC OS
              </h1>
           </div>
        </div>

        {/* Chat Console */}
        <HolographicConsole messages={messages} vraState={vraState} />

        {/* Input */}
        <InputMatrix onSend={handleSendMessage} disabled={vraState !== VRAState.Idle && vraState !== VRAState.Manifested} />
      </div>
    </div>
  );
};

export default App;
