import React, { useState } from 'react';
import {
  UserCheck,
  Zap,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { CustomerInput, PredictionResponse } from '../types';
import { RiskGauge } from '../components/RiskGauge';

const PRESET_PERSONAS = [
  {
    name: 'High Risk Churner',
    tag: 'Flight Risk (~85%)',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    data: {
      gender: 'Female',
      SeniorCitizen: 0,
      Partner: 'No',
      Dependents: 'No',
      tenure: 2,
      PhoneService: 'Yes',
      MultipleLines: 'No',
      InternetService: 'Fiber optic',
      OnlineSecurity: 'No',
      OnlineBackup: 'No',
      DeviceProtection: 'No',
      TechSupport: 'No',
      StreamingTV: 'Yes',
      StreamingMovies: 'Yes',
      Contract: 'Month-to-month',
      PaperlessBilling: 'Yes',
      PaymentMethod: 'Electronic check',
      MonthlyCharges: 89.85,
    },
  },
  {
    name: 'Loyal Long-Term VIP',
    tag: 'Safe Loyal (~4%)',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    data: {
      gender: 'Male',
      SeniorCitizen: 0,
      Partner: 'Yes',
      Dependents: 'Yes',
      tenure: 64,
      PhoneService: 'Yes',
      MultipleLines: 'Yes',
      InternetService: 'DSL',
      OnlineSecurity: 'Yes',
      OnlineBackup: 'Yes',
      DeviceProtection: 'Yes',
      TechSupport: 'Yes',
      StreamingTV: 'Yes',
      StreamingMovies: 'Yes',
      Contract: 'Two year',
      PaperlessBilling: 'No',
      PaymentMethod: 'Credit card (automatic)',
      MonthlyCharges: 65.40,
    },
  },
  {
    name: 'Moderate Risk Streamer',
    tag: 'Borderline (~45%)',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    data: {
      gender: 'Female',
      SeniorCitizen: 1,
      Partner: 'No',
      Dependents: 'No',
      tenure: 18,
      PhoneService: 'Yes',
      MultipleLines: 'Yes',
      InternetService: 'Fiber optic',
      OnlineSecurity: 'Yes',
      OnlineBackup: 'No',
      DeviceProtection: 'Yes',
      TechSupport: 'No',
      StreamingTV: 'Yes',
      StreamingMovies: 'No',
      Contract: 'One year',
      PaperlessBilling: 'Yes',
      PaymentMethod: 'Bank transfer (automatic)',
      MonthlyCharges: 78.20,
    },
  },
];

export const PredictionTryIt: React.FC = () => {
  const [form, setForm] = useState<CustomerInput>(PRESET_PERSONAS[0].data);
  const [selectedModel, setSelectedModel] = useState<string>('xgboost');
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null);

  const handleChange = (field: keyof CustomerInput, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyPreset = (presetData: CustomerInput) => {
    setForm(presetData);
    setPredictionResult(null);
  };

  const handlePredict = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await api.predictChurn(form, selectedModel);
      setPredictionResult(res);
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Persona Presets Row */}
      <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-semibold text-white uppercase tracking-wider">
              Quick-Fill Customer Personas
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Click to load realistic sample profiles</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRESET_PERSONAS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p.data)}
              className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-white group-hover:text-indigo-300">
                  {p.name}
                </span>
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${p.badgeClass}`}>
                  {p.tag}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {p.data.Contract} • {p.data.tenure}mo • ${p.data.MonthlyCharges}/mo
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form on Left, Output & Drivers on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Input Form (7 cols) */}
        <form
          onSubmit={handlePredict}
          className="lg:col-span-7 bg-[#0f172a]/70 border border-slate-800/80 rounded-xl p-6 space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                Customer Subscription Profiler
              </h2>
              <p className="text-xs text-slate-400">Configure parameters to generate real-time churn inference</p>
            </div>

            {/* Model Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Scoring Engine:</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-medium focus:ring-1 focus:ring-indigo-500"
              >
                <option value="xgboost">XGBoost (Champion)</option>
                <option value="stacking">Stacking Ensemble</option>
                <option value="random_forest">Random Forest</option>
                <option value="gradient_boosting">Gradient Boosting</option>
                <option value="adaboost">AdaBoost</option>
                <option value="logistic_regression">Logistic Regression</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Tenure */}
            <div>
              <label className="text-slate-300 font-medium block mb-1.5">
                Tenure ({form.tenure} months)
              </label>
              <input
                type="range"
                min={1}
                max={72}
                value={form.tenure}
                onChange={(e) => handleChange('tenure', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                <span>1 mo</span>
                <span>36 mo</span>
                <span>72 mo</span>
              </div>
            </div>

            {/* Monthly Charges */}
            <div>
              <label className="text-slate-300 font-medium block mb-1.5">
                Monthly Charges (${form.MonthlyCharges.toFixed(2)})
              </label>
              <input
                type="range"
                min={18}
                max={120}
                step={0.5}
                value={form.MonthlyCharges}
                onChange={(e) => handleChange('MonthlyCharges', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                <span>$18.00</span>
                <span>$70.00</span>
                <span>$120.00</span>
              </div>
            </div>

            {/* Contract Type */}
            <div>
              <label className="text-slate-300 font-medium block mb-1">Contract Duration</label>
              <select
                value={form.Contract}
                onChange={(e) => handleChange('Contract', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Month-to-month">Month-to-month (High Risk)</option>
                <option value="One year">One year</option>
                <option value="Two year">Two year (Low Risk)</option>
              </select>
            </div>

            {/* Internet Service */}
            <div>
              <label className="text-slate-300 font-medium block mb-1">Internet Service</label>
              <select
                value={form.InternetService}
                onChange={(e) => handleChange('InternetService', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Fiber optic">Fiber optic (High Bandwidth)</option>
                <option value="DSL">DSL</option>
                <option value="No">No Internet Service</option>
              </select>
            </div>

            {/* Tech Support */}
            <div>
              <label className="text-slate-300 font-medium block mb-1">Tech Support</label>
              <select
                value={form.TechSupport}
                onChange={(e) => handleChange('TechSupport', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No internet service">No Internet Service</option>
              </select>
            </div>

            {/* Online Security */}
            <div>
              <label className="text-slate-300 font-medium block mb-1">Online Security</label>
              <select
                value={form.OnlineSecurity}
                onChange={(e) => handleChange('OnlineSecurity', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No internet service">No Internet Service</option>
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="text-slate-300 font-medium block mb-1">Payment Method</label>
              <select
                value={form.PaymentMethod}
                onChange={(e) => handleChange('PaymentMethod', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Electronic check">Electronic check (Manual)</option>
                <option value="Mailed check">Mailed check</option>
                <option value="Bank transfer (automatic)">Bank transfer (automatic)</option>
                <option value="Credit card (automatic)">Credit card (automatic)</option>
              </select>
            </div>

            {/* Paperless Billing */}
            <div>
              <label className="text-slate-300 font-medium block mb-1">Paperless Billing</label>
              <select
                value={form.PaperlessBilling}
                onChange={(e) => handleChange('PaperlessBilling', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Senior Citizen */}
            <div>
              <label className="text-slate-300 font-medium block mb-1">Senior Citizen</label>
              <select
                value={form.SeniorCitizen}
                onChange={(e) => handleChange('SeniorCitizen', parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              >
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            {/* Partner / Dependents */}
            <div>
              <label className="text-slate-300 font-medium block mb-1">Partner & Family</label>
              <select
                value={form.Partner}
                onChange={(e) => handleChange('Partner', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="No">No Partner</option>
                <option value="Yes">Has Partner</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Calculating Inference...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  Evaluate Churn Probability
                </>
              )}
            </button>
          </div>
        </form>

        {/* Prediction Results & Explanation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {predictionResult ? (
            <>
              {/* Risk Gauge */}
              <RiskGauge
                score={predictionResult.churn_probability}
                tier={predictionResult.risk_tier}
                modelName={predictionResult.model_used}
              />

              {/* Explainable Feature Attribution Breakdown */}
              <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    Key Decision Drivers
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">Local Attribution</span>
                </div>

                <div className="space-y-2">
                  {predictionResult.key_drivers.map((d, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-200">{d.feature}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                            d.impact.includes('High Risk')
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : d.impact.includes('Protective')
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {d.impact}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{d.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proactive Retention Playbook */}
              {predictionResult.retention_recommendations.length > 0 && (
                <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    Recommended Retention Actions
                  </div>
                  <ul className="space-y-2">
                    {predictionResult.retention_recommendations.map((rec, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-300 flex items-start gap-2 bg-indigo-950/20 border border-indigo-500/20 p-2.5 rounded-lg"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">No Prediction Evaluated Yet</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Select a persona preset above or adjust subscriber features and click "Evaluate Churn Probability".
                </p>
              </div>
              <button
                type="button"
                onClick={() => handlePredict()}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Run Default Persona Inference
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
