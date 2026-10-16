import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, Shield, Navigation, ArrowLeft, Home, Car } from 'lucide-react';

export const NotFound = ({ requestedPath = '/unknown-corridor' }) => {
  const { setActiveTab, currentRole } = useApp();
  const isPolice = currentRole === 'TRAFFIC_POLICE';

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 flex items-center justify-center font-mono">
      <div className="max-w-lg w-full glass-panel p-6 sm:p-8 rounded-3xl border border-red-500/30 shadow-2xl relative overflow-hidden space-y-6 glow-red text-center">
        
        {/* Decorative Grid Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500"></div>

        {/* 404 Badge with Beacon */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-400 shadow-inner">
            <AlertTriangle className="w-8 h-8 animate-pulse text-red-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
          
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-wider">
              404
            </h1>
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40 inline-block mt-1">
              ERR_UNREGISTERED_CORRIDOR_ROUTE
            </span>
          </div>
        </div>

        {/* Explanation */}
        <div className="space-y-2 text-xs text-slate-300 font-sans">
          <p className="font-semibold text-slate-100">
            The requested intersection telemetry feed or enforcement route could not be located.
          </p>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            The link you followed may be outdated, restricted by role-based access policy, or the intersection ID has been retired from the real-time SUMO/MATSim network.
          </p>
        </div>

        {/* Telemetry Diagnostics */}
        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-[11px] text-left space-y-1 text-slate-400 font-mono">
          <div className="flex justify-between">
            <span>Requested Resource:</span>
            <strong className="text-red-400">{requestedPath}</strong>
          </div>
          <div className="flex justify-between">
            <span>Security Perimeter:</span>
            <strong className="text-emerald-400">iTraCS Firewall v2.4</strong>
          </div>
          <div className="flex justify-between">
            <span>Current IAM Context:</span>
            <strong className={isPolice ? 'text-emerald-300' : 'text-amber-300'}>
              {isPolice ? 'Traffic Police Officer Scope' : 'Citizen Public Scope'}
            </strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => setActiveTab(isPolice ? 'control_room' : 'citizen_vehicles')}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 font-mono shadow-lg ${
              isPolice 
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 glow-emerald' 
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 glow-amber'
            }`}
          >
            {isPolice ? <Home size={15} /> : <Car size={15} />}
            <span>{isPolice ? 'Return to Control Room' : 'Go to My Portal'}</span>
          </button>

          <button
            onClick={() => setActiveTab('diversions')}
            className="py-3 px-4 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition flex items-center justify-center space-x-2 font-mono"
          >
            <Navigation size={15} className="text-cyan-400" />
            <span>Traffic Diversions Map</span>
          </button>
        </div>

      </div>
    </div>
  );
};
