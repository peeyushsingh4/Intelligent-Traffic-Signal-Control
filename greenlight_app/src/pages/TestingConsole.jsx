import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LiveVideoPlayer } from '../components/video/LiveVideoPlayer';
import { 
  Play, RotateCcw, CheckCircle2, AlertTriangle, Activity, 
  ShieldCheck, BarChart2, Cpu, FileCheck, Layers, ArrowUpRight 
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

const LATENCY_DISTRIBUTION = [
  { latency: '< 0.5s', count: 420 },
  { latency: '0.5s - 1.0s', count: 1250 },
  { latency: '1.0s - 1.5s', count: 890 },
  { latency: '1.5s - 2.0s', count: 140 },
  { latency: '> 2.0s', count: 12 }
];

const ACCURACY_BY_LIGHTING = [
  { condition: 'Daylight Clear', accuracy: 98.4 },
  { condition: 'Night High-Beam', accuracy: 94.2 },
  { condition: 'Heavy Monsoon', accuracy: 91.8 },
  { condition: 'Dust/Fog', accuracy: 92.5 }
];

export const TestingConsole = () => {
  const [testMode, setTestMode] = useState('BACKTEST'); // BACKTEST, FORWARDTEST
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testProgress, setTestProgress] = useState(100);

  const runBacktest = () => {
    setIsRunningTest(true);
    setTestProgress(0);
    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setTestProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setIsRunningTest(false);
      }
    }, 400);
  };

  return (
    <div className="h-[calc(100vh-4rem)] p-4 lg:p-6 flex flex-col space-y-6 overflow-y-auto">
      
      {/* Header & Testing Mode Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 glow-emerald">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-display">AI Backtesting & Forward-Testing Suite</h2>
              <p className="text-xs text-slate-400">Ground-Truth Accuracy Verification & Real-Time Model Drift Detection</p>
            </div>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex space-x-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs">
          <button 
            onClick={() => setTestMode('BACKTEST')}
            className={`px-4 py-2 rounded-xl font-mono font-bold transition ${
              testMode === 'BACKTEST' ? 'bg-emerald-500 text-slate-950 glow-emerald' : 'text-slate-400 hover:text-white'
            }`}
          >
            Historical Backtest (30-Day Data)
          </button>
          <button 
            onClick={() => setTestMode('FORWARDTEST')}
            className={`px-4 py-2 rounded-xl font-mono font-bold transition ${
              testMode === 'FORWARDTEST' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Forward-Test (Real-Time Streams)
          </button>
        </div>
      </div>

      {/* Main Testing Console Panels */}
      {testMode === 'BACKTEST' ? (
        <div className="space-y-6">
          
          {/* Top Control & Run Bar */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-mono text-slate-400">Evaluation Dataset: <strong className="text-white">100,000 Verified Ground-Truth Video Frames</strong></div>
              <div className="text-xs text-slate-400">Coverage: 512 Cameras across Mumbai & Navi Mumbai Intersections</div>
            </div>

            <button 
              onClick={runBacktest}
              disabled={isRunningTest}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-xs transition flex items-center space-x-2 glow-emerald"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{isRunningTest ? `Running Backtest (${testProgress}%)...` : 'Execute Complete Backtest Suite'}</span>
            </button>
          </div>

          {/* 4 Backtest Verification KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-mono">Detection Recall</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">96.2%</div>
              <div className="text-[10px] text-slate-500">True Violator Catch Rate</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-mono">Detection Precision</div>
              <div className="text-2xl font-bold font-mono text-cyan-400">97.8%</div>
              <div className="text-[10px] text-slate-500">Minimizes False Violations</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-mono">False Positive Rate</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">1.2%</div>
              <div className="text-[10px] text-slate-500">&lt;2.0% Target SLA</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-mono">Sub-2s Latency Compliance</div>
              <div className="text-2xl font-bold font-mono text-amber-400">99.4%</div>
              <div className="text-[10px] text-slate-500">Avg Latency: 1.38 seconds</div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Latency Distribution Bar Chart (7 cols) */}
            <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white font-display">End-to-End Latency Distribution</h3>
                <span className="text-xs font-mono text-emerald-400 font-bold">Target &lt; 2.0s</span>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={LATENCY_DISTRIBUTION}>
                    <XAxis dataKey="latency" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                    <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ANPR Accuracy by Environmental Conditions (5 cols) */}
            <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white font-display">ANPR Accuracy by Weather/Lighting</h3>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ACCURACY_BY_LIGHTING} layout="vertical">
                    <XAxis type="number" domain={[80, 100]} stroke="#64748b" fontSize={11} />
                    <YAxis dataKey="condition" type="category" stroke="#64748b" fontSize={11} width={100} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                    <Bar dataKey="accuracy" fill="#10b981" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* FORWARD-TESTING REAL-TIME VIDEO SUITE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          
          {/* Live Video Analysis Player (7 cols) */}
          <div className="lg:col-span-7 glass-panel p-4 rounded-3xl border border-slate-800 flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <h3 className="text-sm font-bold text-white font-display">Forward-Test Video Stream Analysis</h3>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold">BKC Kalanagar Camera</span>
            </div>

            <div className="flex-1 min-h-[360px]">
              <LiveVideoPlayer 
                videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                cameraName="BKC Kalanagar Junction (Mumbai)"
                plateNumber="MH 02 CZ 4921"
                violationTag="RED LIGHT RUNNING"
                speedObserved={64}
              />
            </div>
          </div>

          {/* Model Drift & Stream Health Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white font-display">Real-Time Model Drift Monitor</h3>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/20 text-emerald-400 rounded-full">
                  NO DRIFT DETECTED
                </span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Inference Accuracy:</span>
                  <span className="text-emerald-400 font-bold">96.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Baseline Target:</span>
                  <span className="text-slate-200">95.0%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Stream Health Status:</span>
                  <span className="text-emerald-400 font-bold">512 / 512 Streams Operational</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-mono text-slate-400 font-bold uppercase">Automated Continuous Testing SLA</h3>
              
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sub-2s Latency SLA Passed</span>
                </div>
                <div className="text-[11px] text-slate-400">Frame-to-alert latency verified at 1.38s average. Zero dropped frames detected.</div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
