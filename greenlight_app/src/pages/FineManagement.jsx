import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  DollarSign, FileText, Search, Filter, ShieldAlert, CheckCircle, 
  XCircle, Clock, AlertTriangle, ArrowUpRight, Send, Download 
} from 'lucide-react';

export const FineManagement = () => {
  const { fines, handleResolveDispute, openEvidenceModal, violations } = useApp();
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDisputeFine, setSelectedDisputeFine] = useState(null);

  const filteredFines = fines.filter(f => {
    const matchesStatus = filterStatus === 'ALL' || f.status === filterStatus;
    const matchesSearch = f.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.fineId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalCollected = fines.filter(f => f.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = fines.filter(f => f.status === 'PENDING' || f.status === 'OVERDUE').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="h-[calc(100vh-4rem)] p-4 lg:p-6 flex flex-col space-y-6 overflow-y-auto">
      
      {/* Top Header & Summary Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-mono">Collected Fine Revenue</div>
            <div className="text-lg font-bold font-mono text-emerald-400">₹ {totalCollected.toLocaleString()}</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-mono">Pending Collection</div>
            <div className="text-lg font-bold font-mono text-amber-400">₹ {totalPending.toLocaleString()}</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-mono">Collection Rate</div>
            <div className="text-lg font-bold font-mono text-cyan-400">84.2%</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-mono">Active Disputes</div>
            <div className="text-lg font-bold font-mono text-red-400">
              {fines.filter(f => f.status === 'DISPUTED').length} Appeals
            </div>
          </div>
        </div>

      </div>

      {/* Main Workspace Table & Adjudication Queue */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex-1 flex flex-col space-y-4">
        
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="Search Plate, Fine ID, Owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Filter Status Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {['ALL', 'PENDING', 'PAID', 'OVERDUE', 'DISPUTED'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs transition ${
                  filterStatus === st 
                    ? 'bg-emerald-500 text-slate-950 font-bold glow-emerald' 
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button className="flex items-center space-x-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs border border-slate-800">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

        </div>

        {/* Data Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-3 px-4">Fine ID</th>
                <th className="py-3 px-4">Vehicle Plate</th>
                <th className="py-3 px-4">Owner Name</th>
                <th className="py-3 px-4">Violation Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredFines.map(f => (
                <tr key={f.fineId} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-4 font-bold text-white">{f.fineId}</td>
                  <td className="py-3 px-4 font-bold text-emerald-400">{f.plateNumber}</td>
                  <td className="py-3 px-4">{f.ownerName}</td>
                  <td className="py-3 px-4">{f.violationType}</td>
                  <td className="py-3 px-4 font-bold text-white">₹{f.amount}</td>
                  <td className="py-3 px-4 text-slate-400">{f.dueDate}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      f.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      f.status === 'DISPUTED' ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' :
                      f.status === 'OVERDUE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {f.status === 'DISPUTED' && (
                      <button 
                        onClick={() => setSelectedDisputeFine(f)}
                        className="px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 text-[11px] font-bold"
                      >
                        Review Dispute
                      </button>
                    )}
                    <button 
                      onClick={() => openEvidenceModal(violations[0])}
                      className="px-2.5 py-1 bg-slate-900 text-slate-300 border border-slate-800 rounded-lg hover:bg-slate-800 text-[11px]"
                    >
                      View Proof
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Dispute Review Modal */}
      {selectedDisputeFine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
          <div className="glass-panel w-full max-w-2xl p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-display">Adjudicate Dispute: {selectedDisputeFine.fineId}</h3>
                <p className="text-xs text-slate-400 font-mono">Owner: {selectedDisputeFine.ownerName} ({selectedDisputeFine.plateNumber})</p>
              </div>
              <button onClick={() => setSelectedDisputeFine(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="text-slate-500 font-bold uppercase text-[10px]">Submitted Reason</div>
              <div className="text-amber-400 font-bold">{selectedDisputeFine.disputeDetails?.reason}</div>
              <div className="text-slate-300 font-sans italic">"{selectedDisputeFine.disputeDetails?.comment}"</div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button 
                onClick={() => {
                  handleResolveDispute(selectedDisputeFine.fineId, 'DISMISSED');
                  setSelectedDisputeFine(null);
                }}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition"
              >
                Accept Dispute & Cancel Fine
              </button>
              <button 
                onClick={() => {
                  handleResolveDispute(selectedDisputeFine.fineId, 'UPHELD');
                  setSelectedDisputeFine(null);
                }}
                className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold rounded-xl text-xs transition"
              >
                Reject Dispute & Uphold Fine
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
