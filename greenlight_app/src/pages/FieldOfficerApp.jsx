import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, Search, AlertTriangle, Car, CheckCircle, Navigation } from 'lucide-react';

export const FieldOfficerApp = () => {
  const { violations } = useApp();
  const [searchPlate, setSearchPlate] = useState('MH 02 CZ 4921');
  const [searchedRecord, setSearchedRecord] = useState(violations[0]);

  const handleSearch = (e) => {
    e.preventDefault();
    const found = violations.find(v => v.plateNumber.toLowerCase().includes(searchPlate.toLowerCase())) || violations[0];
    setSearchedRecord(found);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-950 overflow-y-auto">
      
      <div className="w-full max-w-sm bg-slate-900 border-4 border-slate-800 rounded-[2.5rem] p-4 shadow-2xl space-y-4 overflow-hidden flex flex-col justify-between min-h-[640px] relative glow-amber">
        
        {/* Notch */}
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 px-2 pt-1 border-b border-slate-800 pb-2">
          <span>POLICE SECURE</span>
          <span className="text-amber-400 font-bold">PATROL UNIT #4</span>
        </div>

        {/* Header */}
        <div className="flex items-center space-x-2 justify-center py-1">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <span className="font-display font-bold text-white text-sm">Traffic Officer Patrol Console</span>
        </div>

        {/* Plate Search Form */}
        <form onSubmit={handleSearch} className="space-y-2 font-mono text-xs">
          <label className="text-[10px] text-slate-400">Scan / Search Vehicle Number</label>
          <div className="flex space-x-2">
            <input 
              type="text" 
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value)}
              className="flex-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold uppercase focus:outline-none focus:border-amber-500"
            />
            <button type="submit" className="p-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Vehicle Record Results */}
        {searchedRecord && (
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs my-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-amber-400 font-bold text-sm">{searchedRecord.plateNumber}</span>
              <span className="px-2 py-0.5 text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 rounded font-bold">
                {searchedRecord.repeatCount} Repeat Violations
              </span>
            </div>

            <div className="space-y-1 text-slate-300">
              <div>Owner: <span className="text-white font-bold">{searchedRecord.ownerName}</span></div>
              <div>Make: <span className="text-slate-400">{searchedRecord.vehicleMake} ({searchedRecord.vehicleColor})</span></div>
              <div>Latest Infringement: <span className="text-amber-400 font-bold">{searchedRecord.violationType}</span></div>
              <div>Outstanding Penalty: <span className="text-red-400 font-bold">₹{searchedRecord.fineAmount}</span></div>
            </div>
          </div>
        )}

        {/* Incident Alert Dispatch Banner */}
        <div className="bg-red-500/10 p-3 rounded-2xl border border-red-500/30 space-y-1 text-xs">
          <div className="flex items-center space-x-2 text-red-400 font-bold font-mono">
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            <span>ACCIDENT ALERT: BKC FLYOVER</span>
          </div>
          <div className="text-[10px] text-slate-300 font-sans">Multi-vehicle congestion detected. Reroute dispatched via Signage.</div>
        </div>

        <div className="w-24 h-1 bg-slate-700 rounded-full mx-auto mb-1"></div>

      </div>

    </div>
  );
};
