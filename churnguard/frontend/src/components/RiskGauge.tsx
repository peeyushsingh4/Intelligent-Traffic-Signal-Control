import React from 'react';

interface RiskGaugeProps {
  score: number; // 0.0 to 1.0
  tier: 'LOW' | 'MEDIUM' | 'HIGH';
  modelName: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, tier, modelName }) => {
  const percentage = Math.round(score * 100);

  const tierColors = {
    LOW: {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      bar: 'bg-emerald-500',
      label: 'Low Churn Risk',
      sub: 'Customer shows healthy loyalty patterns and strong engagement.',
    },
    MEDIUM: {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      bar: 'bg-amber-500',
      label: 'Moderate Churn Risk',
      sub: 'Early warning indicators detected; monitor billing and contract status.',
    },
    HIGH: {
      text: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      bar: 'bg-rose-500',
      label: 'Critical Churn Risk',
      sub: 'Immediate proactive intervention recommended before current billing cycle closes.',
    },
  };

  const config = tierColors[tier] || tierColors.LOW;

  return (
    <div className={`p-6 rounded-xl border ${config.border} bg-[#0f172a]/80 transition-all`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Risk Assessment Output
        </span>
        <span className="text-xs font-mono text-slate-400">Scored via {modelName}</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Probability Metric Display */}
        <div className="text-center sm:text-left">
          <div className="flex items-baseline gap-1">
            <span className={`text-5xl font-extrabold font-mono tracking-tight ${config.text}`}>
              {percentage}%
            </span>
            <span className="text-xs text-slate-400 font-medium">Churn Probability</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${config.bg} ${config.text} ${config.border}`}>
              {config.label}
            </span>
          </div>
        </div>

        {/* Risk meter bar */}
        <div className="flex-1 w-full space-y-2">
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${config.bar}`}
              style={{ width: `${Math.min(100, Math.max(5, percentage))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>0% (Safe)</span>
            <span>30%</span>
            <span>65%</span>
            <span>100% (Imminent)</span>
          </div>
          <p className="text-xs text-slate-300 mt-1">{config.sub}</p>
        </div>
      </div>
    </div>
  );
};
