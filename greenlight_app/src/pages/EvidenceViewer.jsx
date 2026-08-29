import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, CheckCircle, XCircle, ShieldCheck, AlertCircle, Eye, 
  MapPin, Clock, Camera, User, FileText, Play, Check, ShieldAlert, ArrowRight 
} from 'lucide-react';

export const EvidenceViewer = ({ violationOverride = null, onClose = null }) => {
  const { 
    selectedViolation, 
    closeEvidenceModal, 
    handleApproveFine, 
    handleDismissFine, 
    violations,
    openEvidenceModal 
  } = useApp();

  const isModal = Boolean(violationOverride || selectedViolation);
  const [selectedViolationIndex, setSelectedViolationIndex] = useState(0);
  const [selectedSnapshot, setSelectedSnapshot] = useState(0);

  const activeViolation = violationOverride || selectedViolation || violations[selectedViolationIndex] || violations[0] || {};
  const snapshots = activeViolation.snapshots || activeViolation.evidenceUrls || [
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80'
  ];

  const content = (
    <div className="glass-panel w-full rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center space-x-3">
          <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg ${
            activeViolation.violationType === 'RED_LIGHT' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
            activeViolation.violationType === 'OVERSPEEDING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
            'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
          }`}>
            {(activeViolation.violationType || 'VIOLATION').replace('_', ' ')}
          </span>
          <h2 className="text-base font-bold text-white font-mono tracking-wide">{activeViolation.id || 'VIOL-001'}</h2>
          <span className="text-xs text-slate-400 font-mono">({activeViolation.timestamp ? activeViolation.timestamp.split('T')[0] : 'Today'})</span>
        </div>

        {isModal && (
          <button 
            onClick={onClose || closeEvidenceModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
        
        {/* Left Column: Media Evidence Player & Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Primary Snapshot Display */}
          <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 group">
            <img 
              src={snapshots[selectedSnapshot] || snapshots[0]} 
              alt="Violation Evidence"
              className="w-full h-full object-cover"
            />
            
            {/* ANPR OCR Bounding Box Overlay */}
            <div className="absolute bottom-6 left-6 border-2 border-emerald-400 rounded-lg p-2.5 bg-slate-950/90 backdrop-blur-md flex items-center space-x-3 glow-emerald">
              <div className="text-[10px] font-mono text-slate-400 uppercase">ANPR OCR:</div>
              <div className="text-base font-bold font-mono text-emerald-400 tracking-wider">{activeViolation.plateNumber || 'MH 02 CZ 4921'}</div>
              <div className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500 text-slate-950 font-bold rounded">
                {((activeViolation.anprConfidence || activeViolation.confidence || 0.94) * 100).toFixed(1)}% Match
              </div>
            </div>
          </div>

          {/* 3 Snapshot Thumbnails Gallery */}
          <div className="grid grid-cols-3 gap-3">
            {snapshots.map((img, idx) => (
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
              href={activeViolation.videoUrl || 'https://assets.mixkit.co/videos/1755/1755-720.mp4'} 
              target="_blank" 
              rel="noreferrer"
              className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 text-xs font-mono font-bold transition"
            >
              Play Video Stream
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
                <div className="text-base font-bold font-mono text-emerald-400">
                  {((activeViolation.aiConfidence || activeViolation.confidence || 0.94) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full" style={{ width: `${(activeViolation.aiConfidence || activeViolation.confidence || 0.94) * 100}%` }}></div>
              </div>
            </div>

            {/* Vehicle & Owner DB Lookup Details */}
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white font-display">Vehicle Registration Info</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">RTO Verified</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">Owner Name</span>
                  <span className="text-white font-bold">{activeViolation.ownerName || 'Arun Patel'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Vehicle Model</span>
                  <span className="text-slate-200">{activeViolation.vehicleMake || activeViolation.vehicleMakeModel || 'Maruti Suzuki Swift'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Registered Mobile</span>
                  <span className="text-slate-300">{activeViolation.ownerPhone || activeViolation.ownerMobile || '+91 98201 44921'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Repeat Violations</span>
                  <span className={`font-bold ${(activeViolation.repeatCount || 1) >= 3 ? 'text-red-400' : 'text-slate-300'}`}>
                    {activeViolation.repeatCount || 1} {(activeViolation.repeatCount || 1) >= 3 ? '(2x Multiplier)' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Calculated Fine Card */}
            <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-mono">Calculated Penalty Amount</div>
                <div className="text-xl font-bold font-mono text-emerald-400">₹{activeViolation.fineAmount || 1000}</div>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>

          </div>

          {/* Operator Approval / Dismissal Actions */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
            <button 
              onClick={() => handleDismissFine && handleDismissFine(activeViolation.id)}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/30 font-bold text-xs transition flex items-center justify-center space-x-2"
            >
              <XCircle className="w-4 h-4" />
              <span>Dismiss Violation</span>
            </button>

            <button 
              onClick={() => handleApproveFine && handleApproveFine(activeViolation.id)}
              className="py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center justify-center space-x-2 glow-emerald"
            >
              <Check className="w-4 h-4" />
              <span>Approve & Issue Fine</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl overflow-y-auto">
        <div className="w-full max-w-5xl max-h-[90vh] flex flex-col">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
      
      {/* Left Sidebar: Violation Queue List */}
      <div className="lg:col-span-4 glass-panel p-4 rounded-3xl border border-slate-800 space-y-3 flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm font-display">Violations Review Queue</h3>
          </div>
          <span className="text-xs font-mono text-slate-400 font-bold">{violations.length} Cases</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {violations.map((v, idx) => {
            const isSelected = activeViolation.id === v.id;
            return (
              <div 
                key={v.id}
                onClick={() => {
                  setSelectedViolationIndex(idx);
                  setSelectedSnapshot(0);
                }}
                className={`p-3.5 rounded-2xl border transition cursor-pointer font-mono text-xs ${
                  isSelected 
                    ? 'bg-emerald-500/10 border-emerald-500 text-white glow-emerald' 
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white">{v.plateNumber}</span>
                  <span className="px-2 py-0.5 text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 rounded">
                    {v.violationType}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>{v.ownerName}</span>
                  <span className="text-emerald-400 font-bold">₹{v.fineAmount}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Main Panel: Evidence Details */}
      <div className="lg:col-span-8 flex flex-col">
        {content}
      </div>

    </div>
  );
};
