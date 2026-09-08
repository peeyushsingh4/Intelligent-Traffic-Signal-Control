import React, { useEffect, useMemo, useState, useRef } from 'react';
import { 
  Camera, CirclePause, CirclePlay, Database, Gauge, Radio, RefreshCw, Save, 
  TriangleAlert, Video, MapPin, Info, ExternalLink, Leaf, TrendingDown, Trees, 
  Fuel, ShieldAlert, Zap, Navigation, Clock, Eye, Sliders, Activity, AlertTriangle
} from 'lucide-react';
import { MachineThoughtConsole } from '../simulation/MachineThoughtConsole';

const API = 'http://localhost:5005/api';

const CCTV_CAMERAS = {
  bkc: {
    id: 'CAM-01',
    scenarioId: 'bkc',
    name: 'BKC Junction (Bandra East, Mumbai)',
    location: 'Western Express Hwy × BKC Main Gateway',
    coordinates: '19.0657° N, 72.8686° E',
    cctvUrl: 'https://assets.mixkit.co/videos/1755/1755-720.mp4',
    detourCorridor: 'LBS Marg Alternate Detour',
    speedLimit: 60,
    fps: 29.97,
    bitrate: '4.8 Mbps',
    detections: [
      { id: 'det-1', type: 'BEST BUS', conf: 0.98, speed: 28, plate: 'MH 01 CV 2841', bbox: { top: '35%', left: '42%', width: '18%', height: '24%' } },
      { id: 'det-2', type: 'AUTO-RICKSHAW', conf: 0.96, speed: 32, plate: 'MH 02 CZ 4921', bbox: { top: '58%', left: '22%', width: '12%', height: '16%' } },
      { id: 'det-3', type: 'CAR', conf: 0.97, speed: 44, plate: 'MH 03 BT 9012', bbox: { top: '48%', left: '62%', width: '14%', height: '18%' } },
      { id: 'det-4', type: 'CAR', conf: 0.95, speed: 41, plate: 'MH 43 BE 8812', bbox: { top: '65%', left: '72%', width: '13%', height: '17%' } },
    ]
  },
  vashi: {
    id: 'CAM-02',
    scenarioId: 'vashi',
    name: 'Vashi Highway Interchange (Navi Mumbai)',
    location: 'Sion-Panvel Expressway Mainline',
    coordinates: '19.0770° N, 72.9986° E',
    cctvUrl: 'https://assets.mixkit.co/videos/4272/4272-720.mp4',
    detourCorridor: 'Turbhe MIDC Bypass Corridor',
    speedLimit: 80,
    fps: 30.0,
    bitrate: '5.2 Mbps',
    detections: [
      { id: 'det-v1', type: 'TRUCK', conf: 0.97, speed: 52, plate: 'MH 46 BB 3321', bbox: { top: '30%', left: '35%', width: '22%', height: '28%' } },
      { id: 'det-v2', type: 'CAR', conf: 0.98, speed: 68, plate: 'MH 04 ER 5510', bbox: { top: '55%', left: '60%', width: '15%', height: '20%' } },
      { id: 'det-v3', type: 'CAR', conf: 0.96, speed: 72, plate: 'MH 12 QX 1144', bbox: { top: '42%', left: '15%', width: '14%', height: '19%' } },
    ]
  },
  palm_beach: {
    id: 'CAM-03',
    scenarioId: 'palm_beach',
    name: 'Palm Beach Road (Nerul, Navi Mumbai)',
    location: 'Divided Coastal Express Boulevard',
    coordinates: '19.0330° N, 73.0160° E',
    cctvUrl: 'https://assets.mixkit.co/videos/36261/36261-720.mp4',
    detourCorridor: 'Seawoods Coastal Bypass',
    speedLimit: 70,
    fps: 29.97,
    bitrate: '4.5 Mbps',
    detections: [
      { id: 'det-p1', type: 'CAR', conf: 0.99, speed: 64, plate: 'MH 43 CC 9090', bbox: { top: '45%', left: '48%', width: '16%', height: '22%' } },
      { id: 'det-p2', type: 'AUTO-RICKSHAW', conf: 0.95, speed: 38, plate: 'MH 43 AZ 1205', bbox: { top: '62%', left: '25%', width: '13%', height: '17%' } },
    ]
  }
};

