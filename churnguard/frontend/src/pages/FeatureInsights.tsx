import React, { useEffect, useState } from 'react';
import {
  Lightbulb,
  TrendingUp,
  AlertOctagon,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { api } from '../services/api';
import { InsightsResponse } from '../types';
import { DashboardSkeleton } from '../components/SkeletonLoader';

export const FeatureInsights: React.FC = () => {
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getInsights();
        setData(res);
      } catch (err) {
        console.error('Failed to load insights:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !data) {
    return <DashboardSkeleton />;
  }

  // Format feature importances for horizontal bar chart
  const importanceChartData = (data.feature_importances || [])
    .slice(0, 10)
    .map((item) => ({
      feature: item.feature
        .replace('_', ' ')
        .replace('Contract_', 'Contract: ')
        .replace('InternetService_', 'Internet: ')
        .replace('PaymentMethod_', 'Pay: '),
      importance: Number((item.importance * 100).toFixed(1)),
    }))
    .reverse();

  const impactBadgeStyles: Record<string, string> = {
    Critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    High: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Medium: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    Low: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-[#0f172a] border border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Lightbulb className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white tracking-tight">
              Predictive Feature Rankings & Business Insights
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Derived directly from tree-based Gini gain & gradient split importances ({data.model_source}).
            Translating mathematical ensemble features into concrete retention operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 block font-mono">Algorithm Source</span>
            <span className="text-xs font-semibold text-emerald-400 font-mono">{data.model_source}</span>
          </div>
        </div>
      </div>

      {/* Feature Importance Horizontal Bar Chart */}
      <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Global Feature Importance Ranking</h3>
            <p className="text-xs text-slate-400">Relative contribution to ensemble tree split purity</p>
          </div>
          <span className="text-xs font-mono text-slate-400">Split Gain (%)</span>
        </div>

        <div className="h-80 w-full my-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={importanceChartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#64748b" fontSize={11} domain={[0, 'dataMax + 5']} />
              <YAxis
                dataKey="feature"
                type="category"
                stroke="#94a3b8"
                fontSize={11}
                tick={{ fill: '#cbd5e1' }}
                width={140}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="importance" name="Relative Gain (%)" fill="#6366f1" radius={[0, 4, 4, 0]}>
                {importanceChartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index >= importanceChartData.length - 3 ? '#818cf8' : '#6366f1'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Top Predictors: Contract Type, Tenure, and Internet Service tier.</span>
          <span className="font-mono text-indigo-400">Mean Decrease Impurity (MDI)</span>
        </div>
      </div>

      {/* Domain Narrative Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.narrative_insights.map((insight) => (
          <div
            key={insight.id}
            className="bg-[#0f172a]/70 border border-slate-800/80 rounded-xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${impactBadgeStyles[insight.impact_level]}`}>
                  {insight.impact_level} Priority
                </span>
                <div className="text-right">
                  <div className="text-lg font-bold font-mono text-white">{insight.metric}</div>
                  <div className="text-[10px] text-slate-400">{insight.metric_label}</div>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                {insight.title}
              </h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{insight.summary}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 bg-slate-900/50 -mx-6 -mb-6 p-4 rounded-b-xl">
              <div className="text-[10px] uppercase font-semibold text-indigo-400 tracking-wider mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Recommended Business Intervention
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">{insight.action}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
