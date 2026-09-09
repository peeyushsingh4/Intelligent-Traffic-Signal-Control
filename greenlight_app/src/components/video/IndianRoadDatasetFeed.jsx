import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, AlertTriangle, CheckCircle2, Shield, Eye, ShieldAlert,
  Zap, ArrowRight, Video, Navigation, Activity, Clock, Sliders, Leaf, Cpu
} from 'lucide-react';
import { MachineThoughtConsole } from '../simulation/MachineThoughtConsole';

const API = '/api';

const CCTV_CAMERAS = {
  bkc: {
    id: 'CAM-01',
    scenarioId: 'bkc',
    name: 'BKC Junction (Bandra East, Mumbai)',
    location: 'Western Express Hwy × BKC Main Gateway',
    coordinates: '19.0657° N, 72.8686° E',
    rawUrl: '/videos/istockphoto-2193558699-640_adpp_is.mp4',
    trackedUrl: '/videos/istockphoto-2193558699-640_adpp_is_tracked.mp4',
    tracksJson: '/videos/istockphoto-2193558699-640_adpp_is_compact.json',
    detourCorridor: 'LBS Marg Alternate Detour',
    speedLimit: 60,
    fps: 25.0,
    bitrate: '5.2 Mbps'
  },
  vashi: {
    id: 'CAM-02',
    scenarioId: 'vashi',
    name: 'Vashi Highway Interchange (Navi Mumbai)',
    location: 'Sion-Panvel Expressway Mainline',
    coordinates: '19.0770° N, 72.9986° E',
    rawUrl: '/videos/istockphoto-1328725609-640_adpp_is.mp4',
    trackedUrl: '/videos/istockphoto-1328725609-640_adpp_is_tracked.mp4',
    tracksJson: '/videos/istockphoto-1328725609-640_adpp_is_compact.json',
    detourCorridor: 'Turbhe MIDC Bypass Corridor',
    speedLimit: 80,
    fps: 24.0,
    bitrate: '5.8 Mbps'
  },
  palm_beach: {
    id: 'CAM-03',
    scenarioId: 'palm_beach',
    name: 'Palm Beach Road (Nerul, Navi Mumbai)',
    location: 'Divided Coastal Express Boulevard',
    coordinates: '19.0330° N, 73.0160° E',
    rawUrl: '/videos/istockphoto-1173077963-640_adpp_is.mp4',
    trackedUrl: '/videos/istockphoto-1173077963-640_adpp_is_tracked.mp4',
    tracksJson: '/videos/istockphoto-1173077963-640_adpp_is_compact.json',
    detourCorridor: 'Seawoods Coastal Bypass',
    speedLimit: 70,
    fps: 24.0,
    bitrate: '4.5 Mbps'
  },
  dadar: {
    id: 'CAM-04',
    scenarioId: 'dadar',
    name: 'Dadar TT Circle (Central Mumbai)',
    location: 'Dr. Ambedkar Rd × Tilak Bridge Flyover',
    coordinates: '19.0178° N, 72.8478° E',
    rawUrl: '/videos/istockphoto-1170897707-640_adpp_is.mp4',
    trackedUrl: '/videos/istockphoto-1170897707-640_adpp_is_tracked.mp4',
    tracksJson: '/videos/istockphoto-1170897707-640_adpp_is_compact.json',
    detourCorridor: 'Senapati Bapat Marg Bypass',
    speedLimit: 50,
    fps: 30.0,
    bitrate: '6.1 Mbps'
  },
  weh: {
    id: 'CAM-05',
    scenarioId: 'weh',
    name: 'WEH Airport Flyover & Metro (Andheri East)',
    location: 'Western Express Highway Metro Line 7 Pier',
    coordinates: '19.1197° N, 72.8464° E',
    rawUrl: '/videos/istockphoto-2228456242-640_adpp_is.mp4',
    trackedUrl: '/videos/istockphoto-2228456242-640_adpp_is_tracked.mp4',
    tracksJson: '/videos/istockphoto-2228456242-640_adpp_is_compact.json',
    detourCorridor: 'Sahar Airport Elevated Road',
    speedLimit: 70,
    fps: 30.0,
    bitrate: '5.4 Mbps'
  },
  lbs_metro: {
    id: 'CAM-06',
    scenarioId: 'lbs_metro',
    name: 'Kurla - LBS Marg Metro Corridor (Mumbai)',
    location: 'Lal Bahadur Shastri Marg × Metro Line 2B',
    coordinates: '19.0728° N, 72.8797° E',
    rawUrl: '/videos/istockphoto-2228456262-640_adpp_is.mp4',
    trackedUrl: '/videos/istockphoto-2228456262-640_adpp_is_tracked.mp4',
    tracksJson: '/videos/istockphoto-2228456262-640_adpp_is_compact.json',
    detourCorridor: 'Santacruz-Chembur Link Road (SCLR)',
    speedLimit: 60,
    fps: 30.0,
    bitrate: '5.9 Mbps'
  }
};

