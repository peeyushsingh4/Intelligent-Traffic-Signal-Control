import React, { useEffect, useState } from 'react';
import { BarChart3, Play, RefreshCw, Save, Timer } from 'lucide-react';
import { IndianRoadDatasetFeed } from '../components/video/IndianRoadDatasetFeed';

const API = 'http://localhost:5005/api';
const number = (value, unit = '') => value == null ? 'N/A' : `${Number(value).toFixed(2)}${unit}`;

export const TestingConsole = () => {
  const [captures, setCaptures] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadCaptures = async () => { try { const response = await fetch(`${API}/replays`); const data = await response.json(); setCaptures(data.captures || []); } catch { setMessage('Start the local SUMO bridge to load captured instances.'); } };
  useEffect(() => { loadCaptures(); }, []);
  const compare = async () => {
    setLoading(true); setMessage('');
    try { const response = await fetch(`${API}/replays/compare`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scenario: 'bkc' }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setComparison(data); setMessage(data.message); }
    catch (error) { setMessage(error.message || 'Comparison could not be run.'); }
    finally { setLoading(false); }
  };
  return <div className="h-[calc(100vh-4rem)] p-4 lg:p-6 space-y-6 overflow-y-auto">
    <header><p className="eyebrow">Simulation evaluation</p><h2 className="text-xl font-bold text-white">Live instances & controller comparison</h2><p className="mt-1 text-sm text-slate-300">Metrics come from the project’s TraCI run and <code>evaluate.py</code>; unavailable values are left unavailable.</p></header>
    <IndianRoadDatasetFeed />
    <section className="glass-panel rounded-2xl p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold text-slate-100">BKC: fixed-time vs DQN</h3><p className="text-xs text-slate-300 mt-1">Runs the existing evaluator against the real BKC SUMO configuration.</p></div><button className="control-button control-button--primary" onClick={compare} disabled={loading}><Play size={15} />{loading ? 'Running evaluator…' : 'Run real comparison'}</button></div>{message && <p className="mt-4 text-sm text-slate-200">{message}</p>}{comparison && <div className="grid md:grid-cols-2 gap-4 mt-5"><Result title="Fixed-time baseline" data={comparison.baseline} /><Result title={comparison.adaptiveName || 'DQN (unavailable)'} data={comparison.adaptive} /></div>}</section>
    <section className="glass-panel rounded-2xl p-5"><div className="flex items-center justify-between gap-3"><div><h3 className="font-bold text-slate-100">Captured simulation instances</h3><p className="text-xs text-slate-300 mt-1">Snapshots are created from the current TraCI tick in the live view above.</p></div><button className="control-button control-button--secondary" onClick={loadCaptures}><RefreshCw size={15} /> Refresh</button></div><div className="mt-4 grid md:grid-cols-2 xl:grid-cols-3 gap-3">{captures.length ? captures.map((capture) => <article key={capture.id} className="glass-card rounded-xl p-4"><p className="font-semibold text-slate-100">{capture.label}</p><p className="text-xs text-slate-300 mt-1">{capture.scenario} · {capture.simTime}s · {capture.vehicleCount} vehicles</p><p className="text-xs text-slate-300 mt-3">Queue {capture.metrics.queueLength}, wait {number(capture.metrics.waitingTimeSeconds, 's')}, CO₂ {number(capture.metrics.co2MgPerSecond, ' mg/s')}</p></article>) : <p className="text-sm text-slate-300">No instances captured yet.</p>}</div></section>
  </div>;
};

const Result = ({ title, data }) => <article className="glass-card rounded-xl p-4"><div className="flex gap-2 items-center"><BarChart3 size={16} className="text-cyan-300" /><h4 className="font-semibold text-slate-100">{title}</h4></div>{data ? <dl className="mt-4 grid grid-cols-2 gap-y-3 text-sm"><dt className="text-slate-300">Average queue</dt><dd className="font-mono text-slate-100">{number(data.avg_queue_length)}</dd><dt className="text-slate-300">Average wait</dt><dd className="font-mono text-slate-100">{number(data.avg_waiting_time, ' s')}</dd><dt className="text-slate-300">Total CO₂</dt><dd className="font-mono text-slate-100">{number(data.total_co2_kg, ' kg')}</dd><dt className="text-slate-300">Throughput</dt><dd className="font-mono text-slate-100">{data.throughput ?? 'N/A'}</dd></dl> : <p className="mt-4 text-sm text-amber-200">No result. See the evaluator message above.</p>}</article>;
