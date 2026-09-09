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
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

// Hazard / Bottleneck Marker
const createHazardIcon = (type, label) => {
  const isFlood = type === 'FLOOD';
  const bg = isFlood ? '#0284c7' : '#ef4444';
  const iconSymbol = isFlood ? '🌊' : '⛔';
  return L.divIcon({
    className: 'custom-hazard-pin',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: ${bg}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; background: #090d16; border: 2px solid ${bg}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; font-family: monospace; display: flex; align-items: center; gap: 4px; box-shadow: 0 0 16px ${bg}; white-space: nowrap;">
          <span>${iconSymbol}</span>
          <span>${label || 'BOTTLENECK'}</span>
        </div>
      </div>
    `,
    iconSize: [120, 30],
    iconAnchor: [60, 15]
  });
};

// VMS Digital Signage Marker
const createVmsIcon = (name) => {
  return L.divIcon({
    className: 'custom-vms-pin',
    html: `
      <div style="background: #020617; border: 1.5px solid #f59e0b; color: #fbbf24; padding: 3px 8px; border-radius: 8px; font-size: 10px; font-family: monospace; font-weight: bold; display: flex; align-items: center; gap: 4px; box-shadow: 0 0 12px #f59e0b99; white-space: nowrap;">
        <span style="color: #fbbf24; animation: pulse 1s infinite;">📡</span>
        <span>${name}</span>
      </div>
    `,
    iconSize: [120, 24],
    iconAnchor: [60, 12]
  });
};

// Waypoint Pin (Entry / Exit)
const createWaypointIcon = (label, color = '#10b981') => {
  return L.divIcon({
    className: 'custom-waypoint-pin',
    html: `
      <div style="background: #064e3b; border: 1.5px solid ${color}; color: #ecfdf5; padding: 3px 8px; border-radius: 8px; font-size: 10px; font-family: monospace; font-weight: bold; box-shadow: 0 0 12px ${color}99; white-space: nowrap;">
        ${label}
      </div>
    `,
    iconSize: [120, 22],
    iconAnchor: [60, 11]
  });
};

// Animated Vehicle Icon on Leaflet Map
const createMovingVehicleIcon = (v) => {
  const { type, color, bearing, isWave } = v;
  const isBus = type === 'bus';
  const width = isBus ? 13 : 11;
  const height = isBus ? 24 : 17;
  const glow = isWave ? '0 0 12px #38bdf8' : `0 0 8px ${color}`;
  const border = isWave ? '2px solid #38bdf8' : '1px solid #ffffff';

  return L.divIcon({
    className: 'leaflet-animated-vehicle',
    html: `
      <div style="transform: rotate(${bearing}deg); width: ${width + 6}px; height: ${height + 6}px; display: flex; align-items: center; justify-content: center; transition: transform 0.05s linear;">
        <div style="background: ${color}; width: ${width}px; height: ${height}px; border-radius: 3px; position: relative; border: ${border}; box-shadow: ${glow};">
          <!-- Front Headlights (Bright Yellow) -->
          <div style="position: absolute; top: -1px; left: 1.5px; width: 2.5px; height: 2px; background: #fef08a; border-radius: 50%; box-shadow: 0 0 4px #fef08a;"></div>
          <div style="position: absolute; top: -1px; right: 1.5px; width: 2.5px; height: 2px; background: #fef08a; border-radius: 50%; box-shadow: 0 0 4px #fef08a;"></div>
          <!-- Windshield -->
          <div style="position: absolute; top: 3px; left: 1.5px; right: 1.5px; height: 3.5px; background: #0f172a; border-radius: 1px;"></div>
          <!-- Rear Taillights (Red) -->
          <div style="position: absolute; bottom: -1px; left: 1.5px; width: 2px; height: 1.5px; background: #ef4444;"></div>
          <div style="position: absolute; bottom: -1px; right: 1.5px; width: 2px; height: 1.5px; background: #ef4444;"></div>
        </div>
      </div>
    `,
    iconSize: [width + 6, height + 6],
    iconAnchor: [(width + 6) / 2, (height + 6) / 2]
  });
};

// Polyline Geometry Interpolation
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
      // Bearing in degrees from North (0° = North, 90° = East, 180° = South, 270° = West)
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

  // Default center if no diversion selected
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

  // Simulated Moving Vehicles along the Bypass Polyline
  const [vehicles, setVehicles] = useState(() => {
    const types = [
      { type: 'car', color: '#10b981' },
      { type: 'cab', color: '#facc15' },
      { type: 'sedan', color: '#f8fafc' },
      { type: 'bus', color: '#ef4444' },
      { type: 'suv', color: '#38bdf8' },
      { type: 'car', color: '#a855f7' },
      { type: 'cab', color: '#facc15' },
      { type: 'car', color: '#34d399' }
    ];
    return types.map((t, idx) => ({
      id: `veh-${idx}`,
      t: idx / types.length,
      speed: 0.0035 + (idx % 3) * 0.0008,
      ...t
    }));
  });

  // Flash banner and spawn rapid convoy when waveTrigger changes
  const prevWaveTrigger = useRef(waveTrigger);
  useEffect(() => {
    if (waveTrigger > prevWaveTrigger.current) {
      setLiveCounter(c => c + 35);
      setWaveBanner(`🌊 DISPATCHED SURGE WAVE: +35 VEHICLES REROUTED ONTO ${selectedDiversion?.recommendedRoute || 'BYPASS CORRIDOR'}`);
      
      // Inject 5 fast wave convoy vehicles at the start
      const newWaveVehicles = [0, 1, 2, 3, 4].map(k => ({
        id: `wave-${Date.now()}-${k}`,
        t: k * 0.04,
        speed: 0.0095 + k * 0.0005,
        type: k === 0 ? 'bus' : 'cab',
        color: '#38bdf8',
        isWave: true
      }));

      setVehicles(prev => [...newWaveVehicles, ...prev.filter(v => !v.isWave)]);

      const t = setTimeout(() => setWaveBanner(null), 4500);
      prevWaveTrigger.current = waveTrigger;
      return () => clearTimeout(t);
    }
    prevWaveTrigger.current = waveTrigger;
  }, [waveTrigger, selectedDiversion]);

  // Animation Loop for real-time map traffic flow
  useEffect(() => {
    let frameId;
    let lastTime = performance.now();

    const animate = (currentTime) => {
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const speedMultiplier = isDiversionActive ? (flowRate / 32) : 0.2;

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
      
      {/* Real-time Dynamic Status HUD Overlay */}
      {showDiversions && selectedDiversion && (
        <div className="absolute top-3 left-3 right-3 z-[500] pointer-events-none flex flex-wrap items-center justify-between gap-2">
          {/* Active Status Badge */}
          <div className="glass-panel px-3 py-1.5 rounded-xl border border-slate-800 flex items-center space-x-2 text-xs font-mono pointer-events-auto shadow-xl bg-slate-900/90 backdrop-blur-md">
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

        {/* Clean Dark Tiles via OpenStreetMap with high-contrast filter (Zero API key watermark) */}
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
                icon={createHazardIcon(selectedDiversion.hazard.type, selectedDiversion.hazard.label)}
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

            {/* Start Waypoint (Diversion Entry Slip-Road) */}
            <Marker 
              position={activeBypassRoute[0]} 
              icon={createWaypointIcon('🟢 DIVERSION ENTRY')} 
            />

            {/* End Waypoint (Mainline Rejoin Point) */}
            <Marker 
              position={activeBypassRoute[activeBypassRoute.length - 1]} 
              icon={createWaypointIcon('🏁 REJOIN FREE FLOW', '#065f46')} 
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

            {/* 3. REAL-TIME ANIMATED VEHICLES MOVING PRECISELY ALONG THE ROAD CURVES */}
            {vehicles.map((v) => {
              const { pos, bearing } = getPointAndBearingAlongPolyline(activeBypassRoute, v.t);
              return (
                <Marker
                  key={v.id}
                  position={pos}
                  icon={createMovingVehicleIcon({ ...v, bearing })}
                  interactive={false}
                />
              );
            })}
          </>
        )}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[500] glass-panel px-3 py-2 rounded-xl text-[11px] font-mono flex items-center space-x-4 bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-1 bg-red-500 rounded-full glow-red"></span>
          <span className="text-slate-300">Congested Mainline</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-1 bg-emerald-400 rounded-full glow-emerald"></span>
          <span className="text-slate-300">Active Detour Flow</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-amber-400">📡</span>
          <span className="text-slate-300">VMS Sign</span>
        </div>
      </div>
    </div>
  );
};
