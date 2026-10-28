import React, { useRef, useState, useEffect } from 'react';
import { RotateCw, Compass, Shield, Sparkles, Sliders } from 'lucide-react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Connection {
  a: number;
  b: number;
  color?: string;
}

type ModelPreset = 'astrolabe' | 'tesseract' | 'silicon' | 'helix';

export default function Interactive3DModel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeModel, setActiveModel] = useState<ModelPreset>('astrolabe');
  const [isRotating, setIsRotating] = useState(true);
  const [glowEnabled, setGlowEnabled] = useState(true);
  const [nodeSize, setNodeSize] = useState<number>(4);
  const [scale, setScale] = useState<number>(100);

  // Rotation angles
  const anglesRef = useRef({ x: 0.3, y: 0.4, z: 0.1 });
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Preset generators
  const getModelData = (type: ModelPreset): { points: Point3D[]; connections: Connection[] } => {
    const points: Point3D[] = [];
    const connections: Connection[] = [];

    if (type === 'tesseract') {
      // 16 vertices of a hypercube
      for (let i = 0; i < 16; i++) {
        const x = (i & 1 ? 1 : -1) * 0.8;
        const y = (i & 2 ? 1 : -1) * 0.8;
        const z = (i & 4 ? 1 : -1) * 0.8;
        const w = (i & 8 ? 0.5 : 1.2); // W coordinate represented as perspective depth offset
        points.push({ x: x * w, y: y * w, z: z * w });
      }

      // Connect inner and outer cube edges
      for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 4; j++) {
          const bit = 1 << j;
          if ((i & bit) === 0) {
            connections.push({ a: i, b: i | bit });
          }
        }
      }
    } else if (type === 'astrolabe') {
      // 3 concentric rings + celestial axis
      const ringCount = 3;
      const pointsPerRing = 18;

      for (let r = 0; r < ringCount; r++) {
        const radius = 0.5 + r * 0.35;
        const tilt = (r - 1) * 0.4; // Orbit tilt
        const startIndex = points.length;

        for (let i = 0; i < pointsPerRing; i++) {
          const theta = (i / pointsPerRing) * Math.PI * 2;
          const x = Math.cos(theta) * radius;
          const y = Math.sin(theta) * radius * Math.cos(tilt);
          const z = Math.sin(theta) * radius * Math.sin(tilt);
          points.push({ x, y, z });

          // Connect adjacent points to form a circle
          const next = startIndex + ((i + 1) % pointsPerRing);
          connections.push({ a: startIndex + i, b: next, color: r === 0 ? '#F59E0B' : r === 1 ? '#10B981' : '#8B5CF6' });
        }
      }

      // Add center sun and polar pointers
      const centerIdx = points.length;
      points.push({ x: 0, y: 0, z: 0 }); // Center sun
      points.push({ x: 0, y: -1.3, z: 0 }); // North star
      points.push({ x: 0, y: 1.3, z: 0 }); // South star

      // Connect sun to rings
      for (let r = 0; r < ringCount; r++) {
        connections.push({ a: centerIdx, b: r * pointsPerRing });
      }
      connections.push({ a: centerIdx + 1, b: centerIdx + 2, color: '#F59E0B' }); // Axis
    } else if (type === 'silicon') {
      // Buckminsterfullerene molecular lattice structure (simulated truncated icosahedron)
      const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
      // Golden spiral coordinates for a clean 3D mesh
      const N = 36;
      for (let i = 0; i < N; i++) {
        const y = 1 - (i / (N - 1)) * 2;
        const radius = Math.sqrt(1 - y * y);
        const theta = phi * i * 2.39996; // Golden angle
        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;
        points.push({ x: x * 1.1, y: y * 1.1, z: z * 1.1 });
      }

      // Connect points that are close to each other
      for (let i = 0; i < N; i++) {
        let nearest: { idx: number; dist: number }[] = [];
        for (let j = 0; j < N; j++) {
          if (i === j) continue;
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dz = points[i].z - points[j].z;
          const dist = dx * dx + dy * dy + dz * dz;
          nearest.push({ idx: j, dist });
        }
        nearest.sort((a, b) => a.dist - b.dist);
        // Connect to nearest 3 vertices
        nearest.slice(0, 3).forEach(n => {
          if (i < n.idx) {
            connections.push({ a: i, b: n.idx });
          }
        });
      }
    } else if (type === 'helix') {
      // 3D Double Helix DNA Strand
      const steps = 24;
      for (let i = 0; i < steps; i++) {
        const t = (i / steps) * Math.PI * 4; // 2 full revolutions
        const y = -1.2 + (i / steps) * 2.4; // Rise along Y axis
        
        // Strand A
        const xA = Math.cos(t) * 0.6;
        const zA = Math.sin(t) * 0.6;
        points.push({ x: xA, y, z: zA });

        // Strand B
        const xB = Math.cos(t + Math.PI) * 0.6;
        const zB = Math.sin(t + Math.PI) * 0.6;
        points.push({ x: xB, y, z: zB });

        const idxA = points.length - 2;
        const idxB = points.length - 1;

        // Connect base pairs
        connections.push({ a: idxA, b: idxB, color: i % 2 === 0 ? '#10B981' : '#F59E0B' });

        // Connect backbone
        if (i > 0) {
          connections.push({ a: idxA - 2, b: idxA, color: '#8B5CF6' });
          connections.push({ a: idxB - 2, b: idxB, color: '#D946EF' });
        }
      }
    }

    return { points, connections };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      // Handle canvas resolution
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      // Rotate if automatic rotation is active
      if (isRotating) {
        anglesRef.current.y += 0.007;
        anglesRef.current.x += 0.004;
      }

      const { points, connections } = getModelData(activeModel);

      // Rotation matrix values
      const cx = Math.cos(anglesRef.current.x);
      const sx = Math.sin(anglesRef.current.x);
      const cy = Math.cos(anglesRef.current.y);
      const sy = Math.sin(anglesRef.current.y);
      const cz = Math.cos(anglesRef.current.z);
      const sz = Math.sin(anglesRef.current.z);

      // Project 3D points to 2D
      const projected = points.map(pt => {
        // Rotate X
        let xy = cx * pt.y - sx * pt.z;
        let xz = sx * pt.y + cx * pt.z;

        // Rotate Y
        let yx = cy * pt.x + sy * xz;
        let yz = -sy * pt.x + cy * xz;

        // Rotate Z
        let zx = cz * yx - sz * xy;
        let zy = sz * yx + cz * xy;

        // Perspective projection
        const fov = 400;
        const distance = 3;
        const scaleFactor = fov / (yz + distance);
        const screenX = width / 2 + zx * scaleFactor * (scale / 100);
        const screenY = height / 2 + zy * scaleFactor * (scale / 100);

        return { x: screenX, y: screenY, depth: yz };
      });

      // Draw connections/edges
      connections.forEach(conn => {
        const ptA = projected[conn.a];
        const ptB = projected[conn.b];

        if (!ptA || !ptB) return;

        // Dynamic gradient/transparency based on depth
        const avgDepth = (ptA.depth + ptB.depth) / 2;
        const alpha = Math.max(0.1, Math.min(0.9, 1 - (avgDepth + 1.5) / 3));

        ctx.beginPath();
        ctx.moveTo(ptA.x, ptA.y);
        ctx.lineTo(ptB.x, ptB.y);

        // Styling based on presets
        if (conn.color) {
          ctx.strokeStyle = conn.color;
        } else {
          // Amethyst to Gold futuristic neon gradient
          const gradient = ctx.createLinearGradient(ptA.x, ptA.y, ptB.x, ptB.y);
          gradient.addColorStop(0, `rgba(139, 92, 246, ${alpha})`);
          gradient.addColorStop(0.5, `rgba(236, 72, 153, ${alpha * 0.85})`);
          gradient.addColorStop(1, `rgba(245, 158, 11, ${alpha})`);
          ctx.strokeStyle = gradient;
        }

        ctx.lineWidth = 1.6;
        if (glowEnabled) {
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#8B5CF6';
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
      });

      // Draw points/nodes
      projected.forEach((pt, idx) => {
        const alpha = Math.max(0.2, Math.min(1.0, 1 - (pt.depth + 1.5) / 3));
        const radius = Math.max(1.5, nodeSize * (1 - pt.depth / 4));

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);

        // Make special node selections stand out in gold
        if (idx % 5 === 0) {
          ctx.fillStyle = `rgba(245, 158, 11, ${alpha})`;
          if (glowEnabled) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#F59E0B';
          }
        } else {
          ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`;
          if (glowEnabled) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#8B5CF6';
          }
        }
        ctx.fill();
      });

      // Reset shadows
      ctx.shadowBlur = 0;

      // Draw subtle orbital compass ring
      ctx.beginPath();
      ctx.ellipse(width / 2, height / 2, (scale * 1.5), (scale * 0.6), Math.PI / 12, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [activeModel, isRotating, glowEnabled, nodeSize, scale]);

  // Handle Dragging to rotate
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;

    anglesRef.current.y += deltaX * 0.007;
    anglesRef.current.x += deltaY * 0.007;

    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div 
      className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 neo-out flex flex-col xl:flex-row gap-6 relative overflow-hidden group"
      id="3d-interactive-model-site-panel"
    >
      {/* Decorative Classical corner brackets */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-amber-500/40 pointer-events-none" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-amber-500/40 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-amber-500/40 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-amber-500/40 pointer-events-none" />

      {/* Model Canvas and Title (7/12 layout) */}
      <div className="flex-1 flex flex-col justify-between relative min-h-[340px]">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-amber-500/90 dark:text-amber-400 font-mono">
            <Compass className="w-3.5 h-3.5 animate-spin" /> Interactive Academic Astrometry
          </div>
          <h2 className="text-3xl font-serif text-slate-800 dark:text-slate-100 font-extrabold mt-1 tracking-tight leading-none">
            {activeModel === 'astrolabe' && 'Celestial Astrolabe'}
            {activeModel === 'tesseract' && 'Tesseract 4-Dimensional Hypercube'}
            {activeModel === 'silicon' && 'Silicon Fullerene Lattice Model'}
            {activeModel === 'helix' && 'Syllabus Double-Helix Strand'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-xl font-sans font-light">
            Click, drag, and tilt to rotate this interactive architectural system. Developed to simulate complex relational databases using coordinate matrix projections in real-time.
          </p>
        </div>

        {/* Real HTML5 Interactive Canvas */}
        <div className="relative flex-1 min-h-[220px] rounded-2xl bg-slate-50/50 dark:bg-slate-950/45 border border-slate-200/40 dark:border-slate-800/60 neo-in overflow-hidden my-3">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-full cursor-grab active:cursor-grabbing block"
          />
          {isDraggingRef.current && (
            <span className="absolute bottom-2 right-3 text-[9px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded animate-pulse">
              3D MATRIX ROTATION ACTIVE
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            <span>Projected coordinates: XYZ render</span>
          </div>
          <span>FPS: 60 (Hardware Accelerated)</span>
        </div>
      </div>

      {/* Preset Selector Panel & Tactile Controls (5/12 layout) */}
      <div className="w-full xl:w-72 flex flex-col justify-between shrink-0 bg-slate-50/70 dark:bg-slate-950/30 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 neo-in space-y-4">
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2.5 font-mono">
            Model Presets
          </span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'astrolabe', label: 'Orrery Astrolabe', icon: '🪐' },
              { id: 'tesseract', label: 'Hypercube 3D', icon: '📦' },
              { id: 'silicon', label: 'C-36 Lattice', icon: '🧬' },
              { id: 'helix', label: 'Double Helix', icon: '💈' }
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => setActiveModel(preset.id as ModelPreset)}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group/btn ${
                  activeModel === preset.id
                    ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white border-violet-500 shadow-md font-bold'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-violet-500/50 neo-out'
                }`}
              >
                <div className="text-lg mb-1">{preset.icon}</div>
                <div className="text-[11px] truncate tracking-tight">{preset.label}</div>
                {activeModel === preset.id && (
                  <div className="absolute right-0 top-0 w-3 h-3 bg-amber-400 rounded-bl-lg" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Tactile Sliders */}
        <div className="space-y-3.5">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-mono">
            3D Parameters
          </span>

          <div className="space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Model Scale</span>
              <span className="font-mono text-amber-500">{scale}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="160"
              value={scale}
              onChange={(e) => setScale(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Node Diameter</span>
              <span className="font-mono text-violet-500">{nodeSize}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={nodeSize}
              onChange={(e) => setNodeSize(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
            />
          </div>
        </div>

        {/* Buttons & System State Toggles */}
        <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col gap-2">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
              isRotating
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 neo-out'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            <span>{isRotating ? 'Pause Rotation Engine' : 'Auto-Rotate Mesh'}</span>
          </button>

          <button
            onClick={() => setGlowEnabled(!glowEnabled)}
            className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
              glowEnabled
                ? 'bg-violet-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 neo-out'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{glowEnabled ? 'Aura Glow: ON' : 'Aura Glow: OFF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
