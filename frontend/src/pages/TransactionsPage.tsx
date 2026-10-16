import React from 'react';
import { TransactionTable } from '../components/TransactionTable';
import { Transaction } from '../lib/types';

interface TransactionsPageProps {
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

export const TransactionsPage: React.FC<TransactionsPageProps> = (props) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-zinc-100">Financial Transactions Ledger</h2>
        <p className="text-xs text-zinc-400">
          Search, filter, and audit incoming payments, transfers, and high-risk flagged activities.
        </p>
      </div>

      <TransactionTable {...props} />
    </div>
  );
};
