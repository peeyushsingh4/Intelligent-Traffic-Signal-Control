import React from 'react';
import { FraudRingGraph } from '../components/FraudRingGraph';
import { FraudCluster } from '../lib/types';

interface FraudRingsPageProps {
  clusters: FraudCluster[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const FraudRingsPage: React.FC<FraudRingsPageProps> = ({
  clusters,
  isLoading,
  onRefresh,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-zinc-100">Fraud Ring Community Detection</h2>
        <p className="text-xs text-zinc-400">
          Uncovers synchronized laundering rings, money-mule funnels, and circular fund movements using NetworkX graph analytics.
        </p>
      </div>

      <FraudRingGraph
        clusters={clusters}
        isLoading={isLoading}
        onRefresh={onRefresh}
      />
    </div>
  );
};
