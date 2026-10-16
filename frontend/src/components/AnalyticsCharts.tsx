import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { Play, Sparkles, TrendingUp, PieChart as PieIcon } from 'lucide-react';

interface AnalyticsChartsProps {
  summary: {
    type_breakdown: Array<{ type: string; count: number; total_volume: number; fraud_count: number }>;
    total_transactions: number;
    total_flagged: number;
    fraud_ratio_pct: number;
  } | null;
  onTriggerBatch: () => void;
  isBatchRunning: boolean;
  batchResult: {
    total_transactions_analyzed: number;
    total_accounts_processed: number;
    anomalies_detected: number;
    top_anomalous_accounts: string[];
    duration_ms: number;
  } | null;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  summary,
  onTriggerBatch,
  isBatchRunning,
  batchResult,
}) => {
  const chartData = summary?.type_breakdown || [];

  const pieData = [
    { name: 'Clean Transactions', value: Math.max(0, (summary?.total_transactions || 0) - (summary?.total_flagged || 0)) },
    { name: 'Flagged Anomalies', value: summary?.total_flagged || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Batch Analytics Trigger Header */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-zinc-100">Batch Aggregation & Z-Score Anomaly Engine</h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Aggregates transacting accounts, computes mean/std-dev, and flags accounts with transaction amounts &gt; 3σ (z &gt; 3.0).
          </p>
        </div>

        <button
          onClick={onTriggerBatch}
          disabled={isBatchRunning}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 text-zinc-950 font-semibold text-xs rounded-lg transition-all shadow-md shadow-emerald-500/20 cursor-pointer disabled:cursor-not-allowed"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isBatchRunning ? 'animate-spin' : ''}`} />
          {isBatchRunning ? 'Executing Pandas Aggregations...' : 'Run Batch Anomaly Job'}
        </button>
      </div>

      {/* Batch Result Report Card */}
      {batchResult && (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold font-mono text-emerald-400">BATCH RUN SUMMARY</span>
            <span className="text-xs font-mono text-zinc-400">Completed in {batchResult.duration_ms} ms</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800">
              <span className="text-zinc-500 block text-[10px]">ANALYZED TRANSACTIONS</span>
              <span className="font-mono font-bold text-zinc-100">{batchResult.total_transactions_analyzed.toLocaleString()}</span>
            </div>
            <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800">
              <span className="text-zinc-500 block text-[10px]">ACCOUNTS PROCESSED</span>
              <span className="font-mono font-bold text-zinc-100">{batchResult.total_accounts_processed.toLocaleString()}</span>
            </div>
            <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800">
              <span className="text-zinc-500 block text-[10px]">Z-SCORE ANOMALIES (&gt;3σ)</span>
              <span className="font-mono font-bold text-rose-400">{batchResult.anomalies_detected}</span>
            </div>
            <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800">
              <span className="text-zinc-500 block text-[10px]">FLAGGED ACCOUNTS</span>
              <span className="font-mono text-xs text-zinc-300 truncate block">
                {batchResult.top_anomalous_accounts.slice(0, 2).join(', ') || 'None'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bar Chart: Transaction Volume by Type */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2 text-zinc-100 text-xs font-semibold">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Volume Distribution by Transaction Type ($)</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="type" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Total Volume']}
                />
                <Bar dataKey="total_volume" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Clean vs Flagged Ratio */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2 text-zinc-100 text-xs font-semibold">
              <PieIcon className="w-4 h-4 text-rose-400" />
              <span>Clean vs Flagged Fraud Ratio</span>
            </div>
            <span className="font-mono text-xs text-rose-400 font-bold">
              {summary?.fraud_ratio_pct || 0}% Fraud Ratio
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f43f5e" />
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [Number(val).toLocaleString(), 'Transactions']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center items-center gap-6 text-xs text-zinc-400 pt-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Clean Transactions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span>Flagged Anomalies</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
