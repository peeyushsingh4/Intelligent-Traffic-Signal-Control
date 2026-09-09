import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp, DEFAULT_HEATMAP_NODES } from '../../context/AppContext';

// Helper component to smoothly fly to center and zoom when selected diversion changes
const MapViewController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2) {
      map.flyTo(center, zoom || 13, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
};

// Custom Camera Marker Pin
const createCameraIcon = (status) => {
  const color = status === 'ONLINE' || status === 'active' ? '#10b981' : '#f59e0b';
  return L.divIcon({
    className: 'custom-map-pin',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 12px ${color};"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

// Hazard / Bottleneck Marker with Pulsing Ripple
const createHazardIcon = (type, label, queueKm) => {
  const isFlood = type === 'FLOOD';
  const bg = isFlood ? '#0284c7' : '#ef4444';
  const iconSymbol = isFlood ? '🌊' : '⛔';
  return L.divIcon({
    className: 'custom-hazard-pin',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <!-- Pulsing Ripple Beacon -->
        <div style="position: absolute; top: 14px; left: 50%; transform: translate(-50%, -50%); width: 42px; height: 42px; border-radius: 50%; background: ${bg}; opacity: 0.35; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        
        <!-- High-Tech Badge -->
        <div style="position: relative; background: rgba(9, 13, 22, 0.95); border: 2px solid ${bg}; color: white; padding: 4px 10px; border-radius: 14px; font-size: 11px; font-weight: 800; font-family: monospace; display: flex; align-items: center; gap: 6px; box-shadow: 0 0 20px ${bg}; white-space: nowrap; backdrop-filter: blur(6px);">
          <span style="font-size: 13px;">${iconSymbol}</span>
          <span style="letter-spacing: 0.4px;">${label || 'BOTTLENECK'}</span>
        </div>
        ${queueKm ? `<div style="font-size: 9px; font-family: monospace; color: #fecaca; background: rgba(0,0,0,0.85); padding: 1px 6px; border-radius: 6px; margin-top: 3px; border: 1px solid ${bg}66;">Queue: ${queueKm} km · Speed &lt;8 km/h</div>` : ''}
      </div>
    `,
    iconSize: [160, 48],
    iconAnchor: [80, 20]
  });
};

// VMS Digital Signage Gantry Marker
const createVmsIcon = (name) => {
  return L.divIcon({
    className: 'custom-vms-pin',
    html: `
      <div style="background: rgba(2, 6, 23, 0.94); border: 1.5px solid #f59e0b; color: #fbbf24; padding: 3px 9px; border-radius: 10px; font-size: 10px; font-family: monospace; font-weight: 700; display: flex; align-items: center; gap: 5px; box-shadow: 0 0 14px rgba(245, 158, 11, 0.45); white-space: nowrap; backdrop-filter: blur(6px);">
        <span style="color: #fbbf24; display: inline-block; animation: pulse 1s infinite;">📡</span>
        <span style="color: #fef3c7;">${name}</span>
      </div>
    `,
    iconSize: [130, 26],
    iconAnchor: [65, 13]
  });
};

// Waypoint Pin (Entry / Exit) with Anchor Stem (Prevents Overlap)
const createWaypointIcon = (label, color = '#10b981', isExit = false) => {
  return L.divIcon({
    className: 'custom-waypoint-pin',
    html: `
      <div style="display: flex; flex-direction: ${isExit ? 'column-reverse' : 'column'}; align-items: center; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.8));">
        <div style="background: rgba(6, 78, 59, 0.95); border: 1.5px solid ${color}; color: #ecfdf5; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-family: monospace; font-weight: 800; letter-spacing: 0.5px; box-shadow: 0 0 16px ${color}88; white-space: nowrap; backdrop-filter: blur(6px);">
          ${label}
        </div>
        <div style="width: 2px; height: 10px; background: ${color};"></div>
        <div style="width: 6px; height: 6px; border-radius: 50%; background: ${color}; box-shadow: 0 0 8px ${color};"></div>
      </div>
    `,
    iconSize: [140, 44],
    iconAnchor: [70, isExit ? 6 : 38]
  });
};

// Niche Animated Vehicle Icon with Glowing Headlight Cones & Tail Lights
const createMovingVehicleIcon = (v) => {
  const { type, color, bearing, isWave, plate } = v;
  const isBus = type === 'bus';
  const width = isBus ? 14 : 11;
  const height = isBus ? 25 : 18;
  const glow = isWave ? '0 0 16px #38bdf8' : `0 0 10px ${color}`;
  const border = isWave ? '2px solid #38bdf8' : '1.5px solid #ffffff';

  return L.divIcon({
    className: 'leaflet-animated-vehicle',
    html: `
      <div style="transform: rotate(${bearing}deg); width: ${width + 16}px; height: ${height + 24}px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
        <!-- Forward Headlight Light Cones (Projects on pavement) -->
        <div style="position: absolute; top: -14px; width: 24px; height: 18px; background: radial-gradient(ellipse at 50% 100%, rgba(254, 240, 138, 0.55) 0%, rgba(254, 240, 138, 0) 80%); pointer-events: none;"></div>

        <!-- Vehicle Body -->
        <div style="background: ${color}; width: ${width}px; height: ${height}px; border-radius: 4px; position: relative; border: ${border}; box-shadow: ${glow}; transition: transform 0.05s linear;">
          <!-- Dual LED Headlights -->
          <div style="position: absolute; top: -1px; left: 1.5px; width: 2.5px; height: 2.5px; background: #fef08a; border-radius: 50%; box-shadow: 0 0 6px #fef08a;"></div>
          <div style="position: absolute; top: -1px; right: 1.5px; width: 2.5px; height: 2.5px; background: #fef08a; border-radius: 50%; box-shadow: 0 0 6px #fef08a;"></div>
          
          <!-- Front Windshield -->
          <div style="position: absolute; top: 3.5px; left: 1.5px; right: 1.5px; height: 3.5px; background: #0f172a; border-radius: 1px;"></div>
          
          <!-- Taxi or Bus Roof Distinction -->
          ${type === 'cab' ? '<div style="position: absolute; top: 8px; left: 3px; right: 3px; height: 3px; background: #000000; border-radius: 1px;"></div>' : ''}
          ${isBus ? '<div style="position: absolute; top: 9px; left: 2px; right: 2px; height: 6px; background: rgba(15,23,42,0.6); border-radius: 1px;"></div>' : ''}

          <!-- Dual Red Taillights -->
          <div style="position: absolute; bottom: -1px; left: 1.5px; width: 2.5px; height: 2px; background: #ef4444; box-shadow: 0 0 6px #ef4444;"></div>
          <div style="position: absolute; bottom: -1px; right: 1.5px; width: 2.5px; height: 2px; background: #ef4444; box-shadow: 0 0 6px #ef4444;"></div>
        </div>
      </div>
    `,
    iconSize: [width + 16, height + 24],
    iconAnchor: [(width + 16) / 2, (height + 24) / 2]
  });
};

// Polyline Geometry Interpolation along Real Road Coordinates
function getPointAndBearingAlongPolyline(points, t) {
  if (!points || points.length < 2) return { pos: [0, 0], bearing: 0 };
  
  let totalDist = 0;
  const dists = [];
  for (let i = 0; i < points.length - 1; i++) {
    const d = Math.hypot(points[i+1][0] - points[i][0], points[i+1][1] - points[i][1]);
    dists.push(d);
    totalDist += d;
  }
  if (totalDist === 0) return { pos: points[0], bearing: 0 };

  const targetDist = ((t % 1) + 1) % 1 * totalDist;
  let accum = 0;
  for (let i = 0; i < dists.length; i++) {
    if (accum + dists[i] >= targetDist || i === dists.length - 1) {
      const segT = dists[i] === 0 ? 0 : (targetDist - accum) / dists[i];
      const lat = points[i][0] + (points[i+1][0] - points[i][0]) * segT;
      const lng = points[i][1] + (points[i+1][1] - points[i][1]) * segT;
      const dLat = points[i+1][0] - points[i][0];
      const dLng = points[i+1][1] - points[i][1];
      const bearing = (Math.atan2(dLng, dLat) * (180 / Math.PI) + 360) % 360;
      return { pos: [lat, lng], bearing };
    }
    accum += dists[i];
  }
  return { pos: points[points.length - 1], bearing: 0 };
}

export const TrafficMap = ({ 
  selectedIntersection = null, 
  showDiversions = false,
  selectedDiversion = null,
  isDiversionActive = false,
  waveTrigger = 0,
  flowRate = 50
}) => {
  const app = useApp();
  const cameras = app.cameras || [];
  const heatmapNodes = (app.heatmapNodes && app.heatmapNodes.length > 0) ? app.heatmapNodes : (DEFAULT_HEATMAP_NODES || []);
  const setActiveCamera = app.setActiveCamera || (() => {});

  // Center coordinate and zoom from selected template
  const defaultCenter = selectedDiversion?.mapCenter || [19.0660, 72.8680];
  const defaultZoom = selectedDiversion?.mapZoom || 13;

  // Real-time Diverted Counter ticking up during active diversion
  const [liveCounter, setLiveCounter] = useState(selectedDiversion?.divertedCount || 742);
  const [waveBanner, setWaveBanner] = useState(null);

  useEffect(() => {
    setLiveCounter(selectedDiversion?.divertedCount || 742);
  }, [selectedDiversion?.id]);

  useEffect(() => {
    if (!isDiversionActive) return;
    const interval = setInterval(() => {
      setLiveCounter(c => c + Math.floor(Math.random() * 3 + 1));
    }, 2000);
    return () => clearInterval(interval);
  }, [isDiversionActive]);

  // Initial vehicle fleet with Mumbai mix (Taxis, BEST Buses, EV Cars, Sedans)
  const [vehicles, setVehicles] = useState(() => {
    const types = [
      { type: 'car', color: '#10b981', plate: 'MH 02 EE 7731' },
      { type: 'cab', color: '#facc15', plate: 'MH 01 AB 4421' },
      { type: 'sedan', color: '#f8fafc', plate: 'MH 04 CD 1980' },
      { type: 'bus', color: '#ef4444', plate: 'BEST 302 EXPR' },
      { type: 'suv', color: '#38bdf8', plate: 'MH 02 BG 3319' },
      { type: 'car', color: '#a855f7', plate: 'MH 03 DZ 9140' },
      { type: 'cab', color: '#facc15', plate: 'MH 02 CZ 4921' },
      { type: 'car', color: '#34d399', plate: 'MH 43 AT 8812' }
    ];
    return types.map((t, idx) => ({
      id: `veh-${idx}`,
      t: idx / types.length,
      speed: 0.0032 + (idx % 3) * 0.0007,
      ...t
    }));
  });

  // Flash banner and spawn rapid convoy when waveTrigger changes
  const prevWaveTrigger = useRef(waveTrigger);
  useEffect(() => {
    if (waveTrigger > prevWaveTrigger.current) {
      setLiveCounter(c => c + 35);
      setWaveBanner(`🌊 DISPATCHED SURGE WAVE: +35 VEHICLES REROUTED ONTO ${selectedDiversion?.recommendedRoute || 'BYPASS CORRIDOR'}`);
      
      // Inject 5 fast wave convoy vehicles at the slip-ramp entrance
      const newWaveVehicles = [0, 1, 2, 3, 4].map(k => ({
        id: `wave-${Date.now()}-${k}`,
        t: k * 0.045,
        speed: 0.011 + k * 0.0006,
        type: k === 0 ? 'bus' : 'cab',
        color: '#38bdf8',
        plate: `WAVE-FLUX-${k + 1}`,
        isWave: true
      }));

      setVehicles(prev => [...newWaveVehicles, ...prev.filter(v => !v.isWave)]);

      const t = setTimeout(() => setWaveBanner(null), 4500);
      prevWaveTrigger.current = waveTrigger;
      return () => clearTimeout(t);
    }
    prevWaveTrigger.current = waveTrigger;
  }, [waveTrigger, selectedDiversion]);

  // Animation Loop for real-time traffic flow along real road coordinates
  useEffect(() => {
    let frameId;
    let lastTime = performance.now();

    const animate = (currentTime) => {
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Speed adapts dynamically to diversion active toggle and user's flow rate slider
      const speedMultiplier = isDiversionActive ? (flowRate / 32) : 0.22;

      setVehicles(prev => prev.map(v => ({
        ...v,
        t: (v.t + v.speed * speedMultiplier * delta * 1.5) % 1.0
      })));

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isDiversionActive, flowRate]);

  const activeBypassRoute = selectedDiversion?.bypassRoute || [
    [19.0815, 72.8535],
    [19.0772, 72.8615],
    [19.0722, 72.8735],
    [19.0628, 72.8838],
    [19.0480, 72.8892]
  ];

  const activeBlockedRoute = selectedDiversion?.hazard?.blockedPolyline || [
    [19.0835, 72.8532],
    [19.0730, 72.8518],
    [19.0620, 72.8502],
    [19.0560, 72.8495]
  ];

  return (
    <div className="relative w-full h-full min-h-[350px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      
      {/* Niche Dynamic Operations HUD Overlay */}
      {showDiversions && selectedDiversion && (
        <div className="absolute top-3 left-3 right-3 z-[500] pointer-events-none flex flex-wrap items-center justify-between gap-2">
          {/* Active Status Badge */}
          <div className="glass-panel px-3 py-1.5 rounded-xl border border-slate-800 flex items-center space-x-2.5 text-xs font-mono pointer-events-auto shadow-xl bg-slate-900/90 backdrop-blur-md">
            <span className={`w-2.5 h-2.5 rounded-full ${isDiversionActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
            <span className="font-bold text-white uppercase tracking-wider">
              {isDiversionActive ? '🟢 DIVERSION ACTIVE (1-CLICK FLOW)' : '🟡 STANDBY / READY'}
            </span>
          </div>

          {/* Key Metrics Pill */}
          <div className="glass-panel px-3 py-1.5 rounded-xl border border-slate-800 flex items-center space-x-4 text-xs font-mono pointer-events-auto shadow-xl bg-slate-900/90 backdrop-blur-md">
            <div>
              <span className="text-slate-400">Rerouted: </span>
              <strong className="text-emerald-400 font-bold">{liveCounter.toLocaleString()} veh</strong>
            </div>
            <div className="h-3 w-px bg-slate-800 hidden sm:block"></div>
            <div className="hidden sm:block">
              <span className="text-slate-400">Time Saved: </span>
              <strong className="text-amber-400 font-bold">{selectedDiversion.timeSavingsMin} mins</strong>
            </div>
            <div className="h-3 w-px bg-slate-800 hidden md:block"></div>
            <div className="hidden md:block">
              <span className="text-slate-400">Bottleneck: </span>
              <strong className="text-cyan-400 font-bold">{isDiversionActive ? '-68% Relieved' : 'Congested'}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Surge Wave Dispatched Notification Banner */}
      {waveBanner && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-[501] glass-panel border border-cyan-500/50 bg-cyan-950/95 text-cyan-200 text-xs font-mono font-bold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center space-x-2 animate-bounce">
          <span className="text-cyan-400 text-base">⚡</span>
          <span>{waveBanner}</span>
        </div>
      )}

      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        style={{ width: '100%', height: '100%', minHeight: '350px', backgroundColor: '#070a11' }}
        zoomControl={false}
      >
        {/* Dynamic Viewport Controller */}
        <MapViewController center={selectedDiversion?.mapCenter || defaultCenter} zoom={selectedDiversion?.mapZoom || defaultZoom} />

        {/* Clean High-Contrast Dark Map Tiles (OpenStreetMap + dark matrix filter, zero watermarks) */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | iTraCS'
          maxZoom={19}
          className="dark-tile-layer"
        />

        {/* Congestion Heatmap Circles */}
        {heatmapNodes.map((node) => (
          <CircleMarker
            key={node.id}
            center={[node.lat, node.lng]}
            radius={Math.max(8, node.score / 2.5)}
            pathOptions={{
              color: node.color || '#ef4444',
              fillColor: node.color || '#ef4444',
              fillOpacity: 0.3,
              weight: 2
            }}
          >
            <Popup className="dark-leaflet-popup">
              <div className="p-2 font-sans text-slate-100">
                <div className="flex items-center justify-between space-x-2 border-b border-slate-700 pb-1 mb-1">
                  <strong className="text-sm font-display text-white">{node.name}</strong>
                  <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${node.color}33`, color: node.color }}>
                    Score: {node.score}/100
                  </span>
                </div>
                <div className="text-xs space-y-1 text-slate-300 font-mono">
                  <div>Status: <span className="font-bold">{node.status}</span></div>
                  <div>Halting Queue: <span className="text-amber-400 font-bold">{node.queue} vehicles</span></div>
                  <div>Avg Speed: <span className="text-emerald-400 font-bold">{node.avgSpeed} km/h</span></div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Camera Markers */}
        {cameras.map((cam) => (
          <Marker 
            key={cam.id} 
            position={[cam.lat, cam.lng]} 
            icon={createCameraIcon(cam.status)}
            eventHandlers={{
              click: () => setActiveCamera(cam)
            }}
          >
            <Popup>
              <div className="p-1 font-sans text-xs">
                <strong className="text-emerald-400">{cam.id}</strong> — {cam.name}
                <div className="text-slate-400">{cam.zone || cam.name} ({cam.speedLimitKmh || 60} km/h)</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ─── DIVERSION VISUALIZATION LAYERS (Tracing Real Road Geometry) ─── */}
        {showDiversions && selectedDiversion && (
          <>
            {/* 1. BLOCKED / CONGESTED CORRIDOR (Glowing Red Line on actual highway) */}
            <Polyline 
              positions={activeBlockedRoute} 
              pathOptions={{ 
                color: '#ef4444', 
                weight: 6, 
                opacity: 0.9, 
                dashArray: '8, 8' 
              }} 
            />
            {/* Red Underglow */}
            <Polyline 
              positions={activeBlockedRoute} 
              pathOptions={{ 
                color: '#ef4444', 
                weight: 14, 
                opacity: 0.28 
              }} 
            />

            {/* Bottleneck Hazard Epicenter Marker */}
            {selectedDiversion.hazard?.location && (
              <Marker 
                position={selectedDiversion.hazard.location} 
                icon={createHazardIcon(selectedDiversion.hazard.type, selectedDiversion.hazard.label, selectedDiversion.hazard.queueKm)}
              >
                <Popup>
                  <div className="p-2 font-mono text-xs text-slate-100">
                    <div className="font-bold text-red-400 border-b border-slate-700 pb-1 mb-1">
                      {selectedDiversion.hazard.label}
                    </div>
                    <div>Bottleneck Queue: <strong>{selectedDiversion.hazard.queueKm} km</strong></div>
                    <div>Commuter Delay: <strong className="text-amber-400">+{selectedDiversion.hazard.delayMin} mins</strong></div>
                    <div className="mt-1 text-emerald-400">
                      {isDiversionActive ? '⚡ Traffic Being Diverted' : 'Waiting for Diversion Protocol'}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* 2. DIVERSION BYPASS CORRIDOR (Glowing Emerald Green Line on real street alignment) */}
            {/* Outer Glow */}
            <Polyline 
              positions={activeBypassRoute} 
              pathOptions={{ 
                color: '#10b981', 
                weight: 14, 
                opacity: isDiversionActive ? 0.38 : 0.16 
              }} 
            />
            {/* Main Road Bed */}
            <Polyline 
              positions={activeBypassRoute} 
              pathOptions={{ 
                color: '#059669', 
                weight: 6, 
                opacity: 0.95 
              }} 
            />
            {/* Center Flowing Dash Pattern */}
            <Polyline 
              positions={activeBypassRoute} 
              pathOptions={{ 
                color: '#a7f3d0', 
                weight: 2.5, 
                dashArray: isDiversionActive ? '10, 8' : '4, 8',
                opacity: 0.95
              }} 
            />

            {/* Start Waypoint (Diversion Entry Slip-Road) - positioned cleanly with stem */}
            <Marker 
              position={activeBypassRoute[0]} 
              icon={createWaypointIcon('🟢 DIVERSION ENTRY', '#10b981', false)} 
            />

            {/* End Waypoint (Mainline Rejoin Point) */}
            <Marker 
              position={activeBypassRoute[activeBypassRoute.length - 1]} 
              icon={createWaypointIcon('🏁 REJOIN FREE FLOW', '#059669', true)} 
            />

            {/* VMS Gantries along the route */}
            {selectedDiversion.vmsGantries && selectedDiversion.vmsGantries.map((vms) => (
              <Marker 
                key={vms.id} 
                position={vms.pos} 
                icon={createVmsIcon(vms.name)}
              >
                <Popup>
                  <div className="p-2 font-mono text-xs text-amber-300">
                    <div className="font-bold text-white border-b border-slate-700 pb-1 mb-1">
                      {vms.name}
                    </div>
                    <div className="text-[11px] text-slate-300">BROADCASTING:</div>
                    <div className="bg-slate-900 p-1.5 rounded border border-amber-500/40 mt-1 font-bold">
                      "{vms.message}"
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* 3. REAL-TIME ANIMATED VEHICLES WITH DYNAMIC HEADLIGHT CONES ALONG THE ROAD */}
            {vehicles.map((v) => {
              const { pos, bearing } = getPointAndBearingAlongPolyline(activeBypassRoute, v.t);
              return (
                <Marker
                  key={v.id}
                  position={pos}
                  icon={createMovingVehicleIcon({ ...v, bearing })}
                >
                  <Popup>
                    <div className="p-1.5 font-mono text-xs text-slate-100">
                      <div className="font-bold text-emerald-400 border-b border-slate-700 pb-1 mb-1">
                        🚗 {v.plate || 'MH 02 CZ 4921'}
                      </div>
                      <div className="text-slate-300 text-[11px] space-y-0.5">
                        <div>Vehicle Class: <strong className="text-white uppercase">{v.type}</strong></div>
                        <div>Detour Speed: <strong className="text-emerald-400">{isDiversionActive ? '54 km/h' : '18 km/h'}</strong></div>
                        <div>Delay Saved: <strong className="text-amber-400">+{selectedDiversion.timeSavingsMin}m</strong></div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </>
        )}
      </MapContainer>

      {/* Niche Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[500] glass-panel px-3.5 py-2 rounded-xl text-[11px] font-mono flex items-center space-x-4 bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-1 bg-red-500 rounded-full glow-red"></span>
          <span className="text-slate-300">Bottleneck Corridor</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-1 bg-emerald-400 rounded-full glow-emerald"></span>
          <span className="text-slate-300">Bypass Detour Stream</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-amber-400">📡</span>
          <span className="text-slate-300">VMS Gantry</span>
        </div>
      </div>
    </div>
  );
};
