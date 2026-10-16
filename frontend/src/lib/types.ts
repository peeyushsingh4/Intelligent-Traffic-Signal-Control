export type TransactionType = 'PAYMENT' | 'TRANSFER' | 'CASH_OUT' | 'CASH_IN' | 'DEBIT';

export interface Transaction {
  transaction_id: string;
  step: number;
  type: TransactionType;
  amount: number;
  nameOrig: string;
  oldbalanceOrg: number;
  newbalanceOrig: number;
  nameDest: string;
  oldbalanceDest: number;
  newbalanceDest: number;
  isFraud: number;
  isFlaggedFraud: number;
  is_flagged: boolean;
  risk_score: number;
  flags: string[];
  timestamp: number;
}

export interface BloomFilterStats {
  expected_elements: number;
  target_false_positive_rate: number;
  bit_array_size_m: number;
  hash_functions_count_k: number;
  inserted_count: number;
  set_bits_count: number;
  fill_rate: number;
  estimated_current_fpr: number;
  memory_usage_bytes: number;
}

export interface FlajoletMartinStats {
  num_hashes_m: number;
  num_groups: number;
  group_size: number;
  hash_bits: number;
  phi_constant: number;
  total_processed: number;
  estimated_distinct_accounts: number;
  max_trailing_zeros_distribution: number[];
  theoretical_std_error: number;
  memory_usage_bytes: number;
}

export interface DGIMStats {
  window_size_n: number;
  high_value_threshold: number;
  current_time: number;
  total_active_buckets: number;
  estimated_high_value_count: number;
  exact_high_value_count: number;
  absolute_error: number;
  relative_error_pct: number;
  theoretical_max_error_pct: number;
  bucket_sizes_breakdown: Record<number, number>;
  memory_usage_bytes: number;
}

export interface StreamStats {
  state: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
  speed: number;
  total_processed: number;
  total_flagged: number;
  total_volume: number;
  current_rate: number;
  bloom_filter: BloomFilterStats;
  flajolet_martin: FlajoletMartinStats;
  dgim: DGIMStats;
}

export interface GraphNode {
  id: string;
  label: string;
  role: 'SOURCE' | 'DESTINATION' | 'MULE_HUB' | 'MEMBER';
  is_flagged: boolean;
  volume: number;
  in_degree: number;
  out_degree: number;
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  weight: number;
  count: number;
  is_fraud: boolean;
}

export interface FraudCluster {
  cluster_id: string;
  size: number;
  edge_count: number;
  density: number;
  suspicion_score: number;
  total_volume: number;
  cycle_count: number;
  fraud_edges: number;
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface FlaggedEvent {
  event_id: string;
  transaction_id: string;
  account_id: string;
  destination_id: string;
  amount: number;
  flags: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risk_score: number;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
  has_more?: boolean;
}
