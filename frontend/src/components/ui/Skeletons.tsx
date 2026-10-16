import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 animate-pulse space-y-3">
    <div className="flex items-center justify-between">
      <div className="h-4 w-28 bg-zinc-800 rounded"></div>
      <div className="h-6 w-6 bg-zinc-800 rounded-md"></div>
    </div>
    <div className="h-8 w-36 bg-zinc-800 rounded"></div>
    <div className="h-3 w-44 bg-zinc-800/60 rounded"></div>
  </div>
);

export const TableSkeleton: React.FC = () => (
  <div className="space-y-2 p-4 animate-pulse">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex items-center justify-between py-3 border-b border-zinc-800/50">
        <div className="h-4 w-24 bg-zinc-800 rounded"></div>
        <div className="h-4 w-20 bg-zinc-800 rounded"></div>
        <div className="h-4 w-28 bg-zinc-800 rounded"></div>
        <div className="h-4 w-32 bg-zinc-800 rounded"></div>
        <div className="h-4 w-16 bg-zinc-800 rounded-full"></div>
      </div>
    ))}
  </div>
);

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}> = ({ title, description, actionText, onAction, icon }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20 my-4">
    {icon && <div className="p-3 bg-zinc-800/60 text-zinc-400 rounded-xl mb-3">{icon}</div>}
    <h3 className="text-base font-semibold text-zinc-200 mb-1">{title}</h3>
    <p className="text-sm text-zinc-400 max-w-md mb-4">{description}</p>
    {actionText && onAction && (
      <button
        onClick={onAction}
        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-medium text-sm rounded-lg transition-colors cursor-pointer"
      >
        {actionText}
      </button>
    )}
  </div>
);
