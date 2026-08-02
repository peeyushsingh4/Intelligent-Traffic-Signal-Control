import React from 'react';
import { EXECUTIVE_METRICS } from '../data/mockData';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { BarChart3, TrendingUp, DollarSign, ShieldCheck, Download, Award } from 'lucide-react';

const REVENUE_DATA = [
  { month: 'Mar', revenue: 2.4 },
  { month: 'Apr', revenue: 3.1 },
  { month: 'May', revenue: 3.8 },
  { month: 'Jun', revenue: 4.2 },
  { month: 'Jul', revenue: 4.6 },
  { month: 'Aug', revenue: 4.82 }
];

const VIOLATION_CATEGORIES = [
  { name: 'Red Light', value: 38, color: '#ef4444' },
  { name: 'Over-Speeding', value: 28, color: '#f59e0b' },
  { name: 'Wrong Lane', value: 18, color: '#06b6d4' },
  { name: 'No Helmet/Seatbelt', value: 16, color: '#10b981' }
];

export const ExecutiveAnalytics = () => {
  return (
    <div className="h-[calc(100vh-4rem)] p-4 lg:p-6 flex flex-col space-y-6 overflow-y-auto">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Executive Analytics & Safety Impact</h2>
          <p className="text-xs text-slate-400">City Transport Authority Executive Dashboard (Comm. Vikram Mehta)</p>
        </div>

        <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition glow-emerald">
          <Download className="w-4 h-4" />
          <span>Export Monthly PDF Report</span>
        </button>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-xs text-slate-400 font-mono">Violation Enforcement Rate</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{EXECUTIVE_METRICS.violationDetectionRate}</div>
          <div className="text-[10px] text-slate-500">vs Manual Police Checkpoints</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-xs text-slate-400 font-mono">Commute Time Reduction</div>
          <div className="text-2xl font-bold font-mono text-cyan-400">{EXECUTIVE_METRICS.avgCommuteSavings}</div>
          <div className="text-[10px] text-slate-500">Target: 25-40% Reduction</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-xs text-slate-400 font-mono">Fine Collection Rate</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{EXECUTIVE_METRICS.fineCollectionRate}</div>
          <div className="text-[10px] text-slate-500">Baseline was &lt;30%</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-xs text-slate-400 font-mono">Intersection Accidents</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{EXECUTIVE_METRICS.accidentReduction}</div>
          <div className="text-[10px] text-slate-500">Vision Zero Road Safety Goal</div>
        </div>

      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Revenue Collection Trend Bar Chart (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white font-display">Monthly Revenue Collection (₹ Crores)</h3>
            <span className="text-xs font-mono text-emerald-400 font-bold">Aug 2026: ₹ 4.82 Cr</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Violation Category Breakdown Pie Chart (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white font-display">Violation Types Breakdown</h3>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={VIOLATION_CATEGORIES} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={85} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {VIOLATION_CATEGORIES.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
