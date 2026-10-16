import React from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Lock, FileText, ArrowLeft, CheckCircle2, Globe, Database, Scale } from 'lucide-react';

export const PrivacyPolicy = () => {
  const { setActiveTab, currentRole } = useApp();
  const isPolice = currentRole === 'TRAFFIC_POLICE';

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 font-mono text-xs text-slate-300">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-display tracking-wide">Privacy and Data Protection Policy</h1>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Statutory Compliance under DPDP Act 2023 and Section 43A of IT Act 2000
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
          <span className="text-slate-500 block">Enforcement Jurisdiction:</span>
          <strong className="text-white">Maharashtra State Traffic Branch</strong>
        </div>
        <div>
          <span className="text-slate-500 block">Verified Domain:</span>
          <strong className="text-emerald-400">itracs.transport.maharashtra.gov.in</strong>
        </div>
        <div>
          <span className="text-slate-500 block">Effective Revision:</span>
          <strong className="text-white">September 2026 (v2.4 Audit)</strong>
        </div>
      </div>

      {/* Policy Content Sections */}
      <div className="space-y-6 text-slate-300 font-sans leading-relaxed">
        
        {/* Section 1 */}
        <section className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="flex items-center space-x-2 font-mono text-emerald-400 font-bold text-sm">
            <Lock className="w-4 h-4" />
            <h2>1. Legal Authority and Statutory Mandate</h2>
          </div>
          <p className="text-xs text-slate-300">
            The Intelligent Traffic and Challan System (iTraCS) operates under statutory powers conferred by Section 133A and Section 136A of the Motor Vehicles (Amendment) Act 2019, read with Rule 167A of the Central Motor Vehicles Rules (Electronic Monitoring and Enforcement of Road Safety). Optical sensors, Automatic Number Plate Recognition (ANPR), and inductive telemetry feeds are deployed strictly for public road safety, congestion mitigation, and evidentiary adjudication.
          </p>
        </section>

        {/* Section 2 */}
        <section className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="flex items-center space-x-2 font-mono text-cyan-400 font-bold text-sm">
            <Database className="w-4 h-4" />
            <h2>2. Categories of Telemetry and Personal Data Collected</h2>
          </div>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>
              <strong className="text-white">Optical Imagery:</strong> Timestamped CCTV video snippets and high-resolution plate crops captured exclusively upon algorithmic trigger of traffic violations (speed violations, red signal infringement, stop line encroachment, or lane discipline).
            </li>
            <li>
              <strong className="text-white">Vehicle Registry Telemetry:</strong> Vehicle Registration Number, Chassis ID (masked), Engine ID (masked), Registered Owner Name, and Parivahan Vahan registration status.
            </li>
            <li>
              <strong className="text-white">Communication Coordinates:</strong> Registered mobile phone numbers and email addresses linked with the Vahan portal solely for dispatching statutory SMS challan notices.
            </li>
            <li>
              <strong className="text-white">Simulation and Kinematic Metrics:</strong> Edge lane occupancy, queue length, waiting seconds, and TraCI emission data. These metrics are aggregated and non-personally identifiable.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="flex items-center space-x-2 font-mono text-amber-400 font-bold text-sm">
            <Scale className="w-4 h-4" />
            <h2>3. Cryptographic Proof and Section 65B Certification</h2>
          </div>
          <p className="text-xs text-slate-300">
            Every digital evidentiary file captured by iTraCS edge cameras is cryptographically hashed with SHA-256 at the moment of recording. The hash, camera hardware identifier, GPS coordinates, and server time from National Physical Laboratory (NPL) time servers are embedded into the record. This ensures full admissibility in Magistrate Courts under Section 65B of the Indian Evidence Act 1872 without third-party tampering.
          </p>
        </section>

        {/* Section 4 */}
        <section className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="flex items-center space-x-2 font-mono text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <h2>4. Data Retention, Purging, and Citizen Access Rights</h2>
          </div>
          <p className="text-xs text-slate-300">
            Non-infringing optical feed data is purged within 72 hours from local buffer caches. Violation evidence records are retained for a statutory period of 365 days or until final adjudication before the Virtual Court. Vehicle owners maintain the legal right to inspect photographic evidence, contest citations within 60 days, and request verification logs through the Citizen Dispute Portal.
          </p>
        </section>

        {/* Section 5 */}
        <section className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="flex items-center space-x-2 font-mono text-slate-300 font-bold text-sm">
            <Globe className="w-4 h-4" />
            <h2>5. Data Protection Officer and Grievance Redressal</h2>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-400 space-y-1">
            <div>Grievance Officer: <strong className="text-white">Superintendent of Police (Traffic Telematics)</strong></div>
            <div>Address: <strong className="text-slate-200">Traffic Police Headquarters, Sir Pochkhanawala Road, Worli, Mumbai 400030</strong></div>
            <div>Official Email: <a href="mailto:grievance-dpdp@itracs.gov.in" className="text-emerald-400 hover:underline">grievance-dpdp@itracs.gov.in</a></div>
            <div>Control Room Phone: <a href="tel:02224937747" className="text-emerald-400 hover:underline">022-24937747</a></div>
          </div>
        </section>

      </div>

    </div>
  );
};