export const IndianRoadDatasetFeed = () => {
  const [scenarioKey, setScenarioKey] = useState('bkc');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isServerActive, setIsServerActive] = useState(false);
  const [state, setState] = useState({
    status: 'running',
    simTime: 12.0,
    metrics: {
      vehicleCount: 38,
      queueLength: 6,
      waitingTimeSeconds: 4.2,
      co2MgPerSecond: 28400.0,
      co2SavedKg: 1.842,
      co2SavedGrams: 1842.0,
      co2SavedPercent: 33.4,
      treesEquivalent: 12.6,
      fuelSavedLiters: 0.797,
      signalPhase: 'Phase 1: Southbound Green Wave',
      diversionActive: false,
      emergencyActive: false
    },
    links: [
      { id: 'link-1', name: 'Western Express Hwy (Southbound)', density: 68.0, queueLength: 5, greenSeconds: 44.0, isGreen: true, isAlternate: false },
      { id: 'link-2', name: 'BKC Main Corridor (Eastbound)', density: 42.0, queueLength: 1, greenSeconds: 30.0, isGreen: false, isAlternate: false },
      { id: 'link-3', name: 'LBS Marg Alternate Corridor', density: 18.0, queueLength: 0, greenSeconds: 16.0, isGreen: false, isAlternate: true },
    ],
    machineThoughts: [
      {
        timestamp: 12.0,
        phase: 'SIGNAL_REALLOCATION',
        title: '⏱️ Adaptive Timing: 14s Transferred from Free Lane to South Corridor',
        reasoning: 'LBS Marg approach operating at low load (18% capacity). Subtracted 14 seconds from LBS Marg (reduced to 16s) and transferred directly to congested Western Express Highway (increased to 44s) to clear queuing vehicles.',
        confidence: 0.94,
        telemetry: { donorLink: 'LBS Marg', timeSubtracted: '14s', beneficiaryLink: 'WEH South', greenDuration: '44s' }
      }
    ]
  });

  const [emergencyBlink, setEmergencyBlink] = useState(false);
  const [showAiBoxes, setShowAiBoxes] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const videoRef = useRef(null);

  const activeCam = CCTV_CAMERAS[scenarioKey] || CCTV_CAMERAS.bkc;

  // Running digital clock for CCTV overlay
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Poll backend state if server is online
  useEffect(() => {
    let timer = null;
    const fetchState = async () => {
      try {
        const res = await fetch(`${API}/simulation/state`);
        if (res.ok) {
          const data = await res.json();
          setState(prev => ({
            ...prev,
            ...data,
            metrics: { ...prev.metrics, ...data.metrics },
            links: data.links?.length ? data.links : prev.links,
            machineThoughts: data.machineThoughts?.length ? data.machineThoughts : prev.machineThoughts
          }));
          setIsServerActive(true);
        }
      } catch (err) {
        // Backend offline: Keep resilient local interactive state
      }
    };

    fetchState();
    timer = setInterval(fetchState, 1000);
    return () => clearInterval(timer);
  }, [scenarioKey]);

  // Handle Congestion Surge Trigger
  const handleTriggerSurge = async () => {
    try {
      await fetch(`${API}/matsim/trigger-congestion`, { method: 'POST' });
    } catch (e) {
      // Local fallback
    }

    setState(prev => {
      const newLinks = prev.links.map(l => {
        if (l.isAlternate) return { ...l, greenSeconds: Math.max(12, l.greenSeconds - 14) };
        if (l.isGreen || l.density > 50) return { ...l, density: 84.0, queueLength: 18, greenSeconds: l.greenSeconds + 14 };
        return l;
      });

      const newThought = {
        timestamp: Math.round((prev.simTime + 2.0) * 10) / 10,
        phase: 'SIGNAL_REALLOCATION',
        title: '⏱️ Congestion Spike Detected: Green Time Reallocated from Free Lane',
        reasoning: 'Primary approach density reached 84%. Reallocated 14s of green time from low-density free lane (reduced to 16s) to flush the primary corridor queue (boosted to 44s).',
        confidence: 0.95,
        telemetry: { bottleneckDensity: '84%', donorGreen: '16s', boostedGreen: '44s' }
      };

      return {
        ...prev,
        simTime: prev.simTime + 2.0,
        links: newLinks,
        metrics: {
          ...prev.metrics,
          queueLength: 18,
          waitingTimeSeconds: 8.6,
          co2SavedKg: Math.round((prev.metrics.co2SavedKg + 0.35) * 1000) / 1000,
          co2SavedPercent: 34.8
        },
        machineThoughts: [newThought, ...prev.machineThoughts.slice(0, 8)]
      };
    });
  };

  // Handle Emergency Priority Trigger
  const handleTriggerEmergency = async () => {
    try {
      await fetch(`${API}/matsim/trigger-emergency`, { method: 'POST' });
    } catch (e) {
      // Local fallback
    }

    setEmergencyBlink(true);
    setTimeout(() => setEmergencyBlink(false), 12000);

    setState(prev => {
      const newThought = {
        timestamp: Math.round((prev.simTime + 1.0) * 10) / 10,
        phase: 'EMERGENCY_EVP',
        title: '🚨 Emergency Ambulance AMB-108 Detected: Green Wave Priority Activated',
        reasoning: 'AI computer vision radar detected emergency vehicle approaching at 64 km/h. Signal controller preempted opposing traffic with 3s clearance and locked an uninterrupted Green Wave corridor.',
        confidence: 0.99,
        telemetry: { vehicle: 'AMB-108 (ICU-Ambulance)', speed: '64 km/h', signalAction: 'FORCE_GREEN_HOLD' }
      };

      return {
        ...prev,
        metrics: {
          ...prev.metrics,
          emergencyActive: true,
          signalPhase: '🚨 PRIORITY GREEN WAVE (AMB-108)'
        },
        machineThoughts: [newThought, ...prev.machineThoughts.slice(0, 8)]
      };
    });
  };

  // Handle Dynamic Diversion Trigger
  const handleTriggerDiversion = async () => {
    try {
      await fetch(`${API}/activate-diversion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diversionId: 'cctv-div-01' })
      });
    } catch (e) {
      // Local fallback
    }

    setState(prev => {
      const newThought = {
        timestamp: Math.round((prev.simTime + 1.5) * 10) / 10,
        phase: 'DIVERSION_EXEC',
        title: '🔀 Dynamic Traffic Diversion Broadcasted via Overhead VMS',
        reasoning: `Upstream traffic volume approaching saturation. NTCIP 1203 Variable Message Signs updated to divert 65% of traffic onto ${activeCam.detourCorridor}. Preventing corridor gridlock and reducing idling emissions.`,
        confidence: 0.96,
        telemetry: { divertedVolume: '65%', alternateRoute: activeCam.detourCorridor, expectedDelaySaved: '-14.2 min' }
      };

      return {
        ...prev,
        metrics: {
          ...prev.metrics,
          diversionActive: true,
          queueLength: Math.max(2, prev.metrics.queueLength - 8),
          co2SavedKg: Math.round((prev.metrics.co2SavedKg + 0.62) * 1000) / 1000,
          co2SavedPercent: 36.2
        },
        machineThoughts: [newThought, ...prev.machineThoughts.slice(0, 8)]
      };
    });
  };

  const metrics = state.metrics || {};
  const co2SavedDisplay = metrics.co2SavedKg != null ? `${metrics.co2SavedKg} kg` : '1.84 kg';
  const co2ReductionRate = metrics.co2SavedPercent ?? 33.4;

  return (
    <section className="glass-panel rounded-2xl overflow-hidden flex flex-col" aria-label="Indian Traffic Signal Live CCTV & AI Optimization Console">
      
      {/* Compact Header */}
      <header className="p-3 border-b border-slate-800 bg-slate-900/90 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <h3 className="text-sm font-bold text-slate-100">{activeCam.name}</h3>
          <span className="px-1.5 py-0.5 text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full font-bold">
            {activeCam.id}
          </span>
          <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full flex items-center gap-1">
            <Leaf size={10} className="text-emerald-400" />
            CO₂: +{co2SavedDisplay} (-{co2ReductionRate}%)
          </span>
        </div>

        <div className="flex gap-2 items-center">
          <select 
            value={scenarioKey} 
            onChange={(e) => setScenarioKey(e.target.value)} 
            className="control-select text-[10px] font-mono py-1"
          >
            <option value="bkc">CAM-01: BKC Junction</option>
            <option value="vashi">CAM-02: Vashi Interchange</option>
            <option value="palm_beach">CAM-03: Palm Beach Road</option>
          </select>
          <button 
            onClick={() => setShowAiBoxes(!showAiBoxes)} 
            className={`px-2 py-1 rounded-lg border text-[10px] font-mono font-bold transition flex items-center gap-1 ${
              showAiBoxes 
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                : 'bg-slate-800/80 text-slate-400 border-slate-700'
            }`}
          >
            <Eye size={11} />
            {showAiBoxes ? 'AI ON' : 'Raw'}
          </button>
        </div>
      </header>

      {/* CCTV Video — constrained height so it doesn't dominate */}
      <div className="p-3 space-y-2">
        <div className="relative rounded-xl overflow-hidden bg-black border border-slate-800 shadow-xl" style={{ maxHeight: '280px' }}>
          
          <video 
            ref={videoRef}
            key={activeCam.cctvUrl}
            src={activeCam.cctvUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ maxHeight: '280px' }}
          />

          {/* HUD overlay */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start pointer-events-none z-20 text-[9px] font-mono">
            <div className="p-1.5 rounded bg-slate-950/85 backdrop-blur-md border border-slate-800 text-slate-200">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                <strong className="text-red-400">REC ●</strong>
                <span className="text-emerald-400 font-bold">{activeCam.id}</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">{currentTime}</span>
              </div>
            </div>
            <div className="p-1.5 rounded bg-slate-950/85 backdrop-blur-md border border-slate-800 flex items-center gap-2">
              <div className="flex gap-1 bg-slate-900 p-0.5 rounded border border-slate-700">
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                <div className={`w-2 h-2 rounded-full bg-emerald-500 ${emergencyBlink ? 'animate-pulse' : ''}`}></div>
              </div>
              <span className="text-emerald-400 font-bold">{emergencyBlink ? 'PRIORITY' : 'GREEN'}</span>
            </div>
          </div>

          {/* Emergency Vehicle Priority Banner */}
          {emergencyBlink && (
            <div className="absolute top-10 inset-x-2 z-30 p-2 bg-red-600/90 backdrop-blur-md text-white rounded-lg border border-red-400 flex items-center gap-2 animate-pulse text-[10px]">
              <ShieldAlert size={14} className="text-white shrink-0" />
              <span className="font-bold uppercase">🚨 EVP: Ambulance AMB-108 (64 km/h) — Green Wave Locked</span>
            </div>
          )}

          {/* Diversion VMS */}
          {metrics.diversionActive && (
            <div className="absolute bottom-8 inset-x-2 z-30 p-2 bg-emerald-950/90 backdrop-blur-md text-emerald-300 rounded-lg border border-emerald-500/60 flex items-center gap-2 text-[10px]">
              <Navigation size={14} className="text-emerald-400 shrink-0" />
              <span className="font-bold uppercase">🔀 VMS: 65% Flow Diverted → {activeCam.detourCorridor}</span>
            </div>
          )}

          {/* AI Detection Boxes */}
          {showAiBoxes && (
            <div className="absolute inset-0 pointer-events-none z-10">
              {activeCam.detections.map((det) => (
                <div
                  key={det.id}
                  className="absolute border-2 border-cyan-400 bg-cyan-500/10 rounded"
                  style={{ top: det.bbox.top, left: det.bbox.left, width: det.bbox.width, height: det.bbox.height }}
                >
                  <div className="absolute -top-4 left-0 px-1 py-0.5 bg-slate-950/90 border border-cyan-400 rounded text-[7px] font-mono text-cyan-300 whitespace-nowrap">
                    {det.type} · {det.speed} km/h
                  </div>
                </div>
              ))}
              {emergencyBlink && (
                <div className="absolute border-2 border-red-500 bg-red-500/20 rounded z-20 animate-bounce"
                  style={{ top: '40%', left: '50%', width: '18%', height: '24%' }}>
                  <div className="absolute -top-4 left-0 px-1 py-0.5 bg-red-950 border border-red-500 rounded text-[7px] font-mono text-red-300 font-bold whitespace-nowrap">
                    🚨 AMB-108 · PRIORITY
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom bar */}
          <div className="absolute bottom-1.5 left-2 right-2 flex justify-between pointer-events-none z-20 text-[8px] font-mono">
            <span className="px-1.5 py-0.5 bg-slate-950/80 backdrop-blur-md rounded border border-slate-800 text-emerald-400">
              {activeCam.detourCorridor}
            </span>
            <span className="px-1.5 py-0.5 bg-slate-950/80 backdrop-blur-md rounded border border-slate-800 text-amber-400">
              {activeCam.speedLimit} km/h
            </span>
          </div>
        </div>

        {/* Compact stats strip + action buttons in one row */}
        <div className="flex gap-2 items-stretch">
          {/* Stats */}
          <div className="flex-1 grid grid-cols-4 gap-1.5 text-[9px] font-mono">
            <div className="p-1.5 bg-slate-900/80 rounded-lg border border-slate-800 text-center">
              <div className="text-slate-500">Queue</div>
              <div className="text-amber-400 font-bold">{metrics.queueLength ?? 5}</div>
            </div>
            <div className="p-1.5 bg-slate-900/80 rounded-lg border border-slate-800 text-center">
              <div className="text-slate-500">Wait</div>
              <div className="text-white font-bold">{metrics.waitingTimeSeconds ?? 4.2}s</div>
            </div>
            <div className="p-1.5 bg-slate-900/80 rounded-lg border border-slate-800 text-center">
              <div className="text-slate-500">Vehicles</div>
              <div className="text-cyan-400 font-bold">{metrics.vehicleCount ?? 38}</div>
            </div>
            <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/30 text-center">
              <div className="text-emerald-400/70">CO₂</div>
              <div className="text-emerald-400 font-bold">+{co2SavedDisplay}</div>
            </div>
          </div>
        </div>

        {/* Compact action buttons */}
        <div className="flex gap-1.5">
          <button onClick={handleTriggerSurge}
            className="flex-1 p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold font-mono transition flex items-center justify-center gap-1">
            <Zap size={11} /> Surge
          </button>
          <button onClick={handleTriggerEmergency}
            className="flex-1 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-[10px] font-bold font-mono transition flex items-center justify-center gap-1">
            <ShieldAlert size={11} /> Ambulance
          </button>
          <button onClick={handleTriggerDiversion}
            className="flex-1 p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold font-mono transition flex items-center justify-center gap-1">
            <Navigation size={11} /> Divert
          </button>
        </div>
      </div>

      {/* Machine Thought Console — compact */}
      <div className="p-3 pt-0">
        <MachineThoughtConsole 
          thoughts={state.machineThoughts || []} 
          links={state.links || []} 
          onTriggerSurge={handleTriggerSurge}
          onTriggerEmergency={handleTriggerEmergency}
          onTriggerDiversion={handleTriggerDiversion}
        />
      </div>

    </section>
  );
};
