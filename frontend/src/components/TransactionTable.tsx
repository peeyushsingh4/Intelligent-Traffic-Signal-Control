import React, { useState } from 'react';
import { Search, Filter, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, X, ExternalLink } from 'lucide-react';
import { Transaction } from '../lib/types';
import { TableSkeleton, EmptyState } from './ui/Skeletons';

interface TransactionTableProps {
  transactions: Transaction[];
  total: number;
  skip: number;
  limit: number;
  isLoading: boolean;
  onPageChange: (newSkip: number) => void;
  onSearchChange: (search: string) => void;
  onTypeFilterChange: (type: string) => void;
  onFlaggedOnlyToggle: (flaggedOnly: boolean) => void;
  search: string;
  selectedType: string;
  flaggedOnly: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  total,
  skip,
  limit,
  isLoading,
  onPageChange,
  onSearchChange,
  onTypeFilterChange,
  onFlaggedOnlyToggle,
  search,
  selectedType,
  flaggedOnly,
}) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const currentPage = Math.floor(skip / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'TRANSFER':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'CASH_OUT':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'PAYMENT':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'CASH_IN':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      {/* Search & Filter Header Bar */}
      <div className="p-4 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search account, destination, or TX ID..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          {/* Type dropdown */}
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedType}
              onChange={(e) => onTypeFilterChange(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="TRANSFER">Transfer</option>
              <option value="CASH_OUT">Cash Out</option>
              <option value="PAYMENT">Payment</option>
              <option value="CASH_IN">Cash In</option>
              <option value="DEBIT">Debit</option>
            </select>
          </div>

          {/* Flagged Only Toggle */}
          <button
            onClick={() => onFlaggedOnlyToggle(!flaggedOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              flaggedOnly
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Flagged Only
          </button>
        </div>
      </div>

      {/* Transactions Table Content */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <TableSkeleton />
        ) : transactions.length === 0 ? (
          <EmptyState
            title="No Transactions Found"
            description="Start or resume the stream simulator to ingest PaySim transactions."
          />
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/60 border-b border-zinc-800/80 text-zinc-400 uppercase tracking-wider text-[11px] font-mono">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Origin Account</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status / Risk</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {transactions.map((tx) => (
                <tr
                  key={tx.transaction_id}
                  onClick={() => setSelectedTx(tx)}
                  className="hover:bg-zinc-800/30 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 font-mono text-zinc-300 font-medium">
                    {tx.transaction_id}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono border ${getTypeBadgeColor(
                        tx.type
                      )}`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-300">{tx.nameOrig}</td>
                  <td className="py-3 px-4 font-mono text-zinc-300">{tx.nameDest}</td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-zinc-100">
                    ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {tx.is_flagged ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        <AlertCircle className="w-3 h-3" />
                        FLAGGED ({tx.risk_score})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        CLEAN
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTx(tx);
                      }}
                      className="text-zinc-500 group-hover:text-emerald-400 transition-colors p-1"
                      title="Inspect Transaction"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between text-xs text-zinc-400">
        <div className="font-mono">
          Showing {Math.min(skip + 1, total)} - {Math.min(skip + transactions.length, total)} of {total.toLocaleString()} transactions
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(0, skip - limit))}
            disabled={skip === 0}
            className="p-1.5 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-zinc-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(skip + limit)}
            disabled={skip + limit >= total}
            className="p-1.5 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Transaction Detail Drawer / Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                  Transaction Audit Inspector
                  {selectedTx.is_flagged && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      HIGH RISK
                    </span>
                  )}
                </h3>
                <p className="text-xs text-zinc-400 font-mono">{selectedTx.transaction_id}</p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Risk Score Meter */}
              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-zinc-400 font-medium">Anomaly Risk Score</span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      selectedTx.risk_score >= 60
                        ? 'text-rose-400'
                        : selectedTx.risk_score >= 30
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {selectedTx.risk_score} / 100
                  </span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      selectedTx.risk_score >= 60
                        ? 'bg-rose-500'
                        : selectedTx.risk_score >= 30
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${selectedTx.risk_score}%` }}
                  />
                </div>
              </div>

              {/* Triggered Flags */}
              {selectedTx.flags && selectedTx.flags.length > 0 && (
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Triggered Streaming Signals
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTx.flags.map((flag) => (
                      <span
                        key={flag}
                        className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30"
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Accounts & Balance Transition Matrix */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1">
                  <span className="text-zinc-400 block text-[11px]">Originator Account</span>
                  <span className="font-mono text-zinc-200 font-semibold block">{selectedTx.nameOrig}</span>
                  <div className="pt-1 text-[11px] text-zinc-400">
                    <div>Old Bal: <span className="font-mono text-zinc-300">${selectedTx.oldbalanceOrg.toLocaleString()}</span></div>
                    <div>New Bal: <span className="font-mono text-zinc-300">${selectedTx.newbalanceOrig.toLocaleString()}</span></div>
                  </div>
                </div>

                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1">
                  <span className="text-zinc-400 block text-[11px]">Destination Account</span>
                  <span className="font-mono text-zinc-200 font-semibold block">{selectedTx.nameDest}</span>
                  <div className="pt-1 text-[11px] text-zinc-400">
                    <div>Old Bal: <span className="font-mono text-zinc-300">${selectedTx.oldbalanceDest.toLocaleString()}</span></div>
                    <div>New Bal: <span className="font-mono text-zinc-300">${selectedTx.newbalanceDest.toLocaleString()}</span></div>
                  </div>
                </div>
              </div>

              {/* Financial Amount */}
              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-zinc-400 block text-[11px]">Transfer Amount</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">
                    ${selectedTx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-400 block text-[11px]">Simulation Step</span>
                  <span className="font-mono text-zinc-300 font-semibold">Step {selectedTx.step}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
