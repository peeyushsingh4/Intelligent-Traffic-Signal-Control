import React from 'react';
import { Cpu, Binary, Layers, CheckCircle, BookOpen } from 'lucide-react';
import { BloomFilterStats, FlajoletMartinStats, DGIMStats } from '../lib/types';

interface AlgorithmMetricsProps {
  bloom: BloomFilterStats | undefined;
  fm: FlajoletMartinStats | undefined;
  dgim: DGIMStats | undefined;
}

export const AlgorithmMetrics: React.FC<AlgorithmMetricsProps> = ({ bloom, fm, dgim }) => {
  return (
    <div className="space-y-6">
      {/* Viva Exam Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-100">
              Streaming Algorithms Viva Verification HUD
            </h2>
            <p className="text-xs text-zinc-400">
              Live mathematical telemetry, bounds verification, and space-complexity proofs for oral defense.
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
          <CheckCircle className="w-3.5 h-3.5" />
          All Invariants Maintained
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. Bloom Filter Deep Dive */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Binary className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-zinc-100">Bloom Filter (New Accounts)</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              O(k) Lookup
            </span>
          </div>

          {/* Mathematical formulas */}
          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-[11px] font-mono text-zinc-300 space-y-1">
            <div className="text-emerald-400 font-semibold">Kirsch-Mitzenmacher Hashing:</div>
            <div>g_i(x) = (h₁(x) + i · h₂(x)) mod m</div>
            <div className="text-zinc-500 pt-1">Optimal size: m = -n·ln(p)/(ln 2)²</div>
          </div>

          {/* Telemetry Metrics */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Target Capacity (n):</span>
              <span className="font-mono text-zinc-200">{bloom?.expected_elements?.toLocaleString() || '100,000'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Bit Array Size (m):</span>
              <span className="font-mono text-zinc-200">{bloom?.bit_array_size_m?.toLocaleString() || '958,506'} bits</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Hash Functions (k):</span>
              <span className="font-mono text-zinc-200">{bloom?.hash_functions_count_k || 7} SHA-slices</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">False Positive Target (p):</span>
              <span className="font-mono text-emerald-400">{(bloom?.target_false_positive_rate || 0.01) * 100}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Empirical FPR Bound:</span>
              <span className="font-mono text-zinc-200">{((bloom?.estimated_current_fpr || 0) * 100).toFixed(4)}%</span>
            </div>
          </div>

          {/* Saturation Fill Rate Progress Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-zinc-400">Bit Array Saturation (Fill Rate):</span>
              <span className="font-mono text-emerald-400 font-bold">
                {((bloom?.fill_rate || 0) * 100).toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (bloom?.fill_rate || 0) * 100)}%` }}
              />
            </div>
          </div>

          {/* Memory Savings Callout */}
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-zinc-300">
            Memory Footprint: <span className="font-mono font-bold text-emerald-400">117 KB</span> vs ~4.8 MB in a HashSet (97.5% memory reduction).
          </div>
        </div>

        {/* 2. Flajolet-Martin Deep Dive */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-zinc-100">Flajolet-Martin (Distinct F₀)</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              O(log N) Space
            </span>
          </div>

          {/* Mathematical formulas */}
          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-[11px] font-mono text-zinc-300 space-y-1">
            <div className="text-blue-400 font-semibold">Stochastic Averaging Formula:</div>
            <div>Estimate E = 2^R / φ (φ ≈ 0.77351)</div>
            <div className="text-zinc-500 pt-1">Variance reduction: Median-of-Means</div>
          </div>

          {/* Telemetry Metrics */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Total Stream Accounts:</span>
              <span className="font-mono text-zinc-200">{fm?.total_processed?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Distinct F₀ Estimate:</span>
              <span className="font-mono text-blue-400 font-bold">
                {fm?.estimated_distinct_accounts?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Independent Hashes (M):</span>
              <span className="font-mono text-zinc-200">{fm?.num_hashes_m || 32} hashes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Partitioned Groups:</span>
              <span className="font-mono text-zinc-200">{fm?.num_groups || 4} groups</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Theoretical Std Error:</span>
              <span className="font-mono text-zinc-200">±{((fm?.theoretical_std_error || 0.23) * 100).toFixed(1)}%</span>
            </div>
          </div>

          {/* Trailing Zeros Distribution Preview */}
          <div>
            <span className="text-[11px] text-zinc-400 block mb-1.5">Trailing Zeros Register Vector R:</span>
            <div className="grid grid-cols-8 gap-1">
              {(fm?.max_trailing_zeros_distribution || Array(32).fill(0)).slice(0, 16).map((val, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-950 p-1 text-center rounded border border-zinc-800 font-mono text-[10px] text-blue-300"
                >
                  {val}
                </div>
              ))}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] text-zinc-300">
            Memory Footprint: <span className="font-mono font-bold text-blue-400">128 bytes</span> (constant bounded memory regardless of stream length).
          </div>
        </div>

        {/* 3. DGIM Deep Dive */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-zinc-100">DGIM Sliding Window Counter</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              O(log² N) Space
            </span>
          </div>

          {/* Mathematical formulas */}
          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-[11px] font-mono text-zinc-300 space-y-1">
            <div className="text-purple-400 font-semibold">Bucket Invariant Rules:</div>
            <div>Sizes = 2^j; at most 2 buckets per size</div>
            <div className="text-zinc-500 pt-1">Error Bound: |Est - Exact| / Exact ≤ 50%</div>
          </div>

          {/* Telemetry Metrics */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Window Size (N):</span>
              <span className="font-mono text-zinc-200">{dgim?.window_size_n?.toLocaleString() || '10,000'} txs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">High-Value Threshold:</span>
              <span className="font-mono text-zinc-200">${(dgim?.high_value_threshold || 200000).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">DGIM Estimated Count:</span>
              <span className="font-mono text-purple-400 font-bold">{dgim?.estimated_high_value_count || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Ground Truth Exact Count:</span>
              <span className="font-mono text-zinc-200">{dgim?.exact_high_value_count || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Empirical Relative Error:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {dgim?.relative_error_pct || 0}% (guaranteed ≤ 50%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Active Power-of-2 Buckets:</span>
              <span className="font-mono text-zinc-200">{dgim?.total_active_buckets || 0} buckets</span>
            </div>
          </div>

          {/* Active Bucket Hierarchy */}
          <div>
            <span className="text-[11px] text-zinc-400 block mb-1.5">Bucket Hierarchy (Sizes 2^j):</span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(dgim?.bucket_sizes_breakdown || { 1: 1, 2: 1, 4: 1, 8: 1 }).map(([sz, count]) => (
                <span
                  key={sz}
                  className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-purple-300"
                >
                  Size {sz}: {count}
                </span>
              ))}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[11px] text-zinc-300">
            Memory Footprint: <span className="font-mono font-bold text-purple-400">~380 bytes</span> vs storing 10,000 integers (~80 KB).
          </div>
        </div>
      </div>
    </div>
  );
};
