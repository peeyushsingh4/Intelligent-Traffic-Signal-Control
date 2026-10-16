import React from 'react';
import { ShieldCheck, Database } from 'lucide-react';

interface NavbarProps {
  activeTab: 'overview' | 'transactions' | 'fraud-rings' | 'analytics';
  setActiveTab: (tab: 'overview' | 'transactions' | 'fraud-rings' | 'analytics') => void;
  isStreaming: boolean;
  isMockDb: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isStreaming,
  isMockDb,
}) => {
  const navItems = [
    { id: 'overview', label: 'Live Monitor' },
    { id: 'transactions', label: 'Transactions Feed' },
    { id: 'fraud-rings', label: 'Fraud Ring Explorer' },
    { id: 'analytics', label: 'Analytics & Viva Proofs' },
  ] as const;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-zinc-100">
                AegisStream
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                v1.0
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Real-Time Financial Fraud & Streaming Analytics
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 bg-zinc-900/60 border border-zinc-800/80 p-1 rounded-lg">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Status Indicators */}
        <div className="flex items-center gap-3">
          {/* Database Mode Badge */}
          <div
            className={`hidden md:flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-md border ${
              isMockDb
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isMockDb ? 'Mock DB' : 'MongoDB'}</span>
          </div>

          {/* Live Streaming State Badge */}
          <div
            className={`flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-md border ${
              isStreaming
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isStreaming ? 'bg-emerald-400 animate-ping' : 'bg-zinc-500'
              }`}
            />
            <span>{isStreaming ? 'STREAM LIVE' : 'IDLE'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
