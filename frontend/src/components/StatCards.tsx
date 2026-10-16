import React from 'react';
import { Users, AlertTriangle, Coins, TrendingUp } from 'lucide-react';
import { StreamStats } from '../lib/types';

interface StatCardsProps {
  stats: StreamStats | null;
}

export const StatCards: React.FC<StatCardsProps> = ({ stats }) => {
  const totalProcessed = stats?.total_processed || 0;
  const totalFlagged = stats?.total_flagged || 0;
  const totalVolume = stats?.total_volume || 0;
  const fmEstimate = stats?.flajolet_martin?.estimated_distinct_accounts || 0;
  const dgimEstimate = stats?.dgim?.estimated_high_value_count || 0;
  const dgimExact = stats?.dgim?.exact_high_value_count || 0;
  const bloomFill = (stats?.bloom_filter?.fill_rate || 0) * 100;
  const fraudRatio = totalProcessed > 0 ? (totalFlagged / totalProcessed) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Volume & Processed */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl p-5 transition-all shadow-sm">
        <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-2">
          <span>STREAM VOLUME</span>
          <span className="p-1.5 rounded-lg bg-zinc-800/60 text-emerald-400">
            <Coins className="w-4 h-4" />
          </span>
        </div>
        <div className="text-2xl font-bold font-mono text-zinc-100 mb-1 tracking-tight">
          ${totalVolume >= 1000000 ? `${(totalVolume / 1000000).toFixed(2)}M` : totalVolume.toLocaleString()}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span className="text-emerald-400 font-mono font-medium">
            {totalProcessed.toLocaleString()}
          </span>
          <span>transactions ingested</span>
        </div>
      </div>

      {/* 2. Flajolet-Martin Distinct Accounts */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl p-5 transition-all shadow-sm">
        <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-2">
          <span className="flex items-center gap-1">
            DISTINCT ACCOUNTS
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">
              FM F₀
            </span>
          </span>
          <span className="p-1.5 rounded-lg bg-zinc-800/60 text-blue-400">
            <Users className="w-4 h-4" />
          </span>
        </div>
        <div className="text-2xl font-bold font-mono text-zinc-100 mb-1 tracking-tight">
          {fmEstimate.toLocaleString()}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span>Stochastic avg via</span>
          <span className="text-blue-400 font-mono">
            {stats?.flajolet_martin?.num_hashes_m || 32} hashes
          </span>
        </div>
      </div>

      {/* 3. DGIM High-Value Sliding Window */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl p-5 transition-all shadow-sm">
        <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-2">
          <span className="flex items-center gap-1">
            LARGE TXS (&gt;$200K)
            <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-1 py-0.2 rounded border border-purple-500/20">
              DGIM N={stats?.dgim?.window_size_n || 10000}
            </span>
          </span>
          <span className="p-1.5 rounded-lg bg-zinc-800/60 text-purple-400">
            <TrendingUp className="w-4 h-4" />
          </span>
        </div>
        <div className="text-2xl font-bold font-mono text-zinc-100 mb-1 tracking-tight">
          {dgimEstimate}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span>Exact in window:</span>
          <span className="text-purple-300 font-mono">{dgimExact}</span>
          <span className="text-[11px] text-zinc-400">
            ({stats?.dgim?.relative_error_pct ?? 0}% err)
          </span>
        </div>
      </div>

      {/* 4. Flagged Fraud & Bloom Saturation */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl p-5 transition-all shadow-sm">
        <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-2">
          <span>FLAGGED ANOMALIES</span>
          <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-4 h-4" />
          </span>
        </div>
        <div className="text-2xl font-bold font-mono text-rose-400 mb-1 tracking-tight">
          {totalFlagged.toLocaleString()}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span className="text-rose-400 font-mono">{fraudRatio.toFixed(1)}%</span>
          <span>flagged</span>
          <span className="text-zinc-600">|</span>
          <span>Bloom fill:</span>
          <span className="text-zinc-300 font-mono">{bloomFill.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};
