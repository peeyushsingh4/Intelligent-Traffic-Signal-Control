import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LiveVideoPlayer } from '../components/video/LiveVideoPlayer';
import { Camera, Video, Plus, Activity, CheckCircle, AlertTriangle, RefreshCw, Server, MapPin } from 'lucide-react';

export const CameraManagement = () => {
  const { cameras, activeCamera, setActiveCamera } = useApp();
  const [showAddWizard, setShowAddWizard] = useState(false);

  return (
    <div className="h-[calc(100vh-4rem)] p-4 lg:p-6 flex flex-col space-y-6 overflow-y-auto">
      
      {/* Header & Onboarding Trigger */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Citywide Camera Fleet & Stream Management</h2>
          <p className="text-xs text-slate-400">RTSP Stream Health, FPS Metrics & Onboarding Wizard (512 Active Feeds)</p>
        </div>

        <button 
          onClick={() => setShowAddWizard(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition glow-emerald font-mono"
        >
          <Plus className="w-4 h-4" />
          <span>Register New RTSP Camera Feed</span>
        </button>
      </div>

      {/* Grid: Selected Camera Live Video Feed (7 cols) & Camera Selection List (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[450px]">
        
        {/* Active Selected Camera Live Video Player (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-4 rounded-3xl border border-slate-800 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <h3 className="text-sm font-bold text-white font-display">{activeCamera.name}</h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">IP: {activeCamera.ip}</span>
          </div>

          <div className="flex-1 min-h-[350px]">
            <LiveVideoPlayer activeCamera={activeCamera} />
          </div>
        </div>

        {/* Camera Fleet Selector List (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white font-display">Intersection Camera Stream List</h3>
            <span className="text-xs font-mono text-slate-400 font-bold">5 Registered Corridors</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {cameras.map(cam => {
              const isSelected = activeCamera.id === cam.id;
              return (
                <div 
                  key={cam.id}
                  onClick={() => setActiveCamera(cam)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer font-mono text-xs ${
                    isSelected 
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white glow-emerald' 
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2 font-bold text-white">
                      <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span>{cam.name}</span>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                      {cam.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 mt-2">
                    <div>Zone: <strong className="text-slate-200">{cam.zone}</strong></div>
                    <div>Speed Limit: <strong className="text-slate-200">{cam.speedLimitKmh} km/h</strong></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
