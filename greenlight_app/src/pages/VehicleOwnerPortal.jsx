import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Smartphone, Shield, CheckCircle, CreditCard, Lock, 
  FileText, Upload, AlertCircle, ArrowLeft, Check, QrCode 
} from 'lucide-react';

export const VehicleOwnerPortal = () => {
  const { fines, violations } = useApp();
  const [step, setStep] = useState('LOGIN'); // LOGIN, VIEW_FINE, PAY, DISPUTE, SUCCESS
  const [fineIdInput, setFineIdInput] = useState('FINE-2026-8801');
  const [otpInput, setOtpInput] = useState('4921');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [disputeReason, setDisputeReason] = useState('Wrong Vehicle');
  const [disputeNote, setDisputeNote] = useState('');

  const activeFine = (fines && (fines.find(f => f.id === fineIdInput || f.fineId === fineIdInput || f.challanNo === fineIdInput) || fines[0])) || {
    id: 'FINE-2026-8801',
    challanNo: 'MH-CHALLAN-2026-09481',
    plateNumber: 'MH 02 CZ 4921',
    amount: 1000,
    dueDate: '2026-09-15',
    violationType: 'Red Light Running',
    ownerName: 'Arun Patel'
  };

  const activeViolation = (violations && violations[0]) || {
    plateNumber: 'MH 02 CZ 4921',
    snapshots: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80']
  };

  const snapshotUrl = (activeViolation.snapshots && activeViolation.snapshots[0]) || 
                     (activeViolation.evidenceUrls && activeViolation.evidenceUrls[0]) || 
                     'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80';

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
                <label className="text-[10px] text-slate-400">Challan / Fine Notice ID</label>
                <input 
                  type="text" 
                  value={fineIdInput}
                  onChange={(e) => setFineIdInput(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold tracking-wider focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400">4-Digit Security PIN / OTP</label>
                <input 
                  type="password" 
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold tracking-widest text-center focus:outline-none focus:border-emerald-500"
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
                <span>FINE ID: {activeFine.challanNo || activeFine.id}</span>
                <span className="text-amber-400 font-bold">DUE: {activeFine.dueDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white font-bold">{activeFine.violationType || activeFine.offense}</span>
                <span className="text-base font-bold text-emerald-400">₹{activeFine.amount}</span>
              </div>
              <div className="text-[11px] text-slate-300">{activeFine.ownerName} ({activeFine.plateNumber})</div>
            </div>

            {/* Evidence Image Snapshot Preview */}
            <div className="relative rounded-2xl overflow-hidden h-36 border border-slate-800 bg-slate-950">
              <img src={snapshotUrl} alt="Violation Proof" className="w-full h-full object-cover" />
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
            <div className="flex items-center space-x-2">
              <button onClick={() => setStep('VIEW_FINE')} className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-white font-display">Select Instant Payment Mode</span>
            </div>

            <div className="space-y-2">
              <div 
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                  paymentMethod === 'UPI' ? 'border-emerald-500 bg-emerald-950/20 glow-emerald' : 'border-slate-800 bg-slate-950'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <QrCode className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="font-bold text-white">Instant UPI (GPay / PhonePe / Paytm)</div>
                    <div className="text-[10px] text-slate-400">Zero surcharge, instant receipt</div>
                  </div>
                </div>
                {paymentMethod === 'UPI' && <Check className="w-4 h-4 text-emerald-400" />}
              </div>

              <div 
                onClick={() => setPaymentMethod('CARD')}
                className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                  paymentMethod === 'CARD' ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-800 bg-slate-950'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-cyan-400" />
                  <div>
                    <div className="font-bold text-white">Credit / Debit Card</div>
                    <div className="text-[10px] text-slate-400">Visa, Mastercard, RuPay</div>
                  </div>
                </div>
                {paymentMethod === 'CARD' && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
            </div>

            <button 
              onClick={handleCompletePayment}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition glow-emerald"
            >
              Pay ₹{activeFine.amount} Securely
            </button>
          </div>
        )}

        {/* STEP 4: DISPUTE FORM */}
        {step === 'DISPUTE' && (
          <div className="space-y-3 my-auto px-1 text-xs">
            <div className="flex items-center space-x-2">
              <button onClick={() => setStep('VIEW_FINE')} className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-white font-display">Submit Challan Appeal</span>
            </div>

            <div className="space-y-2 font-mono">
              <div>
                <label className="text-[10px] text-slate-400">Ground for Appeal</label>
                <select 
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                >
                  <option value="Wrong Vehicle">ANPR Mismatch / Wrong Vehicle</option>
                  <option value="Emergency Situation">Emergency Medical Evacuation</option>
                  <option value="Stolen Plate">Cloned / Stolen License Plate</option>
                  <option value="Traffic Officer Signal">Directed by Traffic Officer</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400">Statement / Explanation</label>
                <textarea 
                  rows={3}
                  value={disputeNote}
                  onChange={(e) => setDisputeNote(e.target.value)}
                  placeholder="Explain why this challan should be waived..."
                  className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button 
              onClick={handleCompleteDispute}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition glow-amber"
            >
              Submit Dispute to RTO
            </button>
          </div>
        )}

        {/* STEP 5: SUCCESS CONFIRMATION */}
        {step === 'SUCCESS' && (
          <div className="text-center space-y-4 my-auto px-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto glow-emerald">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-bold text-white text-base">Request Processed</h3>
              <p className="text-xs text-slate-400 font-sans">
                Status updated in Government Parivahan Database.
              </p>
            </div>

            <button 
              onClick={() => setStep('LOGIN')}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold font-mono transition"
            >
              Back to Home
            </button>
          </div>
        )}

        {/* Home Indicator */}
        <div className="w-28 h-1 bg-slate-700 rounded-full mx-auto mb-1"></div>

      </div>

    </div>
  );
};
