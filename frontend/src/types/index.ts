export interface ClassBalance {
  label: string;
  count: number;
  percentage: number;
}

export interface DatasetSummary {
  total_rows: number;
  total_columns: number;
  target_column: string;
  class_balance_raw: ClassBalance[];
  class_balance_resampled: ClassBalance[];
  missing_values_handled: {
    TotalCharges_missing: number;
    strategy: string;
  };
  numerical_features: string[];
  categorical_features: string[];
  sample_rows: Record<string, any>[];
  preprocessing_steps: {
    step: string;
    detail: string;
  }[];
}

export interface ConfusionMatrixData {
  matrix: number[][]; // [[TN, FP], [FN, TP]]
  tn: number;
  fp: number;
  fn: number;
  tp: number;
  labels: string[];
}

export interface RocPoint {
  fpr: number;
  tpr: number;
}

export interface RocCurve {
  model_name: string;
  model_family?: string;
  auc: number;
  points: RocPoint[];
}

export interface KFoldScores {
  folds: number[];
  mean: number;
  std: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface ModelRun {
  run_id: string;
  model_name: string;
  model_family: string;
  description?: string;
  hyperparameters: Record<string, any>;
  accuracy: number;
  precision: number;
  recall: number; // sensitivity
  specificity: number;
  f1_score: number;
  roc_auc: number;
  log_loss?: number;
  training_time_seconds: number;
  confusion_matrix: ConfusionMatrixData;
  roc_curve: RocCurve;
  kfold_scores: KFoldScores;
  feature_importances?: FeatureImportance[];
  is_champion: boolean;
  created_at: string;
}

export interface ModelComparisonItem {
  run_id: string;
  model_name: string;
  model_family: string;
  accuracy: number;
  precision: number;
  recall: number;
  specificity: number;
  f1_score: number;
  roc_auc: number;
  training_time_seconds: number;
  is_champion: boolean;
}

export interface Recommendation {
  champion_model: string;
  champion_family: string;
  champion_auc: number;
  champion_f1: number;
  rationale: string;
  strengths: string[];
  tradeoffs: string[];
  comparison_summary: string;
}

export interface CustomerInput {
  gender: string;
  SeniorCitizen: number;
  Partner: string;
  Dependents: string;
  tenure: number;
  PhoneService: string;
  MultipleLines: string;
  InternetService: string;
  OnlineSecurity: string;
  OnlineBackup: string;
  DeviceProtection: string;
  TechSupport: string;
  StreamingTV: string;
  StreamingMovies: string;
  Contract: string;
  PaperlessBilling: string;
  PaymentMethod: string;
  MonthlyCharges: number;
  TotalCharges?: number | null;
}

export interface KeyDriver {
  feature: string;
  impact: string; // "High Risk Factor", "Protective Factor", "Neutral"
  description: string;
}

export interface PredictionResponse {
  customer_id: string;
  churn_probability: number;
  churn_percentage: number;
  prediction: number;
  risk_tier: 'LOW' | 'MEDIUM' | 'HIGH';
  model_used: string;
  key_drivers: KeyDriver[];
  retention_recommendations: string[];
}

export interface PredictionHistoryItem {
  id: number;
  customer_id: string;
  churn_probability: number;
  risk_tier: 'LOW' | 'MEDIUM' | 'HIGH';
  model_used: string;
  contract: string;
  tenure: number;
  monthly_charges: number;
  created_at: string;
}

export interface NarrativeInsight {
  id: string;
  title: string;
  metric: string;
  metric_label: string;
  summary: string;
  action: string;
  impact_level: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface InsightsResponse {
  model_source: string;
  feature_importances: FeatureImportance[];
  narrative_insights: NarrativeInsight[];
}
