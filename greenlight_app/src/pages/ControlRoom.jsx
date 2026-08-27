import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TrafficMap } from '../components/maps/TrafficMap';
import { LiveVideoPlayer } from '../components/video/LiveVideoPlayer';
import { SignalPrioritizationSim } from '../components/simulation/SignalPrioritizationSim';
import { ThreeDTrafficSim } from '../components/simulation/ThreeDTrafficSim';
import { IndianRoadDatasetFeed } from '../components/video/IndianRoadDatasetFeed';
import { 
  AlertTriangle, Shield, Video, Zap, ArrowRight, Eye, CheckCircle2, 
  XCircle, Sliders, Radio, Activity, Navigation, Play, RefreshCw, Cpu, Database 
} from 'lucide-react';

export const ControlRoom = () => {
  const { 
    violations, cameras, activeCamera, setActiveCamera, 
    openEvidenceModal, diversions, handleActivateDiversion 
  } = useApp();

  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [activeViewMode, setActiveViewMode] = useState('INDIAN_DATASET'); // INDIAN_DATASET, 3D_WEBGL, SIMULATION, CAMERA_STREAM

  const filteredViolations = violations.filter(v => {
    if (filterSeverity === 'OPERATOR_REVIEW') return v.status === 'OPERATOR_REVIEW';
    if (filterSeverity === 'AUTO_FINED') return v.status === 'AUTO_FINED';
    return true;
  });

  return (
    <div className="h-[calc(100vh-4rem)] p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 overflow-y-auto">
      
      {/* LEFT PANEL: Prioritized Live Alert Feed (4 cols) */}
      <div className="lg:col-span-4 flex flex-col space-y-4 h-full min-h-[500px]">
        
        {/* Header & Filter Toolbar */}
        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></div>
            <h2 className="font-bold text-white font-display text-sm">Live AI Violation Stream</h2>
          </div>
          <div className="flex space-x-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-[11px]">
            <button 
              onClick={() => setFilterSeverity('ALL')}
              className={`px-2 py-1 rounded-md transition ${filterSeverity === 'ALL' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilterSeverity('OPERATOR_REVIEW')}
              className={`px-2 py-1 rounded-md transition ${filterSeverity === 'OPERATOR_REVIEW' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Review Queue
            </button>
          </div>
        </div>

        {/* Violation Feed Cards */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredViolations.map((v) => {
            const isReview = v.status === 'OPERATOR_REVIEW';
            return (
              <div 
                key={v.id} 
                className={`glass-panel p-4 rounded-2xl border transition-all cursor-pointer ${
                  isReview 
                    ? 'border-amber-500/40 bg-amber-950/10 hover:border-amber-500 glow-amber' 
                    : 'border-slate-800 hover:border-emerald-500/40'
                }`}
                onClick={() => openEvidenceModal(v)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md ${
                      v.violationType === 'RED_LIGHT' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      v.violationType === 'OVERSPEEDING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    }`}>
                      {v.violationType.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{v.timestamp.split('T')[1].slice(0, 8)}</span>
                  </div>
                  
                  {isReview ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full animate-pulse">
                      Review Needed (78%)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                      Auto-Fined (94%)
                    </span>
                  )}
                </div>

                {/* Details Row */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Vehicle Plate</div>
                    <div className="font-mono font-bold text-white tracking-wider text-sm">{v.plateNumber}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Location</div>
                    <div className="text-slate-300 font-medium truncate">{v.camera.name}</div>
                  </div>
                </div>

                {/* Action trigger footer */}
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px] font-mono">Fine: <strong className="text-emerald-400">₹{v.fineAmount}</strong></span>
                  <button className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-semibold text-xs">
                    <span>Inspect Evidence</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* CENTER PANEL: Indian Road Dataset / 3D WebGL / Signal Simulation / Video Stream (5 cols) */}
      <div className="lg:col-span-5 flex flex-col space-y-4 h-full min-h-[500px]">
        
        {/* Toggle Switcher Toolbar */}
        <div className="flex justify-between items-center bg-slate-900/90 p-2 rounded-2xl border border-slate-800">
          <span className="text-xs font-mono text-slate-400 ml-2 font-bold uppercase">Center Engine Display</span>
          <div className="flex space-x-1 font-mono text-xs">
            <button 
              onClick={() => setActiveViewMode('INDIAN_DATASET')}
              className={`px-3 py-1 rounded-xl transition flex items-center space-x-1 ${
                activeViewMode === 'INDIAN_DATASET' ? 'bg-cyan-500 text-slate-950 font-bold glow-emerald' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Indian Road Dataset</span>
            </button>
            <button 
              onClick={() => setActiveViewMode('3D_WEBGL')}
              className={`px-3 py-1 rounded-xl transition ${
                activeViewMode === '3D_WEBGL' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              3D WebGL
            </button>
            <button 
              onClick={() => setActiveViewMode('SIMULATION')}
              className={`px-3 py-1 rounded-xl transition ${
                activeViewMode === 'SIMULATION' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              2D Queue
            </button>
          </div>
        </div>

        {/* Dynamic Display Component */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {activeViewMode === 'INDIAN_DATASET' ? (
            <IndianRoadDatasetFeed />
          ) : activeViewMode === '3D_WEBGL' ? (
            <ThreeDTrafficSim />
          ) : activeViewMode === 'SIMULATION' ? (
            <SignalPrioritizationSim />
          ) : (
            <div className="h-full flex flex-col space-y-4">
              <div className="h-1/2 relative glass-panel rounded-2xl overflow-hidden p-1">
                <TrafficMap />
              </div>
              <div className="h-1/2 glass-panel p-2 rounded-2xl relative overflow-hidden flex flex-col">
                <LiveVideoPlayer 
                  videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                  cameraName={activeCamera.name}
                  plateNumber="MH 02 CZ 4921"
                  violationTag="RED LIGHT RUNNING"
                  speedObserved={64}
                />
              </div>
            </div>
          )}
        </div>

      </div>

      {/* RIGHT PANEL: Intelligent Diversion Quick Action & Stats (3 cols) */}
      <div className="lg:col-span-3 flex flex-col space-y-4 h-full">
        
        {/* Quick System Stats */}
        <div className="glass-panel p-4 rounded-2xl space-y-3">
          <h3 className="text-xs font-bold text-slate-400 font-mono uppercase">System Performance</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Detection Latency</span>
              <span className="font-mono text-emerald-400 font-bold">1.38 seconds</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full w-[70%]"></div>
            </div>

            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-slate-400">ANPR Match Rate</span>
              <span className="font-mono text-cyan-400 font-bold">96.4%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-400 h-full w-[96%]"></div>
            </div>
          </div>
        </div>

        {/* Intelligent Diversion Quick Action Box */}
        <div className="glass-panel p-4 rounded-2xl flex-1 flex flex-col justify-between border-emerald-500/20">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <div className="flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-xs font-display">Traffic Diversion Engine</h3>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-mono bg-emerald-500/20 text-emerald-400 rounded-full">AI ACTIVE</span>
            </div>

            {diversions.map(d => (
              <div key={d.id} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2 mb-3">
                <div className="text-xs font-bold text-white">{d.title}</div>
                <div className="text-[11px] text-slate-400 font-mono">Savings: <span className="text-emerald-400 font-bold">{d.timeSavingsMin} Mins</span></div>
                <div className="text-[10px] text-amber-400 bg-amber-500/10 p-2 rounded border border-amber-500/20 font-mono">
                  "{d.signageMessage}"
                </div>

                <button 
                  onClick={() => handleActivateDiversion(d.id)}
                  disabled={d.status === 'ACTIVE'}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 ${
                    d.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold glow-emerald'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{d.status === 'ACTIVE' ? 'Diversion Active' : 'Activate 1-Click Diversion'}</span>
                </button>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-slate-500 text-center font-mono">
            NTCIP 1203 Digital Signage Sync Enabled
          </div>
        </div>

      </div>

    </div>
  );
};
