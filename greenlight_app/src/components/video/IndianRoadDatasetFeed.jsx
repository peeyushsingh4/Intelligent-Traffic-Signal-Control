import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Eye, ShieldAlert, Cpu, Filter, Layers, Database, Tag, CheckCircle2 } from 'lucide-react';

export const IndianRoadDatasetFeed = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeClassFilter, setActiveClassFilter] = useState('ALL'); // ALL, AUTO_RICKSHAW, MOTORCYCLE, VIOLATIONS
  const [showConfidence, setShowConfidence] = useState(true);

  // ThirdEye Labs Indian Road Dataset Sample Detections (BDD100K Format)
  const detections = [
    { id: 1, label: 'auto_rickshaw', conf: '94%', color: '#06b6d4', box: { x: 90, y: 140, w: 120, h: 100 } },
    { id: 2, label: 'motorcycle', conf: '91%', isViolation: true, violationTag: 'NO HELMET', color: '#f59e0b', box: { x: 240, y: 160, w: 80, h: 90 } },
    { id: 3, label: 'car', conf: '98%', plate: 'MH 02 CZ 4921', isViolation: true, violationTag: 'RED LIGHT RUNNING', color: '#ef4444', box: { x: 360, y: 110, w: 140, h: 95 } },
    { id: 4, label: 'bus', conf: '96%', color: '#a855f7', box: { x: 520, y: 80, w: 160, h: 140 } }
  ];

  // Dynamic Bounding Box Canvas Drawing
  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.02;

      detections.forEach((d) => {
        // Apply class filters
        if (activeClassFilter === 'AUTO_RICKSHAW' && d.label !== 'auto_rickshaw') return;
        if (activeClassFilter === 'MOTORCYCLE' && d.label !== 'motorcycle') return;
        if (activeClassFilter === 'VIOLATIONS' && !d.isViolation) return;

        // Animate box slightly with vehicle motion
        const offsetX = Math.sin(t + d.id) * 12;
        const offsetY = Math.cos(t * 0.8 + d.id) * 6;

        const bx = d.box.x + offsetX;
        const by = d.box.y + offsetY;
        const bw = d.box.w;
        const bh = d.box.h;

        // Bounding Box Rectangle
        ctx.strokeStyle = d.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);

        // Corner Accents
        const len = 10;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(bx, by + len); ctx.lineTo(bx, by); ctx.lineTo(bx + len, by); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx + bw - len, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - len); ctx.stroke();

        // Label Badge Tag
        const tagText = `${d.label.toUpperCase()} ${d.conf}`;
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        const textWidth = ctx.measureText(tagText).width;

        ctx.fillStyle = '#070a11';
        ctx.fillRect(bx, by - 22, textWidth + 12, 20);
        ctx.strokeStyle = d.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by - 22, textWidth + 12, 20);

        ctx.fillStyle = d.color;
        ctx.fillText(tagText, bx + 6, by - 8);

        // Optional Plate / Violation Extra Tag
        if (d.plate) {
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.fillText(`ANPR: ${d.plate}`, bx + 6, by + bh + 14);
        }

        if (d.isViolation) {
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(bx, by + bh + 2, bw, 18);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText(`⚠ ${d.violationTag}`, bx + 4, by + bh + 14);
        }
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [activeClassFilter, showConfidence]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-3xl overflow-hidden glass-panel border border-slate-800 flex flex-col">
      
      {/* ThirdEye Labs Dataset Header Bar */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 z-10">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 glow-emerald">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white font-display">HuggingFace ThirdEye Labs Indian Road Dataset</h3>
              <span className="px-2 py-0.5 text-[9px] font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full">
                646K Frames • 12 Classes
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">BDD100K Perception Architecture (Auto-Rickshaws, Tempos, Motorcycles, Taxis)</p>
          </div>
        </div>

        {/* Class Filter Bar */}
        <div className="flex space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button 
            onClick={() => setActiveClassFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg transition ${
              activeClassFilter === 'ALL' ? 'bg-emerald-500 text-slate-950 font-bold glow-emerald' : 'text-slate-400 hover:text-white'
            }`}
          >
            All 12 Classes
          </button>
          <button 
            onClick={() => setActiveClassFilter('AUTO_RICKSHAW')}
            className={`px-2.5 py-1 rounded-lg transition ${
              activeClassFilter === 'AUTO_RICKSHAW' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Auto-Rickshaw
          </button>
          <button 
            onClick={() => setActiveClassFilter('MOTORCYCLE')}
            className={`px-2.5 py-1 rounded-lg transition ${
              activeClassFilter === 'MOTORCYCLE' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Motorcycles
          </button>
          <button 
            onClick={() => setActiveClassFilter('VIOLATIONS')}
            className={`px-2.5 py-1 rounded-lg transition ${
              activeClassFilter === 'VIOLATIONS' ? 'bg-red-500 text-white font-bold glow-red' : 'text-slate-400 hover:text-white'
            }`}
          >
            Violations
          </button>
        </div>
      </div>

      {/* Video & Canvas Overlay Player Container */}
      <div className="flex-1 w-full h-full min-h-[350px] relative bg-black flex items-center justify-center overflow-hidden">
        <video 
          ref={videoRef}
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-85"
        />

        {/* Dynamic Canvas Bounding Box Overlay */}
        <canvas 
          ref={canvasRef} 
          width={720} 
          height={400} 
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Live HUD Metadata Overlay */}
        <div className="absolute top-4 left-4 z-20 space-y-2 pointer-events-none font-mono text-xs">
          <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 flex items-center space-x-2 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="font-bold">thirdeyelabs/indian-road-dataset</span>
          </div>

          <div className="bg-slate-950/80 backdrop-blur-md p-3 rounded-xl border border-slate-800 space-y-1 text-[11px] text-slate-300">
            <div>Annotated Detections: <strong className="text-emerald-400">6,800,000 Objects</strong></div>
            <div>Format Standard: <strong className="text-amber-400">BDD100K JSON / WebDataset</strong></div>
            <div>Mixed Traffic Density: <strong className="text-cyan-400">HIGH (Mumbai/Navi Mumbai)</strong></div>
          </div>
        </div>

      </div>

      {/* Control Bar Footer */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-3">
          <button onClick={togglePlay} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <span className="text-slate-400 text-[11px]">HuggingFace Hub Model Pipeline • YOLOv8 Multi-Class Indian Perception</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
            Inference: 14.2ms / frame
          </span>
        </div>
      </div>

    </div>
  );
};
