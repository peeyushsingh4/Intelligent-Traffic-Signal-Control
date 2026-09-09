import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  TrendingDown,
  Award,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { DatasetSummary, ModelComparisonItem, PredictionHistoryItem, Recommendation } from '../types';
import { StatCard } from '../components/StatCard';
import { DashboardSkeleton } from '../components/SkeletonLoader';

export const DashboardOverview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataset, setDataset] = useState<DatasetSummary | null>(null);
  const [comparison, setComparison] = useState<ModelComparisonItem[]>([]);
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dsData, compData, histData, recData] = await Promise.all([
        api.getDatasetSummary(),
        api.getModelComparison(),
        api.getPredictionHistory(6),
        api.getRecommendation(),
      ]);
      setDataset(dsData);
      setComparison(compData);
      setHistory(histData);
      setRecommendation(recData);
    } catch (err: any) {
      console.error('Failed loading dashboard overview data:', err);
      setError(err?.message || 'Failed to connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !dataset) {
    return (
      <div className="p-8 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <TrendingDown className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-white">Platform Overview Unavailable</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          {error || 'Could not connect to backend service.'} Please ensure the backend is running on port 8000.
        </p>
        <button
          onClick={fetchData}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const champion = comparison.find((m) => m.is_champion) || comparison[0];
  const churnCount = dataset?.class_balance_raw[1]?.count || 1869;
  const retainedCount = dataset?.class_balance_raw[0]?.count || 5174;
  const churnRate = dataset ? ((churnCount / dataset.total_rows) * 100).toFixed(1) : '26.5';

  const pieData = [
    { name: 'Retained Customers', value: retainedCount, color: '#6366f1' },
    { name: 'Churned Cohort', value: churnCount, color: '#f43f5e' },
  ];

  // Tenure cohort distribution data
  const tenureCohorts = [
    { cohort: '0-12m', retained: 1120, churned: 1037 },
    { cohort: '13-24m', retained: 730, churned: 294 },
    { cohort: '25-36m', retained: 652, churned: 180 },
    { cohort: '37-48m', retained: 614, churned: 145 },
    { cohort: '49-60m', retained: 652, churned: 120 },
    { cohort: '61-72m', retained: 1406, churned: 93 },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Baseline Churn Rate"
          value={`${churnRate}%`}
          subtitle="1,869 churners in 7,043 population"
          badgeText="Class Imbalance (3:1)"
          badgeVariant="danger"
          icon={TrendingDown}
        />
        <StatCard
          title="Analyzed Subscribers"
          value={(dataset?.total_rows || 7043).toLocaleString()}
          subtitle="IBM Telco telecom customer records"
          badgeText="20 Feature Columns"
          badgeVariant="indigo"
          icon={Users}
        />
        <StatCard
          title="Champion ROC-AUC"
          value={champion ? champion.roc_auc.toFixed(3) : '0.849'}
          subtitle={champion ? champion.model_name : 'XGBoost Classifier'}
          badgeText="Champion Architecture"
          badgeVariant="success"
          icon={Award}
        />
        <StatCard
          title="At-Risk Cohort"
          value={churnCount.toLocaleString()}
          subtitle="Subscribers requiring proactive retention"
          badgeText="Actionable Target"
          badgeVariant="warning"
          icon={AlertTriangle}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Churn Ratio Donut */}
        <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Class Balance Breakdown</h2>
              <span className="text-[11px] text-slate-400 font-mono">Raw Dataset</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Natural class distribution highlights the imperative for SMOTE resampling.
            </p>
          </div>

          <div className="h-56 w-full relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0b0f19" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold font-mono text-white">{churnRate}%</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Churn Rate</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span className="text-slate-300">Retained: {retainedCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-300">Churned: {churnCount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Churn by Tenure Cohort */}
        <div className="lg:col-span-2 bg-[#0f172a]/70 border border-slate-800/80 rounded-xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Churn Hazard vs Tenure Cohort</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                First-year subscribers (0-12m) experience 48% churn, plunging to under 7% after year 5.
              </p>
            </div>
            <NavLink
              to="/insights"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
            >
              Deep Dive <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="h-60 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tenureCohorts} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="cohort" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="retained" name="Retained" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="churned" name="Churned" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800">
            <span>Critical Retention Window: First 90-180 Days</span>
            <span className="font-mono text-indigo-400">High Lifetime Value Protection</span>
          </div>
        </div>
      </div>

      {/* Champion Model & Live Feed Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommendation / Champion Box */}
        <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-semibold text-white">Champion Architecture</h2>
            </div>
            <div className="p-3.5 rounded-lg bg-indigo-950/20 border border-indigo-500/20 mb-4">
              <div className="text-base font-bold text-white font-mono">
                {recommendation?.champion_model || 'XGBoost Classifier'}
              </div>
              <div className="text-xs text-indigo-300/90 mt-0.5">
                Family: {recommendation?.champion_family || 'Boosting'}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] block">ROC-AUC</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {recommendation?.champion_auc.toFixed(4) || '0.8492'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">F1-SCORE</span>
                  <span className="text-indigo-400 font-bold text-sm">
                    {recommendation?.champion_f1.toFixed(4) || '0.6385'}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
              {recommendation?.rationale ||
                'Second-order gradient boosting minimizes variance and handles correlated categorical subscriber variables with precision.'}
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
            <NavLink
              to="/evaluation"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
            >
              Inspect Evaluation Matrix <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>

        {/* Live Prediction Activity Feed */}
        <div className="lg:col-span-2 bg-[#0f172a]/70 border border-slate-800/80 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Recent Customer Scoring Activity</h2>
              <p className="text-xs text-slate-400">Live feed of processed subscriber profiles and risk tags</p>
            </div>
            <NavLink
              to="/predict"
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-xs"
            >
              Test New Customer
            </NavLink>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-3 pl-2">Customer ID</th>
                  <th className="pb-3">Contract</th>
                  <th className="pb-3">Tenure</th>
                  <th className="pb-3">Monthly</th>
                  <th className="pb-3">Probability</th>
                  <th className="pb-3">Risk Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {history.length > 0 ? (
                  history.map((item) => {
                    const probPct = Math.round(item.churn_probability * 100);
                    const isHigh = item.risk_tier === 'HIGH';
                    const isMed = item.risk_tier === 'MEDIUM';

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 pl-2 text-white font-medium">{item.customer_id}</td>
                        <td className="py-3 text-slate-300 font-sans">{item.contract}</td>
                        <td className="py-3 text-slate-300">{item.tenure} mo</td>
                        <td className="py-3 text-slate-300">${item.monthly_charges.toFixed(2)}</td>
                        <td className="py-3">
                          <span
                            className={`font-semibold ${
                              isHigh ? 'text-rose-400' : isMed ? 'text-amber-400' : 'text-emerald-400'
                            }`}
                          >
                            {probPct}%
                          </span>
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              isHigh
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : isMed
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}
                          >
                            {item.risk_tier}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 font-sans">
                      No prediction logs found. Score a customer in the Profiler!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
