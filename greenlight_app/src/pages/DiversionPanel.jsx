import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TrafficMap } from '../components/maps/TrafficMap';
import { Navigation, Zap, Clock, ShieldAlert, CheckCircle, Radio, ArrowRight } from 'lucide-react';

export const DiversionPanel = () => {
  const { diversions, handleActivateDiversion, heatmapNodes } = useApp();
  const [selectedTemplate, setSelectedTemplate] = useState(diversions[0]);

  return (
    <div className="h-[calc(100vh-4rem)] p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
      
      {/* LEFT COLUMN: Diversion Control & Template Builder (5 cols) */}
      <div className="lg:col-span-5 flex flex-col space-y-4">
        
        <div className="glass-panel p-5 rounded-3xl border border-slate-800">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 glow-emerald">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">Intelligent Traffic Diversion Engine</h2>
              <p className="text-xs text-slate-400">AI-Powered Congestion Routing & Digital Signage Dispatch</p>
            </div>
          </div>
        </div>

        {/* Diversion Templates List */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4 flex-1">
          <div className="flex justify-between items-center text-xs font-mono border-b border-slate-800 pb-2">
            <span className="text-slate-400 font-bold uppercase">Active & Suggested Plans</span>
            <span className="text-emerald-400 font-bold">{diversions.length} Templates Ready</span>
          </div>

          <div className="space-y-3">
            {diversions.map((d) => (
              <div 
                key={d.id}
                onClick={() => setSelectedTemplate(d)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  selectedTemplate.id === d.id 
                    ? 'border-emerald-500 bg-emerald-950/20 glow-emerald' 
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-bold text-white">{d.title}</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                    d.status === 'ACTIVE' 
                      ? 'bg-emerald-500 text-slate-950' 
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {d.status}
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <div><strong className="text-slate-400">Affected Corridor:</strong> {d.affectedCorridor}</div>
                  <div><strong className="text-slate-400">Recommended Route:</strong> {d.recommendedRoute}</div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800">
                  <span className="text-emerald-400 font-bold">Est. Savings: {d.timeSavingsMin} mins</span>
                  <span className="text-slate-400">{d.capacityImpact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Map Overlay & Before/After Impact Analysis (7 cols) */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        
        {/* Map View with Alternate Route Polyline */}
        <div className="h-2/3 glass-panel rounded-3xl overflow-hidden relative p-1">
          <TrafficMap showDiversions={true} />
        </div>

        {/* Selected Plan Details & Digital Signage Push */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase font-bold border-b border-slate-800 pb-2 mb-3">
              Digital Signage Dispatch Preview (NTCIP 1203 / MQTT)
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 text-amber-400 font-mono text-sm tracking-wider flex items-start space-x-3 glow-amber">
              <Radio className="w-5 h-5 shrink-0 mt-0.5 animate-pulse text-amber-400" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-sans mb-1">Broadcasting Message to Variable Message Signs (VMS)</div>
                "{selectedTemplate.signageMessage}"
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleActivateDiversion(selectedTemplate.id)}
              disabled={selectedTemplate.status === 'ACTIVE'}
              className={`w-full py-3.5 rounded-2xl text-xs font-bold font-sans transition flex items-center justify-center space-x-2 ${
                selectedTemplate.status === 'ACTIVE'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold glow-emerald'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>{selectedTemplate.status === 'ACTIVE' ? 'Diversion Active' : 'Activate 1-Click Diversion Protocol'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
