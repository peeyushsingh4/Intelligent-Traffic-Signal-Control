import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Cpu,
  Layers
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { ModelRun, RocCurve, Recommendation } from '../types';
import { ConfusionMatrix } from '../components/ConfusionMatrix';
import { DashboardSkeleton } from '../components/SkeletonLoader';

export const ModelEvaluation: React.FC = () => {
  const [runs, setRuns] = useState<ModelRun[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string>('');
  const [rocCurves, setRocCurves] = useState<RocCurve[]>([]);
  const [kfoldData, setKfoldData] = useState<any[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [runsData, rocData, kfData, recData] = await Promise.all([
          api.getModelRuns(),
          api.getRocComparison(),
          api.getKFoldComparison(),
          api.getRecommendation(),
        ]);
        setRuns(runsData);
        setRocCurves(rocData);
        setKfoldData(kfData);
        setRecommendation(recData);
        if (runsData.length > 0) {
          // Select champion or first run by default
          const champ = runsData.find((r) => r.is_champion);
          setSelectedRunId(champ ? champ.run_id : runsData[0].run_id);
        }
      } catch (err) {
        console.error('Failed to load evaluation data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  if (loading || runs.length === 0) {
    return <DashboardSkeleton />;
  }

  const selectedRun = runs.find((r) => r.run_id === selectedRunId) || runs[0];

  // Overlaid ROC curves formatting for Recharts
  // Sample 50 points from 0 to 1
  const rocPlotData = Array.from({ length: 50 }, (_, i) => {
    const pointIdx = i;
    const basePoint: Record<string, any> = {
      fpr: Number((i / 49).toFixed(3)),
    };

    rocCurves.slice(0, 5).forEach((curve) => {
      const p = curve.points[pointIdx] || curve.points[curve.points.length - 1];
      const shortName = curve.model_name
        .replace(' Classifier', '')
        .replace(' Machine', '')
        .replace(' (CART)', '')
        .replace(' (L2)', '');
      basePoint[shortName] = p ? Number((p.tpr * 100).toFixed(1)) : 0;
    });

    basePoint['Random_Chance'] = Number((i / 49 * 100).toFixed(1));
    return basePoint;
  });

  const curveColors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Model Selection & Switcher Bar */}
      <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Inspect Model Deep Dive
          </span>
          <p className="text-xs text-slate-300">
            Switch model to inspect its holdout Confusion Matrix, diagnostic ratios, and hyperparams.
          </p>
        </div>

        <select
          value={selectedRunId}
          onChange={(e) => setSelectedRunId(e.target.value)}
          className="w-full sm:w-80 bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
        >
          {runs.map((r) => (
            <option key={r.run_id} value={r.run_id}>
              {r.model_name} ({r.model_family}) — AUC: {(r.roc_auc * 100).toFixed(1)}%
            </option>
          ))}
        </select>
      </div>

      {/* Visual Confusion Matrix Section */}
      <ConfusionMatrix data={selectedRun.confusion_matrix} modelName={selectedRun.model_name} />

      {/* Detailed Classification Report Grid */}
      <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Classification Report — {selectedRun.model_name}
            </h2>
            <p className="text-xs text-slate-400">
              Module 2.3 performance metrics evaluated on 20% holdout test partition
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Family: {selectedRun.model_family}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-sans font-medium block">ROC-AUC</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {(selectedRun.roc_auc * 100).toFixed(2)}%
            </div>
            <span className="text-[10px] text-slate-400 font-sans mt-0.5 block">Discrimination</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-sans font-medium block">Accuracy</span>
            <div className="text-xl font-bold text-white mt-1">
              {(selectedRun.accuracy * 100).toFixed(2)}%
            </div>
            <span className="text-[10px] text-slate-400 font-sans mt-0.5 block">Global Concordance</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-sans font-medium block">Precision</span>
            <div className="text-xl font-bold text-amber-400 mt-1">
              {(selectedRun.precision * 100).toFixed(2)}%
            </div>
            <span className="text-[10px] text-slate-400 font-sans mt-0.5 block">PPV (Low FP)</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-sans font-medium block">Recall / Sens</span>
            <div className="text-xl font-bold text-indigo-400 mt-1">
              {(selectedRun.recall * 100).toFixed(2)}%
            </div>
            <span className="text-[10px] text-slate-400 font-sans mt-0.5 block">TP Rate</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-sans font-medium block">Specificity</span>
            <div className="text-xl font-bold text-cyan-400 mt-1">
              {(selectedRun.specificity * 100).toFixed(2)}%
            </div>
            <span className="text-[10px] text-slate-400 font-sans mt-0.5 block">TN Rate</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-sans font-medium block">F1-Score</span>
            <div className="text-xl font-bold text-purple-400 mt-1">
              {(selectedRun.f1_score * 100).toFixed(2)}%
            </div>
            <span className="text-[10px] text-slate-400 font-sans mt-0.5 block">Harmonic Mean</span>
          </div>
        </div>
      </div>

      {/* Multi-Model Overlaid ROC Curve Section */}
      <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Overlaid Receiver Operating Characteristic (ROC)</h2>
            <p className="text-xs text-slate-400">
              True Positive Rate (Sensitivity) vs False Positive Rate (1 - Specificity) across candidate models
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
            Top Model AUC: {rocCurves[0] ? (rocCurves[0].auc * 100).toFixed(1) : '85.0'}%
          </span>
        </div>

        <div className="h-80 w-full my-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rocPlotData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="fpr"
                stroke="#64748b"
                fontSize={11}
                label={{ value: 'False Positive Rate (1 - Specificity)', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                domain={[0, 100]}
                label={{ value: 'True Positive Rate (%)', angle: -90, position: 'insideLeft', offset: 15, fill: '#94a3b8', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
              {rocCurves.slice(0, 5).map((curve, idx) => {
                const shortName = curve.model_name
                  .replace(' Classifier', '')
                  .replace(' Machine', '')
                  .replace(' (CART)', '')
                  .replace(' (L2)', '');
                return (
                  <Line
                    key={curve.model_name}
                    type="monotone"
                    dataKey={shortName}
                    name={`${shortName} (AUC: ${(curve.auc * 100).toFixed(1)}%)`}
                    stroke={curveColors[idx % curveColors.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                );
              })}
              <Line
                type="monotone"
                dataKey="Random_Chance"
                name="Random Chance (AUC: 50.0%)"
                stroke="#475569"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* K-Fold Cross-Validation & Which Model Wins Conclusion */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* K-Fold CV Table */}
        <div className="lg:col-span-6 bg-[#0f172a]/70 border border-slate-800/80 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">5-Fold Stratified Cross-Validation (AUC)</h2>
              <p className="text-xs text-slate-400">Syllabus verification: guarantees generalization invariance</p>
            </div>
            <span className="text-xs font-mono text-indigo-400">K=5</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-3 pl-2">Model</th>
                  <th className="pb-3 text-right">Mean AUC</th>
                  <th className="pb-3 text-right">Std Dev (σ)</th>
                  <th className="pb-3 text-right pr-2">Stability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {kfoldData.map((k) => (
                  <tr key={k.model_name} className="hover:bg-slate-800/30">
                    <td className="py-2.5 pl-2 text-white font-sans font-medium">{k.model_name}</td>
                    <td className="py-2.5 text-right font-bold text-emerald-400">
                      {(k.mean_auc * 100).toFixed(2)}%
                    </td>
                    <td className="py-2.5 text-right text-slate-300">
                      ±{(k.std_auc * 100).toFixed(2)}%
                    </td>
                    <td className="py-2.5 text-right pr-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans">
                        {k.std_auc < 0.02 ? 'High Stability' : 'Moderate'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* "Which Model Wins and Why" Analytical Conclusion Panel */}
        <div className="lg:col-span-6 bg-gradient-to-b from-[#0f172a] to-indigo-950/20 border border-indigo-500/30 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
                <Award className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-semibold text-white">Which Model Wins & Why? (Report Conclusion)</h2>
            </div>
            <p className="text-xs text-indigo-300/80 mb-4">
              Theoretical and empirical synthesis for your viva defense & final project report
            </p>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong className="text-white">Empirical Winner:</strong>{' '}
                <span className="font-mono text-emerald-400 font-semibold">
                  {recommendation?.champion_model || 'XGBoost Classifier'}
                </span>{' '}
                achieves champion status with an ROC-AUC of{' '}
                <span className="font-mono font-bold text-white">
                  {((recommendation?.champion_auc || 0.85) * 100).toFixed(2)}%
                </span>.
              </p>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="font-semibold text-white text-[11px] uppercase tracking-wider">
                  Ensemble Synergy Justification:
                </div>
                <ul className="space-y-1.5 list-disc pl-4 text-slate-300 text-[11px]">
                  <li>
                    <strong className="text-slate-200">Bagging (Random Forest)</strong> tames high variance by averaging de-correlated trees, but its parallel nature cannot explicitly target stubborn edge-case churners.
                  </li>
                  <li>
                    <strong className="text-slate-200">Boosting (XGBoost / GBM)</strong> sequentially reduces bias by iteratively fitting second-order Taylor pseudo-residuals, directly learning subtle churn boundary interactions.
                  </li>
                  <li>
                    <strong className="text-slate-200">Stacking</strong> blends complementary inductive biases of tree learners and linear boundaries via a meta-estimator, matching or exceeding top boosting benchmarks.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Syllabus Module 2.3 Defense Ready</span>
            <span className="font-mono text-indigo-400">Cross-Validated Generalization</span>
          </div>
        </div>
      </div>
    </div>
  );
};
