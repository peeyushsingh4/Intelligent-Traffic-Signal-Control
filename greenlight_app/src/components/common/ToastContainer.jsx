import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts = [], removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col space-y-2 max-w-sm w-full pointer-events-none p-2 sm:p-0">
      {toasts.map((t) => {
        const isSuccess = t.type === 'success';
        const isError = t.type === 'error';
        const isWarning = t.type === 'warning';
        
        const borderCol = isSuccess ? 'border-emerald-500/60' : isError ? 'border-red-500/60' : isWarning ? 'border-amber-500/60' : 'border-cyan-500/60';
        const bgCol = isSuccess ? 'bg-emerald-950/90' : isError ? 'bg-red-950/90' : isWarning ? 'bg-amber-950/90' : 'bg-slate-900/90';
        const textCol = isSuccess ? 'text-emerald-300' : isError ? 'text-red-300' : isWarning ? 'text-amber-300' : 'text-cyan-300';
        const glowCol = isSuccess ? 'shadow-emerald-500/20' : isError ? 'shadow-red-500/20' : isWarning ? 'shadow-amber-500/20' : 'shadow-cyan-500/20';

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start space-x-3 p-3.5 rounded-2xl border ${borderCol} ${bgCol} shadow-2xl ${glowCol} backdrop-blur-xl transition-all duration-300 animate-slide-in font-mono text-xs`}
          >
            <div className={`shrink-0 p-1 rounded-lg ${textCol} mt-0.5`}>
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {isError && <AlertCircle className="w-4 h-4 text-red-400" />}
              {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-4 h-4 text-cyan-400" />}
            </div>

            <div className="flex-1 overflow-hidden pr-1">
              {t.title && (
                <div className={`font-bold font-sans ${textCol} text-xs tracking-wide`}>
                  {t.title}
                </div>
              )}
              <div className="text-slate-200 text-[11px] leading-relaxed mt-0.5">
                {t.message}
              </div>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 p-1 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-800/80"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
