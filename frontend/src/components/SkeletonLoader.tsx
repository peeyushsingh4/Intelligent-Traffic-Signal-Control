import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = 'h-6 w-full' }) => {
  return <div className={`animate-pulse bg-slate-800/80 rounded-lg ${className}`} />;
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 bg-[#0f172a]/50 border border-slate-800 rounded-xl space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-[#0f172a]/50 border border-slate-800 rounded-xl space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="p-6 bg-[#0f172a]/50 border border-slate-800 rounded-xl space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
};
