import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Car, Shield, CheckCircle2, CreditCard, Lock, FileText, 
  AlertCircle, QrCode, Search, Download, ExternalLink, Calendar, 
  MapPin, AlertTriangle, Check, Smartphone, Laptop, RefreshCw, Eye, X, ArrowRight,
  Camera, Scale, ShieldAlert, History
} from 'lucide-react';
import { REGISTERED_VEHICLES } from '../data/mockData';

export const VehicleOwnerPortal = ({ activeSection = 'citizen_vehicles' }) => {
  const { fines, handlePayFine, handleDisputeFine, violations, setActiveTab } = useApp();

  // Selected portal sub-view: 'VEHICLES', 'EVIDENCE', 'DISPUTES'
  const getSectionFromTab = (tab) => {
    if (tab === 'citizen_evidence') return 'EVIDENCE';
    if (tab === 'citizen_disputes') return 'DISPUTES';
    return 'VEHICLES';
  };

  const [currentSection, setCurrentSection] = useState(getSectionFromTab(activeSection));

  useEffect(() => {
    if (activeSection) {
      setCurrentSection(getSectionFromTab(activeSection));
    }
  }, [activeSection]);

  const handleSwitchSection = (sec) => {
    setCurrentSection(sec);
    if (sec === 'EVIDENCE') setActiveTab('citizen_evidence');
    else if (sec === 'DISPUTES') setActiveTab('citizen_disputes');
    else setActiveTab('citizen_vehicles');
  };

  // Active searched / selected vehicle
  const [selectedPlate, setSelectedPlate] = useState('MH 02 CZ 4921');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, PAID, DISPUTED
  
  // Modals state
  const [activeEvidenceChallan, setActiveEvidenceChallan] = useState(null);
  const [activePayChallan, setActivePayChallan] = useState(null);
  const [activeDisputeChallan, setActiveDisputeChallan] = useState(null);

  // Pay modal state
  const [paymentStep, setPaymentStep] = useState('METHOD'); // METHOD, PROCESSING, SUCCESS
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentTxn, setPaymentTxn] = useState('');

  // Dispute modal state
  const [disputeReason, setDisputeReason] = useState('EMERGENCY_YIELD');
  const [disputeNote, setDisputeNote] = useState('');
  const [disputeSubmitted, setDisputeSubmitted] = useState(false);

  // View layout toggle: 'DESKTOP' or 'MOBILE_MOCKUP'
  const [viewLayout, setViewLayout] = useState('DESKTOP');

  // Lookup vehicle details from registry or generate standard entry
  const vehicle = REGISTERED_VEHICLES[selectedPlate] || {
    plateNumber: selectedPlate,
    ownerName: 'Registered Citizen Owner',
    phone: '+91 98200 XXXXX',
    email: 'citizen.owner@parivahan.gov.in',
    model: 'Personal Motor Vehicle (LMV)',
    vehicleClass: 'Motor Car (LMV)',
    fuelType: 'Petrol / BS-VI',
    color: 'Standard Finish',
    rto: 'MH-02 Mumbai West',
    registrationDate: '10-Jan-2023',
    chassisNo: 'MA3EWB31S00******',
    engineNo: 'K12MN87******',
    insuranceCompany: 'National Insurance Company',
    insurancePolicyNo: 'NIC-MOT-2026-XXXXX',
    insuranceExpiry: '31-Dec-2026',
    pucCertNo: 'MH02PUC2026XXXX',
    pucExpiry: '30-Oct-2026',
    status: 'ACTIVE_REGISTERED'
  };

  // Fines for this vehicle
  const vehicleFines = fines.filter(f => f.plateNumber.replace(/\s+/g, '') === selectedPlate.replace(/\s+/g, ''));
  
  // Apply status filter
  const displayedFines = vehicleFines.filter(f => {
    if (statusFilter === 'ALL') return true;
    return f.status === statusFilter;
  });

  const totalDue = vehicleFines
    .filter(f => f.status === 'PENDING')
    .reduce((acc, f) => acc + (f.amount || 1000), 0);

  const totalPaid = vehicleFines
    .filter(f => f.status === 'PAID')
    .reduce((acc, f) => acc + (f.amount || 1000), 0);

  const totalDisputed = vehicleFines
    .filter(f => f.status === 'DISPUTED').length;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const formatted = searchInput.trim().toUpperCase();
      setSelectedPlate(formatted);
      setSearchInput('');
    }
  };

  const handleStartPayment = (challan) => {
    setActivePayChallan(challan);
    setPaymentStep('METHOD');
  };

  const handleProcessPayment = () => {
    setPaymentStep('PROCESSING');
    setTimeout(() => {
      const txn = handlePayFine(activePayChallan.id, `${paymentMethod} (e-Challan Portal)`);
      setPaymentTxn(txn);
      setPaymentStep('SUCCESS');
    }, 1200);
  };

  const handleStartDispute = (challan) => {
    setActiveDisputeChallan(challan);
    setDisputeReason('EMERGENCY_YIELD');
    setDisputeNote('');
    setDisputeSubmitted(false);
  };

  const handleSubmitDispute = (e) => {
    e.preventDefault();
    handleDisputeFine(activeDisputeChallan.id, disputeReason, disputeNote);
    setDisputeSubmitted(true);
    setTimeout(() => {
      setActiveDisputeChallan(null);
      setDisputeSubmitted(false);
    }, 1800);
  };

  // Find snapshot for active challan
  const getChallanSnapshot = (challan) => {
    const matchedViol = violations.find(v => v.plateNumber === challan.plateNumber);
    if (matchedViol && matchedViol.snapshots && matchedViol.snapshots.length > 0) {
      return matchedViol.snapshots[0];
    }
    return '/videos/sample_tracked_frame.jpg';
  };

  return (
    <div className="h-[calc(100vh-4rem)] p-4 lg:p-6 flex flex-col space-y-4 overflow-y-auto font-sans bg-slate-950">
      
      {/* ─── Portal Header & IAM Public Banner ─── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/90 p-4 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 glow-amber">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white font-display">e-Challan Citizen Portal</h2>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                IAM: CITIZEN_READ_PAY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Official Parivahan Digital Enforcement Gateway · Ministry of Road Transport & Highways
            </p>
          </div>
        </div>

        {/* Quick Vehicle Search & Layout Switcher */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <form onSubmit={handleSearch} className="flex-1 md:w-64 relative">
            <input 
              type="text"
              placeholder="Search Reg. No (e.g. MH 04 ER 8812)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 font-mono uppercase focus:outline-none focus:border-amber-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </form>

          {/* Quick Demo Selector */}
          <select 
            value={selectedPlate}
            onChange={(e) => setSelectedPlate(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs font-mono text-amber-300 py-1.5 px-2 rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="MH 02 CZ 4921">MH 02 CZ 4921 (Arun Patel)</option>
            <option value="MH 04 ER 8812">MH 04 ER 8812 (Vikram Shinde)</option>
            <option value="KA 03 MN 9210">KA 03 MN 9210 (Rajesh Kumar)</option>
            <option value="DL 01 AB 3490">DL 01 AB 3490 (Sanjay Sharma)</option>
          </select>

          {/* Device Mockup Toggle */}
          <div className="hidden sm:flex bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setViewLayout('DESKTOP')}
              className={`p-1.5 rounded-lg transition ${viewLayout === 'DESKTOP' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Desktop Portal View"
            >
              <Laptop size={14} />
            </button>
            <button
              onClick={() => setViewLayout('MOBILE_MOCKUP')}
              className={`p-1.5 rounded-lg transition ${viewLayout === 'MOBILE_MOCKUP' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Mobile Device Preview"
            >
              <Smartphone size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Top Navigation Tabs for Citizen Modules ─── */}
      <div className="flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 text-xs font-mono">
        <button
          onClick={() => handleSwitchSection('VEHICLES')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
            currentSection === 'VEHICLES' 
              ? 'bg-amber-500 text-slate-950 shadow-md font-black' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Car size={15} />
          <span>My Vehicles & Fines</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${currentSection === 'VEHICLES' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-amber-400'}`}>
            {vehicleFines.length}
          </span>
        </button>

        <button
          onClick={() => handleSwitchSection('EVIDENCE')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
            currentSection === 'EVIDENCE' 
              ? 'bg-amber-500 text-slate-950 shadow-md font-black' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileText size={15} />
          <span>Evidence & Photos</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${currentSection === 'EVIDENCE' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-cyan-400'}`}>
            CCTV Proof
          </span>
        </button>

        <button
          onClick={() => handleSwitchSection('DISPUTES')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
            currentSection === 'DISPUTES' 
              ? 'bg-amber-500 text-slate-950 shadow-md font-black' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <AlertCircle size={15} />
          <span>Dispute & Grievance Center</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${currentSection === 'DISPUTES' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-amber-300'}`}>
            {totalDisputed > 0 ? `${totalDisputed} Active` : 'Appeal'}
          </span>
        </button>
      </div>

      {/* ─── DESKTOP VIEW: SECTION 1 (MY VEHICLES & FINES) ─── */}
      {viewLayout === 'DESKTOP' && currentSection === 'VEHICLES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          
          {/* LEFT: Registered Vehicle Dossier & Status (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Vehicle Card with HSRP Styling */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4 relative overflow-hidden">
              
              {/* High Security Registration Plate (HSRP) Graphic */}
              <div className="p-3 bg-white text-black rounded-xl border-2 border-slate-300 shadow-md font-mono flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex flex-col items-center justify-center pr-2 border-r border-slate-300 text-[9px] font-bold text-blue-900 leading-tight">
                    <span>IND</span>
                    <span className="w-2 h-2 rounded-full bg-blue-700 mt-0.5"></span>
                  </div>
                  <span className="text-lg font-black tracking-widest">{vehicle.plateNumber}</span>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded border border-slate-200">
                  {vehicle.rto.split(' ')[0]}
                </span>
              </div>

              {/* Vehicle Specifications */}
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Registered Owner</span>
                  <strong className="text-white">{vehicle.ownerName}</strong>
                </div>

                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Make & Model</span>
                  <span className="text-slate-200 font-bold">{vehicle.model}</span>
                </div>

                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Vehicle Class</span>
                  <span className="text-slate-300">{vehicle.vehicleClass}</span>
                </div>

                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Fuel Type</span>
                  <span className="text-emerald-400 font-bold">{vehicle.fuelType}</span>
                </div>

                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">RTO Jurisdiction</span>
                  <span className="text-slate-300">{vehicle.rto}</span>
                </div>

                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Registration Date</span>
                  <span className="text-slate-300">{vehicle.registrationDate}</span>
                </div>

                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Insurance Policy</span>
                  <span className="text-emerald-400 font-bold">{vehicle.insuranceExpiry}</span>
                </div>

                <div className="flex justify-between pb-0.5">
                  <span className="text-slate-400">PUC Emission Cert</span>
                  <span className="text-emerald-400 font-bold">{vehicle.pucExpiry}</span>
                </div>
              </div>

              {/* Status Ribbon */}
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span className="font-bold">RC Status: ACTIVE</span>
                </div>
                <span className="text-[10px] text-slate-400">Parivahan Verified</span>
              </div>
            </div>

            {/* Financial Summary Card */}
            <div className="glass-panel p-4 rounded-3xl border border-slate-800 space-y-3 font-mono text-xs">
              <h4 className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Challan Summary</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30">
                  <div className="text-[10px] text-red-400">Total Due</div>
                  <div className="text-lg font-bold text-red-300 mt-0.5">₹{totalDue}</div>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="text-[10px] text-emerald-400">Paid to Date</div>
                  <div className="text-lg font-bold text-emerald-300 mt-0.5">₹{totalPaid}</div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 leading-tight">
                * As per Sec. 133A of Motor Vehicles Act, unpaid challans after 60 days are referred to the National Virtual Court.
              </div>
            </div>

          </div>

          {/* RIGHT: E-Challans Ledger & Actions (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            
            {/* Filter Bar */}
            <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 text-xs font-mono">
              <div className="flex items-center space-x-1">
                {['ALL', 'PENDING', 'PAID', 'DISPUTED'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      statusFilter === filter 
                        ? 'bg-amber-500 text-slate-950 font-black' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <span className="text-slate-400 text-[11px]">
                Showing <strong className="text-white">{displayedFines.length}</strong> of {vehicleFines.length} Challan(s)
              </span>
            </div>

            {/* Challans List */}
            <div className="space-y-3">
              {displayedFines.length === 0 ? (
                <div className="p-8 text-center glass-panel rounded-3xl border border-slate-800 space-y-2">
                  <CheckCircle2 size={32} className="text-emerald-400 mx-auto" />
                  <h3 className="text-white font-bold text-sm font-display">No Challans Found</h3>
                  <p className="text-xs text-slate-400">There are no {statusFilter.toLowerCase()} traffic fines on record for {selectedPlate}.</p>
                </div>
              ) : (
                displayedFines.map((f) => {
                  const isPending = f.status === 'PENDING';
                  const isPaid = f.status === 'PAID';
                  const isDisputed = f.status === 'DISPUTED';

                  return (
                    <div 
                      key={f.id}
                      className={`p-5 rounded-3xl border transition-all ${
                        isPending 
                          ? 'bg-red-950/10 border-red-500/40 hover:border-red-500' 
                          : isDisputed 
                            ? 'bg-amber-950/10 border-amber-500/40' 
                            : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 pb-3 border-b border-slate-800/80">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-white text-sm">{f.challanNo || f.fineId}</span>
                            <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-full ${
                              isPending ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' :
                              isPaid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {f.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-300 mt-0.5">{f.offense || f.violationType}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-black text-white font-mono">₹{f.amount}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {isPaid ? `Paid: ${f.transactionId || 'SUCCESS'}` : `Due by: ${f.dueDate || '15-Sep-2026'}`}
                          </div>
                        </div>
                      </div>

                      {/* Challan Details Row */}
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-slate-400">
                        <div>
                          <div className="text-[9px] uppercase text-slate-500">Location</div>
                          <div className="text-slate-200 truncate">BKC Gateway × WEH</div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase text-slate-500">Timestamp</div>
                          <div className="text-slate-200">27-Aug-2026 09:12 IST</div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase text-slate-500">Enforcing Camera</div>
                          <div className="text-cyan-400 font-bold">CAM-01 (YOLOv8)</div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase text-slate-500">Speed / Evidence</div>
                          <div className="text-emerald-400 font-bold">Recorded 64 km/h</div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2 items-center justify-between">
                        
                        {/* Evidence Proof Trigger */}
                        <button
                          onClick={() => setActiveEvidenceChallan(f)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <Eye size={13} className="text-cyan-400" />
                          <span>View CCTV Proof Snapshot</span>
                        </button>

                        <div className="flex gap-2">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleStartDispute(f)}
                                className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold transition flex items-center gap-1.5"
                              >
                                <AlertCircle size={13} />
                                <span>Contest / Dispute</span>
                              </button>

                              <button
                                onClick={() => handleStartPayment(f)}
                                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-black transition flex items-center gap-1.5 glow-emerald shadow-lg"
                              >
                                <CreditCard size={13} />
                                <span>Pay ₹{f.amount} Online</span>
                              </button>
                            </>
                          )}

                          {isPaid && (
                            <button
                              onClick={() => {
                                alert(`Official e-Receipt downloaded for Challan ${f.challanNo}. Transaction: ${f.transactionId}`);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono text-xs font-bold transition flex items-center gap-1.5"
                            >
                              <Download size={13} />
                              <span>Download e-Receipt</span>
                            </button>
                          )}

                          {isDisputed && (
                            <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30">
                              ⚖️ Dispute Under Review by Traffic Magistrate
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>
      )}

      {/* ─── DESKTOP VIEW: SECTION 2 (EVIDENCE & PHOTOS CENTER) ─── */}
      {viewLayout === 'DESKTOP' && currentSection === 'EVIDENCE' && (
        <div className="space-y-4 flex-1">
          <div className="bg-slate-900/80 p-4 rounded-3xl border border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Camera className="w-5 h-5 text-cyan-400" />
                <span>Photographic CCTV Violation Evidence & Proof Gallery</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated optical captures certified under Section 65B of the Indian Evidence Act for vehicle <strong className="text-white font-mono">{selectedPlate}</strong>
              </p>
            </div>
            <span className="px-3 py-1 text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl">
              ANPR Confidence: 96.4%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vehicleFines.map((f, i) => (
              <div key={f.id} className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                  <div>
                    <span className="text-xs font-bold text-white font-mono">{f.challanNo}</span>
                    <div className="text-[11px] text-amber-400 font-semibold">{f.offense || f.violationType}</div>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                    f.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {f.status}
                  </span>
                </div>

                {/* Photo Frame with Overlaid Telemetry */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black aspect-video flex items-center justify-center">
                  <img 
                    src={getChallanSnapshot(f)} 
                    alt="CCTV Evidence" 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Bounding box reticle simulation */}
                  <div className="absolute inset-x-12 inset-y-8 border-2 border-emerald-400 rounded-lg pointer-events-none shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                    <div className="absolute -top-6 left-0 bg-slate-950/95 border border-emerald-500/50 px-2 py-0.5 rounded text-[8px] font-mono text-emerald-300 font-bold">
                      PLATE: {f.plateNumber} | SPEED: 64 km/h | CO2: 28.4 mg/s
                    </div>
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[9px] font-mono text-white bg-slate-950/90 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-800">
                    <span>CAM-01: BKC Gateway</span>
                    <span>2026-08-27 09:12:30 IST</span>
                    <span className="text-emerald-400 font-bold">SHA-256 Validated</span>
                  </div>
                </div>

                {/* Evidence Metadata */}
                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div>
                    <div className="text-slate-500">Fine Amount</div>
                    <div className="text-white font-bold">₹{f.amount}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Camera Source</div>
                    <div className="text-cyan-400 font-bold">YOLOv8 ByteTrack</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Speed Over Limit</div>
                    <div className="text-red-400 font-bold">+4 km/h</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveEvidenceChallan(f)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs font-mono transition flex items-center justify-center gap-1.5"
                  >
                    <Eye size={14} className="text-cyan-400" />
                    <span>Expand High-Res Proof</span>
                  </button>
                  {f.status === 'PENDING' && (
                    <button
                      onClick={() => handleStartPayment(f)}
                      className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs font-mono transition flex items-center justify-center gap-1.5"
                    >
                      <CreditCard size={14} />
                      <span>Pay ₹{f.amount}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── DESKTOP VIEW: SECTION 3 (DISPUTE & GRIEVANCE CENTER) ─── */}
      {viewLayout === 'DESKTOP' && currentSection === 'DISPUTES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          
          {/* LEFT: Filed Grievances & Status (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900/80 p-4 rounded-3xl border border-slate-800">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>Active Grievances & Legal Contestations</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Appeals filed under Motor Vehicles Act 2019 / Rule 167A
              </p>
            </div>

            <div className="space-y-3">
              {vehicleFines.filter(f => f.status === 'DISPUTED').length === 0 ? (
                <div className="p-8 text-center glass-panel rounded-3xl border border-slate-800 space-y-2">
                  <CheckCircle2 size={32} className="text-emerald-400 mx-auto" />
                  <h4 className="text-white font-bold text-sm">No Active Disputes Pending</h4>
                  <p className="text-xs text-slate-400">All registered fines are either uncontested or settled.</p>
                </div>
              ) : (
                vehicleFines.filter(f => f.status === 'DISPUTED').map((f) => (
                  <div key={f.id} className="glass-panel p-5 rounded-3xl border border-amber-500/40 space-y-3">
                    <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                      <div>
                        <span className="font-mono font-bold text-white text-sm">{f.challanNo}</span>
                        <div className="text-xs text-amber-300 mt-0.5">{f.offense || f.violationType}</div>
                      </div>
                      <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                        UNDER REVIEW
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono space-y-1 text-slate-300">
                      <div>Ground: <strong className="text-white">{f.disputeReason || 'Emergency Vehicle Yield'}</strong></div>
                      <div>Dispute Ticket: <strong className="text-cyan-400">DISPUTE-2026-0941</strong></div>
                      <div>Adjudication Authority: <strong className="text-slate-200">Mumbai Virtual Traffic Court</strong></div>
                      <div>Expected Resolution: <strong className="text-emerald-400">Within 7 Working Days</strong></div>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      * Enforcement fine payment is frozen while your dispute is under review. You will receive an SMS update on the registered mobile number.
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT: Lodge New Dispute Form (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">Lodge a New Challan Contest / Grievance</h3>
                  <p className="text-xs text-slate-400">Submit formal appeal against an automated fine</p>
                </div>
              </div>

              {vehicleFines.filter(f => f.status === 'PENDING').length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 font-mono">
                  There are no pending fines eligible for contestation on vehicle <strong className="text-white">{selectedPlate}</strong>.
                </div>
              ) : (
                <form onSubmit={handleSubmitDispute} className="space-y-4 font-mono text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase">Select Challan to Contest</label>
                    <select 
                      onChange={(e) => {
                        const target = vehicleFines.find(f => f.id === e.target.value);
                        if (target) setActiveDisputeChallan(target);
                      }}
                      className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    >
                      {vehicleFines.filter(f => f.status === 'PENDING').map(f => (
                        <option key={f.id} value={f.id}>
                          {f.challanNo} — {f.offense || f.violationType} (₹{f.amount})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase">Legal Grounds for Exemption</label>
                    <select
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="EMERGENCY_YIELD">Yielded Right-of-Way to Emergency Vehicle (Ambulance AMB-108)</option>
                      <option value="WRONG_PLATE_OCR">Cloned Plate / Optical Recognition Error</option>
                      <option value="SIGNAL_OBSTRUCTION">Signal Obstructed by Heavy Vehicle / Tree</option>
                      <option value="ALREADY_PAID">Challan Already Cleared via Netbanking</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase">Detailed Citizen Statement</label>
                    <textarea
                      rows={4}
                      placeholder="State the circumstances (e.g., An ambulance approached with active siren and flashing lights; I crossed the stop line at 09:12 AM to allow it through)..."
                      value={disputeNote}
                      onChange={(e) => setDisputeNote(e.target.value)}
                      className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition glow-amber shadow-lg"
                  >
                    Submit Legal Dispute to Traffic Cell
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ─── MOBILE DEVICE PREVIEW MODE ─── */}
      {viewLayout === 'MOBILE_MOCKUP' && (
        <div className="flex-1 flex items-center justify-center py-4">
          <div className="w-full max-w-sm bg-slate-900 border-4 border-slate-800 rounded-[2.5rem] p-4 shadow-2xl space-y-4 overflow-hidden flex flex-col justify-between min-h-[640px] relative glow-emerald">
            
            {/* Mobile Status Bar */}
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 px-2 pt-1 border-b border-slate-800 pb-2">
              <span>9:41 AM</span>
              <div className="w-16 h-3 bg-slate-950 rounded-full mx-auto"></div>
              <span className="text-emerald-400 font-bold">5G • 100%</span>
            </div>

            {/* Brand Header */}
            <div className="flex items-center space-x-2 justify-center py-1 border-b border-slate-800 pb-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <span className="font-display font-bold text-white text-sm">e-Challan Mobile Pay</span>
            </div>

            {/* Mobile Content */}
            <div className="space-y-3 flex-1 overflow-y-auto px-1">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Vehicle Registered</div>
                <div className="text-sm font-bold text-white font-mono">{vehicle.plateNumber}</div>
                <div className="text-xs text-slate-300 font-sans">{vehicle.ownerName} · {vehicle.model}</div>
              </div>

              <div className="text-xs font-bold text-white font-mono uppercase text-[10px] text-slate-400">
                Active Fines ({vehicleFines.length})
              </div>

              {vehicleFines.map(f => (
                <div key={f.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
                  <div className="flex justify-between">
                    <span className="text-amber-400 font-bold">{f.challanNo}</span>
                    <span className="font-bold text-white">₹{f.amount}</span>
                  </div>
                  <div className="text-[11px] text-slate-300">{f.offense || f.violationType}</div>
                  
                  {f.status === 'PENDING' ? (
                    <button 
                      onClick={() => handleStartPayment(f)}
                      className="w-full py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1"
                    >
                      <CreditCard size={12} />
                      <span>Pay ₹{f.amount} Instant UPI</span>
                    </button>
                  ) : (
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>PAID: {f.transactionId}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button 
              onClick={() => setViewLayout('DESKTOP')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold transition"
            >
              Switch to Desktop Full Portal View
            </button>
          </div>
        </div>
      )}

      {/* ─── MODAL: Photographic CCTV Evidence Viewer ─── */}
      {activeEvidenceChallan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel max-w-xl w-full rounded-3xl border border-slate-700 p-6 space-y-4 shadow-2xl glow-emerald">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Official Evidence Record: {activeEvidenceChallan.challanNo}
                </h3>
              </div>
              <button 
                onClick={() => setActiveEvidenceChallan(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Photographic Capture */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black aspect-video flex items-center justify-center">
              <img 
                src={getChallanSnapshot(activeEvidenceChallan)} 
                alt="Violation Snapshot" 
                className="w-full h-full object-cover"
              />
              
              {/* Overlaid Target Reticle */}
              <div className="absolute top-4 left-4 p-2 bg-slate-950/90 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-200">
                <div>TARGET: <strong className="text-emerald-400">{activeEvidenceChallan.plateNumber}</strong></div>
                <div>CONFIDENCE: <strong className="text-cyan-400">96.4% ANPR OCR</strong></div>
                <div>FRAME SPEED: <strong className="text-amber-400">64 km/h (Limit: 60)</strong></div>
              </div>
            </div>

            {/* Evidence Audit Information */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-1 text-slate-300">
              <div>Enforcing Agency: <strong className="text-white">Mumbai Traffic Police Automated Enforcement</strong></div>
              <div>Camera Stream: <strong className="text-cyan-400">CAM-01 BKC Gateway (YOLOv8 + ByteTrack)</strong></div>
              <div>Digital Certificate: <strong className="text-emerald-400">SHA-256 Validated (Sec. 65B Indian Evidence Act)</strong></div>
            </div>

            <button
              onClick={() => setActiveEvidenceChallan(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs font-mono transition"
            >
              Close Evidence Record
            </button>
          </div>
        </div>
      )}

      {/* ─── MODAL: Instant UPI & Netbanking Payment ─── */}
      {activePayChallan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full rounded-3xl border border-slate-700 p-6 space-y-4 shadow-2xl glow-emerald">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white font-display">Bharat BillPay / Parivahan Gateway</h3>
              </div>
              {paymentStep !== 'PROCESSING' && (
                <button 
                  onClick={() => setActivePayChallan(null)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {paymentStep === 'METHOD' && (
              <div className="space-y-4 font-mono text-xs">
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="text-[10px] text-slate-400">Challan No.</div>
                    <div className="font-bold text-white">{activePayChallan.challanNo}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Payable Amount</div>
                    <div className="text-base font-black text-emerald-400">₹{activePayChallan.amount}</div>
                  </div>
                </div>

                {/* Bharat QR Code Mockup */}
                <div className="p-4 bg-white rounded-2xl text-center space-y-2 text-slate-950">
                  <div className="font-bold text-xs uppercase tracking-wider">Scan & Pay with Any UPI App</div>
                  <div className="w-36 h-36 mx-auto bg-slate-100 rounded-xl border border-slate-300 flex items-center justify-center">
                    <QrCode size={110} className="text-slate-900" />
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold">GPay · PhonePe · Paytm · BHIM</div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400">Or Select Alternative Gateway</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['UPI (Instant)', 'NetBanking (SBI/HDFC)', 'Debit Card', 'Wallets'].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m)}
                        className={`p-2 rounded-xl border text-[11px] text-left transition ${
                          paymentMethod === m 
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold' 
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleProcessPayment}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm transition glow-emerald shadow-lg"
                >
                  Confirm Payment of ₹{activePayChallan.amount}
                </button>
              </div>
            )}

            {paymentStep === 'PROCESSING' && (
              <div className="p-8 text-center space-y-3 font-mono">
                <RefreshCw size={36} className="text-emerald-400 animate-spin mx-auto" />
                <h4 className="text-white font-bold text-sm">Processing National Payment Gateway...</h4>
                <p className="text-xs text-slate-400">Verifying NPCI UPI transaction and updating RTO ledger</p>
              </div>
            )}

            {paymentStep === 'SUCCESS' && (
              <div className="p-4 text-center space-y-3 font-mono">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Payment Successful!</h4>
                  <p className="text-xs text-slate-400">Official RTO e-Challan cleared and receipt generated</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs space-y-1 text-slate-300">
                  <div>Challan: <strong className="text-white">{activePayChallan.challanNo}</strong></div>
                  <div>Transaction ID: <strong className="text-emerald-400">{paymentTxn}</strong></div>
                  <div>Amount Paid: <strong className="text-white">₹{activePayChallan.amount}</strong></div>
                </div>

                <button
                  onClick={() => setActivePayChallan(null)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
                >
                  Done & Back to Portal
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ─── MODAL: Contest / Dispute Challan ─── */}
      {activeDisputeChallan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full rounded-3xl border border-slate-700 p-6 space-y-4 shadow-2xl glow-amber">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white font-display">Contest / Dispute Challan</h3>
              </div>
              <button 
                onClick={() => setActiveDisputeChallan(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {disputeSubmitted ? (
              <div className="p-6 text-center space-y-3 font-mono">
                <CheckCircle2 size={36} className="text-amber-400 mx-auto" />
                <h4 className="text-white font-bold text-sm">Grievance Registered Successfully</h4>
                <p className="text-xs text-slate-400">
                  Tracking Ticket <strong className="text-amber-300">DISPUTE-2026-0941</strong> generated. The Traffic Police Adjudication Cell will review the CCTV timestamps.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitDispute} className="space-y-3 font-mono text-xs">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-300">
                  Challan: <strong className="text-white">{activeDisputeChallan.challanNo}</strong> (₹{activeDisputeChallan.amount})
                </div>

                <div>
                  <label className="text-[10px] text-slate-400">Legal Grounds for Dispute</label>
                  <select
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="EMERGENCY_YIELD">Yielded Right-of-Way to Ambulance / Fire Engine</option>
                    <option value="WRONG_PLATE_OCR">Incorrect Automatic Number Plate Recognition (ANPR Clone)</option>
                    <option value="SIGNAL_OBSTRUCTION">Traffic Light Obstructed by Overgrown Tree / Billboard</option>
                    <option value="ALREADY_PAID">Challan Already Paid at Local Traffic Police Chowki</option>
                    <option value="MEDICAL_EMERGENCY">Medical Emergency Patient Transport</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400">Supporting Note / Explanation</label>
                  <textarea
                    rows={3}
                    placeholder="Provide details (e.g. Ambulance siren was active, moved past stop line to clear lane)..."
                    value={disputeNote}
                    onChange={(e) => setDisputeNote(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="text-[10px] text-slate-400">
                  * Submission under Rule 167A of Motor Vehicles Rules 2021. False contestations incur penalties.
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition glow-amber shadow-lg"
                >
                  Submit Official Dispute to Traffic Cell
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
