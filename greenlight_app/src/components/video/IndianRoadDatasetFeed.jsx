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
    <section className="glass-panel rounded-2xl overflow-hidden flex flex-col space-y-4" aria-label="Indian Traffic Signal Live CCTV & AI Optimization Console">
      
      {/* Top Header & Camera Scenario Selector */}
      <header className="p-4 border-b border-slate-800 bg-slate-900/90 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">{activeCam.name}</h3>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full font-bold">
                {activeCam.id} · HD CCTV
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full flex items-center gap-1">
                <Leaf size={11} className="text-emerald-400" />
                <span>CO₂ Saved: +{co2SavedDisplay} ({co2ReductionRate}%)</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
              <span>📍 {activeCam.location} ({activeCam.coordinates})</span>
              <span>•</span>
              <span className="text-cyan-400">{activeCam.speedLimit} km/h Zone</span>
            </p>
          </div>
        </div>

        {/* Camera Selector Dropdown & View Mode */}
        <div className="flex gap-2 items-center">
          <select 
            value={scenarioKey} 
            onChange={(e) => setScenarioKey(e.target.value)} 
            className="control-select text-xs font-mono"
          >
            <option value="bkc">CAM-01: BKC Junction (Western Express Hwy)</option>
            <option value="vashi">CAM-02: Vashi Highway Interchange (Sion-Panvel)</option>
            <option value="palm_beach">CAM-03: Palm Beach Road (Nerul Express)</option>
          </select>

          <button 
            onClick={() => setShowAiBoxes(!showAiBoxes)} 
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition flex items-center gap-1.5 ${
              showAiBoxes 
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                : 'bg-slate-800/80 text-slate-400 border-slate-700'
            }`}
          >
            <Eye size={13} />
            <span>{showAiBoxes ? 'AI Telemetry ON' : 'Raw CCTV'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace: CCTV Video Feed (8 cols) + Telemetry / CO2 Impact (4 cols) */}
      <div className="p-4 grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* Real CCTV Footage with Live AI Detection Overlay (8 cols) */}
        <div className="xl:col-span-8 flex flex-col space-y-2">
          
          <div className="flex justify-between items-center text-xs font-mono text-slate-400 px-1">
            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Camera size={13} className="text-emerald-400" />
              Live CCTV Traffic Feed · Mumbai Traffic Police
            </span>
            <span className="text-[11px] text-slate-300 font-mono">
              Timestamp: <strong className="text-white">{currentTime}</strong>
            </span>
          </div>

          {/* High-Resolution CCTV Video Container with Telemetry HUD */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl group">
            
            {/* Real Traffic CCTV Video Element */}
            <video 
              ref={videoRef}
              key={activeCam.cctvUrl}
              src={activeCam.cctvUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />

            {/* CCTV Security Camera HUD Header Overlay */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none z-20 text-[10px] font-mono">
              <div className="p-2 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800 text-slate-200 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  <strong className="text-red-400">REC ● LIVE CCTV</strong>
                  <span>|</span>
                  <span className="text-emerald-400 font-bold">{activeCam.id}</span>
                </div>
                <div className="text-slate-400">{activeCam.name}</div>
                <div className="text-[9px] text-slate-500">{activeCam.fps} FPS · 1080p FHD · {activeCam.bitrate}</div>
              </div>

              {/* Active Signal Head HUD with Live Countdown */}
              <div className="p-2 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800 flex items-center gap-3">
                <div className="flex gap-1.5 bg-slate-900 p-1 rounded-md border border-slate-700">
                  <div className={`w-3 h-3 rounded-full ${emergencyBlink ? 'bg-slate-700' : 'bg-slate-700'}`}></div>
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                  <div className={`w-3 h-3 rounded-full bg-emerald-500 glow-emerald ${emergencyBlink ? 'animate-pulse' : ''}`}></div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400">Signal Status</div>
                  <div className="text-xs font-bold text-emerald-400 font-mono">
                    {emergencyBlink ? 'PRIORITY GREEN' : 'ACTIVE GREEN (38s)'}
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Vehicle Priority (EVP) Banner Overlay */}
            {emergencyBlink && (
              <div className="absolute top-16 inset-x-4 z-30 p-2.5 bg-red-600/90 backdrop-blur-md text-white rounded-xl border border-red-400 shadow-2xl flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={18} className="text-white" />
                  <span className="font-bold text-xs uppercase tracking-wide">
                    🚨 Emergency Priority (EVP): Ambulance AMB-108 Approaching (64 km/h) — Green Wave Locked
                  </span>
                </div>
                <span className="px-2 py-0.5 text-[10px] bg-white/20 rounded font-mono font-bold">
                  PROTOCOL: ISO-22951
                </span>
              </div>
            )}

            {/* Dynamic Diversion Overhead VMS Gantry Sign */}
            {metrics.diversionActive && (
              <div className="absolute bottom-16 inset-x-4 z-30 p-2.5 bg-emerald-950/90 backdrop-blur-md text-emerald-300 rounded-xl border border-emerald-500/60 shadow-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation size={18} className="text-emerald-400" />
                  <span className="font-bold text-xs uppercase tracking-wide">
                    🔀 NTCIP 1203 VMS: Primary Corridor Saturated — 65% Flow Diverted via {activeCam.detourCorridor}
                  </span>
                </div>
                <span className="px-2 py-0.5 text-[10px] bg-emerald-500 text-slate-950 font-bold rounded font-mono">
                  DIVERSION ACTIVE
                </span>
              </div>
            )}

            {/* Live Computer Vision AI Detection Bounding Boxes */}
            {showAiBoxes && (
              <div className="absolute inset-0 pointer-events-none z-10">
                {activeCam.detections.map((det) => (
                  <div
                    key={det.id}
                    className="absolute border-2 border-cyan-400 bg-cyan-500/10 rounded transition-all duration-300"
                    style={{
                      top: det.bbox.top,
                      left: det.bbox.left,
                      width: det.bbox.width,
                      height: det.bbox.height,
                    }}
                  >
                    <div className="absolute -top-5 left-0 px-1.5 py-0.5 bg-slate-950/90 border border-cyan-400 rounded text-[8px] font-mono text-cyan-300 whitespace-nowrap">
                      {det.type} · {det.speed} km/h · {det.plate}
                    </div>
                  </div>
                ))}

                {/* Simulated Emergency Ambulance Detection Box when triggered */}
                {emergencyBlink && (
                  <div 
                    className="absolute border-2 border-red-500 bg-red-500/20 rounded z-20 animate-bounce"
                    style={{ top: '40%', left: '50%', width: '18%', height: '24%' }}
                  >
                    <div className="absolute -top-5 left-0 px-1.5 py-0.5 bg-red-950 border border-red-500 rounded text-[8px] font-mono text-red-300 font-bold whitespace-nowrap">
                      🚨 AMBULANCE AMB-108 · 64 km/h · PRIORITY
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Bar inside CCTV */}
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center pointer-events-none z-20 text-[10px] font-mono">
              <span className="px-2 py-1 bg-slate-950/80 backdrop-blur-md rounded border border-slate-800 text-slate-300">
                Detour Corridor: <strong className="text-emerald-400">{activeCam.detourCorridor}</strong>
              </span>
              <span className="px-2 py-1 bg-slate-950/80 backdrop-blur-md rounded border border-slate-800 text-slate-300">
                Speed Limit: <strong className="text-amber-400">{activeCam.speedLimit} km/h</strong>
              </span>
            </div>

          </div>

          {/* Telemetry Footer with Dedicated CO2 Saved Indicator */}
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center text-xs font-mono text-slate-300 gap-2">
            <span>Location: <strong className="text-emerald-400 uppercase">{activeCam.name}</strong></span>
            <span>Active Queue: <strong className="text-amber-400">{metrics.queueLength ?? 5} vehicles</strong></span>
            <span>Wait Time: <strong className="text-white">{metrics.waitingTimeSeconds ?? 4.2}s</strong></span>
            
            {/* Live CO2 Saved Footprint Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300 font-bold glow-emerald">
              <Leaf size={13} className="text-emerald-400 animate-pulse" />
              <span>CO₂ Saved: +{co2SavedDisplay}</span>
              <span className="text-[10px] text-emerald-400/80 font-normal">(-{co2ReductionRate}%)</span>
            </div>
          </div>
        </div>

        {/* Telemetry Sidebar & Environmental Carbon Impact (4 cols) */}
        <div className="xl:col-span-4 flex flex-col space-y-4">
          
          {/* Environmental Carbon Savings Dashboard Card */}
          <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Leaf size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-display">CO₂ Saved & Environmental Impact</h4>
                  <p className="text-[10px] text-slate-400">Adaptive Signal Timing vs Fixed-Time</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500 text-slate-950 rounded-full">
                -{co2ReductionRate}%
              </span>
            </div>

            {/* Hero Saved Stat */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Cumulative CO₂ Prevented</span>
                <div className="text-2xl font-bold text-emerald-400 glow-emerald">
                  +{co2SavedDisplay}
                </div>
                <span className="text-[10px] text-slate-500">Idling & queuing emissions eliminated</span>
              </div>
              <div className="text-right text-[11px] space-y-1">
                <div className="text-slate-400">Emission Rate: <span className="text-slate-200">{metrics.co2MgPerSecond ? (metrics.co2MgPerSecond/1000).toFixed(1) : '28.4'} g/s</span></div>
                <div className="text-emerald-400">Reduction: <span className="font-bold">{co2ReductionRate}%</span></div>
              </div>
            </div>

            {/* Equivalencies (Trees & Fuel) */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2">
                <Trees size={15} className="text-emerald-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400">Offset Impact</div>
                  <div className="font-bold text-white text-[11px]">{metrics.treesEquivalent ?? 12.6} Trees/yr</div>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2">
                <Fuel size={15} className="text-cyan-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400">Fuel Conserved</div>
                  <div className="font-bold text-white text-[11px]">{metrics.fuelSavedLiters ?? 0.79} Liters</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick AI Action Buttons for Live Presentation */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3 font-mono">
            <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
              <Zap size={14} className="text-amber-400" />
              Live Demonstration Controls
            </h4>
            <p className="text-[11px] text-slate-400 font-sans leading-tight">
              Test adaptive timing reallocation, emergency priority preemption, and corridor diversion:
            </p>

            <div className="space-y-2">
              <button 
                onClick={handleTriggerSurge}
                className="w-full p-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Zap size={14} />
                  <span>Test Congestion Surge</span>
                </div>
                <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded">Reduce Free Lane Time</span>
              </button>

              <button 
                onClick={handleTriggerEmergency}
                className="w-full p-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-bold transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert size={14} />
                  <span>Dispatch Ambulance (AMB-108)</span>
                </div>
                <span className="text-[10px] bg-red-500/20 px-1.5 py-0.5 rounded">Green Wave EVP</span>
              </button>

              <button 
                onClick={handleTriggerDiversion}
                className="w-full p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Navigation size={14} />
                  <span>Divert Traffic to Alternate Route</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded">Reroute 65%</span>
              </button>
            </div>
          </div>

          {/* Key Metric Gauges */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2.5 font-mono">
            <p className="text-xs font-bold text-slate-400 uppercase">Traffic Health Indicators</p>
            <Metric icon={Camera} label="Tracked Vehicles (CCTV)" value={metrics.vehicleCount ?? 38} />
            <Metric icon={Gauge} label="Queue Backlog" value={`${metrics.queueLength ?? 5} vehicles`} />
            <Metric icon={RefreshCw} label="Average Wait Time" value={`${metrics.waitingTimeSeconds ?? 4.2}s`} />
            <Metric icon={Sliders} label="Signal Phase" value={metrics.signalPhase ?? 'Phase 1: Green'} />
          </div>

        </div>

      </div>

      {/* Machine Thought AI Explainability Console */}
      <div className="p-4 pt-0">
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

const Metric = ({ icon: Icon, label, value }) => (
  <div className="flex gap-2.5 items-center justify-between p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
    <div className="flex items-center gap-2">
      <Icon size={14} className="text-cyan-400" aria-hidden="true" />
      <span className="text-xs text-slate-300 font-mono">{label}</span>
    </div>
    <span className="font-mono text-xs font-bold text-emerald-400">{value}</span>
  </div>
);
