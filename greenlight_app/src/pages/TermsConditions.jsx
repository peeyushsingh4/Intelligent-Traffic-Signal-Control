import React from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Scale, Shield, AlertTriangle, ArrowLeft, CheckCircle2, Clock, DollarSign } from 'lucide-react';

export const TermsConditions = () => {
  const { setActiveTab, currentRole } = useApp();
  const isPolice = currentRole === 'TRAFFIC_POLICE';

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 font-mono text-xs text-slate-300">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-display tracking-wide">Terms and Conditions of Traffic Enforcement</h1>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Rules Governing Automated Citations, Judicial Contests, and Virtual Court Referrals
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab(isPolice ? 'control_room' : 'citizen_vehicles')}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold transition flex items-center space-x-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Meta Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-[11px]">
        <div>
          <span className="text-slate-500 block">Regulatory Act:</span>
          <strong className="text-white">Motor Vehicles (Amendment) Act 2019</strong>
        </div>
        <div>
          <span className="text-slate-500 block">Adjudication Forum:</span>
          <strong className="text-cyan-400">National Virtual Traffic Court</strong>
        </div>
        <div>
          <span className="text-slate-500 block">Compliance Standard:</span>
          <strong className="text-emerald-400">Section 133A & CMVR 167A</strong>
        </div>
      </div>

      {/* Policy Content Sections */}
      <div className="space-y-6 text-slate-300 font-sans leading-relaxed">
        
        {/* Section 1 */}
        <section className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="flex items-center space-x-2 font-mono text-amber-400 font-bold text-sm">
            <FileText className="w-4 h-4" />
            <h2>1. Binding Nature of Electronic Challan Notice</h2>
          </div>
          <p className="text-xs text-slate-300">
            Every e-Challan issued through the iTraCS automated perception pipeline constitutes a formal notice of offense under Section 133A of the Motor Vehicles Act. Delivery via SMS or registered electronic mail to the contact coordinates on file with Parivahan Vahan shall be deemed effective service under the law.
          </p>
        </section>

        {/* Section 2 */}
        <section className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="flex items-center space-x-2 font-mono text-emerald-400 font-bold text-sm">
            <Clock className="w-4 h-4" />
            <h2>2. Settlement Window and Virtual Court Transfer</h2>
          </div>
          <p className="text-xs text-slate-300">
            A registered vehicle owner has a statutory grace period of 60 calendar days from the date of issuance to either pay the fine through the authorized Parivahan Bharat BillPay gateway or submit a formal contest. Citations remaining unresolved after 60 days are automatically escalated to the Maharashtra Virtual Court system for summary judicial processing.
          </p>
        </section>

        {/* Section 3 */}
        <section className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="flex items-center space-x-2 font-mono text-cyan-400 font-bold text-sm">
            <Scale className="w-4 h-4" />
            <h2>3. Grounds for Exemption and Dispute Review</h2>
          </div>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>
              <strong className="text-white">Emergency Vehicle Yield:</strong> Under Section 194E, vehicles yielding right-of-way to active emergency vehicles (Ambulance AMB-108, Fire Brigade, or Police units) are exempt from red light and stop line penalties upon verification against synchronized ISO-22951 preemption logs.
            </li>
            <li>
              <strong className="text-white">Cloned or Obscured Number Plates:</strong> If optical character recognition misidentifies an obscured digit, the owner must submit high-resolution proof and vehicle registration documentation for immediate revocation.
            </li>
            <li>
              <strong className="text-white">Directed Diversion Compliance:</strong> Drivers acting under the explicit instructions of on-duty traffic police officers or automated variable message signs (VMS) are completely indemnified from wrong-turn or route-restriction citations.
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="flex items-center space-x-2 font-mono text-red-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <h2>4. Habitual Offender Escalation and License Suspension</h2>
          </div>
          <p className="text-xs text-slate-300">
            In accordance with Rule 21 of the Central Motor Vehicles Rules, vehicles accumulating three or more major safety infractions (exceeding speed limit by 20 km/h or more, dangerous driving, or dangerous signal jumps) within 90 calendar days are flagged for driving license suspension proceedings before the jurisdictional Regional Transport Officer (RTO).
          </p>
        </section>

        {/* Section 5 */}
        <section className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="flex items-center space-x-2 font-mono text-slate-200 font-bold text-sm">
            <DollarSign className="w-4 h-4" />
            <h2>5. Digital Payment Verification and Refund Protocol</h2>
          </div>
          <p className="text-xs text-slate-300">
            All fine transactions processed through UPI, NetBanking, or Debit Card generate a digitally signed transaction reference number. If a duplicate transaction occurs due to banking gateway latency, the excess amount is auto-reversed to the source account within 5 to 7 banking days following settlement reconciliation.
          </p>
        </section>

      </div>

    </div>
  );
};
