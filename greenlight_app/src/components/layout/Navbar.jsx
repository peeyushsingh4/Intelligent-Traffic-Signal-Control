import React from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Radio, Activity, AlertTriangle, UserCheck, Video, Clock, CheckCircle2 } from 'lucide-react';

export const Navbar = () => {
  const { activeTab, setActiveTab, activePersona, setActivePersona, currentTime, liveAlertCount } = useApp();

  const personas = [
    { id: 'operator', name: 'Control Room Operator (Priya Sharma)', badge: 'Operator' },
    { id: 'officer', name: 'Traffic Police Officer (Insp. Rajesh)', badge: 'Field Officer' },
    { id: 'owner', name: 'Vehicle Owner Mobile (Arun Patel)', badge: 'Public Portal' },
    { id: 'admin', name: 'Transport Admin (Comm. Mehta)', badge: 'Executive' }
  ];

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 lg:px-6">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 glow-emerald">
          <Shield className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-white tracking-wider font-display">greenlight.exe</h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">v2.4 AI-READY</span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">AI Traffic Analytics & Violation Enforcement Platform</p>
        </div>
      </div>

      {/* Center System Status Bar */}
      <div className="hidden lg:flex items-center space-x-6 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800/80 text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <Video className="w-4 h-4 text-emerald-400" />
          <span><strong className="text-white font-mono">512 / 512</strong> Feeds Active</span>
        </div>
        <div className="h-3 w-px bg-slate-800"></div>
        <div className="flex items-center space-x-2 text-slate-300">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Latency: <strong className="text-cyan-400 font-mono">1.4s</strong> (&lt;2s SLA)</span>
        </div>
        <div className="h-3 w-px bg-slate-800"></div>
        <div className="flex items-center space-x-2 text-slate-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>ANPR Acc: <strong className="text-emerald-400 font-mono">96.4%</strong></span>
        </div>
        <div className="h-3 w-px bg-slate-800"></div>
        <div className="flex items-center space-x-2 text-slate-300 font-mono">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-amber-400">{currentTime} IST</span>
        </div>
      </div>

      {/* Persona Switcher & Alert Indicator */}
      <div className="flex items-center space-x-3">
        {/* Live Alert Count Badge */}
        <button 
          onClick={() => setActiveTab('control_room')}
          className="relative flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
        >
          <AlertTriangle className="w-4 h-4 animate-bounce text-red-400" />
          <span className="text-xs font-semibold hidden md:inline">Alerts</span>
          <span className="px-1.5 py-0.5 text-xs font-bold font-mono bg-red-500 text-white rounded-full">
            {liveAlertCount}
          </span>
        </button>

        {/* Persona Dropdown */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-lg p-1">
          <UserCheck className="w-4 h-4 text-slate-400 ml-2 hidden sm:block" />
          <select 
            value={activePersona}
            onChange={(e) => {
              const selected = e.target.value;
              setActivePersona(selected);
              if (selected === 'owner') setActiveTab('vehicle_owner_portal');
              else if (selected === 'officer') setActiveTab('field_officer');
              else if (selected === 'admin') setActiveTab('analytics');
              else setActiveTab('control_room');
            }}
            className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer pr-2"
          >
            {personas.map(p => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};
