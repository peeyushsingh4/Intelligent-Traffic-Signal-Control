import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  DollarSign, FileText, Search, Filter, ShieldAlert, CheckCircle, 
  XCircle, Clock, AlertTriangle, ArrowUpRight, Send, Download, Database 
} from 'lucide-react';

export const FineManagement = () => {
  const { fines, setFines } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDispute, setSelectedDispute] = useState(null);

  const filteredFines = fines.filter(f => {
    const matchesSearch = f.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.challanNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleResolveDispute = (fineId, action) => {
    setFines(prev => prev.map(f => {
      if (f.id === fineId) {
        return {
          ...f,
          status: action === 'APPROVE' ? 'WAIVED' : 'PENDING',
          disputeStatus: action === 'APPROVE' ? 'APPROVED_WAIVED' : 'REJECTED_MUST_PAY'
        };
      }
      return f;
    }));
    setSelectedDispute(null);
  };

  return (
    <div className="h-[calc(100vh-4rem)] p-4 lg:p-6 flex flex-col space-y-6 overflow-y-auto">
      
      {/* Header & Dataset Attribution Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 glow-amber">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-display">Fine Lifecycle & Dispute Adjudication Workspace</h2>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-xs text-slate-400">Motor Vehicles (Amendment) Act Compliance Engine</span>
                <span className="px-2 py-0.5 text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full flex items-center space-x-1">
                  <Database className="w-3 h-3" />
                  <span>Synthetic demo records — not connected to a vehicle-owner database</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Export & Actions */}
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs transition font-mono">
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export RTO E-Challan CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-mono">Total E-Challans Issued</div>
          <div className="text-2xl font-bold font-mono text-white">12,482</div>
          <div className="text-[10px] text-emerald-400 font-mono">+18.4% vs last month</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-mono">Fine Revenue Collected</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">₹ 4.82 Crores</div>
          <div className="text-[10px] text-slate-500 font-mono">84.2% Collection Rate</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-mono">Disputes Under Review</div>
          <div className="text-2xl font-bold font-mono text-amber-400">142</div>
          <div className="text-[10px] text-slate-500 font-mono">Avg Resolution: 4.2 Hours</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-mono">Repeat Offender License Suspensions</div>
          <div className="text-2xl font-bold font-mono text-red-400">38</div>
          <div className="text-[10px] text-slate-500 font-mono">3+ Offenses in 90 Days</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Plate (e.g. MH 02 CZ 4921), Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 font-mono"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex space-x-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          {['ALL', 'PENDING', 'PAID', 'DISPUTED'].map(status => (
            <button 
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === status ? 'bg-emerald-500 text-slate-950 font-bold glow-emerald' : 'text-slate-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Fine Database Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-4">E-Challan No.</th>
                <th className="p-4">Demo reference</th>
                <th className="p-4">Vehicle Make & Owner</th>
                <th className="p-4">Offense Details</th>
                <th className="p-4 text-right">Penalty Fine</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredFines.map(fine => (
                <tr key={fine.id} className="hover:bg-slate-900/40 transition">
                  <td className="p-4 font-bold text-white">{fine.challanNo}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-slate-950 text-emerald-400 border border-emerald-500/30 rounded-lg font-bold tracking-wider">
                      {fine.plateNumber}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-200">{fine.ownerName}</div>
                    <div className="text-[10px] text-slate-500">{fine.vehicleModel}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-slate-300">{fine.offense}</div>
                    {fine.flaggedForSuspension && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 rounded-full font-bold">
                        ⚠ License Suspension Recommended
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right font-bold text-emerald-400 text-sm">₹ {fine.amount}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                      fine.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      fine.status === 'DISPUTED' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' :
                      fine.status === 'WAIVED' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {fine.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {fine.status === 'DISPUTED' ? (
                      <button 
                        onClick={() => setSelectedDispute(fine)}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition"
                      >
                        Review Dispute
                      </button>
                    ) : (
                      <span className="text-slate-500 text-[11px]">No Action Needed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjudication Review Modal for Disputed Fine */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-display">Adjudicate Fine Dispute</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">{selectedDispute.plateNumber}</span>
            </div>

            <div className="space-y-3 text-xs font-mono bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div><strong className="text-slate-400">Appellant:</strong> {selectedDispute.ownerName} ({selectedDispute.vehicleModel})</div>
              <div><strong className="text-slate-400">Offense:</strong> {selectedDispute.offense}</div>
              <div><strong className="text-slate-400">Fine Amount:</strong> ₹{selectedDispute.amount}</div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300">
                <strong>Dispute Statement:</strong> "{selectedDispute.disputeReason}"
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button 
                onClick={() => handleResolveDispute(selectedDispute.id, 'APPROVE')}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition"
              >
                Approve Dispute & Waive Fine
              </button>
              <button 
                onClick={() => handleResolveDispute(selectedDispute.id, 'REJECT')}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl text-xs transition"
              >
                Reject & Enforce Payment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
