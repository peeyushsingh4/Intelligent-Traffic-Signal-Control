import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, CheckCircle, XCircle, ShieldCheck, AlertCircle, Eye, 
  MapPin, Clock, Camera, User, FileText, Play, Check 
} from 'lucide-react';

export const EvidenceViewer = ({ violationOverride = null, onClose = null }) => {
  const { selectedViolation, closeEvidenceModal, handleApproveViolation, handleDismissViolation, violations } = useApp();

  const violation = violationOverride || selectedViolation || violations[0];
  const [selectedSnapshot, setSelectedSnapshot] = useState(0);

  if (!violation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl overflow-y-auto">
      <div className="glass-panel w-full max-w-5xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg ${
              violation.violationType === 'RED_LIGHT' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              violation.violationType === 'OVERSPEEDING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            }`}>
              {violation.violationType.replace('_', ' ')}
            </span>
            <h2 className="text-base font-bold text-white font-mono tracking-wide">{violation.id}</h2>
            <span className="text-xs text-slate-400 font-mono">({violation.timestamp})</span>
          </div>

          <button 
            onClick={onClose || closeEvidenceModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
          
          {/* Left Column: Media Evidence Player & Gallery (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Primary Snapshot Display */}
            <div className="relative w-full h-72 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 group">
              <img 
                src={violation.snapshots[selectedSnapshot]} 
                alt="Violation Evidence"
                className="w-full h-full object-cover"
              />
              
              {/* ANPR OCR Bounding Box Overlay */}
              <div className="absolute bottom-6 left-6 border-2 border-emerald-400 rounded-lg p-2 bg-slate-950/90 backdrop-blur-md flex items-center space-x-3 glow-emerald">
                <div className="text-[10px] font-mono text-slate-400">ANPR OCR:</div>
                <div className="text-base font-bold font-mono text-emerald-400 tracking-wider">{violation.plateNumber}</div>
                <div className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500 text-slate-950 font-bold rounded">
                  {(violation.anprConfidence * 100).toFixed(1)}% Match
                </div>
              </div>
            </div>

            {/* 3 Snapshot Thumbnails Gallery */}
            <div className="grid grid-cols-3 gap-3">
              {violation.snapshots.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSnapshot(idx)}
                  className={`relative rounded-xl overflow-hidden h-20 border-2 transition ${
                    selectedSnapshot === idx ? 'border-emerald-400 glow-emerald' : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Snapshot ${idx+1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[9px] font-mono bg-slate-950/80 text-white rounded">
                    Frame #{idx+1}
                  </span>
                </button>
              ))}
            </div>

            {/* Video Clip Stream Section */}
            <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span className="font-mono text-slate-300">10-Sec High-Definition Violation Recording</span>
              </div>
              <a 
                href={violation.videoUrl} 
                target="_blank" 
                rel="noreferrer"
                className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 text-xs font-mono font-bold transition"
              >
                Play Recording
              </a>
            </div>

          </div>

          {/* Right Column: Violation & Vehicle Verification Details (5 cols) */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            
            <div className="space-y-4">
              
              {/* Confidence & Status Header */}
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-xs font-mono text-slate-400">AI Inference Assessment</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-white">Detection Confidence</div>
                  <div className="text-base font-bold font-mono text-emerald-400">{(violation.aiConfidence * 100).toFixed(1)}%</div>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full" style={{ width: `${violation.aiConfidence * 100}%` }}></div>
                </div>
              </div>

              {/* Vehicle & Owner DB Lookup Details */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-white font-display">Vehicle Registration Info</span>
                  <span className="text-[10px] font-mono text-emerald-400">RTO Verified</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Owner Name</span>
                    <span className="text-white font-bold">{violation.ownerName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Vehicle Model</span>
                    <span className="text-slate-200">{violation.vehicleMake}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Registered Mobile</span>
                    <span className="text-slate-300">{violation.ownerPhone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Repeat Violations</span>
                    <span className={`font-bold ${violation.repeatCount >= 3 ? 'text-red-400' : 'text-slate-300'}`}>
                      {violation.repeatCount} {violation.repeatCount >= 3 ? '(2x Fine Multiplier)' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Calculated Fine Card */}
              <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-mono">Calculated Penalty Amount</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">₹{violation.fineAmount}</div>
                </div>
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>

            </div>

            {/* Operator Approval / Dismissal Actions */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
              <button 
                onClick={() => handleDismissViolation(violation.id)}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/30 font-bold text-xs transition flex items-center justify-center space-x-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Dismiss Violation</span>
              </button>

              <button 
                onClick={() => handleApproveViolation(violation.id)}
                className="py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center justify-center space-x-2 glow-emerald"
              >
                <Check className="w-4 h-4" />
                <span>Approve & Issue Fine</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