export const IndianRoadDatasetFeed = ({ initialScenario = 'bkc', currentScenario, onScenarioChange }) => {
  const [scenarioKey, setScenarioKey] = useState(currentScenario || initialScenario);

  useEffect(() => {
    if (currentScenario && CCTV_CAMERAS[currentScenario]) {
      setScenarioKey(currentScenario);
    }
  }, [currentScenario]);

  const handleSelectScenario = (key) => {
    setScenarioKey(key);
    if (onScenarioChange) onScenarioChange(key);
  };
  const [viewMode, setViewMode] = useState('OVERLAY'); // 'OVERLAY' (Dynamic HUD), 'TRACKED_VIDEO' (YOLO Render), 'RAW'
  const [tracksData, setTracksData] = useState(null);
  const [liveDetections, setLiveDetections] = useState([]);
  const [currentTime, setCurrentTime] = useState('');
  const [emergencyBlink, setEmergencyBlink] = useState(false);
  const [liveCarbonRate, setLiveCarbonRate] = useState(284.0);
  const [liveCumulativeCarbon, setLiveCumulativeCarbon] = useState(1.842);
  
  const videoRef = useRef(null);
  const animRef = useRef(null);

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

  // Fetch real frame-by-frame tracks generated by YOLOv8
  useEffect(() => {
    setTracksData(null);
    setLiveDetections([]);
    fetch(activeCam.tracksJson)
      .then(res => res.json())
      .then(data => {
        setTracksData(data);
      })
      .catch(err => console.error('Failed to load tracking data:', err));
  }, [scenarioKey]);

  // Synchronize bounding boxes & live carbon footprint with video playback time
  useEffect(() => {
    let lastTime = performance.now();
    const syncLoop = () => {
      const video = videoRef.current;
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      if (video && tracksData && !video.paused) {
        const tVal = Math.round(video.currentTime * 10) / 10;
        const timeKey = tVal.toFixed(1);
        
        let dets = tracksData[timeKey];
        if (!dets || dets.length === 0) {
          const kPrev = Math.max(0, tVal - 0.1).toFixed(1);
          const kNext = (tVal + 0.1).toFixed(1);
          dets = tracksData[kPrev] || tracksData[kNext];
        }

        if (dets && dets.length > 0) {
          setLiveDetections(dets);
          // Calculate live carbon metrics from tracked vehicles in this frame
          const totalRate = dets.reduce((acc, d) => acc + (d.emission_rate || 28.4), 0);
          setLiveCarbonRate(round(totalRate, 1));
          // Instantaneous baseline vs AI optimized savings:
          // In fixed-time signals, queuing causes ~32.8% extra idle burn.
          const savedDeltaKg = ((totalRate * 0.328) * dt) / 1000000.0;
          setLiveCumulativeCarbon(prev => round(prev + savedDeltaKg, 4));
        }
      }
      animRef.current = requestAnimationFrame(syncLoop);
    };

    animRef.current = requestAnimationFrame(syncLoop);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [tracksData]);

  const round = (num, dec) => Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);

  // Simulation state for telemetry
  const [state, setState] = useState({
    status: 'running',
    metrics: {
      vehicleCount: 28,
      queueLength: 6,
      waitingTimeSeconds: 4.2,
      co2SavedKg: 1.842,
      co2SavedPercent: 33.4,
      diversionActive: false,
      emergencyActive: false
    },
    links: [
      { id: 'link-1', name: 'Western Express Hwy (Southbound)', density: 68.0, queueLength: 6, greenSeconds: 44.0, isGreen: true, isAlternate: false },
      { id: 'link-2', name: 'BKC Main Corridor (Eastbound)', density: 42.0, queueLength: 2, greenSeconds: 30.0, isGreen: false, isAlternate: false },
      { id: 'link-3', name: 'LBS Marg Alternate Corridor', density: 18.0, queueLength: 0, greenSeconds: 16.0, isGreen: false, isAlternate: true },
    ],
    machineThoughts: [
      {
        id: 1,
        timestamp: '03:52:10',
        phase: 'SIGNAL_REALLOCATION',
        title: '⏱️ Adaptive Timing: 14s Transferred from Free Lane to South Corridor',
        reasoning: 'LBS Marg approach operating at low load (18% capacity). Subtracted 14 seconds from LBS Marg (reduced to 16s) and transferred directly to congested Western Express Highway (increased to 44s) to clear queuing vehicles.',
        confidence: 0.94,
        telemetry: { donorLink: 'LBS Marg', timeSubtracted: '14s', beneficiaryLink: 'WEH South', greenDuration: '44s' }
      }
    ]
  });

  const handleTriggerSurge = () => {
    setState(prev => ({
      ...prev,
      metrics: { ...prev.metrics, queueLength: 16, vehicleCount: 38 },
      machineThoughts: [{
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        phase: 'SIGNAL_REALLOCATION',
        title: '⏱️ Bottleneck Congestion Surge Detected',
        reasoning: 'Traffic density spiked to 84% on Southbound approach. AI reallocating +14s green time from opposing free lanes.',
        confidence: 0.96,
        telemetry: { queue: '16 vehicles', action: 'BOOST_GREEN_TO_44s' }
      }, ...prev.machineThoughts.slice(0, 7)]
    }));
  };

  const handleTriggerEmergency = () => {
    setEmergencyBlink(true);
    setTimeout(() => setEmergencyBlink(false), 8000);
    setState(prev => ({
      ...prev,
      metrics: { ...prev.metrics, emergencyActive: true },
      machineThoughts: [{
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        phase: 'EMERGENCY_EVP',
        title: '🚨 Ambulance AMB-108 Detected: Green Wave Priority Activated',
        reasoning: 'Emergency vehicle detected at 64 km/h approaching intersection. All conflicting signals preempted to solid RED.',
        confidence: 0.99,
        telemetry: { vehicle: 'AMB-108 (ICU)', speed: '64 km/h', preemption: 'ALL_RED_OPPOSING' }
      }, ...prev.machineThoughts.slice(0, 7)]
    }));
  };

  const handleTriggerDiversion = () => {
    setState(prev => ({
      ...prev,
      metrics: { ...prev.metrics, diversionActive: true, queueLength: 3 },
      machineThoughts: [{
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        phase: 'DIVERSION_EXEC',
        title: '🔀 Dynamic Traffic Diversion: 65% Volume Rerouted via LBS Marg',
        reasoning: 'Primary approach at 72% capacity. Digital VMS sign activated to divert upstream volume onto secondary bypass.',
        confidence: 0.97,
        telemetry: { divertedVolume: '65%', alternateRoute: 'LBS Marg Detour', delaySaved: '-14.2 min' }
      }, ...prev.machineThoughts.slice(0, 7)]
    }));
  };

  // Video source based on user selection
  const activeVideoSrc = viewMode === 'TRACKED_VIDEO' ? activeCam.trackedUrl : activeCam.rawUrl;

  const idlingCount = liveDetections.filter(d => d.is_idling).length;
  const activeVehicleCount = liveDetections.length > 0 ? liveDetections.length : state.metrics.vehicleCount;

  return (
    <section className="glass-panel rounded-2xl overflow-hidden flex flex-col border border-slate-800" aria-label="Indian Traffic Signal Live CCTV & AI Optimization Console">
      
      {/* ─── Compact Header ─── */}
      <header className="p-3 border-b border-slate-800 bg-slate-900/95 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <h3 className="text-sm font-bold text-slate-100 font-display">{activeCam.name}</h3>
          <span className="px-1.5 py-0.5 text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full font-bold">
            {activeCam.id}
          </span>
          <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full flex items-center gap-1">
            <Leaf size={10} className="text-emerald-400" />
            CO₂ Saved: +{state.metrics.co2SavedKg} kg (-{state.metrics.co2SavedPercent}%)
          </span>
        </div>

        <div className="flex gap-2 items-center">
          {/* Camera Selection */}
          <select 
            value={scenarioKey} 
            onChange={(e) => handleSelectScenario(e.target.value)} 
            className="control-select text-[10px] font-mono py-1 bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-2"
          >
            <option value="bkc">CAM-01: BKC Arterial</option>
            <option value="vashi">CAM-02: Vashi Expressway</option>
            <option value="palm_beach">CAM-03: Palm Beach Signal</option>
            <option value="dadar">CAM-04: Dadar TT 4-Way</option>
            <option value="weh">CAM-05: WEH Airport Metro</option>
            <option value="lbs_metro">CAM-06: Kurla-LBS Metro</option>
          </select>

          {/* View Mode Switcher */}
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[9px] font-mono">
            <button
              onClick={() => setViewMode('OVERLAY')}
              className={`px-2 py-1 rounded transition ${viewMode === 'OVERLAY' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Real-time frame-synchronized bounding boxes with speed and CO2 tags"
            >
              Live HUD
            </button>
            <button
              onClick={() => setViewMode('TRACKED_VIDEO')}
              className={`px-2 py-1 rounded transition ${viewMode === 'TRACKED_VIDEO' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Full YOLOv8 neural network video with burned-in tracking meters"
            >
              YOLOv8 Stream
            </button>
            <button
              onClick={() => setViewMode('RAW')}
              className={`px-2 py-1 rounded transition ${viewMode === 'RAW' ? 'bg-slate-700 text-white font-bold' : 'text-slate-500 hover:text-white'}`}
              title="Raw unedited CCTV feed"
            >
              Raw
            </button>
          </div>
        </div>
      </header>

      {/* ─── CCTV Video Container ─── */}
      <div className="p-3 space-y-2">
        <div className="relative rounded-xl overflow-hidden bg-black border border-slate-800 shadow-2xl" style={{ height: '310px' }}>
          
          <video 
            ref={videoRef}
            key={activeVideoSrc}
            src={activeVideoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Top HUD Overlay */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start pointer-events-none z-20 text-[9px] font-mono">
            <div className="p-1.5 rounded-lg bg-slate-950/90 backdrop-blur-md border border-slate-800 text-slate-200 shadow-lg">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <strong className="text-red-400">REC ●</strong>
                <span className="text-cyan-400 font-bold">{activeCam.id}</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-300">{currentTime}</span>
              </div>
            </div>

            <div className="p-1.5 rounded-lg bg-slate-950/90 backdrop-blur-md border border-slate-800 flex items-center gap-2 shadow-lg">
              <span className="text-slate-400">SIGNAL:</span>
              <div className="flex gap-1 bg-slate-900 p-1 rounded border border-slate-700">
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                <div className={`w-2 h-2 rounded-full bg-emerald-500 ${emergencyBlink ? 'animate-pulse' : ''}`}></div>
              </div>
              <span className="text-emerald-400 font-bold">{emergencyBlink ? 'EVP PRIORITY' : 'GREEN WAVE'}</span>
            </div>
          </div>

          {/* Emergency Vehicle Priority Banner */}
          {emergencyBlink && (
            <div className="absolute top-11 inset-x-2 z-30 p-2 bg-red-600/95 backdrop-blur-md text-white rounded-lg border border-red-400 flex items-center gap-2 animate-pulse text-[10px] shadow-lg">
              <ShieldAlert size={15} className="text-white shrink-0" />
              <span className="font-bold uppercase">🚨 ISO-22951: Ambulance AMB-108 approaching at 64 km/h — Opposing Red locked</span>
            </div>
          )}

          {/* Diversion VMS Signage */}
          {state.metrics.diversionActive && (
            <div className="absolute bottom-10 inset-x-2 z-30 p-2 bg-emerald-950/95 backdrop-blur-md text-emerald-200 rounded-lg border border-emerald-500/60 flex items-center gap-2 text-[10px] shadow-lg">
              <Navigation size={14} className="text-emerald-400 shrink-0" />
              <span className="font-bold uppercase">🔀 OVERHEAD VMS: 65% Traffic Diverted → {activeCam.detourCorridor} (-14.2 min)</span>
            </div>
          )}

          {/* Dynamic Frame-Synchronized Bounding Boxes with Live CO2 Carbon Footprint */}
          {viewMode === 'OVERLAY' && (
            <div className="absolute inset-0 pointer-events-none z-10">
              {liveDetections.map((det) => {
                const isIdling = det.is_idling;
                const borderColor = isIdling ? 'border-amber-400' : 'border-emerald-400';
                const shadowClass = isIdling ? 'shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'shadow-[0_0_8px_rgba(16,185,129,0.4)]';

                return (
                  <div
                    key={det.id}
                    className={`absolute border-2 ${borderColor} ${shadowClass} rounded transition-all duration-100`}
                    style={{
                      left: `${det.left}%`,
                      top: `${det.top}%`,
                      width: `${det.width}%`,
                      height: `${det.height}%`,
                    }}
                  >
                    {/* Vehicle Type & Speed Badge */}
                    <div className="absolute -top-7 left-0 flex flex-col gap-0.5 pointer-events-none whitespace-nowrap">
                      <div className="px-1.5 py-0.5 bg-slate-950/95 border border-slate-700 rounded text-[8px] font-mono text-slate-100 flex items-center gap-1">
                        <span className="font-bold text-cyan-400">{det.type}</span>
                        <span className="text-slate-400">·</span>
                        <span className={isIdling ? 'text-amber-400 font-bold' : 'text-white'}>{det.speed} km/h</span>
                      </div>
                      
                      {/* Live Carbon Footprint Tag */}
                      <div className={`px-1.5 py-0.2 rounded text-[7px] font-mono font-bold flex items-center gap-1 ${
                        isIdling 
                          ? 'bg-amber-950/95 text-amber-300 border border-amber-500/60' 
                          : 'bg-emerald-950/95 text-emerald-300 border border-emerald-500/50'
                      }`}>
                        <Leaf size={8} className="text-emerald-400" />
                        <span>CO₂: {det.emission_rate} mg/s</span>
                        <span className="text-slate-400 font-normal">({det.co2_g}g)</span>
                        {isIdling && <span className="text-red-400 text-[6px]">IDLING</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Location & Corridor Tag */}
          <div className="absolute bottom-2 left-2 right-2 flex justify-between pointer-events-none z-20 text-[8px] font-mono">
            <span className="px-2 py-0.5 bg-slate-950/90 backdrop-blur-md rounded border border-slate-800 text-emerald-400 flex items-center gap-1 font-bold">
              <Navigation size={9} />
              {activeCam.detourCorridor}
            </span>
            <span className="px-2 py-0.5 bg-slate-950/90 backdrop-blur-md rounded border border-slate-800 text-amber-300 font-bold">
              Limit: {activeCam.speedLimit} km/h
            </span>
          </div>
        </div>

        {/* ─── Real-Time Telemetry & Carbon Impact Strip ─── */}
        <div className="grid grid-cols-4 gap-2 text-[10px] font-mono">
          <div className="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
            <div className="text-slate-500 text-[9px]">Active Tracked</div>
            <div className="text-cyan-400 font-bold text-sm mt-0.5 flex items-center gap-1">
              <Activity size={12} />
              <span>{activeVehicleCount} Vehicles</span>
            </div>
          </div>

          <div className="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
            <div className="text-slate-500 text-[9px]">Queue Idling</div>
            <div className={`font-bold text-sm mt-0.5 flex items-center gap-1 ${idlingCount > 4 ? 'text-amber-400' : 'text-slate-200'}`}>
              <Clock size={12} />
              <span>{idlingCount} Vehicles</span>
            </div>
          </div>

          <div className="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
            <div className="text-slate-500 text-[9px]">Instantaneous CO₂</div>
            <div className="text-red-400 font-bold text-sm mt-0.5 flex items-center gap-1">
              <Leaf size={12} />
              <span>{liveCarbonRate} mg/s</span>
            </div>
          </div>

          <div className="p-2 bg-emerald-950/30 rounded-xl border border-emerald-500/40">
            <div className="text-emerald-400/80 text-[9px]">CO₂ Prevented</div>
            <div className="text-emerald-300 font-bold text-sm mt-0.5 flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>+{liveCumulativeCarbon} kg</span>
            </div>
          </div>
        </div>

        {/* ─── Interactive Operator Control Triggers ─── */}
        <div className="flex gap-2 pt-1 font-mono text-[10px]">
          <button 
            onClick={handleTriggerSurge}
            className="flex-1 p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Zap size={13} />
            <span>Simulate Congestion Surge</span>
          </button>
          
          <button 
            onClick={handleTriggerEmergency}
            className="flex-1 p-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-300 font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <ShieldAlert size={13} />
            <span>Dispatch Ambulance (EVP)</span>
          </button>

          <button 
            onClick={handleTriggerDiversion}
            className="flex-1 p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Navigation size={13} />
            <span>Broadcast Diversion VMS</span>
          </button>
        </div>
      </div>

      {/* ─── Explainable Machine Thought Console ─── */}
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
