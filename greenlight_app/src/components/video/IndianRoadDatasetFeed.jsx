import React, { useEffect, useMemo, useState } from 'react';
import { Camera, CirclePause, CirclePlay, Database, Gauge, Radio, RefreshCw, Save, TriangleAlert } from 'lucide-react';

const API = 'http://localhost:5005/api';
const colors = ['#22d3ee', '#34d399', '#fbbf24', '#a78bfa', '#fb7185'];

const vehicleColor = (type) => colors[[...type].reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length];
const readError = (error) => error?.message || 'The local SUMO bridge is unavailable.';

export const IndianRoadDatasetFeed = () => {
  const [state, setState] = useState({ status: 'idle', vehicles: [], metrics: {} });
  const [scenario, setScenario] = useState('bkc');
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState('');
  const [captureName, setCaptureName] = useState('');
  const [captureNotice, setCaptureNotice] = useState('');

  const start = async () => {
    setError(''); setCaptureNotice('');
    try {
      const response = await fetch(`${API}/simulation/start`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scenario }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setState(data); setIsPolling(true);
    } catch (requestError) { setError(readError(requestError)); }
  };

  const stop = async () => {
    await fetch(`${API}/simulation/stop`, { method: 'POST' }).catch(() => undefined);
    setIsPolling(false); setState((current) => ({ ...current, status: 'stopped' }));
  };

  const capture = async () => {
    setCaptureNotice('');
    try {
      const response = await fetch(`${API}/replays/capture`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label: captureName }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setCaptureNotice(`Captured ${data.label} at ${data.simTime}s.`); setCaptureName('');
    } catch (requestError) { setError(readError(requestError)); }
  };

  useEffect(() => {
    const restoreRunningState = async () => {
      try {
        const response = await fetch(`${API}/simulation/state`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setState(data);
        setIsPolling(data.status === 'running');
        if (data.status === 'running') setError('');
      } catch {
        // Keep the initial idle state; the Start control presents any actionable error.
      }
    };
    restoreRunningState();
  }, []);

  useEffect(() => {
    if (!isPolling) return undefined;
    const poll = async () => {
      try {
        const response = await fetch(`${API}/simulation/state`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setState(data);
        if (data.status !== 'running') setIsPolling(false);
      } catch (requestError) { setError(readError(requestError)); setIsPolling(false); }
    };
    const interval = window.setInterval(poll, 500);
    return () => window.clearInterval(interval);
  }, [isPolling]);

  const metrics = state.metrics || {};
  const vehicles = useMemo(() => state.vehicles || [], [state.vehicles]);
  return (
    <section className="glass-panel rounded-2xl overflow-hidden" aria-label="Live SUMO vehicle tracking">
      <header className="p-4 border-b border-slate-700/70 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`status-dot ${state.status === 'running' ? 'status-dot--live' : ''}`} aria-hidden="true" />
          <div><h3 className="text-base font-bold text-slate-100">SUMO simulation ground truth</h3><p className="text-xs text-slate-300">Vehicles are read directly from TraCI at each simulation tick.</p></div>
        </div>
        <div className="flex gap-2 items-center">
          <label className="sr-only" htmlFor="scenario">Intersection scenario</label>
          <select id="scenario" value={scenario} disabled={isPolling} onChange={(event) => setScenario(event.target.value)} className="control-select">
            <option value="bkc">BKC Junction</option><option value="vashi">Vashi Interchange</option><option value="palm_beach">Palm Beach Road</option>
          </select>
          <button onClick={isPolling ? stop : start} className="control-button control-button--primary">
            {isPolling ? <CirclePause size={16} /> : <CirclePlay size={16} />} {isPolling ? 'Stop run' : 'Start SUMO'}
          </button>
        </div>
      </header>

      {error && <div className="m-4 alert alert--error"><TriangleAlert size={16} /> {error}</div>}
      <div className="grid lg:grid-cols-[1fr_220px]">
        <div className="relative min-h-[390px] bg-[#0a111d] overflow-hidden" role="img" aria-label={`${vehicles.length} active simulation vehicles`}>
          <div className="absolute inset-x-0 top-1/2 h-28 -translate-y-1/2 bg-slate-700/65 border-y border-slate-500/30" />
          <div className="absolute inset-y-0 left-1/2 w-32 -translate-x-1/2 bg-slate-700/65 border-x border-slate-500/30" />
          <div className="absolute inset-0 traffic-grid" aria-hidden="true" />
          {vehicles.map((vehicle) => {
            const left = `${Math.min(98, Math.max(2, vehicle.x / 10))}%`;
            const bottom = `${Math.min(98, Math.max(2, vehicle.y / 10))}%`;
            return <div key={vehicle.id} className="sim-vehicle" style={{ left, bottom, '--vehicle-color': vehicleColor(vehicle.type), transform: `translate(-50%, 50%) rotate(${vehicle.heading}deg)` }} title={`${vehicle.id} · ${vehicle.type} · ${vehicle.speedKmh} km/h`}>
              <span className="sim-vehicle__body" /><span className="sim-vehicle__label">{vehicle.id} · {vehicle.speedKmh} km/h</span>
            </div>;
          })}
          {state.status !== 'running' && <div className="absolute inset-0 grid place-items-center p-6 text-center"><div><Radio className="mx-auto mb-3 text-cyan-300" /><p className="font-semibold text-slate-100">Start a scenario to view live positions</p><p className="text-sm text-slate-300 mt-1">No stock footage or computer-vision detections are used.</p></div></div>}
        </div>
        <aside className="p-4 border-l border-slate-700/70 space-y-4 bg-slate-950/30">
          <div><p className="eyebrow">Run state</p><p className="font-mono text-sm text-emerald-300 capitalize">{state.status || 'idle'}</p></div>
          <Metric icon={Camera} label="Vehicles" value={metrics.vehicleCount ?? 'N/A'} /><Metric icon={Gauge} label="Queue" value={metrics.queueLength ?? 'N/A'} />
          <Metric icon={RefreshCw} label="Wait" value={metrics.waitingTimeSeconds != null ? `${metrics.waitingTimeSeconds}s` : 'N/A'} />
          <Metric icon={Database} label="CO₂ rate" value={metrics.co2MgPerSecond != null ? `${metrics.co2MgPerSecond} mg/s` : 'N/A'} />
          <div className="pt-2 border-t border-slate-700/70"><p className="eyebrow mb-2">Capture instance</p><input value={captureName} onChange={(event) => setCaptureName(event.target.value)} placeholder="e.g., pre-control" className="control-input" /><button disabled={state.status !== 'running'} onClick={capture} className="control-button control-button--secondary mt-2 w-full"><Save size={15} /> Capture current tick</button>{captureNotice && <p className="mt-2 text-xs text-emerald-300">{captureNotice}</p>}</div>
        </aside>
      </div>
      <footer className="px-4 py-3 border-t border-slate-700/70 flex justify-between text-xs text-slate-300"><span>Scenario: {state.scenario || scenario}</span><span>Simulation time: {state.simTime ?? 'N/A'} s</span></footer>
    </section>
  );
};

const Metric = ({ icon: Icon, label, value }) => <div className="flex gap-2 items-start"><Icon size={15} className="mt-0.5 text-cyan-300" aria-hidden="true" /><div><p className="text-xs text-slate-300">{label}</p><p className="font-mono text-sm text-slate-100">{value}</p></div></div>;
