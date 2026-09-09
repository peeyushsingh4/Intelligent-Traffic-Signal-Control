import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, FileText, Navigation, DollarSign, Smartphone, 
  ShieldAlert, Camera, BarChart3, Cpu, MonitorPlay, Shield, Car, Lock, Search, AlertCircle 
} from 'lucide-react';
import { IAM_ROLES } from '../../data/mockData';

export const Sidebar = () => {
  const { activeTab, setActiveTab, currentRole, switchRole } = useApp();
  const isPolice = currentRole === 'TRAFFIC_POLICE';
  const roleConfig = IAM_ROLES[currentRole] || IAM_ROLES.TRAFFIC_POLICE;

  // Police Officer Modules
  const policeNavItems = [
    { id: 'control_room', label: 'Control Room (CCTV)', icon: LayoutDashboard, badge: 'Live HUD' },
    { id: 'simulation_display', label: 'Simulation Display', icon: MonitorPlay, badge: 'MATSim' },
    { id: 'evidence_viewer', label: 'Violation & ANPR Review', icon: FileText, badge: 'Officer' },
    { id: 'diversions', label: 'Traffic Diversions', icon: Navigation, badge: 'VMS' },
    { id: 'fines', label: 'Fines Adjudication', icon: DollarSign, badge: 'Disputes' },
    { id: 'camera_management', label: 'Camera Fleet (6)', icon: Camera, badge: 'HD Streams' },
    { id: 'field_officer', label: 'Field Officer App', icon: ShieldAlert, badge: 'Patrol' },
    { id: 'analytics', label: 'Executive Analytics', icon: BarChart3, badge: 'KPIs' },
    { id: 'testing', label: 'AI Perception Testing', icon: Cpu, badge: 'YOLOv8s' }
  ];

  // Citizen / Vehicle Owner Modules (Restricted IAM scope)
  const citizenNavItems = [
    { id: 'citizen_vehicles', label: 'My Vehicles & Fines', icon: Car, badge: 'Challans' },
    { id: 'citizen_evidence', label: 'Evidence & Photos', icon: FileText, badge: 'CCTV Proof' },
    { id: 'citizen_disputes', label: 'Dispute & Grievance', icon: AlertCircle, badge: 'Appeal' }
  ];

  const currentNavItems = isPolice ? policeNavItems : citizenNavItems;

  return (
    <aside className="w-64 bg-slate-950/95 border-r border-slate-800 flex flex-col justify-between hidden md:flex shrink-0">
      <div className="p-3 space-y-3">
        
        {/* IAM Role Scope Card */}
        <div className={`p-3 rounded-2xl border font-mono text-xs ${
          isPolice 
            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' 
            : 'bg-amber-950/20 border-amber-500/40 text-amber-300'
        }`}>
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
            <div className="flex items-center gap-1.5 font-bold">
              {isPolice ? <Shield size={14} className="text-emerald-400" /> : <Car size={14} className="text-amber-400" />}
              <span>{isPolice ? 'OFFICER IAM' : 'CITIZEN IAM'}</span>
            </div>
            <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-slate-900 border border-slate-700 text-slate-300">
              {isPolice ? 'ROLE: POLICE' : 'ROLE: CITIZEN'}
            </span>
          </div>
          
          <div className="pt-2 space-y-1 text-[11px] text-slate-300">
            <div className="font-bold text-white truncate">{roleConfig.userName}</div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Lock size={10} />
              <span className="truncate">{isPolice ? 'HQ Traffic Command Scope' : 'Vehicle Owner Read/Pay Scope'}</span>
            </div>
          </div>
        </div>

        {/* Section Heading */}
        <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center justify-between">
          <span>{isPolice ? 'Police Command Modules' : 'Citizen Portal Modules'}</span>
          <span className="text-slate-600">[{currentNavItems.length}]</span>
        </div>

        {/* Nav Buttons */}
        <div className="space-y-1">
          {currentNavItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'citizen_vehicles' && activeTab === 'vehicle_owner_portal');
            return (
              <button
                key={`${item.id}-${idx}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive 
                    ? isPolice 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold glow-emerald' 
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold glow-amber'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? (isPolice ? 'text-emerald-400' : 'text-amber-400') : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                  isActive 
                    ? (isPolice ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300')
                    : 'bg-slate-900 text-slate-500'
                }`}>
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Citizen Restricted Notice */}
        {!isPolice && (
          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-[10px] text-slate-400 space-y-1 font-mono">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Lock size={12} />
              <span>RBAC Policy Applied</span>
            </div>
            <p className="leading-tight">
              Traffic signal timing overrides and CCTV command feeds are restricted to authorized Traffic Police Officers.
            </p>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950 text-xs text-slate-500 space-y-1 font-mono">
        <div className="flex justify-between items-center text-[11px]">
          <span>Security Governance:</span>
          <span className="text-emerald-400 font-bold">ISO-27001 RBAC</span>
        </div>
        <div className="text-[10px] text-slate-600">Motor Vehicles Act, Sec. 133A Compliance</div>
      </div>
    </aside>
  );
};
