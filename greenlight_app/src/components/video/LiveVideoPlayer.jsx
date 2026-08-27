import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Eye, ShieldAlert, Camera, RefreshCw } from 'lucide-react';

export const LiveVideoPlayer = ({ 
  activeCamera = {
    name: "BKC Junction (Bandra East, Mumbai)",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    livePlate: "MH 02 CZ 4921",
    speedObserved: 64,
    violationTag: "RED LIGHT RUNNING"
  }
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [videoError, setVideoError] = useState(false);

  const videoUrl = activeCamera.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
  const cameraName = activeCamera.name || "BKC Junction (Bandra East, Mumbai)";
  const plateNumber = activeCamera.livePlate || "MH 02 CZ 4921";
  const speedObserved = activeCamera.speedObserved || 64;
  const violationTag = activeCamera.violationTag || "RED LIGHT RUNNING";

  // Animated Traffic Canvas (Fallback + Bounding Boxes)
  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let boxX = 120;
    let boxY = 80;
    let dirX = 2.0;
    let dirY = 0.6;

    // Traffic lane vehicle particles for fallback
    const trafficVehicles = [
      { x: 40, y: 120, speed: 2.2, color: '#38bdf8', type: 'Car' },
      { x: 180, y: 160, speed: 1.8, color: '#f59e0b', type: 'Auto' },
      { x: 320, y: 110, speed: 2.5, color: '#10b981', type: 'Car' },
      { x: 460, y: 150, speed: 1.5, color: '#a855f7', type: 'Bus' }
    ];

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // If video error or fallback active, draw synthetic road traffic background
      if (videoError) {
        // Draw Dark Asphalt Road
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 80, canvas.width, 160);

        // Draw Road Borders
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, 76, canvas.width, 4);
        ctx.fillRect(0, 240, canvas.width, 4);

        // Dashed Lane Lines
        ctx.strokeStyle = '#f59e0b';
        ctx.setLineDash([15, 15]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 160);
        ctx.lineTo(canvas.width, 160);
        ctx.stroke();
        ctx.setLineDash([]); // reset

        // Draw Moving Traffic Vehicles
        trafficVehicles.forEach(v => {
          v.x += v.speed;
          if (v.x > canvas.width + 40) v.x = -60;

          // Vehicle Body
          ctx.fillStyle = v.color;
          ctx.beginPath();
          ctx.roundRect(v.x, v.y, 50, 26, 6);
          ctx.fill();

          // Vehicle Windshield
          ctx.fillStyle = '#070a11';
          ctx.fillRect(v.x + 30, v.y + 4, 12, 18);
        });
      }

      // Draw AI Bounding Boxes Overlay
      if (showBoundingBoxes) {
        boxX += dirX;
        boxY += dirY;
        if (boxX > canvas.width - 180 || boxX < 60) dirX = -dirX;
        if (boxY > canvas.height - 120 || boxY < 50) dirY = -dirY;

        // Vehicle Bounding Box (Emerald Green)
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, 160, 95);

        // Corner Accents
        const len = 12;
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(boxX, boxY + len); ctx.lineTo(boxX, boxY); ctx.lineTo(boxX + len, boxY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(boxX + 160 - len, boxY + 95); ctx.lineTo(boxX + 160, boxY + 95); ctx.lineTo(boxX + 160, boxY + 95 - len); ctx.stroke();

        // License Plate Tag Box
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(boxX, boxY - 24, 140, 22);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        ctx.strokeRect(boxX, boxY - 24, 140, 22);

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillText(`ANPR: ${plateNumber}`, boxX + 6, boxY - 8);

        // Speed radar tag
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.fillText(`SPD: ${speedObserved} km/h`, boxX + 168, boxY + 20);

        // Violation Warning Tag
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(boxX, boxY + 100, 160, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText(`⚠ ${violationTag}`, boxX + 8, boxY + 114);
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [showBoundingBoxes, plateNumber, speedObserved, violationTag, videoError]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col group">
      
      {/* Video Stream Container */}
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center min-h-[300px]">
        {!videoError && (
          <video 
            ref={videoRef}
            key={videoUrl}
            src={videoUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover opacity-85"
          />
        )}

        {/* Canvas Overlay (Renders Bounding Boxes + Animated Road Traffic Fallback) */}
        <canvas 
          ref={canvasRef} 
          width={640} 
          height={360} 
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Camera Info Overlay */}
        <div className="absolute top-3 left-3 z-20 flex items-center space-x-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-white font-bold">{cameraName}</span>
          <span className="text-slate-400">| 4K Feed</span>
        </div>

        {/* AI Bounding Box Toggle Button */}
        <button
          onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
          className="absolute top-3 right-3 z-20 px-2.5 py-1 bg-slate-900/80 hover:bg-slate-800 text-xs font-mono text-emerald-400 border border-emerald-500/30 rounded-lg backdrop-blur-md transition flex items-center space-x-1"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{showBoundingBoxes ? 'AI Boxes ON' : 'AI Boxes OFF'}</span>
        </button>
      </div>

      {/* Video Control Bar */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-3">
          <button onClick={togglePlay} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button onClick={() => setIsMuted(!isMuted)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <span className="text-slate-400 text-[11px]">RTSP Stream • 30 FPS</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
            ANPR Accuracy: 96.4%
          </span>
        </div>
      </div>

    </div>
  );
};
