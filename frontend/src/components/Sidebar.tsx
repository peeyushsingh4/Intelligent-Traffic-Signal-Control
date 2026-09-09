import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  Cpu,
  BarChart3,
  UserCheck,
  Lightbulb,
  ShieldCheck,
  Zap
} from 'lucide-react';

const navigationItems = [
  {
    name: 'Overview',
    path: '/',
    icon: LayoutDashboard,
    badge: 'Real-time'
  },
  {
    name: 'Data & Preprocessing',
    path: '/data',
    icon: Database,
    badge: '7,043 rows'
  },
  {
    name: 'Model Training & Runs',
    path: '/training',
    icon: Cpu,
    badge: '8 Ensembles'
  },
  {
    name: 'Model Evaluation',
    path: '/evaluation',
    icon: BarChart3,
    badge: 'K-Fold'
  },
  {
    name: 'Customer Profiler',
    path: '/predict',
    icon: UserCheck,
    badge: 'Try It'
  },
  {
    name: 'Feature Insights',
    path: '/insights',
    icon: Lightbulb,
    badge: 'XGBoost'
  }
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#0d1322] border-r border-slate-800/80 flex flex-col flex-shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400/30">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold tracking-tight text-white text-base">ChurnGuard</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Pro
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Customer Churn Intelligence</p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Intelligence Suite
        </div>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110 text-slate-400 group-hover:text-slate-200" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 group-hover:text-slate-300 border border-slate-700/50">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Ensemble Info Box */}
      <div className="p-4 m-3 rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1.5">
          <Zap className="w-4 h-4 text-indigo-400" />
          <span>Ensemble Architectures</span>
        </div>
        <p className="text-slate-400 leading-relaxed text-[11px]">
          Combines <strong className="text-slate-300">Bagging</strong> (Variance Reduction), <strong className="text-slate-300">Boosting</strong> (Bias Reduction), & <strong className="text-slate-300">Stacking</strong> (Meta-learning).
        </p>
        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
          <span>IBM Telco Dataset</span>
          <span className="font-mono text-emerald-400">v1.0 Ready</span>
        </div>
      </div>
    </aside>
  );
};
