
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Book, MessageSquare, Sparkles, Send, GripVertical } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { SYSTEM_DOCS, DocSection } from './data/docs';
import { queryDocsAssistant, generateIceBreakers } from './services/vraService';

interface GuideProps {
  isOpen: boolean;
  onClose: () => void;
  initialDocId?: string;
}

interface ChatMsg {
    role: 'user' | 'model';
    content: string;
}

const Guide: React.FC<GuideProps> = ({ isOpen, onClose, initialDocId }) => {
  const [activeDoc, setActiveDoc] = useState<DocSection>(SYSTEM_DOCS[0]);
  const [splitRatio, setSplitRatio] = useState(65); 
  const [isDragging, setIsDragging] = useState(false);
  
  const [chatHistory, setChatHistory] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [iceBreakers, setIceBreakers] = useState<string[]>([]);
  const [loadingBreakers, setLoadingBreakers] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const docContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (isOpen && initialDocId) {
          const target = SYSTEM_DOCS.find(d => d.id === initialDocId);
          if (target) setActiveDoc(target);
      } else if (isOpen && !initialDocId) {
          if (!activeDoc) setActiveDoc(SYSTEM_DOCS[0]);
      }
  }, [isOpen, initialDocId]);

  useEffect(() => {
    if (activeDoc) {
      setLoadingBreakers(true);
      generateIceBreakers(activeDoc).then(res => {
        setIceBreakers(res);
        setLoadingBreakers(false);
      });
      if (docContentRef.current) docContentRef.current.scrollTop = 0;
    }
  }, [activeDoc]);

  const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      e.preventDefault();
  };

  useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
          if (!isDragging) return;
          const modalElement = document.getElementById('guide-modal');
          if (!modalElement) return;
          
          const rect = modalElement.getBoundingClientRect();
          const relativeX = e.clientX - rect.left;
          const newRatio = (relativeX / rect.width) * 100;
          setSplitRatio(Math.min(80, Math.max(30, newRatio)));
      };
      const handleMouseUp = () => setIsDragging(false);

      if (isDragging) {
          window.addEventListener('mousemove', handleMouseMove);
          window.addEventListener('mouseup', handleMouseUp);
      }
      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
      };
  }, [isDragging]);

  const handleSend = async (text: string) => {
      if (!text.trim()) return;
      
      const userMsg: ChatMsg = { role: 'user', content: text };
      setChatHistory(prev => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 100);

      const response = await queryDocsAssistant(text, activeDoc, chatHistory);
      
      setIsTyping(false);
      setChatHistory(prev => [...prev, { role: 'model', content: response }]);
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        id="guide-modal"
        className="w-full h-full max-w-[1600px] bg-slate-950 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="h-14 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-3">
                <Book className="text-neon-cyan" size={20} />
                <h2 className="font-mono font-bold text-slate-200 tracking-wider">SYSTEM MANUAL</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Main Body with Split Pane */}
        <div className="flex-1 flex overflow-hidden relative">
            
            {/* LEFT PANE: Docs Browser */}
            <div className="flex flex-col h-full bg-slate-950/50" style={{ width: `${splitRatio}%` }}>
                <div className="flex-1 flex overflow-hidden">
                    
                    {/* Navigation Sidebar */}
                    <div className="w-64 bg-slate-900/30 border-r border-slate-800 overflow-y-auto p-4 space-y-6 shrink-0 hidden md:block">
                        {['Ontology', 'Architecture', 'Vectors', 'Guides', 'Meta-Protocols'].map(cat => (
                            <div key={cat}>
                                <h3 className="text-[10px] uppercase font-mono text-slate-500 mb-2 tracking-widest">{cat}</h3>
                                <div className="flex flex-col space-y-1">
                                    {SYSTEM_DOCS.filter(d => d.category === cat).map(doc => (
                                        <button
                                            key={doc.id}
                                            onClick={() => setActiveDoc(doc)}
                                            className={`text-left px-3 py-2 rounded text-xs font-mono transition-colors w-full truncate ${activeDoc.id === doc.id ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                                            title={doc.title}
                                        >
                                            {doc.title}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Content Reader */}
                    <div ref={docContentRef} className="flex-1 overflow-y-auto p-8 prose prose-invert max-w-none scroll-smooth">
                        <div className="max-w-3xl mx-auto">
                            <span className="text-xs font-mono text-neon-cyan mb-2 block uppercase tracking-wider">{activeDoc.category}</span>
                            <h1 className="text-3xl font-bold text-slate-100 mb-8 font-sans">{activeDoc.title}</h1>
                            
                            <ReactMarkdown
                                components={{
                                    code({node, className, children, ...props}) {
                                        return <code className="bg-slate-900 px-1 py-0.5 rounded text-neon-purple font-mono text-sm" {...props}>{children}</code>
                                    },
                                    pre({node, children, ...props}) {
                                        return <pre className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg overflow-x-auto" {...props}>{children}</pre>
                                    },
                                    h2: ({node, ...props}) => <h2 className="text-xl font-bold text-slate-200 mt-8 mb-4 border-b border-slate-800 pb-2" {...props} />,
                                    h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-slate-300 mt-6 mb-3" {...props} />,
                                    p: ({node, ...props}) => <p className="text-slate-400 leading-relaxed mb-4" {...props} />,
                                    ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 mb-4 text-slate-400" {...props} />,
                                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-neon-cyan pl-4 italic text-slate-500 my-6" {...props} />,
                                }}
                            >
                                {activeDoc.content}
                            </ReactMarkdown>

                            <div className="h-20" /> {/* Spacer */}
                        </div>
                    </div>
                </div>
            </div>

            {/* RESIZER HANDLE */}
            <div 
                className="w-1 bg-slate-800 hover:bg-neon-cyan/50 cursor-col-resize z-20 flex items-center justify-center transition-colors group"
                onMouseDown={handleMouseDown}
            >
                <GripVertical size={12} className="text-slate-600 group-hover:text-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* RIGHT PANE: Oracle Chat */}
            <div className="flex flex-col bg-slate-900/20 border-l border-slate-800" style={{ width: `${100 - splitRatio}%` }}>
                
                {/* Chat Header */}
                <div className="h-12 border-b border-slate-800 flex items-center px-4 bg-slate-950/30">
                    <MessageSquare size={14} className="text-neon-purple mr-2" />
                    <span className="text-xs font-mono font-bold text-slate-300">ORACLE :: DOCS ASSISTANT</span>
                </div>

                {/* Chat Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatHistory.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4 opacity-50">
                            <Sparkles className="text-neon-purple w-8 h-8 mb-2" />
                            <p className="text-xs font-mono text-slate-500">Ask the Oracle about "{activeDoc.title}"</p>
                        </div>
                    )}
                    
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                                msg.role === 'user' 
                                ? 'bg-slate-800 text-slate-200 border border-slate-700' 
                                : 'bg-neon-purple/5 text-slate-300 border border-neon-purple/20'
                            }`}>
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-neon-purple/5 border border-neon-purple/20 rounded-lg p-3">
                                <span className="flex gap-1">
                                    <span className="w-1 h-1 bg-neon-purple rounded-full animate-bounce" />
                                    <span className="w-1 h-1 bg-neon-purple rounded-full animate-bounce delay-100" />
                                    <span className="w-1 h-1 bg-neon-purple rounded-full animate-bounce delay-200" />
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Ice Breakers */}
                {!loadingBreakers && iceBreakers.length > 0 && chatHistory.length === 0 && (
                     <div className="px-4 pb-2 flex flex-wrap gap-2">
                        {iceBreakers.map((q, i) => (
                            <button 
                                key={i}
                                onClick={() => handleSend(q)}
                                className="text-[10px] px-2 py-1 rounded border border-slate-700 bg-slate-800/50 text-slate-400 hover:text-neon-purple hover:border-neon-purple/50 transition-colors"
                            >
                                {q}
                            </button>
                        ))}
                     </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/50">
                    <form 
                        onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                        className="flex gap-2"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Query the field..."
                            className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-neon-purple/50 placeholder:text-slate-600 font-mono"
                        />
                        <button 
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="p-2 bg-slate-800 border border-slate-700 rounded text-slate-400 hover:text-white hover:bg-neon-purple/20 hover:border-neon-purple/50 transition-all disabled:opacity-50"
                        >
                            <Send size={14} />
                        </button>
                    </form>
                </div>

            </div>

        </div>
      </motion.div>
    </div>
  );
};

export default Guide;
