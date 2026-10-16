import React, { useState, useEffect, useRef } from 'react';
import { Network, AlertOctagon, RefreshCw, ZoomIn, ZoomOut, Maximize2, ShieldAlert } from 'lucide-react';
import { FraudCluster, GraphNode } from '../lib/types';
import { EmptyState } from './ui/Skeletons';

interface FraudRingGraphProps {
  clusters: FraudCluster[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const FraudRingGraph: React.FC<FraudRingGraphProps> = ({
  clusters,
  isLoading,
  onRefresh,
}) => {
  const [selectedClusterId, setSelectedClusterId] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Set default cluster on load
  useEffect(() => {
    if (clusters.length > 0 && !selectedClusterId) {
      setSelectedClusterId(clusters[0].cluster_id);
    }
  }, [clusters, selectedClusterId]);

  const activeCluster = clusters.find((c) => c.cluster_id === selectedClusterId) || clusters[0];

  // Force-directed simulation on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeCluster || !activeCluster.nodes.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const nodes = activeCluster.nodes.map((n, i) => {
      // Initialize in circle layout
      const angle = (i / activeCluster.nodes.length) * 2 * Math.PI;
      const radius = Math.min(width, height) * 0.32;
      return {
        ...n,
        x: width / 2 + radius * Math.cos(angle) + (Math.random() - 0.5) * 20,
        y: height / 2 + radius * Math.sin(angle) + (Math.random() - 0.5) * 20,
        vx: 0,
        vy: 0,
      };
    });

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    let animationId: number;
    let iteration = 0;
    const maxIterations = 140;

