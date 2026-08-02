import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Smartphone, Shield, CheckCircle, CreditCard, Lock, 
  FileText, Upload, AlertCircle, ArrowLeft, Check, QrCode 
} from 'lucide-react';

export const VehicleOwnerPortal = () => {
  const { fines, violations } = useApp();
  const [step, setStep] = useState('LOGIN'); // LOGIN, VIEW_FINE, PAY, DISPUTE, SUCCESS
  const [fineIdInput, setFineIdInput] = useState('FN-2026-901');
  const [otpInput, setOtpInput] = useState('4921');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [disputeReason, setDisputeReason] = useState('Wrong Vehicle');
  const [disputeNote, setDisputeNote] = useState('');

  const activeFine = fines.find(f => f.fineId === fineIdInput) || fines[0];
  const activeViolation = violations[0];

  const handleLogin = (e) => {
    e.preventDefault();
    setStep('VIEW_FINE');
  };

  const handleCompletePayment = () => {
    activeFine.status = 'PAID';
    setStep('SUCCESS');
  };

  const handleCompleteDispute = () => {
    activeFine.status = 'DISPUTED';
    setStep('SUCCESS');
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-950 overflow-y-auto">
      
      {/* Mobile Device Mockup Frame */}
      <div className="w-full max-w-sm bg-slate-900 border-4 border-slate-800 rounded-[2.5rem] p-4 shadow-2xl space-y-4 overflow-hidden flex flex-col justify-between min-h-[640px] relative glow-emerald">
        
        {/* Mobile Notch Bar */}
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 px-2 pt-1 border-b border-slate-800 pb-2">
          <span>9:41 AM</span>
          <div className="w-16 h-3 bg-slate-950 rounded-full mx-auto"></div>
          <span className="text-emerald-400 font-bold">5G • 100%</span>
        </div>

        {/* Header App Brand */}
        <div className="flex items-center space-x-2 justify-center py-1">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span className="font-display font-bold text-white text-sm">greenlight Pay Portal</span>
        </div>

        {/* STEP 1: LOGIN */}
        {step === 'LOGIN' && (
          <form onSubmit={handleLogin} className="space-y-4 my-auto px-2">
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-white font-display">Traffic Fine Verification</h3>
              <p className="text-xs text-slate-400 font-sans">Enter your Fine Notice ID and Mobile OTP sent via SMS</p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Fine Notice ID</label>
                <input 
                  type="text" 
                  value={fineIdInput}
                  onChange={(e) => setFineIdInput(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">SMS Security OTP</label>
                <input 
                  type="password" 
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-center tracking-widest focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg glow-emerald"
            >
              Verify & View Evidence
            </button>
          </form>
        )}

        {/* STEP 2: VIEW FINE & EVIDENCE */}
        {step === 'VIEW_FINE' && (
          <div className="space-y-4 my-auto px-1 text-xs">
            
            {/* Fine Summary Card */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2 font-mono">
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>FINE ID: {activeFine.fineId}</span>
                <span className="text-amber-400 font-bold">DUE: {activeFine.dueDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white font-bold">{activeFine.violationType}</span>
                <span className="text-base font-bold text-emerald-400">₹{activeFine.amount}</span>
              </div>
              <div className="text-[11px] text-slate-300">{activeFine.ownerName} ({activeFine.plateNumber})</div>
            </div>

            {/* Evidence Image Snapshot Preview */}
            <div className="relative rounded-2xl overflow-hidden h-36 border border-slate-800 bg-slate-950">
              <img src={activeViolation.snapshots[0]} alt="Violation Proof" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/90 text-[10px] font-mono text-emerald-400 font-bold">
                ANPR Verified: {activeFine.plateNumber}
              </div>
            </div>

            {/* Action Choice Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button 
                onClick={() => setStep('DISPUTE')}
                className="py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-700 transition"
              >
                Dispute Fine
              </button>
              <button 
                onClick={() => setStep('PAY')}
                className="py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-emerald-400 transition glow-emerald"
              >
                Pay Now
              </button>
            </div>

          </div>
        )}

        {/* STEP 3: PAY VIA UPI / CARD */}
        {step === 'PAY' && (
          <div className="space-y-4 my-auto px-1 text-xs">
            <button onClick={() => setStep('VIEW_FINE')} className="flex items-center space-x-1 text-slate-400 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-white font-display text-sm">Select Payment Method</h3>
              <div className="text-lg font-bold font-mono text-emerald-400">Total Payable: ₹{activeFine.amount}</div>
            </div>

            <div className="space-y-2 font-mono">
              {['UPI (Google Pay / PhonePe)', 'Credit / Debit Card', 'Netbanking'].map(m => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`w-full p-3 rounded-xl border text-left flex justify-between items-center ${
                    paymentMethod.includes(m.slice(0, 3)) 
                      ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold' 
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <span>{m}</span>
                  <Check className={`w-4 h-4 ${paymentMethod.includes(m.slice(0, 3)) ? 'text-emerald-400' : 'opacity-0'}`} />
                </button>
              ))}
            </div>

            <button 
              onClick={handleCompletePayment}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition glow-emerald"
            >
              Pay ₹{activeFine.amount} Securely
            </button>
          </div>
        )}

        {/* STEP 4: DISPUTE FORM */}
        {step === 'DISPUTE' && (
          <div className="space-y-3 my-auto px-1 text-xs font-mono">
            <button onClick={() => setStep('VIEW_FINE')} className="flex items-center space-x-1 text-slate-400 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <h3 className="font-bold text-white font-display text-sm">Lodge Fine Appeal</h3>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Reason Category</label>
              <select 
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              >
                <option value="Wrong Vehicle">Wrong Vehicle Number</option>
                <option value="Emergency Situation">Emergency Medical Situation</option>
                <option value="Signal Malfunction">Traffic Signal Malfunction</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Supporting Details</label>
              <textarea 
                rows="3"
                value={disputeNote}
                onChange={(e) => setDisputeNote(e.target.value)}
                placeholder="Describe your appeal context..."
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>

            <button 
              onClick={handleCompleteDispute}
              className="w-full py-3 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl text-xs transition"
            >
              Submit Appeal to Adjudicator
            </button>
          </div>
        )}

        {/* STEP 5: SUCCESS CONFIRMATION */}
        {step === 'SUCCESS' && (
          <div className="text-center space-y-3 my-auto px-4">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 glow-emerald">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base font-display">Transaction Successful</h3>
            <p className="text-xs text-slate-400 font-mono">Status updated to: <strong className="text-emerald-400">{activeFine.status}</strong></p>
            <button 
              onClick={() => setStep('LOGIN')}
              className="w-full py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs"
            >
              Done
            </button>
          </div>
        )}

        {/* Mobile Home Bar */}
        <div className="w-24 h-1 bg-slate-700 rounded-full mx-auto mb-1"></div>

      </div>

    </div>
  );
};
