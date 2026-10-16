import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { OverviewPage } from './pages/OverviewPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { FraudRingsPage } from './pages/FraudRingsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { api } from './lib/api';
import { wsClient } from './lib/ws';
import { StreamStats, Transaction, FraudCluster, FlaggedEvent } from './lib/types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'fraud-rings' | 'analytics'>('overview');
  const [isMockDb, setIsMockDb] = useState<boolean>(true);
  const [stats, setStats] = useState<StreamStats | null>(null);

  // Live real-time buffer
  const [recentLiveTxs, setRecentLiveTxs] = useState<Transaction[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<FlaggedEvent[]>([]);

  // Transactions ledger state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txTotal, setTxTotal] = useState<number>(0);
  const [txSkip, setTxSkip] = useState<number>(0);
  const [txLimit] = useState<number>(25);
  const [txSearch, setTxSearch] = useState<string>('');
  const [txType, setTxType] = useState<string>('ALL');
  const [txFlaggedOnly, setTxFlaggedOnly] = useState<boolean>(false);
  const [isTxLoading, setIsTxLoading] = useState<boolean>(false);

  // Graph analytics state
  const [clusters, setClusters] = useState<FraudCluster[]>([]);
  const [isGraphLoading, setIsGraphLoading] = useState<boolean>(false);

  // Analytics summary & batch state
  const [summary, setSummary] = useState<any>(null);
  const [isBatchRunning, setIsBatchRunning] = useState<boolean>(false);
  const [batchResult, setBatchResult] = useState<any>(null);

  // Fetch initial health & status
  const refreshSystemStatus = useCallback(async () => {
    try {
      const health = await api.getHealth();
      setIsMockDb(health.is_mock_db);

      const streamStats = await api.getStreamStatus();
      setStats(streamStats);
    } catch {
      // Backend may be starting up
    }
  }, []);

  // Fetch transactions with current filters
  const loadTransactions = useCallback(async () => {
    setIsTxLoading(true);
    try {
      const res = await api.getTransactions({
        skip: txSkip,
        limit: txLimit,
        search: txSearch || undefined,
        type: txType,
        flagged_only: txFlaggedOnly,
      });
      setTransactions(res.items);
      setTxTotal(res.total);
    } catch {
      // Handled cleanly
    } finally {
      setIsTxLoading(false);
    }
  }, [txSkip, txLimit, txSearch, txType, txFlaggedOnly]);

  // Fetch Graph Clusters
  const loadGraphClusters = useCallback(async () => {
    setIsGraphLoading(true);
    try {
      const res = await api.getGraphClusters();
      setClusters(res.clusters);
    } catch {
      // Handled cleanly
    } finally {
      setIsGraphLoading(false);
    }
  }, []);

  // Fetch Analytics Summary
  const loadAnalyticsSummary = useCallback(async () => {
    try {
      const res = await api.getAnalyticsSummary();
      setSummary(res);
    } catch {
      // Handled cleanly
    }
  }, []);

  // Setup WebSocket & Initial Data
  useEffect(() => {
    refreshSystemStatus();
    loadTransactions();
    loadGraphClusters();
    loadAnalyticsSummary();

    // Connect WebSocket
    wsClient.connect();
    const unsubscribe = wsClient.subscribe((msg) => {
      if (msg.stats) {
        setStats(msg.stats);
      }
      if (msg.data) {
        setRecentLiveTxs((prev) => [msg.data!, ...prev.slice(0, 19)]);
      }
      if (msg.alert) {
        setRecentAlerts((prev) => [msg.alert!, ...prev.slice(0, 19)]);
      }
    });

    // Periodic heartbeat / polling fallback
    const interval = setInterval(() => {
      refreshSystemStatus();
    }, 4000);

    return () => {
      clearInterval(interval);
      unsubscribe();
      wsClient.disconnect();
    };
  }, [refreshSystemStatus, loadTransactions, loadGraphClusters, loadAnalyticsSummary]);

  // Re-load transactions when filters change
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Handlers for Stream Controls
  const handleStartStream = async () => {
    try {
      await api.startStream();
      refreshSystemStatus();
    } catch (err) {
      console.error('Failed to start stream:', err);
    }
  };

  const handlePauseStream = async () => {
    try {
      await api.pauseStream();
      refreshSystemStatus();
    } catch (err) {
      console.error('Failed to pause stream:', err);
    }
  };

  const handleResetStream = async () => {
    try {
      await api.resetStream();
      setRecentLiveTxs([]);
      setRecentAlerts([]);
      refreshSystemStatus();
      loadTransactions();
      loadGraphClusters();
    } catch (err) {
      console.error('Failed to reset stream:', err);
    }
  };

  const handleSpeedChange = async (speed: number) => {
    try {
      await api.setSpeed(speed);
      refreshSystemStatus();
    } catch (err) {
      console.error('Failed to set speed:', err);
    }
  };

  // Handler for Batch Analytics Trigger
  const handleTriggerBatch = async () => {
    setIsBatchRunning(true);
    try {
      const res = await api.runBatchAnalytics();
      setBatchResult(res);
      loadAnalyticsSummary();
      loadTransactions();
    } catch (err) {
      console.error('Failed to run batch analytics:', err);
    } finally {
      setIsBatchRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isStreaming={stats?.state === 'RUNNING'}
        isMockDb={isMockDb}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewPage
            stats={stats}
            recentLiveTxs={recentLiveTxs}
            recentAlerts={recentAlerts}
            onStartStream={handleStartStream}
            onPauseStream={handlePauseStream}
            onResetStream={handleResetStream}
            onSpeedChange={handleSpeedChange}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsPage
            transactions={transactions}
            total={txTotal}
            skip={txSkip}
            limit={txLimit}
            isLoading={isTxLoading}
            onPageChange={setTxSkip}
            onSearchChange={(s) => {
              setTxSearch(s);
              setTxSkip(0);
            }}
            onTypeFilterChange={(t) => {
              setTxType(t);
              setTxSkip(0);
            }}
            onFlaggedOnlyToggle={(f) => {
              setTxFlaggedOnly(f);
              setTxSkip(0);
            }}
            search={txSearch}
            selectedType={txType}
            flaggedOnly={txFlaggedOnly}
          />
        )}

        {activeTab === 'fraud-rings' && (
          <FraudRingsPage
            clusters={clusters}
            isLoading={isGraphLoading}
            onRefresh={loadGraphClusters}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsPage
            stats={stats}
            summary={summary}
            onTriggerBatch={handleTriggerBatch}
            isBatchRunning={isBatchRunning}
            batchResult={batchResult}
          />
        )}
      </main>

      <footer className="border-t border-zinc-800/60 py-4 bg-zinc-950/40 text-center text-xs text-zinc-500 font-mono">
        AegisStream Platform · Streaming Fraud Analytics & Community Detection · Viva Edition
      </footer>
    </div>
  );
};
export default App;
