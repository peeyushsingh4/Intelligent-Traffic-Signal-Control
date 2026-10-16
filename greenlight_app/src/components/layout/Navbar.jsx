import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Shield, Activity, AlertTriangle, UserCheck, Video, Clock, 
  Car, Lock, Menu, X, LayoutDashboard, MonitorPlay, 
  FileText, Navigation, DollarSign, ShieldAlert, Camera, BarChart3, Cpu, AlertCircle, Phone, Mail, Globe,
  Sun, Moon
} from 'lucide-react';
import { IAM_ROLES } from '../../data/mockData';

export const Navbar = () => {
  const { 
    currentRole, switchRole, activeTab, setActiveTab, 
    currentTime, liveAlertCount, fines,
    theme, toggleTheme
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPolice = currentRole === 'TRAFFIC_POLICE';
  const pendingCitizenFines = fines.filter(f => f.status === 'PENDING' && f.plateNumber === 'MH 02 CZ 4921').length;

  const policeNavItems = [
    { id: 'control_room', label: 'Control Room (CCTV)', icon: LayoutDashboard },
    { id: 'simulation_display', label: 'Simulation Display', icon: MonitorPlay },
    { id: 'evidence_viewer', label: 'Violation & ANPR Review', icon: FileText },
    { id: 'diversions', label: 'Traffic Diversions', icon: Navigation },
    { id: 'fines', label: 'Fines Adjudication', icon: DollarSign },
    { id: 'camera_management', label: 'Camera Fleet (6)', icon: Camera },
    { id: 'field_officer', label: 'Field Officer App', icon: ShieldAlert },
    { id: 'analytics', label: 'Executive Analytics', icon: BarChart3 },
    { id: 'testing', label: 'Perception Testing', icon: Cpu }
  ];

  const citizenNavItems = [
    { id: 'citizen_vehicles', label: 'My Vehicles & Fines', icon: Car },
    { id: 'citizen_evidence', label: 'Evidence & Photos', icon: FileText },
    { id: 'citizen_disputes', label: 'Dispute & Grievance', icon: AlertCircle }
  ];

  const navItems = isPolice ? policeNavItems : citizenNavItems;

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/95 sticky top-0 z-40 flex items-center justify-between px-3 sm:px-4 lg:px-6">
      {/* Brand & Logo - Clickable */}
      <button 
        onClick={() => setActiveTab(isPolice ? 'control_room' : 'citizen_vehicles')}
        className="flex items-center space-x-3 text-left focus:outline-none group cursor-pointer"
        title="Return to primary dashboard"
      >
        <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl border transition-colors ${
          isPolice 
            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 group-hover:border-emerald-400' 
            : 'bg-amber-500/10 border-amber-500/40 text-amber-400 group-hover:border-amber-400'
        }`}>
          {isPolice ? <Shield className="w-5 h-5" /> : <Car className="w-5 h-5" />}
          <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-sm ${isPolice ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-white tracking-wider font-display group-hover:text-emerald-400 transition">iTraCS</h1>
            <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-md border ${
              isPolice 
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}>
              {isPolice ? 'POLICE IAM' : 'CITIZEN IAM'}
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            {isPolice 
              ? 'Mumbai Traffic Police Command & Multi-Agent Enforcement' 
              : 'Maharashtra Parivahan Public Challan & Vehicle Portal'}
          </p>
        </div>
      </button>

      {/* Center System Status Bar - Rectangular/Subtle rounded-xl, NOT pill rounded-full */}
      <div className="hidden lg:flex items-center space-x-5 px-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
        <div className="flex items-center space-x-2 text-slate-300">
          <Globe className="w-4 h-4 text-emerald-400" />
          <span className="text-[11px] text-slate-300 font-bold">itracs.transport.maharashtra.gov.in</span>
        </div>
        <div className="h-3 w-px bg-slate-800"></div>
        <div className="flex items-center space-x-2 text-slate-300">
          <Video className="w-4 h-4 text-cyan-400" />
          <span><strong className="text-white">6</strong> Cameras</span>
        </div>
        <div className="h-3 w-px bg-slate-800"></div>
        <div className="flex items-center space-x-2 text-slate-300">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>YOLOv8: <strong className="text-emerald-300">Active</strong></span>
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
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors font-mono cursor-pointer"
            title="Violations Pending Officer Review"
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-xs font-semibold hidden md:inline">Review Queue</span>
            <span className="px-1.5 py-0.5 text-[11px] font-bold bg-red-500 text-white rounded-md">
              {liveAlertCount}
            </span>
          </button>
        ) : (
          <button 
            onClick={() => setActiveTab('vehicle_owner_portal')}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors font-mono text-xs cursor-pointer"
            title="Active E-Challans"
          >
            <Car className="w-4 h-4 text-amber-400" />
            <span className="font-semibold hidden sm:inline">Due Challans:</span>
            <span className="px-1.5 py-0.5 text-[11px] font-bold bg-amber-500 text-slate-950 rounded-md font-mono">
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
                Traffic Police Scope (Insp. Rajesh)
              </option>
              <option value="CITIZEN" className="bg-slate-950 text-slate-100">
                Citizen Portal Scope (Arun Patel)
              </option>
            </select>
          </div>
        </div>

        {/* Theme Toggle Button (Light / Dark) */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-500 text-slate-200 transition-all font-mono text-xs cursor-pointer shadow-md"
          title={theme === 'light' ? 'Switch to Dark Mode (Cyberpunk HUD)' : 'Switch to Light Mode (Daytime Presentation)'}
          aria-label="Toggle visual theme"
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-4 h-4 text-indigo-500 fill-indigo-500/20" />
              <span className="hidden sm:inline font-bold text-[11px] text-slate-700">Dark</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              <span className="hidden sm:inline font-bold text-[11px] text-amber-300">Light</span>
            </>
          )}
        </button>

        {/* Mobile Menu Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bg-slate-950 border-b border-slate-800 shadow-2xl p-4 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Mobile IAM Role Header */}
          <div className="p-3 mb-2 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPolice ? <Shield className="w-4 h-4 text-emerald-400" /> : <Car className="w-4 h-4 text-amber-400" />}
              <span className="text-white font-bold">{isPolice ? 'Insp. Rajesh (Officer)' : 'Arun Patel (Citizen)'}</span>
            </div>
            <select
              value={currentRole}
              onChange={(e) => {
                switchRole(e.target.value);
                setMobileMenuOpen(false);
              }}
              className="bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-[11px] focus:outline-none"
            >
              <option value="TRAFFIC_POLICE">Traffic Police Scope</option>
              <option value="CITIZEN">Citizen Portal Scope</option>
            </select>
          </div>

          {/* Mobile Theme Toggle Button */}
          <div className="p-3 mb-3 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              <span className="text-white font-bold">Theme: {theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <button
              onClick={toggleTheme}
              className="py-1 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
            >
              {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
            </button>
          </div>

          {/* Quick Metrics Bar on Mobile */}
          <div className="grid grid-cols-2 gap-2 mb-4 font-mono text-[11px]">
            <div className="bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-xl flex items-center gap-2 text-slate-300">
              <Video className="w-4 h-4 text-emerald-400" />
              <span>6 CCTV Cameras</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-xl flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{currentTime} IST</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono mb-2 px-1">
            {isPolice ? 'Police Command Modules' : 'Citizen Portal Modules'}
          </div>
          <div className="space-y-1 mb-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || (item.id === 'citizen_vehicles' && activeTab === 'vehicle_owner_portal');
              return (
                <button
                  key={`mobile-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? isPolice
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 font-bold'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/40 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? (isPolice ? 'text-emerald-400' : 'text-amber-400') : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">&gt;</span>
                </button>
              );
            })}
          </div>

          {/* Dedicated Legal Pages Shortcuts on Mobile */}
          <div className="grid grid-cols-2 gap-2 mb-3 font-mono text-[11px]">
            <button
              onClick={() => handleNavClick('privacy_policy')}
              className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-left hover:text-white"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => handleNavClick('terms_conditions')}
              className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-left hover:text-white"
            >
              Terms &amp; Conditions
            </button>
          </div>

          {/* Emergency Helpline button in mobile drawer */}
          <div className="pt-3 border-t border-slate-800/80 flex gap-2">
            <a 
              href="tel:1033" 
              className="flex-1 py-2 px-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-center text-xs font-mono font-bold flex items-center justify-center gap-1.5"
            >
              <Phone size={13} />
              <span>Helpline 1033</span>
            </a>
            <a 
              href="mailto:support@itracs.gov.in" 
              className="flex-1 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-center text-xs font-mono font-bold flex items-center justify-center gap-1.5"
            >
              <Mail size={13} />
              <span>Support Mail</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
