
import React, { useRef, useEffect } from 'react';
import { VRAState } from '../systemTypes';

interface QuantumFieldProps {
  vraState?: VRAState;
}

const QuantumField: React.FC<QuantumFieldProps> = ({ vraState = VRAState.Idle }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- MATRIX CONFIGURATION ---
  // The system interprets the VRA State as a geometric frequency.
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    let height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    let time = 0;

    // 3D Point for projection
    class Node3D {
      x: number; y: number; z: number;
      baseX: number; baseY: number; baseZ: number;

      constructor(x: number, y: number, z: number) {
        this.x = this.baseX = x;
        this.y = this.baseY = y;
        this.z = this.baseZ = z;
      }

      // Rotate point in 3D space
      rotate(angleX: number, angleY: number, angleZ: number) {
        // Rotation Z
        let x1 = this.baseX * Math.cos(angleZ) - this.baseY * Math.sin(angleZ);
        let y1 = this.baseX * Math.sin(angleZ) + this.baseY * Math.cos(angleZ);
        
        // Rotation Y
        let x2 = x1 * Math.cos(angleY) - this.baseZ * Math.sin(angleY);
        let z2 = x1 * Math.sin(angleY) + this.baseZ * Math.cos(angleY);

        // Rotation X
        let y3 = y1 * Math.cos(angleX) - z2 * Math.sin(angleX);
        let z3 = y1 * Math.sin(angleX) + z2 * Math.cos(angleX);

        this.x = x2;
        this.y = y3;
        this.z = z3;
      }

      // Project 3D to 2D
      project(w: number, h: number, fov: number): { x: number, y: number, scale: number } {
        const scale = fov / (fov + this.z);
        const x2d = (this.x * scale) + w / 2;
        const y2d = (this.y * scale) + h / 2;
        return { x: x2d, y: y2d, scale: scale };
      }
    }

    // Initialize Nodes (A Hyper-Cube structure)
    const nodes: Node3D[] = [];
    const GRID_SIZE = 4;
    const SPACING = 150;
    
    // Generate a 3D Grid / Matrix
    for (let i = -GRID_SIZE; i <= GRID_SIZE; i++) {
        for (let j = -GRID_SIZE; j <= GRID_SIZE; j++) {
            for (let k = -GRID_SIZE; k <= GRID_SIZE; k++) {
                // Only create sparse nodes to save performance and create "constellation" look
                if (Math.random() > 0.85) {
                    nodes.push(new Node3D(i * SPACING, j * SPACING, k * SPACING));
                }
            }
        }
    }

    let animationFrameId: number;

    const render = () => {
      // 1. CLEAR & TRAIL EFFECT
      // Use logic to determine trail length based on state
      const trail = vraState === VRAState.Weaving ? 0.1 : 0.2;
      ctx.fillStyle = `rgba(2, 6, 23, ${trail})`; // Void color with alpha for trails
      ctx.fillRect(0, 0, width, height);

      time += 0.005;

      // 2. STATE INTERPRETATION -> GEOMETRY PARAMETERS
      let rotSpeedX = 0.002;
      let rotSpeedY = 0.003;
      let color = '148, 163, 184'; // Slate-400
      let connectionDist = 150;
      let nodeSize = 1;

      if (vraState === VRAState.Input) {
          // GOLDEN FLUX
          rotSpeedX = 0.001;
          rotSpeedY = 0.01; // Fast horizontal spin
          color = '251, 191, 36'; // Amber
          connectionDist = 200;
      } else if (vraState === VRAState.ResonanceScan) {
          // CYAN SCANNER
          rotSpeedX = 0;
          rotSpeedY = 0.05; // Very fast scan
          color = '6, 182, 212'; // Cyan
          connectionDist = 100;
      } else if (vraState === VRAState.Weaving) {
          // PURPLE HYPER-CUBE (COMPLEXITY)
          rotSpeedX = 0.02;
          rotSpeedY = 0.02; // Chaos
          color = '168, 85, 247'; // Purple
          connectionDist = 180;
          nodeSize = 1.5;
      } else if (vraState === VRAState.Manifested) {
          // EMERALD CRYSTAL (STABILITY)
          rotSpeedX = 0;
          rotSpeedY = 0; // Frozen moment
          color = '16, 185, 129'; // Emerald
          connectionDist = 250;
      }

      // 3. UPDATE & DRAW NODES
      const projectedNodes: { x: number, y: number, scale: number }[] = [];

      nodes.forEach(node => {
          // Apply Rotation
          node.rotate(time * rotSpeedX * 100, time * rotSpeedY * 100, 0);
          
          // Project
          const p = node.project(width, height, 800);
          projectedNodes.push(p);

          // Draw Node
          const alpha = (p.scale - 0.5) * 2; // Fade distant nodes
          if (alpha > 0) {
              ctx.beginPath();
              ctx.arc(p.x, p.y, nodeSize * p.scale, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(${color}, ${alpha})`;
              ctx.fill();
          }
      });

      // 4. DRAW CONNECTIONS (CONSEQUENTIAL PATTERNS)
      // Instead of connecting everything, we simulate "Neural Firings"
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${color}, 0.15)`;
      
      for (let i = 0; i < projectedNodes.length; i++) {
          const p1 = projectedNodes[i];
          // Optimization: only check neighbors
          for (let j = i + 1; j < projectedNodes.length; j++) {
              const p2 = projectedNodes[j];
              const dx = p1.x - p2.x;
              const dy = p1.y - p2.y;
              const dist = Math.sqrt(dx*dx + dy*dy);

              if (dist < connectionDist * p1.scale) {
                  ctx.moveTo(p1.x, p1.y);
                  ctx.lineTo(p2.x, p2.y);
              }
          }
      }
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
        width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
        height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [vraState]);

  return (
    <>
        <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
        />
        {/* Semantic Overlay: Tells the user WHAT the visualizer is doing */}
        <div className="absolute bottom-2 right-4 text-[9px] font-mono text-slate-600 tracking-widest pointer-events-none z-10 flex flex-col items-end opacity-50">
            <span>MATRIX::PROJECTION</span>
            <span>
                {vraState === VRAState.Idle && "GEOMETRY: EUCLIDEAN_GRID"}
                {vraState === VRAState.Input && "GEOMETRY: RADIAL_FLUX"}
                {vraState === VRAState.ResonanceScan && "GEOMETRY: POLAR_SCAN"}
                {vraState === VRAState.Weaving && "GEOMETRY: HYPER_CUBE_4D"}
                {vraState === VRAState.Manifested && "GEOMETRY: CRYSTAL_LATTICE"}
            </span>
        </div>
    </>
  );
};

export default QuantumField;
