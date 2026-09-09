import React from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Activity, AlertTriangle, UserCheck, Video, Clock, CheckCircle2, Car, Lock, ChevronDown } from 'lucide-react';
import { IAM_ROLES } from '../../data/mockData';

export const Navbar = () => {
  const { 
    currentRole, switchRole, activeTab, setActiveTab, 
    currentTime, liveAlertCount, fines 
  } = useApp();

  const isPolice = currentRole === 'TRAFFIC_POLICE';
  const pendingCitizenFines = fines.filter(f => f.status === 'PENDING' && f.plateNumber === 'MH 02 CZ 4921').length;

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 lg:px-6">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl border ${
          isPolice 
            ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400 glow-emerald' 
            : 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-400 glow-amber'
        }`}>
          {isPolice ? <Shield className="w-5 h-5" /> : <Car className="w-5 h-5" />}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPolice ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isPolice ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-white tracking-wider font-display">greenlight.exe</h1>
            <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-full border ${
              isPolice 
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}>
              {isPolice ? '👮 TRAFFIC POLICE IAM' : '🚗 CITIZEN E-CHALLAN IAM'}
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            {isPolice 
              ? 'Mumbai Traffic Police Command & Multi-Agent Enforcement' 
              : 'Maharashtra Parivahan Public Challan & Vehicle Portal'}
          </p>
        </div>
      </div>

      {/* Center System Status Bar */}
      <div className="hidden lg:flex items-center space-x-5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono">
        <div className="flex items-center space-x-2 text-slate-300">
          <Video className="w-4 h-4 text-emerald-400" />
          <span><strong className="text-white">6</strong> CCTV Streams</span>
        </div>
        <div className="h-3 w-px bg-slate-800"></div>
        <div className="flex items-center space-x-2 text-slate-300">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>YOLOv8: <strong className="text-cyan-300">Active</strong></span>
        </div>
        <div className="h-3 w-px bg-slate-800"></div>
        <div className="flex items-center space-x-2 text-slate-300">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] text-slate-400">RBAC: <strong className="text-emerald-300">{isPolice ? 'Officer Scope' : 'Public Scope'}</strong></span>
        </div>
        <div className="h-3 w-px bg-slate-800"></div>
        <div className="flex items-center space-x-1.5 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-amber-400">{currentTime} IST</span>
        </div>
      </div>

      {/* Role Switcher & Context Action */}
      <div className="flex items-center space-x-3">
        {/* Police Review Alert Badge (Only for Traffic Police) */}
        {isPolice ? (
          <button 
            onClick={() => setActiveTab('control_room')}
            className="relative flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all font-mono"
            title="Violations Pending Officer Review"
          >
            <AlertTriangle className="w-4 h-4 animate-bounce text-red-400" />
            <span className="text-xs font-semibold hidden md:inline">Review Queue</span>
            <span className="px-1.5 py-0.5 text-[11px] font-bold bg-red-500 text-white rounded-full">
              {liveAlertCount}
            </span>
          </button>
        ) : (
          <button 
            onClick={() => setActiveTab('vehicle_owner_portal')}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all font-mono text-xs"
            title="Active E-Challans"
          >
            <Car className="w-4 h-4 text-amber-400" />
            <span className="font-semibold hidden sm:inline">Due Challans:</span>
            <span className="px-1.5 py-0.5 text-[11px] font-bold bg-amber-500 text-slate-950 rounded-full font-mono">
              {pendingCitizenFines || 1}
            </span>
          </button>
        )}

        {/* IAM Role Switcher Dropdown */}
        <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-1 shadow-lg">
          <div className="px-2 py-1 flex items-center gap-1.5 text-xs font-mono">
            {isPolice ? (
              <Shield className="w-4 h-4 text-emerald-400" />
            ) : (
              <UserCheck className="w-4 h-4 text-amber-400" />
            )}
            <select 
              value={currentRole}
              onChange={(e) => switchRole(e.target.value)}
              className="bg-transparent text-xs font-mono font-bold text-slate-100 focus:outline-none cursor-pointer pr-1"
            >
              <option value="TRAFFIC_POLICE" className="bg-slate-950 text-slate-100">
                👮 Traffic Police Officer (Insp. Rajesh)
              </option>
              <option value="CITIZEN" className="bg-slate-950 text-slate-100">
                🚗 Citizen / Vehicle Owner (Arun Patel)
              </option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
