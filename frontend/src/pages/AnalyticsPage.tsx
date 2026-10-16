import React from 'react';
import { AlgorithmMetrics } from '../components/AlgorithmMetrics';
import { AnalyticsCharts } from '../components/AnalyticsCharts';
import { StreamStats } from '../lib/types';

interface AnalyticsPageProps {
  stats: StreamStats | null;
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

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  stats,
  summary,
  onTriggerBatch,
  isBatchRunning,
  batchResult,
}) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-bold text-zinc-100">Streaming Telemetry & Batch Analytics</h2>
        <p className="text-xs text-zinc-400">
          Rigorous mathematical proofs, streaming algorithms error bounds, and historical statistical distributions.
        </p>
      </div>

      {/* Viva Mathematical Proof HUD */}
      <AlgorithmMetrics
        bloom={stats?.bloom_filter}
        fm={stats?.flajolet_martin}
        dgim={stats?.dgim}
      />

      {/* Batch Processing & Distribution Visualizations */}
      <AnalyticsCharts
        summary={summary}
        onTriggerBatch={onTriggerBatch}
        isBatchRunning={isBatchRunning}
        batchResult={batchResult}
      />
    </div>
  );
};
