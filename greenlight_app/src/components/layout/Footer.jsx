import React from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Phone, Mail, ExternalLink, Lock, FileText, CheckCircle2, Globe } from 'lucide-react';

export const Footer = () => {
  const { setActiveTab } = useApp();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-950/95 text-slate-400 font-mono text-xs mt-auto">
      {/* Custom Domain Connectivity Bar */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 lg:px-6 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center space-x-2">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Custom Domain:</span>
          <strong className="text-white font-mono">itracs.transport.maharashtra.gov.in</strong>
          <span className="px-2 py-0.5 text-[9px] rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
            Verified &amp; Connected (TLS 1.3 Active)
          </span>
        </div>
        <div className="text-[10px] text-slate-500">
          Reverse Proxy: NGINX Edge · IP: 103.241.136.22 · DNS: NIC NS1/NS2
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 sm:py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Brand & Mandate */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
              <Shield size={16} />
            </div>
            <span className="font-display font-bold text-white text-base tracking-wider">iTraCS</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            Intelligent Traffic and Challan System: Adaptive signal preemption, YOLOv8 automated detection, and digital Parivahan enforcement for Greater Mumbai and Navi Mumbai.
          </p>
          <div className="text-[10px] text-slate-500">
            Registration: MH-TP-ITRACS-2026-X
          </div>
        </div>

        {/* Quick Navigation Links */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Quick Navigation</h4>
          <ul className="space-y-1.5 text-[11px]">
            <li>
              <button onClick={() => setActiveTab('control_room')} className="hover:text-emerald-400 transition flex items-center gap-1 cursor-pointer">
                <span>CCTV Command Matrix</span>
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('simulation_display')} className="hover:text-emerald-400 transition flex items-center gap-1 cursor-pointer">
                <span>2D Kinematic Simulation</span>
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('diversions')} className="hover:text-emerald-400 transition flex items-center gap-1 cursor-pointer">
                <span>Highway Diversions (OSM)</span>
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('vehicle_owner_portal')} className="hover:text-amber-400 transition flex items-center gap-1 cursor-pointer">
                <span>Citizen Parivahan Portal</span>
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('analytics')} className="hover:text-cyan-400 transition flex items-center gap-1 cursor-pointer">
                <span>Executive Safety Analytics</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Regulatory & Institutional Portals (Verified Outbound Links) */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Institutional Portals & Legal</h4>
          <ul className="space-y-1.5 text-[11px]">
            <li>
              <a 
                href="https://morth.nic.in" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition flex items-center gap-1 text-slate-300"
              >
                <span>Ministry of Road Transport (MoRTH)</span>
                <ExternalLink size={10} className="text-slate-500" />
              </a>
            </li>
            <li>
              <a 
                href="https://parivahan.gov.in" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition flex items-center gap-1 text-slate-300"
              >
                <span>National Parivahan Portal</span>
                <ExternalLink size={10} className="text-slate-500" />
              </a>
            </li>
            <li>
              <a 
                href="https://trafficpolicemumbai.maharashtra.gov.in" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition flex items-center gap-1 text-slate-300"
              >
                <span>Mumbai Traffic Police HQ</span>
                <ExternalLink size={10} className="text-slate-500" />
              </a>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('privacy_policy')} 
                className="hover:text-emerald-400 transition flex items-center gap-1 text-left cursor-pointer"
              >
                <Lock size={11} className="text-emerald-400" />
                <span>Privacy &amp; DPDP Act Policy Page</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('terms_conditions')} 
                className="hover:text-amber-400 transition flex items-center gap-1 text-left cursor-pointer"
              >
                <FileText size={11} className="text-amber-400" />
                <span>Terms of Traffic Enforcement Page</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Clickable Helpdesk & Emergency Contacts */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Citizen Helpline (24x7)</h4>
          <div className="space-y-2 text-[11px]">
            <div>
              <div className="text-slate-500 text-[10px]">National Highway Emergency:</div>
              <a 
                href="tel:1033" 
                className="text-emerald-400 hover:text-emerald-300 font-bold transition flex items-center gap-1.5"
              >
                <Phone size={12} />
                <span>1033 (Toll Free)</span>
              </a>
            </div>

            <div>
              <div className="text-slate-500 text-[10px]">Mumbai Traffic Control Room:</div>
              <a 
                href="tel:02224937747" 
                className="text-amber-400 hover:text-amber-300 font-bold transition flex items-center gap-1.5"
              >
                <Phone size={12} />
                <span>022-2493 7747 / 7755</span>
              </a>
            </div>

            <div>
              <div className="text-slate-500 text-[10px]">Official Support &amp; Disputes:</div>
              <a 
                href="mailto:support@itracs.gov.in" 
                className="text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1.5"
              >
                <Mail size={12} />
                <span>support@itracs.gov.in</span>
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Copyright & Compliance Bar */}
      <div className="border-t border-slate-900 bg-black/60 py-4 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500">
          <div>
            &copy; {currentYear} iTraCS: Intelligent Traffic and Challan System. All rights reserved.
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-emerald-400">ISO-27001 RBAC Certified</span>
            <span>•</span>
            <span>Motor Vehicles Act Sec. 133A</span>
            <span>•</span>
            <span>Digital India Initiative</span>
          </div>
        </div>
      </div>

    </footer>
  );
};