    const simulate = () => {
      // 1. Repulsion between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 1800 / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          n1.vx -= fx;
          n1.vy -= fy;
          n2.vx += fx;
          n2.vy += fy;
        }
      }

      // 2. Attraction along edges
      activeCluster.links.forEach((link) => {
        const sourceNode = nodeMap.get(typeof link.source === 'string' ? link.source : (link.source as any).id);
        const targetNode = nodeMap.get(typeof link.target === 'string' ? link.target : (link.target as any).id);
        if (sourceNode && targetNode) {
          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetDist = 110;
          const force = (dist - targetDist) * 0.04;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          sourceNode.vx += fx;
          sourceNode.vy += fy;
          targetNode.vx -= fx;
          targetNode.vy -= fy;
        }
      });

      // 3. Center gravity & velocity dampening
      nodes.forEach((node) => {
        const dx = width / 2 - node.x;
        const dy = height / 2 - node.y;
        node.vx += dx * 0.015;
        node.vy += dy * 0.015;

        node.vx *= 0.82;
        node.vy *= 0.82;

        node.x += node.vx;
        node.y += node.vy;

        // Bounding box
        node.x = Math.max(40, Math.min(width - 40, node.x));
        node.y = Math.max(40, Math.min(height - 40, node.y));
      });

      // 4. Render frame
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-width / 2, -height / 2);

      // Render links with arrows
      activeCluster.links.forEach((link) => {
        const source = nodeMap.get(typeof link.source === 'string' ? link.source : (link.source as any).id);
        const target = nodeMap.get(typeof link.target === 'string' ? link.target : (link.target as any).id);
        if (!source || !target) return;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = link.is_fraud ? 'rgba(244, 63, 94, 0.7)' : 'rgba(113, 113, 122, 0.4)';
        ctx.lineWidth = link.is_fraud ? 2.2 : 1.2;
        ctx.stroke();

        // Directional arrow head
        const angle = Math.atan2(target.y - source.y, target.x - source.x);
        const arrowDist = 20; // Offset from target center
        const arrowX = target.x - arrowDist * Math.cos(angle);
        const arrowY = target.y - arrowDist * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(
          arrowX - 8 * Math.cos(angle - Math.PI / 6),
          arrowY - 8 * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          arrowX - 8 * Math.cos(angle + Math.PI / 6),
          arrowY - 8 * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = link.is_fraud ? 'rgba(244, 63, 94, 0.85)' : 'rgba(161, 161, 170, 0.6)';
        ctx.fill();
      });

      // Render nodes
      nodes.forEach((node) => {
        const isSelected = selectedNode?.id === node.id;
        const nodeRadius = node.role === 'MULE_HUB' ? 16 : 12;

        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);

        // Fill color based on role
        if (node.role === 'MULE_HUB') {
          ctx.fillStyle = '#f43f5e'; // Rose
        } else if (node.role === 'SOURCE') {
          ctx.fillStyle = '#f59e0b'; // Amber
        } else if (node.role === 'DESTINATION') {
          ctx.fillStyle = '#a855f7'; // Purple
        } else {
          ctx.fillStyle = '#38bdf8'; // Sky
        }
        ctx.fill();

        // Border
        ctx.lineWidth = isSelected ? 3.5 : 2;
        ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(24, 24, 27, 0.9)';
        ctx.stroke();

        // Account Label
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = isSelected ? '#ffffff' : '#d4d4d8';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + nodeRadius + 12);
      });

      ctx.restore();

      iteration++;
      if (iteration < maxIterations) {
        animationId = requestAnimationFrame(simulate);
      }
    };

    simulate();

    // Click handler for node selection
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = (e.clientX - rect.left - width / 2) / zoom + width / 2;
      const clickY = (e.clientY - rect.top - height / 2) / zoom + height / 2;

      let clickedNode: GraphNode | null = null;
      for (const node of nodes) {
        const dist = Math.hypot(node.x - clickX, node.y - clickY);
        if (dist <= 20) {
          clickedNode = node;
          break;
        }
      }
      setSelectedNode(clickedNode);
    };

    canvas.addEventListener('click', handleCanvasClick);

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [activeCluster, zoom, selectedNode]);

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center bg-zinc-900/50 border border-zinc-800 rounded-xl animate-pulse">
        <div className="flex flex-col items-center gap-2 text-zinc-400 text-xs">
          <Network className="w-8 h-8 animate-spin text-emerald-400" />
          <span>Executing Louvain community detection & cycle analysis...</span>
        </div>
      </div>
    );
  }

  if (!clusters || clusters.length === 0) {
    return (
      <EmptyState
        title="No Fraud Rings Detected"
        description="Run stream simulation to ingest transactions and build the transaction graph."
        actionText="Refresh Graph Analytics"
        onAction={onRefresh}
        icon={<Network className="w-6 h-6" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header bar: Cluster selection and risk badge */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-zinc-100">
                Community Detection: {activeCluster.cluster_id}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Risk Score: {activeCluster.suspicion_score} / 100
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {activeCluster.size} Colluding Accounts | {activeCluster.edge_count} Interconnected Transactions | Density {activeCluster.density}
            </p>
          </div>
        </div>

        {/* Cluster Selector & Controls */}
        <div className="flex items-center gap-2">
          <select
            value={selectedClusterId}
            onChange={(e) => {
              setSelectedClusterId(e.target.value);
              setSelectedNode(null);
            }}
            className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {clusters.map((c) => (
              <option key={c.cluster_id} value={c.cluster_id}>
                {c.cluster_id} - Score: {c.suspicion_score} ({c.size} accounts)
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 p-1 rounded-lg">
            <button
              onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
              className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
              className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(1.0)}
              className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded cursor-pointer"
              title="Reset Zoom"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onRefresh}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors cursor-pointer"
            title="Recalculate Network Graph"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas & Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Canvas Graph View */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden relative min-h-[480px] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={720}
            height={480}
            className="w-full h-full cursor-crosshair"
          />

          {/* Role Legend overlay */}
          <div className="absolute bottom-3 left-3 bg-zinc-900/90 backdrop-blur-sm border border-zinc-800 p-2.5 rounded-lg flex flex-wrap items-center gap-3 text-[11px] text-zinc-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Mule Hub</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Laundering Source</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>Cash-Out Dest</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span>Member Node</span>
            </div>
          </div>
        </div>

        {/* Account Node Inspector & Cluster Metrics Panel */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Fraud Ring Audit Dossier
            </h3>
            <p className="text-xs text-zinc-400">
              Topological anomaly analysis powered by NetworkX
            </p>
          </div>

          {/* Cluster Summary Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <span className="text-zinc-500 block text-[10px]">TOTAL RING VOLUME</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                ${activeCluster.total_volume.toLocaleString()}
              </span>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <span className="text-zinc-500 block text-[10px]">CIRCULAR CYCLES</span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {activeCluster.cycle_count} detected
              </span>
            </div>
          </div>

          {/* Node Inspector Details */}
          {selectedNode ? (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                <span className="font-mono font-bold text-xs text-zinc-100">
                  {selectedNode.id}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {selectedNode.role}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Transacted Volume:</span>
                  <span className="font-mono text-zinc-200 font-medium">
                    ${selectedNode.volume.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>In-Degree (Transfers In):</span>
                  <span className="font-mono text-zinc-200">{selectedNode.in_degree}</span>
                </div>
                <div className="flex justify-between">
                  <span>Out-Degree (Transfers Out):</span>
                  <span className="font-mono text-zinc-200">{selectedNode.out_degree}</span>
                </div>
                <div className="flex justify-between">
                  <span>Flagged Anomalies:</span>
                  <span className="font-mono text-rose-400">
                    {selectedNode.is_flagged ? 'YES' : 'NONE'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950/40 text-xs text-zinc-400">
              Click any node in the graph above to inspect its ledger, transaction in/out flow, and mule risk score.
            </div>
          )}

          {/* Ring Member Account Roster */}
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-2">
              Colluding Cluster Accounts ({activeCluster.nodes.length})
            </span>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {activeCluster.nodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    selectedNode?.id === node.id
                      ? 'bg-zinc-800 border border-zinc-700 text-zinc-100'
                      : 'bg-zinc-950/60 hover:bg-zinc-800/40 text-zinc-300'
                  }`}
                >
                  <span>{node.id}</span>
                  <span className="text-[10px] text-zinc-400">{node.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
