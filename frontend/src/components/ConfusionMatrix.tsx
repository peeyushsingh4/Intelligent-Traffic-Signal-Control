import React from 'react';
import { ConfusionMatrixData } from '../types';

interface ConfusionMatrixProps {
  data: ConfusionMatrixData;
  modelName: string;
}

export const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({ data, modelName }) => {
  const { tn, fp, fn, tp } = data;
  const total = tn + fp + fn + tp || 1;

  const tnPct = ((tn / total) * 100).toFixed(1);
  const fpPct = ((fp / total) * 100).toFixed(1);
  const fnPct = ((fn / total) * 100).toFixed(1);
  const tpPct = ((tp / total) * 100).toFixed(1);

  const sensitivity = ((tp / (tp + fn || 1)) * 100).toFixed(1); // Recall
  const specificity = ((tn / (tn + fp || 1)) * 100).toFixed(1);
  const precision = ((tp / (tp + fp || 1)) * 100).toFixed(1);
  const accuracy = (((tp + tn) / total) * 100).toFixed(1);

  return (
    <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Visual Confusion Matrix</h3>
          <p className="text-xs text-slate-400">Holdout evaluation on 20% test partition (N={total.toLocaleString()})</p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-indigo-950/40 text-indigo-400 border border-indigo-800/50">
          {modelName}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* 2x2 Heatmap Matrix */}
        <div className="space-y-2">
          {/* Header Row: Predicted */}
          <div className="grid grid-cols-3 text-center text-xs font-medium text-slate-400">
            <div className="text-left pl-2 font-mono text-[11px] text-slate-400">Actual \ Predicted</div>
            <div className="text-indigo-300 font-semibold">Pred: Retained (0)</div>
            <div className="text-rose-300 font-semibold">Pred: Churned (1)</div>
          </div>

          {/* Row 1: Actual Retained */}
          <div className="grid grid-cols-3 gap-2 items-center">
            <div className="text-xs font-semibold text-indigo-300 pl-2">
              Act: Retained (0)
            </div>
            {/* True Negative */}
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-3 text-center transition-all hover:bg-emerald-950/50 group">
              <div className="text-[11px] font-semibold text-emerald-400 group-hover:scale-105 transition-transform">
                True Negative (TN)
              </div>
              <div className="text-xl font-bold font-mono text-white mt-1">{tn.toLocaleString()}</div>
              <div className="text-[10px] text-emerald-400/80 font-mono mt-0.5">{tnPct}% of test set</div>
            </div>
            {/* False Positive */}
            <div className="bg-rose-950/20 border border-rose-500/20 rounded-lg p-3 text-center transition-all hover:bg-rose-950/30 group">
              <div className="text-[11px] font-semibold text-rose-400/90 group-hover:scale-105 transition-transform">
                False Positive (FP)
              </div>
              <div className="text-xl font-bold font-mono text-white mt-1">{fp.toLocaleString()}</div>
              <div className="text-[10px] text-rose-400/70 font-mono mt-0.5">{fpPct}% (Type I Error)</div>
            </div>
          </div>

          {/* Row 2: Actual Churned */}
          <div className="grid grid-cols-3 gap-2 items-center">
            <div className="text-xs font-semibold text-rose-300 pl-2">
              Act: Churned (1)
            </div>
            {/* False Negative */}
            <div className="bg-rose-950/30 border border-rose-500/30 rounded-lg p-3 text-center transition-all hover:bg-rose-950/40 group">
              <div className="text-[11px] font-semibold text-rose-400 group-hover:scale-105 transition-transform">
                False Negative (FN)
              </div>
              <div className="text-xl font-bold font-mono text-white mt-1">{fn.toLocaleString()}</div>
              <div className="text-[10px] text-rose-400/70 font-mono mt-0.5">{fnPct}% (Missed Churn)</div>
            </div>
            {/* True Positive */}
            <div className="bg-indigo-950/40 border border-indigo-500/40 rounded-lg p-3 text-center transition-all hover:bg-indigo-950/60 group">
              <div className="text-[11px] font-semibold text-indigo-400 group-hover:scale-105 transition-transform">
                True Positive (TP)
              </div>
              <div className="text-xl font-bold font-mono text-white mt-1">{tp.toLocaleString()}</div>
              <div className="text-[10px] text-indigo-400/80 font-mono mt-0.5">{tpPct}% of test set</div>
            </div>
          </div>
        </div>

        {/* Derived Rates Summary */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Module 2.3 Diagnostic Ratios
          </div>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
            <div>
              <span className="font-semibold text-slate-200">Sensitivity / Recall (TP Rate)</span>
              <p className="text-[11px] text-slate-400">TP / (TP + FN) — Fraction of actual churners caught</p>
            </div>
            <span className="font-mono font-bold text-sm text-indigo-400">{sensitivity}%</span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
            <div>
              <span className="font-semibold text-slate-200">Specificity (TN Rate)</span>
              <p className="text-[11px] text-slate-400">TN / (TN + FP) — Fraction of loyal subscribers retained</p>
            </div>
            <span className="font-mono font-bold text-sm text-emerald-400">{specificity}%</span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
            <div>
              <span className="font-semibold text-slate-200">Precision (PPV)</span>
              <p className="text-[11px] text-slate-400">TP / (TP + FP) — Reliability of churn alerts</p>
            </div>
            <span className="font-mono font-bold text-sm text-amber-400">{precision}%</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-slate-200">Overall Accuracy</span>
              <p className="text-[11px] text-slate-400">(TP + TN) / Total — Global concordant classification</p>
            </div>
            <span className="font-mono font-bold text-sm text-white">{accuracy}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
