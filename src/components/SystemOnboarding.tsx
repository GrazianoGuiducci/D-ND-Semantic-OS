
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, ChevronRight, X, Circle, CheckCircle2 } from 'lucide-react';

interface SystemOnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    targetId: 'tour-vra',
    title: 'VORTEX RESONANCE ADAPTER',
    description: 'The Heart of the System. This visualizer displays the metabolic state of the AI (Idle, Thinking, Weaving). It pulses with your intent.',
    position: 'bottom'
  },
  {
    targetId: 'tour-vectors',
    title: 'VECTOR MONITOR',
    description: 'The Cognitive Lenses. These are active modules (Analytic, Creative, Critical) that shape how the AI processes your request.',
    position: 'right'
  },
  {
    targetId: 'tour-input',
    title: 'INPUT MATRIX',
    description: 'The Perturbation Interface. Enter text, override vectors manually, or link your visual cortex (Camera) here.',
    position: 'top'
  },
  {
    targetId: 'tour-console',
    title: 'HOLOGRAPHIC CONSOLE',
    description: 'The Manifestation Plane. Responses collapse here in 3 layers: Direct Answer (L1), Structural Model (L2), and Inferential Logic (L3).',
    position: 'center'
  },
  {
    targetId: 'tour-kli',
    title: 'AUTOPOIETIC RAM',
    description: 'The Evolution Memory. The system extracts "Key Learning Insights" from conversations and stores them here to get smarter over time.',
    position: 'left'
  }
];

const SystemOnboarding: React.FC<SystemOnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState<{ x: number, y: number, width: number, height: number } | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      const step = STEPS[currentStep];
      if (step.position === 'center') {
          // Center "fake" coords for the mask
          setCoords({ 
              x: window.innerWidth / 2, 
              y: window.innerHeight / 2, 
              width: 0, 
              height: 0 
          });
          return;
      }
      
      const element = document.getElementById(step.targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        // Add padding to the highlight
        const padding = 10;
        setCoords({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    setTimeout(updatePosition, 500); // DOM sync delay

    return () => window.removeEventListener('resize', updatePosition);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const stepData = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[10000] overflow-hidden pointer-events-auto">
      
      {/* SVG MASK LAYER - THE TRUE SPOTLIGHT */}
      {coords && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-500 ease-in-out">
            <defs>
              <mask id="spotlight-mask">
                {/* Everything white is visible (the blur layer) */}
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {/* Everything black is hidden (the hole) - creating the clear spot */}
                {stepData.position !== 'center' && (
                    <motion.rect 
                        initial={false}
                        animate={{
                            x: coords.x - coords.width / 2,
                            y: coords.y - coords.height / 2,
                            width: coords.width,
                            height: coords.height,
                            rx: 12 // Rounded corners
                        }}
                        transition={{ type: "spring", stiffness: 100, damping: 25 }}
                        fill="black" 
                    />
                )}
              </mask>
            </defs>
            
            {/* The blurry dark backdrop */}
            <rect 
                x="0" y="0" width="100%" height="100%" 
                fill="rgba(2, 6, 23, 0.85)" 
                mask="url(#spotlight-mask)" 
                className="backdrop-blur-sm"
            />
            
            {/* Optional: A glowing border around the cutout */}
            {stepData.position !== 'center' && (
                <motion.rect
                    initial={false}
                    animate={{
                        x: coords.x - coords.width / 2,
                        y: coords.y - coords.height / 2,
                        width: coords.width,
                        height: coords.height,
                        rx: 12
                    }}
                    transition={{ type: "spring", stiffness: 100, damping: 25 }}
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="2"
                    strokeDasharray="10 5"
                    strokeOpacity="0.5"
                />
            )}
          </svg>
      )}

      {/* Info Card */}
      <div className={`absolute flex items-center justify-center w-full h-full pointer-events-none`}>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className={`pointer-events-auto bg-slate-950/90 border border-slate-700 p-6 rounded-xl max-w-md shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl relative z-50
                ${
                    stepData.position === 'center' ? '' : 
                    stepData.position === 'bottom' ? 'mt-[350px]' : 
                    stepData.position === 'top' ? 'mb-[250px]' : 
                    stepData.position === 'right' ? 'ml-[450px]' : 'mr-[450px]'
                }
            `}
          >
             <div className="flex items-start justify-between mb-4">
                 <div className="flex items-center gap-2 text-neon-cyan">
                     <Scan size={20} />
                     <span className="font-mono text-xs font-bold tracking-widest">SYSTEM CALIBRATION {currentStep + 1}/{STEPS.length}</span>
                 </div>
                 <button onClick={onComplete} className="text-slate-500 hover:text-white transition-colors">
                     <X size={16} />
                 </button>
             </div>

             <h2 className="text-xl font-bold font-mono text-white mb-2">{stepData.title}</h2>
             <p className="text-sm text-slate-300 leading-relaxed font-sans mb-6">
                 {stepData.description}
             </p>

             <div className="flex items-center justify-between">
                 <div className="flex gap-1">
                     {STEPS.map((_, i) => (
                         <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === currentStep ? 'bg-neon-cyan' : 'bg-slate-800'}`} />
                     ))}
                 </div>
                 <button 
                    onClick={handleNext}
                    className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan rounded-lg hover:bg-neon-cyan/20 transition-all font-mono text-xs font-bold"
                 >
                     {currentStep === STEPS.length - 1 ? 'COMPLETE SYNC' : 'NEXT NODE'}
                     {currentStep === STEPS.length - 1 ? <CheckCircle2 size={14} /> : <ChevronRight size={14} />}
                 </button>
             </div>
          </motion.div>
      </div>
    </div>
  );
};

export default SystemOnboarding;
