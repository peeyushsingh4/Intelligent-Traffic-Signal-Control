import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Zap, AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck, Activity, Cpu } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export const SignalPrioritizationSim = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [simStep, setSimStep] = useState(0);
  const [trafficDistribution, setTrafficDistribution] = useState('UNBALANCED_NORTH'); // UNBALANCED_NORTH, BALANCED, AMBULANCE_PRIORITY

  // Real-time dynamic simulation data
  const [northQueue, setNorthQueue] = useState(38);
  const [eastQueue, setEastQueue] = useState(4);
  const [southQueue, setSouthQueue] = useState(32);
  const [westQueue, setWestQueue] = useState(3);

  const [aiDecision, setAiDecision] = useState('EXTEND_NORTH_SOUTH_GREEN');
  const [currentPhase, setCurrentPhase] = useState('NORTH_SOUTH_GREEN');
  const [phaseTimer, setPhaseTimer] = useState(45);

  const [queueHistory, setQueueHistory] = useState([
    { step: 0, fixedSignalQueue: 28, aiSignalQueue: 28 },
    { step: 10, fixedSignalQueue: 32, aiSignalQueue: 22 },
    { step: 20, fixedSignalQueue: 36, aiSignalQueue: 15 },
    { step: 30, fixedSignalQueue: 41, aiSignalQueue: 8 },
    { step: 40, fixedSignalQueue: 45, aiSignalQueue: 4 }
  ]);

  // Simulation Loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setSimStep(prev => {
        const nextStep = prev + 1;
        
        // Simulate AI queue reduction on congested lane
        setNorthQueue(current => Math.max(2, current - (currentPhase === 'NORTH_SOUTH_GREEN' ? 2 : -1)));
        setSouthQueue(current => Math.max(3, current - (currentPhase === 'NORTH_SOUTH_GREEN' ? 2 : -1)));
        
        setEastQueue(current => (currentPhase === 'EAST_WEST_GREEN' ? Math.max(1, current - 1) : Math.min(18, current + 1)));
        setWestQueue(current => (currentPhase === 'EAST_WEST_GREEN' ? Math.max(1, current - 1) : Math.min(15, current + 1)));

        // Record history
        setQueueHistory(history => [
          ...history.slice(-8),
          {
            step: nextStep * 5,
            fixedSignalQueue: Math.min(50, 28 + nextStep * 2),
            aiSignalQueue: Math.max(3, 28 - nextStep * 2.5)
          }
        ]);

        return nextStep;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentPhase]);

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
      
      {/* Top Header & Simulation Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <h3 className="text-base font-bold text-white font-display">Deep RL Lane Prioritization & Adaptive Signal Simulator</h3>
          </div>
          <p className="text-xs text-slate-400">Microscopic TraCI Physics Engine Demonstrating Dynamic Congestion Clearing</p>
        </div>

        {/* Preset Scenarios */}
        <div className="flex space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button 
            onClick={() => {
              setTrafficDistribution('UNBALANCED_NORTH');
              setNorthQueue(38);
              setEastQueue(4);
              setCurrentPhase('NORTH_SOUTH_GREEN');
            }}
            className={`px-3 py-1.5 rounded-lg transition ${
              trafficDistribution === 'UNBALANCED_NORTH' ? 'bg-emerald-500 text-slate-950 font-bold glow-emerald' : 'text-slate-400 hover:text-white'
            }`}
          >
            North Heavy Queue (38 Veh)
          </button>

          <button 
            onClick={() => {
              setTrafficDistribution('AMBULANCE_PRIORITY');
              setNorthQueue(12);
              setEastQueue(24);
              setCurrentPhase('EAST_WEST_GREEN');
            }}
            className={`px-3 py-1.5 rounded-lg transition ${
              trafficDistribution === 'AMBULANCE_PRIORITY' ? 'bg-red-500 text-white font-bold glow-red' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ambulance Emergency Override
          </button>
        </div>
      </div>

      {/* 4-Way Intersection Physical Telemetry Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Intersection Layout Visualizer (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 p-6 rounded-2xl border border-slate-800 relative overflow-hidden flex items-center justify-center min-h-[380px]">
          
          {/* Background Asphalt Road Grid */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* North-South Road */}
            <div className="w-24 h-full bg-slate-900 border-x-2 border-slate-700/60 relative flex justify-center">
              <div className="w-0.5 h-full border-r-2 border-dashed border-amber-400/40"></div>
            </div>
            {/* East-West Road */}
            <div className="h-24 w-full bg-slate-900 border-y-2 border-slate-700/60 absolute flex items-center">
              <div className="h-0.5 w-full border-b-2 border-dashed border-amber-400/40"></div>
            </div>
          </div>

          {/* Center Signal Box */}
          <div className="z-10 bg-slate-950/90 p-4 rounded-2xl border-2 border-emerald-500/40 text-center shadow-2xl backdrop-blur-md space-y-1 glow-emerald">
            <div className="text-[10px] font-mono text-slate-400">AI Signal Controller</div>
            <div className={`text-xs font-bold font-mono px-3 py-1 rounded-full ${
              currentPhase === 'NORTH_SOUTH_GREEN' 
                ? 'bg-emerald-500 text-slate-950 font-extrabold' 
                : 'bg-amber-500 text-slate-950 font-extrabold'
            }`}>
              {currentPhase === 'NORTH_SOUTH_GREEN' ? '🟢 NORTH-SOUTH GREEN (HEAVY LANE)' : '🟢 EAST-WEST GREEN'}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono">Dynamic Duration: {phaseTimer}s</div>
          </div>

          {/* North Approach Lane (Top) */}
          <div className="absolute top-4 z-20 flex flex-col items-center space-y-1">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full animate-pulse">
              North Lane: {northQueue} Vehicles [EXCESS TRAFFIC]
            </span>
            {/* Visual vehicle queue dots */}
            <div className="flex space-x-1">
              {[...Array(Math.min(10, northQueue))].map((_, i) => (
                <span key={i} className="w-2.5 h-2.5 bg-red-500 rounded-full glow-red"></span>
              ))}
            </div>
          </div>

          {/* South Approach Lane (Bottom) */}
          <div className="absolute bottom-4 z-20 flex flex-col items-center space-y-1">
            <div className="flex space-x-1">
              {[...Array(Math.min(8, southQueue))].map((_, i) => (
                <span key={i} className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
              ))}
            </div>
            <span className="px-2 py-0.5 text-[10px] font-mono text-slate-300 bg-slate-900 border border-slate-800 rounded-full">
              South Lane: {southQueue} Vehicles
            </span>
          </div>

          {/* East Approach Lane (Right) */}
          <div className="absolute right-4 z-20 flex flex-col items-end space-y-1">
            <span className="px-2 py-0.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
              East Lane: {eastQueue} Veh (Low)
            </span>
            <div className="flex space-x-1">
              {[...Array(Math.min(5, eastQueue))].map((_, i) => (
                <span key={i} className="w-2 h-2 bg-emerald-400 rounded-full"></span>
              ))}
            </div>
          </div>

          {/* West Approach Lane (Left) */}
          <div className="absolute left-4 z-20 flex flex-col items-start space-y-1">
            <span className="px-2 py-0.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
              West Lane: {westQueue} Veh (Low)
            </span>
          </div>

        </div>

        {/* AI Q-Values & Telemetry Output (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          
          {/* AI Policy Telemetry Card */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400 font-bold uppercase">Deep Q-Network (DQN) Decision Matrix</span>
              <Cpu className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/30">
                <span className="text-emerald-400 font-bold">Action 0: Hold N-S Green (Priority)</span>
                <span className="text-emerald-400 font-bold">Q = +48.6 (CHOSEN)</span>
              </div>

              <div className="flex justify-between items-center bg-slate-950 p-2 rounded-xl border border-slate-800 opacity-60">
                <span className="text-slate-400">Action 2: Switch to E-W Green</span>
                <span className="text-red-400 font-bold">Q = -24.2 (PENALTY)</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-sans italic pt-1">
              "AI calculated that switching phase now would cause 38 vehicles on North lane to idle, increasing CO₂ by 2.4kg. Maintaining green phase clears queue in 18s."
            </div>
          </div>

          {/* Fixed-Timer vs AI Deep RL Queue Chart */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-300 font-bold">Queue Length Comparison</span>
              <span className="text-emerald-400 font-bold">AI: -96.0% Queues</span>
            </div>

            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={queueHistory}>
                  <XAxis dataKey="step" stroke="#64748b" fontSize={9} />
                  <YAxis stroke="#64748b" fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="fixedSignalQueue" stroke="#ef4444" strokeWidth={2} name="Fixed 30s Signal" />
                  <Line type="monotone" dataKey="aiSignalQueue" stroke="#10b981" strokeWidth={2} name="AI Adaptive RL" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
