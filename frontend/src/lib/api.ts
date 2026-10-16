import {
  Transaction,
  StreamStats,
  PaginatedResponse,
  FraudCluster,
  FlaggedEvent,
} from './types';

const API_BASE = import.meta.env.VITE_API_URL || '';

async function safeFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!res.ok) {
      // Safe generic error handling: do not display stack traces
      throw new Error(`Request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err instanceof Error ? err.message : 'Network error');
    throw err;
  }
}

export const api = {
  getHealth: () => safeFetch<{ status: string; database: string; is_mock_db: boolean; environment: string; stream_state: string }>('/api/health'),

  getStreamStatus: () => safeFetch<StreamStats>('/api/stream/status'),

  startStream: () => safeFetch<{ message: string; state: string }>('/api/stream/start', { method: 'POST' }),

  pauseStream: () => safeFetch<{ message: string; state: string }>('/api/stream/pause', { method: 'POST' }),

  resetStream: () => safeFetch<{ message: string; state: string }>('/api/stream/reset', { method: 'POST' }),

  setSpeed: (speed: number) =>
    safeFetch<{ message: string; speed: number }>('/api/stream/speed', {
      method: 'POST',
      body: JSON.stringify({ speed }),
    }),

  getTransactions: (params: {
    skip?: number;
    limit?: number;
    search?: string;
    flagged_only?: boolean;
    type?: string;
  }) => {
    const query = new URLSearchParams();
    if (params.skip !== undefined) query.set('skip', String(params.skip));
    if (params.limit !== undefined) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    if (params.flagged_only) query.set('flagged_only', 'true');
    if (params.type && params.type !== 'ALL') query.set('type', params.type);
    return safeFetch<PaginatedResponse<Transaction>>(`/api/transactions?${query.toString()}`);
  },

  getFlagged: (skip = 0, limit = 50, severity?: string) => {
    const query = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    if (severity && severity !== 'ALL') query.set('severity', severity);
    return safeFetch<PaginatedResponse<FlaggedEvent>>(`/api/flagged?${query.toString()}`);
  },

  getAlgorithmTelemetry: () => safeFetch<Record<string, unknown>>('/api/algorithms/stats'),

  getGraphClusters: () => safeFetch<{ clusters: FraudCluster[]; total_nodes: number; total_edges: number; duration_ms: number }>('/api/graph/clusters'),

  getClusterSubgraph: (clusterId: string) => safeFetch<FraudCluster>(`/api/graph/subgraph/${clusterId}`),

  runBatchAnalytics: () => safeFetch<{
    status: string;
    total_transactions_analyzed: number;
    total_accounts_processed: number;
    anomalies_detected: number;
    top_anomalous_accounts: string[];
    duration_ms: number;
  }>('/api/analytics/run-batch', { method: 'POST' }),

  getAnalyticsSummary: () => safeFetch<{
    type_breakdown: Array<{ type: string; count: number; total_volume: number; fraud_count: number }>;
    total_transactions: number;
    total_flagged: number;
    fraud_ratio_pct: number;
  }>('/api/analytics/summary'),
};
