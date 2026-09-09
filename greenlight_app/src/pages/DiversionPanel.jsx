import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TrafficMap } from '../components/maps/TrafficMap';
import { 
  Navigation, Zap, Clock, ShieldAlert, CheckCircle, Radio, 
  ArrowRight, RefreshCw, Sliders, AlertTriangle, Play, Pause, ExternalLink
} from 'lucide-react';

export const DiversionPanel = () => {
  const { 
    diversions, 
    handleActivateDiversion, 
    handleDeactivateDiversion, 
    handleToggleDiversion,
    setActiveTab 
  } = useApp();

  const [selectedId, setSelectedId] = useState(diversions[0]?.id || 'div-01');
  const [waveTrigger, setWaveTrigger] = useState(0);
  const [flowRate, setFlowRate] = useState(50); // Flow rate percentage (10% to 90%)
  const [isSignageSending, setIsSignageSending] = useState(false);

  // Always bind to live diversion item in context
  const currentPlan = diversions.find(d => d.id === selectedId) || diversions[0];
  const isActive = currentPlan?.status === 'ACTIVE';

  const handleWave = () => {
    setWaveTrigger(w => w + 1);
  };

  const handleTestSignagePush = () => {
    setIsSignageSending(true);
    setTimeout(() => {
      setIsSignageSending(false);
    }, 1200);
  };

  return (
    <div className="h-[calc(100vh-4rem)] p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
      
      {/* LEFT COLUMN: Diversion Control & Template Builder (5 cols) */}
      <div className="lg:col-span-5 flex flex-col space-y-4">
        
        {/* Header Panel */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 glow-emerald">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-display">Intelligent Traffic Diversion Engine</h2>
                <p className="text-xs text-slate-400">AI-Powered Congestion Routing & Digital Signage Dispatch</p>
              </div>
            </div>

            {/* Quick Link to 2D MATSim Simulation */}
            <button
              onClick={() => setActiveTab('simulation_display')}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-[11px] font-mono text-emerald-400 hover:text-white transition flex items-center space-x-1.5 shadow"
              title="Open 2D Microscopic Simulation"
            >
              <span>2D Kinematics</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Diversion Templates List */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4 flex-1">
          <div className="flex justify-between items-center text-xs font-mono border-b border-slate-800 pb-2">
            <span className="text-slate-400 font-bold uppercase">Active & Suggested Plans</span>
            <span className="text-emerald-400 font-bold">{diversions.length} Scenarios Available</span>
          </div>

          <div className="space-y-3">
            {diversions.map((d) => {
              const selected = currentPlan?.id === d.id;
              const active = d.status === 'ACTIVE';

              return (
                <div 
                  key={d.id}
                  onClick={() => setSelectedId(d.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    selected 
                      ? 'border-emerald-500 bg-emerald-950/25 glow-emerald shadow-lg' 
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
                      <h3 className="text-sm font-bold text-white leading-tight">{d.title}</h3>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full border ${
                      active 
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm' 
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}>
                      {d.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60 font-mono">
                    <div>
                      <span className="text-slate-400">Bottleneck: </span>
                      <strong className="text-red-400">{d.affectedCorridor}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Detour: </span>
                      <strong className="text-emerald-300">{d.recommendedRoute}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-1">
                    <span className="text-emerald-400 font-bold">⏱ Est. Savings: {d.timeSavingsMin} mins</span>
                    <span className="text-cyan-400 font-semibold">{d.capacityImpact}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Map Overlay & Before/After Impact Analysis (7 cols) */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        
        {/* Map View with Real-Time Animated Route & Diverted Traffic */}
        <div className="h-[58%] min-h-[380px] glass-panel rounded-3xl overflow-hidden relative p-1">
          <TrafficMap 
            showDiversions={true} 
            selectedDiversion={currentPlan}
            isDiversionActive={isActive}
            waveTrigger={waveTrigger}
            flowRate={flowRate}
          />
        </div>

        {/* Selected Plan Details & Digital Signage Push */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase font-bold border-b border-slate-800 pb-2 mb-3">
              <span className="flex items-center space-x-1.5">
                <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Digital Signage Dispatch (NTCIP 1203 / MQTT)</span>
              </span>
              <span className="text-[11px] text-emerald-400 normal-case font-semibold">
                {isActive ? '● Signs Broadcasting Live' : '○ Standby'}
              </span>
            </div>

            {/* VMS Broadcast Ticker */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-amber-500/30 text-amber-400 font-mono text-xs sm:text-sm tracking-wide flex items-start space-x-3 glow-amber shadow-inner">
              <div className="shrink-0 p-1 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-[10px] text-slate-400 uppercase font-sans flex items-center justify-between mb-1">
                  <span>VMS Broadcast to Variable Message Highway Signs</span>
                  <span className="text-amber-400 font-mono">100% Signal</span>
                </div>
                <div className="font-bold text-amber-300">
                  "{currentPlan?.signageMessage}"
                </div>
              </div>
            </div>

            {/* Interactive Flow Rate Slider */}
            <div className="mt-3.5 bg-slate-900/60 p-3 rounded-2xl border border-slate-800 flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-300 shrink-0">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Divert Ratio:</span>
                <strong className="text-emerald-400">{flowRate}%</strong>
              </div>
              <input 
                type="range" 
                min="10" 
                max="90" 
                step="5"
                value={flowRate} 
                onChange={(e) => setFlowRate(Number(e.target.value))}
                className="flex-1 accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <span className="text-[11px] font-mono text-slate-400 shrink-0">
                ~{Math.round(flowRate * 8.4)} veh/hr
              </span>
            </div>
          </div>

          {/* Action Control Buttons (Working & Responsive) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            
            {/* Primary Toggle Action Button */}
            {isActive ? (
              <button
                onClick={() => handleDeactivateDiversion(currentPlan.id)}
                className="py-3 px-4 rounded-2xl text-xs font-bold font-sans transition flex items-center justify-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 glow-red"
              >
                <Pause className="w-4 h-4" />
                <span>Deactivate & Restore Normal Flow</span>
              </button>
            ) : (
              <button
                onClick={() => handleActivateDiversion(currentPlan.id)}
                className="py-3 px-4 rounded-2xl text-xs font-bold font-sans transition flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold glow-emerald shadow-lg shadow-emerald-500/20"
              >
                <Zap className="w-4 h-4 text-slate-950" />
                <span>Activate 1-Click Diversion Protocol</span>
              </button>
            )}

            {/* Trigger Fleet Reroute Wave Button */}
            <button
              onClick={handleWave}
              className="py-3 px-4 rounded-2xl text-xs font-bold font-sans transition flex items-center justify-center space-x-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 glow-cyan"
            >
              <RefreshCw className="w-4 h-4 animate-spin-reverse" />
              <span>Trigger Fleet Reroute Wave (+35 Cars)</span>
            </button>

          </div>
        </div>

      </div>

    </div>
  );
};
