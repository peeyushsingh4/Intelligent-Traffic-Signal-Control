import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';

// Custom Map Pins
const createCameraIcon = (status) => {
  const color = status === 'active' ? '#10b981' : '#f59e0b';
  return L.divIcon({
    className: 'custom-map-pin',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

export const TrafficMap = ({ selectedIntersection = null, showDiversions = false }) => {
  const { cameras, heatmapNodes, setActiveCamera, openEvidenceModal, violations } = useApp();

  // Center on Mumbai coordinates
  const mumbaiCenter = [19.0550, 72.8800];

  // Sample Diversion Polyline (BKC to LBS Marg detour)
  const diversionPolyline = [
    [19.0650, 72.8550], // BKC
    [19.0620, 72.8680], // LBS Marg
    [19.0500, 72.8800]  // Eastern Express
  ];

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      <MapContainer 
        center={mumbaiCenter} 
        zoom={12} 
        style={{ width: '100%', height: '100%', backgroundColor: '#070a11' }}
        zoomControl={false}
      >
        {/* Dark Mode Map Tiles (CartoDB Dark Matter) */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a> greenlight.exe'
          maxZoom={19}
        />

        {/* Congestion Heatmap Circles */}
        {heatmapNodes.map((node) => (
          <CircleMarker
            key={node.id}
            center={[node.lat, node.lng]}
            radius={node.score / 2.5}
            pathOptions={{
              color: node.color,
              fillColor: node.color,
              fillOpacity: 0.35,
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
                <div className="text-slate-400">{cam.intersection} ({cam.lanes} Lanes)</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Diversion Polyline Overlay */}
        {showDiversions && (
          <Polyline 
            positions={diversionPolyline} 
            pathOptions={{ color: '#10b981', weight: 5, dashArray: '10, 10' }} 
          />
        )}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[500] glass-panel px-3 py-2 rounded-xl text-[11px] font-mono flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block glow-red"></span>
          <span className="text-slate-300">Severe (80-100)</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
          <span className="text-slate-300">Heavy (60-79)</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block"></span>
          <span className="text-slate-300">Moderate (40-59)</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block glow-emerald"></span>
          <span className="text-slate-300">Free Flow (&lt;40)</span>
        </div>
      </div>
    </div>
  );
};
