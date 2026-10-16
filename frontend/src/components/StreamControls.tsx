import React from 'react';
import { Play, Pause, RotateCcw, Zap, Gauge } from 'lucide-react';

interface StreamControlsProps {
  state: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
  speed: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  totalProcessed: number;
}

export const StreamControls: React.FC<StreamControlsProps> = ({
  state,
  speed,
  onStart,
  onPause,
  onReset,
  onSpeedChange,
  totalProcessed,
}) => {
  const isRunning = state === 'RUNNING';

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
      {/* Playback action buttons */}
      <div className="flex items-center gap-2">
        {isRunning ? (
          <button
            onClick={onPause}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 transition-all text-xs font-semibold cursor-pointer"
          >
            <Pause className="w-3.5 h-3.5" />
            Pause Stream
          </button>
        ) : (
          <button
            onClick={onStart}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-all text-xs font-semibold shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {state === 'PAUSED' ? 'Resume Stream' : 'Start Stream Simulation'}
          </button>
        )}

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 border border-zinc-700/60 transition-all text-xs font-medium cursor-pointer"
          title="Reset stream state and streaming algorithms"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Stream speed controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Gauge className="w-4 h-4 text-zinc-500" />
          <span>Stream Velocity:</span>
          <span className="font-mono text-zinc-200 font-semibold">{speed} tx/s</span>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 p-1 rounded-lg">
          {[5, 15, 30, 60, 100].map((rate) => (
            <button
              key={rate}
              onClick={() => onSpeedChange(rate)}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-all cursor-pointer ${
                speed === rate
                  ? 'bg-zinc-800 text-emerald-400 font-semibold border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-zinc-800 text-xs text-zinc-400">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>PaySim Ingestion:</span>
          <span className="font-mono text-zinc-200">{totalProcessed.toLocaleString()} rows</span>
        </div>
      </div>
    </div>
  );
};
