import React, { useEffect, useState } from 'react';
import {
  Database,
  Layers,
  CheckCircle2,
  Sliders,
  FileSpreadsheet,
  Cpu,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { DatasetSummary } from '../types';
import { StatCard } from '../components/StatCard';
import { DashboardSkeleton } from '../components/SkeletonLoader';

export const DataPreprocessing: React.FC = () => {
  const [data, setData] = useState<DatasetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'preview'>('pipeline');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDatasetSummary();
      setData(res);
    } catch (e: any) {
      console.error('Failed to load dataset summary:', e);
      setError(e?.message || 'Failed to connect to backend service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="p-8 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <Database className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-white">Unable to Load Dataset Pipeline</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          {error || 'Could not retrieve data from backend.'} Ensure the FastAPI service is running on port 8000.
        </p>
        <button
          onClick={load}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const imbalanceComparisonData = [
    {
      stage: 'Raw Dataset (Before)',
      Retained: data.class_balance_raw[0]?.count || 5174,
      Churned: data.class_balance_raw[1]?.count || 1869,
    },
    {
      stage: 'SMOTE Resampled (After)',
      Retained: data.class_balance_resampled[0]?.count || 5174,
      Churned: data.class_balance_resampled[1]?.count || 5174,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Dataset Dimensions"
          value={`${data.total_rows.toLocaleString()} × ${data.total_columns}`}
          subtitle="7,043 observation rows across 21 columns"
          badgeText="IBM Telco"
          badgeVariant="indigo"
          icon={Database}
        />
        <StatCard
          title="Missing TotalCharges"
          value={data.missing_values_handled.TotalCharges_missing}
          subtitle="Cleaned & imputed with zero for 0-mo tenure"
          badgeText="100% Cleaned"
          badgeVariant="success"
          icon={CheckCircle2}
        />
        <StatCard
          title="Raw Churn Ratio"
          value="2.77 : 1"
          subtitle="5,174 Retained vs 1,869 Churned"
          badgeText="Class Imbalance"
          badgeVariant="warning"
          icon={Sliders}
        />
        <StatCard
          title="Encoded Features"
          value="30 Features"
          subtitle="Expanded via dummy one-hot encoding"
          badgeText="StandardScaled"
          badgeVariant="indigo"
          icon={Layers}
        />
      </div>

      {/* Class Imbalance Resolution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Imbalance Chart */}
        <div className="lg:col-span-7 bg-[#0f172a]/70 border border-slate-800/80 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Class Imbalance Mitigation (SMOTE)</h2>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                Synthetic Resampling
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Comparison of training class distributions before vs after Synthetic Minority Over-sampling Technique (SMOTE).
            </p>
          </div>

          <div className="h-64 w-full my-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={imbalanceComparisonData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="stage" stroke="#64748b" fontSize={11} />
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
                <Bar dataKey="Retained" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Churned" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-300">
            <strong className="text-white">Why SMOTE over simple class weights?</strong> SMOTE creates realistic synthetic feature vectors in continuous feature space along the line segments connecting the <em>k</em>-nearest minority neighbors, avoiding decision tree branch collapse and improving minority class recall (Sensitivity).
          </div>
        </div>

        {/* Pipeline Architecture Steps */}
        <div className="lg:col-span-5 bg-[#0f172a]/70 border border-slate-800/80 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white mb-1">Preprocessing Pipeline Stages</h2>
            <p className="text-xs text-slate-400 mb-4">
              Deterministic, leak-free pipeline applied before feeding models:
            </p>

            <div className="space-y-3">
              {data.preprocessing_steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="text-xs font-semibold text-indigo-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    {step.step}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Raw Sample Inspection & Feature Categorization */}
      <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Feature Space & Sample Dataset Inspection</h2>
            <p className="text-xs text-slate-400">Examine raw records prior to vectorization</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeTab === 'pipeline'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Feature Schema ({data.categorical_features.length + data.numerical_features.length})
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeTab === 'preview'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Raw Rows Sample (10)
            </button>
          </div>
        </div>

        {activeTab === 'pipeline' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Continuous Numerical Features (StandardScaled)
              </div>
              <div className="flex flex-wrap gap-2">
                {data.numerical_features.map((feat) => (
                  <span
                    key={feat}
                    className="px-2.5 py-1 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-800/40 text-xs font-mono"
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Categorical Dimensions (One-Hot Encoded)
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {data.categorical_features.map((feat) => (
                  <span
                    key={feat}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/50 text-[11px]"
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-3 pl-2">Customer ID</th>
                  <th className="pb-3">Gender</th>
                  <th className="pb-3">Tenure</th>
                  <th className="pb-3">Contract</th>
                  <th className="pb-3">Internet</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3">Monthly</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Churn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 font-mono">
                {data.sample_rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/20">
                    <td className="py-2.5 pl-2 text-white font-medium">{row.customerID}</td>
                    <td className="py-2.5 text-slate-300 font-sans">{row.gender}</td>
                    <td className="py-2.5 text-slate-300">{row.tenure} mo</td>
                    <td className="py-2.5 text-slate-300 font-sans">{row.Contract}</td>
                    <td className="py-2.5 text-slate-300 font-sans">{row.InternetService}</td>
                    <td className="py-2.5 text-slate-300 font-sans">{row.PaymentMethod}</td>
                    <td className="py-2.5 text-slate-300">${row.MonthlyCharges}</td>
                    <td className="py-2.5 text-slate-300">${row.TotalCharges}</td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          row.Churn === 'Yes'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {row.Churn}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
