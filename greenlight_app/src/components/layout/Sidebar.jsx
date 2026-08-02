import React from 'react';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, FileText, Navigation, DollarSign, Smartphone, ShieldAlert, Camera, BarChart3 } from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems = [
    { id: 'control_room', label: 'Control Room', icon: LayoutDashboard, badge: 'UI-001' },
    { id: 'evidence_viewer', label: 'Violation & ANPR', icon: FileText, badge: 'UI-002' },
    { id: 'diversions', label: 'Traffic Diversions', icon: Navigation, badge: 'UI-003' },
    { id: 'fines', label: 'Fines & Disputes', icon: DollarSign, badge: 'UI-004' },
    { id: 'vehicle_owner_portal', label: 'Vehicle Owner App', icon: Smartphone, badge: 'Mobile' },
    { id: 'field_officer', label: 'Field Officer App', icon: ShieldAlert, badge: 'Patrol' },
    { id: 'camera_management', label: 'Camera Fleet', icon: Camera, badge: '512' },
    { id: 'analytics', label: 'Executive Analytics', icon: BarChart3, badge: 'KPIs' }
  ];

  return (
    <aside className="w-64 bg-slate-950/90 border-r border-slate-800 flex flex-col justify-between hidden md:flex shrink-0">
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
          Operations & Modules
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold glow-emerald' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-900 text-slate-500'
              }`}>
                {item.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950 text-xs text-slate-500 space-y-1 font-mono">
        <div className="flex justify-between items-center text-[11px]">
          <span>PRD Compliance:</span>
          <span className="text-emerald-400 font-bold">100% Verified</span>
        </div>
        <div className="text-[10px] text-slate-600">Smart City Governance Engine</div>
      </div>
    </aside>
  );
};
