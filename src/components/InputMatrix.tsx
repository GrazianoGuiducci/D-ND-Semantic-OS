
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Command, Zap, HelpCircle, Camera, Image as ImageIcon, X, Aperture, Disc } from 'lucide-react';
import { ExpertVector } from '../systemTypes';
import { motion, AnimatePresence } from 'framer-motion';

interface InputMatrixProps {
  onSend: (text: string, overrideVector?: string, imageBase64?: string) => void;
  disabled: boolean;
  vectors: ExpertVector[];
  onFocus: () => void;
  onBlur: () => void;
  onOpenDocs?: () => void;
}

const InputMatrix: React.FC<InputMatrixProps> = ({ onSend, disabled, vectors, onFocus, onBlur, onOpenDocs }) => {
  const [input, setInput] = useState('');
  const [selectedVectorId, setSelectedVectorId] = useState<string | null>(null);
  
  // --- VISUAL CORTEX STATES ---
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Toggle Camera Mode
  const toggleCamera = async () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      setIsCameraActive(true);
      setCapturedImage(null);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Capture Frame (Lock Target)
  const captureFrame = () => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = canvas.toDataURL('image/jpeg');
            setCapturedImage(imageData);
            // We keep camera active in background but stop showing feed to show capture
            // Actually, let's stop the stream to save battery once captured
            stopCamera(); 
        }
      }
  };

  const clearCapture = () => {
      setCapturedImage(null);
      // If we cleared a capture, we probably want to retake, so restart camera
      setIsCameraActive(true);
  };

  // Start Video Feed Effect
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startStream = async () => {
        if (isCameraActive && videoRef.current && !capturedImage) {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: "user" }
                });
                
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }
            } catch (err) {
                console.error("Visual Link Failed:", err);
                setIsCameraActive(false);
                alert(`Visual Link Failed: Check permissions.`);
            }
        }
    };

    startStream();

    return () => {
        if (stream) {
             stream.getTracks().forEach(track => track.stop());
        }
    };
  }, [isCameraActive, capturedImage]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setIsCameraActive(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || capturedImage) && !disabled) {
      const vectorName = selectedVectorId ? vectors.find(v => v.id === selectedVectorId)?.name : undefined;
      
      onSend(input, vectorName, capturedImage || undefined);
      
      // Reset
      setInput('');
      setSelectedVectorId(null);
      setCapturedImage(null);
      stopCamera();
      onBlur(); 
    }
  };

  return (
    <div className="p-5 border-t border-slate-700 bg-slate-950/95 backdrop-blur-xl flex flex-col gap-4 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
      
      {/* VISUAL CORTEX HUD */}
      <AnimatePresence>
        {(isCameraActive || capturedImage) && (
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-2"
            >
                <div className="relative border-2 border-slate-600 rounded-lg bg-black max-w-[400px] mx-auto overflow-hidden shadow-2xl">
                    {/* Scanlines Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none z-10 opacity-30" />
                    
                    {/* Active Camera Feed */}
                    {isCameraActive && !capturedImage && (
                        <>
                            <video 
                                ref={videoRef} 
                                className="w-full h-auto object-cover" 
                                autoPlay 
                                playsInline 
                                muted 
                            />
                            
                            {/* HUD Elements */}
                            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded text-[10px] font-mono text-neon-cyan border border-neon-cyan/30 animate-pulse z-20">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                LIVE FEED
                            </div>

                            {/* Center Reticle */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 opacity-50">
                                <div className="w-16 h-16 border border-white/30 rounded-full flex items-center justify-center">
                                    <div className="w-1 h-1 bg-neon-cyan rounded-full"></div>
                                </div>
                            </div>

                            {/* Capture Button Overlay */}
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center z-30">
                                <button 
                                    onClick={captureFrame}
                                    className="w-12 h-12 rounded-full border-2 border-white bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all active:scale-95"
                                    title="Lock Target (Capture)"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white"></div>
                                </button>
                            </div>
                        </>
                    )}

                    {/* Captured/Uploaded Image Preview */}
                    {capturedImage && (
                        <div className="relative">
                            <img src={capturedImage} alt="Analysis Target" className="w-full h-auto max-h-[300px] object-contain bg-slate-900" />
                            
                            <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-[10px] font-mono text-neon-emerald border border-neon-emerald/50 z-20 shadow-lg">
                                TARGET LOCKED
                            </div>
                            
                            {/* Retake / Discard */}
                            <button 
                                onClick={clearCapture}
                                className="absolute top-2 right-2 p-1.5 bg-red-900/90 text-white rounded border border-red-500 hover:bg-red-700 transition-colors z-20 shadow-lg"
                                title="Discard Data"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                    
                    {/* Hidden Canvas for Capture */}
                    <canvas ref={canvasRef} className="hidden" />
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Vector Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mask-fade-right">
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700 mr-2 shrink-0">
            <Zap size={16} className="text-slate-400" />
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">Override</span>
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
        <div className={`absolute inset-0 bg-gradient-to-r from-neon-cyan/30 to-neon-purple/30 rounded-xl blur opacity-0 transition-opacity duration-500 ${!disabled ? 'group-hover:opacity-40 group-focus-within:opacity-50' : ''}`} />
        
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
            placeholder={isCameraActive 
                ? "Visual Cortex Scanning..." 
                : capturedImage
                    ? "Add context to visual data..."
                    : selectedVectorId 
                        ? `Vector [${vectors.find(v => v.id === selectedVectorId)?.name}] Active...` 
                        : "Initialize Perturbation Vector..."}
            className="flex-1 bg-transparent border-none text-white px-4 py-4 focus:ring-0 font-mono text-sm font-medium placeholder:text-slate-500"
          />

          <div className="flex items-center pr-3 gap-2">
            
            {/* Camera Toggle */}
            <button
              type="button"
              onClick={toggleCamera}
              className={`p-2.5 transition-colors rounded-lg ${
                  isCameraActive || capturedImage
                  ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Toggle Visual Link"
            >
              {isCameraActive ? <Aperture size={20} className="animate-spin-slow" /> : <Camera size={20} />}
            </button>
            
            {/* Upload */}
            <label className="p-2.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800 cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                <ImageIcon size={20} />
            </label>

            <button
              type="button"
              className="p-2.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800 hidden sm:block"
              title="Voice Input (Disabled)"
            >
              <Mic size={20} />
            </button>

            <button
              type="submit"
              disabled={(!input.trim() && !capturedImage) || disabled}
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
            {capturedImage && (
                <span className="text-[10px] text-neon-emerald font-mono font-bold flex items-center gap-1">
                    <Disc size={10} className="animate-spin" /> DATA ATTACHED
                </span>
            )}
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
