import axios from 'axios';
import {
  DatasetSummary,
  ModelRun,
  ModelComparisonItem,
  RocCurve,
  Recommendation,
  CustomerInput,
  PredictionResponse,
  PredictionHistoryItem,
  InsightsResponse
} from '../types';

// Use direct backend connection in browser to prevent Node proxy EPERM issues
const getApiBase = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    return `http://${host || '127.0.0.1'}:8000/api`;
  }
  return 'http://127.0.0.1:8000/api';
};

const client = axios.create({
  baseURL: getApiBase(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Health
  checkHealth: async () => {
    const res = await client.get('/health');
    return res.data;
  },

  // Dataset
  getDatasetSummary: async (): Promise<DatasetSummary> => {
    const res = await client.get<DatasetSummary>('/dataset/summary');
    return res.data;
  },

  // Models
  getModelRuns: async (): Promise<ModelRun[]> => {
    const res = await client.get<ModelRun[]>('/models/runs');
    return res.data;
  },

  getModelComparison: async (): Promise<ModelComparisonItem[]> => {
    const res = await client.get<ModelComparisonItem[]>('/models/comparison');
    return res.data;
  },

  getRocComparison: async (): Promise<RocCurve[]> => {
    const res = await client.get<RocCurve[]>('/models/roc-comparison');
    return res.data;
  },

  getKFoldComparison: async (): Promise<any[]> => {
    const res = await client.get('/models/kfold-comparison');
    return res.data;
  },

  getRecommendation: async (): Promise<Recommendation> => {
    const res = await client.get<Recommendation>('/models/recommendation');
    return res.data;
  },

  getModelMetrics: async (runId: string): Promise<ModelRun> => {
    const res = await client.get<ModelRun>(`/models/${runId}/metrics`);
    return res.data;
  },

  trainModel: async (modelKey: string, useSmote: boolean = true): Promise<ModelRun> => {
    const res = await client.post<ModelRun>('/models/train', {
      model_key: modelKey,
      use_smote: useSmote,
    });
    return res.data;
  },

  // Predictions
  predictChurn: async (customer: CustomerInput, modelKey: string = 'xgboost'): Promise<PredictionResponse> => {
    const res = await client.post<PredictionResponse>(`/predict?model_key=${encodeURIComponent(modelKey)}`, customer);
    return res.data;
  },

  getPredictionHistory: async (limit: number = 10): Promise<PredictionHistoryItem[]> => {
    const res = await client.get<PredictionHistoryItem[]>(`/predictions/history?limit=${limit}`);
    return res.data;
  },

  // Insights
  getInsights: async (): Promise<InsightsResponse> => {
    const res = await client.get<InsightsResponse>('/insights');
    return res.data;
  },
};
