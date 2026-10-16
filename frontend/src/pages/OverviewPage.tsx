import React from 'react';
import { StreamControls } from '../components/StreamControls';
import { StatCards } from '../components/StatCards';
import { StreamStats, Transaction, FlaggedEvent } from '../lib/types';
import { ShieldAlert, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

interface OverviewPageProps {
  stats: StreamStats | null;
  recentLiveTxs: Transaction[];
  recentAlerts: FlaggedEvent[];
  onStartStream: () => void;
  onPauseStream: () => void;
  onResetStream: () => void;
  onSpeedChange: (speed: number) => void;
  onNavigateToTab: (tab: 'overview' | 'transactions' | 'fraud-rings' | 'analytics') => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  stats,
  recentLiveTxs,
  recentAlerts,
  onStartStream,
  onPauseStream,
  onResetStream,
  onSpeedChange,
  onNavigateToTab,
}) => {
  return (
    <div className="space-y-6">
      {/* Playback & Velocity Bar */}
      <StreamControls
        state={stats?.state || 'IDLE'}
        speed={stats?.speed || 10}
        totalProcessed={stats?.total_processed || 0}
        onStart={onStartStream}
        onPause={onPauseStream}
        onReset={onResetStream}
        onSpeedChange={onSpeedChange}
      />

      {/* Primary KPI & Telemetry Cards */}
      <StatCards stats={stats} />

      {/* Two-Column Grid: Live Transaction Ticker & Real-Time Alert Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Streaming Transaction Ticker */}
        <div className="lg:col-span-2 bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-sm font-semibold text-zinc-100">Live Transaction Stream (PaySim Replay)</h3>
            </div>
            <button
              onClick={() => onNavigateToTab('transactions')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              View Full Feed <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-hidden">
            {recentLiveTxs.length === 0 ? (
              <div className="p-12 text-center text-xs text-zinc-400">
                Stream is idle. Click <strong className="text-emerald-400">"Start Stream Simulation"</strong> to begin replaying transactions.
              </div>
            ) : (
              <div className="space-y-2">
                {recentLiveTxs.slice(0, 7).map((tx) => (
                  <div
                    key={tx.transaction_id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all text-xs font-mono ${
                      tx.is_flagged
                        ? 'bg-rose-950/20 border-rose-500/30 text-zinc-200'
                        : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.is_flagged
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {tx.type}
                      </span>
                      <span className="text-zinc-400 text-[11px] hidden sm:inline">{tx.transaction_id}</span>
                      <span className="text-zinc-200 font-semibold">{tx.nameOrig}</span>
                      <span className="text-zinc-500">→</span>
                      <span className="text-zinc-200 font-semibold">{tx.nameDest}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold text-zinc-100">
                        ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      {tx.is_flagged ? (
                        <span className="text-[10px] text-rose-400 flex items-center gap-1 font-sans font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          RISK {tx.risk_score}
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-sans font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          OK
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Real-time Alert Drawer */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-semibold text-zinc-100">Live Anomaly Alerts</h3>
            </div>
            <span className="text-[11px] font-mono text-rose-400 font-bold">
              {recentAlerts.length} Captured
            </span>
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {recentAlerts.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                No high-risk fraud alerts triggered yet.
              </div>
            ) : (
              recentAlerts.slice(0, 6).map((alert, i) => (
                <div
                  key={alert.event_id || i}
                  className="bg-zinc-950 p-3 rounded-lg border border-rose-500/20 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-zinc-300 font-bold">{alert.account_id}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300">
                      {alert.severity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                    <span>Amt: ${alert.amount?.toLocaleString()}</span>
                    <span className="font-mono text-rose-400 font-semibold">Risk: {alert.risk_score}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {alert.flags?.map((f) => (
                      <span key={f} className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
