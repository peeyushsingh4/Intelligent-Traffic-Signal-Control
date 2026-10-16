import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IndianRoadDatasetFeed } from '../components/video/IndianRoadDatasetFeed';
import { Camera, Video, Plus, Activity, CheckCircle, AlertTriangle, RefreshCw, Server, MapPin } from 'lucide-react';

export const CameraManagement = () => {
  const { cameras, activeCamera, setActiveCamera, handleAddCamera, showError } = useApp();
  const [showAddWizard, setShowAddWizard] = useState(false);

  // New Camera Form State
  const [camForm, setCamForm] = useState({
    name: '',
    zone: 'South Mumbai Coastal',
    ip: '192.168.1.108',
    speedLimitKmh: 50,
    simulationScenario: 'bkc',
    lat: 19.0178,
    lng: 72.8478
  });

  const handleSubmitCamera = (e) => {
    e.preventDefault();
    if (!camForm.name.trim()) {
      showError('Please provide a descriptive camera corridor name.', 'Validation Required');
      return;
    }
    if (!camForm.ip.trim()) {
      showError('Please specify an IP address or RTSP stream URI.', 'Validation Required');
      return;
    }

    handleAddCamera({
      name: camForm.name.trim(),
      zone: camForm.zone,
      ip: camForm.ip.trim(),
      speedLimitKmh: Number(camForm.speedLimitKmh) || 50,
      simulationScenario: camForm.simulationScenario,
      lat: camForm.lat,
      lng: camForm.lng,
      videoUrl: '/videos/istockphoto-1095606488-640_adpp_is_tracked.mp4',
      rawVideoUrl: '/videos/istockphoto-1095606488-640_adpp_is.mp4',
      tracksJson: '/videos/istockphoto-1095606488-640_adpp_is_compact.json'
    });

    setCamForm({
      name: '',
      zone: 'South Mumbai Coastal',
      ip: '192.168.1.108',
      speedLimitKmh: 50,
      simulationScenario: 'bkc',
      lat: 19.0178,
      lng: 72.8478
    });
    setShowAddWizard(false);
  };

  return (
    <div className="h-[calc(100vh-4rem)] p-4 lg:p-6 flex flex-col space-y-6 overflow-y-auto">
      
      {/* Header & Onboarding Trigger */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Citywide Camera Fleet & Stream Management</h2>
          <p className="text-xs text-slate-300">TraCI ground-truth sensors and real-time ANPR edge cameras across Mumbai & Navi Mumbai.</p>
        </div>

        <button 
          onClick={() => setShowAddWizard(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition glow-emerald font-mono"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Camera Stream</span>
        </button>
      </div>

      {/* Grid: Selected Camera Live Video Feed (7 cols) & Camera Selection List (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[450px]">
        
        {/* Active Selected Camera Live Video Player (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-4 rounded-3xl border border-slate-800 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <h3 className="text-sm font-bold text-white font-display">{activeCamera.name}</h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">IP: {activeCamera.ip}</span>
          </div>

          <div className="flex-1 min-h-[350px]">
            <IndianRoadDatasetFeed 
              currentScenario={activeCamera?.simulationScenario || 'bkc'} 
            />
          </div>
        </div>

        {/* Camera Fleet Selector List (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white font-display">Intersection Camera Stream List</h3>
            <span className="text-xs font-mono text-emerald-400 font-bold">{cameras.length} Active Corridors</span>
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

      {/* Interactive Camera Registration Modal */}
      {showAddWizard && (
        <div role="dialog" aria-modal="true" aria-labelledby="feed-registration-title" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="glass-panel max-w-lg w-full rounded-3xl p-6 border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-400" />
                <h3 id="feed-registration-title" className="text-base font-bold text-white font-display">Register New CCTV / ANPR Camera</h3>
              </div>
              <button 
                onClick={() => setShowAddWizard(false)}
                className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1 bg-slate-900 rounded-lg"
              >
                Close (Esc)
              </button>
            </div>

            <form onSubmit={handleSubmitCamera} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Corridor & Camera Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Dadar TT Circle : Dr. Ambedkar Road South"
                  value={camForm.name}
                  onChange={(e) => setCamForm({ ...camForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Traffic Zone</label>
                  <input
                    type="text"
                    value={camForm.zone}
                    onChange={(e) => setCamForm({ ...camForm, zone: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Speed Limit (km/h)</label>
                  <input
                    type="number"
                    value={camForm.speedLimitKmh}
                    onChange={(e) => setCamForm({ ...camForm, speedLimitKmh: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">IP / RTSP URI *</label>
                  <input
                    type="text"
                    placeholder="192.168.1.108"
                    value={camForm.ip}
                    onChange={(e) => setCamForm({ ...camForm, ip: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Network Simulation Model</label>
                  <select
                    value={camForm.simulationScenario}
                    onChange={(e) => setCamForm({ ...camForm, simulationScenario: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="bkc">BKC Commercial Gateway</option>
                    <option value="vashi">Vashi Highway Toll Junction</option>
                    <option value="palmbeach">Palm Beach Road Nerul</option>
                    <option value="dadar">Dadar TT Circle</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition glow-emerald font-mono flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Register & Connect Stream</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddWizard(false)}
                  className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs transition font-mono border border-slate-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
