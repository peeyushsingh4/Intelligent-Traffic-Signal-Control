import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, Video, Plus, Activity, CheckCircle, AlertTriangle, RefreshCw, Server } from 'lucide-react';

export const CameraManagement = () => {
  const { cameras, setCameras } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCam, setNewCam] = useState({
    name: '',
    zone: 'Central Mumbai',
    streamUrl: '',
    speedLimit: 60,
    intersection: ''
  });

  const handleAddCamera = (e) => {
    e.preventDefault();
    const created = {
      id: `CAM-NEW-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newCam.name || 'New AI Camera Feed',
      zone: newCam.zone,
      lat: 19.0600,
      lng: 72.8500,
      status: 'active',
      fps: 30,
      uptime: '100%',
      streamUrl: newCam.streamUrl || 'rtsp://camera.traffic.mumbai.gov/stream',
      speedLimit: Number(newCam.speedLimit),
      intersection: newCam.intersection || 'Main Junction',
      lanes: 3,
      type: '4K AI PTZ Camera'
    };
    setCameras([created, ...cameras]);
    setShowAddModal(false);
  };

  return (
    <div className="h-[calc(100vh-4rem)] p-4 lg:p-6 flex flex-col space-y-6 overflow-y-auto">
      
      {/* Fleet Stats Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Camera Fleet Infrastructure</h2>
          <p className="text-xs text-slate-400">Monitoring RTSP/RTMP Streams across 500+ Smart City Camera Feeds</p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition glow-emerald"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Camera Feed</span>
        </button>
      </div>

      {/* Fleet Table Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex-1 overflow-x-auto space-y-4">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <th className="py-3 px-4">Camera ID</th>
              <th className="py-3 px-4">Location Name</th>
              <th className="py-3 px-4">Zone</th>
              <th className="py-3 px-4">Speed Limit</th>
              <th className="py-3 px-4">Stream FPS</th>
              <th className="py-3 px-4">Uptime</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {cameras.map(c => (
              <tr key={c.id} className="hover:bg-slate-900/40 transition">
                <td className="py-3.5 px-4 font-bold text-emerald-400">{c.id}</td>
                <td className="py-3.5 px-4 font-bold text-white">{c.name}</td>
                <td className="py-3.5 px-4 text-slate-400">{c.zone}</td>
                <td className="py-3.5 px-4 font-mono">{c.speedLimit} km/h</td>
                <td className="py-3.5 px-4 font-mono">{c.fps} FPS</td>
                <td className="py-3.5 px-4 font-mono text-cyan-400">{c.uptime}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    c.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {c.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Onboarding Wizard Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
          <form onSubmit={handleAddCamera} className="glass-panel w-full max-w-lg p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white font-display">Onboard New Camera Feed</h3>
            
            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Camera Location Name</label>
                <input 
                  type="text" 
                  value={newCam.name}
                  onChange={(e) => setNewCam({...newCam, name: e.target.value})}
                  placeholder="e.g. Bandra Reclamation Intersection"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">RTSP / RTMP Stream URL</label>
                <input 
                  type="text" 
                  value={newCam.streamUrl}
                  onChange={(e) => setNewCam({...newCam, streamUrl: e.target.value})}
                  placeholder="rtsp://camera.mumbai.gov/feed-109"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs glow-emerald"
              >
                Validate & Connect Stream
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
