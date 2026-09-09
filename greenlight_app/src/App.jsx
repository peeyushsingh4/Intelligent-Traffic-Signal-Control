import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ControlRoom } from './pages/ControlRoom';
import { EvidenceViewer } from './pages/EvidenceViewer';
import { DiversionPanel } from './pages/DiversionPanel';
import { FineManagement } from './pages/FineManagement';
import { TestingConsole } from './pages/TestingConsole';
import { VehicleOwnerPortal } from './pages/VehicleOwnerPortal';
import { FieldOfficerApp } from './pages/FieldOfficerApp';
import { CameraManagement } from './pages/CameraManagement';
import { ExecutiveAnalytics } from './pages/ExecutiveAnalytics';
import { SimulationDisplay } from './pages/SimulationDisplay';
import { Shield, Lock, Car } from 'lucide-react';

// Error Boundary to catch and display runtime errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('React Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#0f172a', color: '#f8fafc', fontFamily: 'monospace', minHeight: '100vh' }}>
          <h1 style={{ color: '#ef4444', fontSize: '24px', marginBottom: '16px' }}>⚠ Runtime Error Caught</h1>
          <pre style={{ color: '#f59e0b', background: '#1e293b', padding: '20px', borderRadius: '12px', overflow: 'auto', fontSize: '13px', lineHeight: '1.6' }}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <h2 style={{ color: '#94a3b8', marginTop: '24px', fontSize: '16px' }}>Component Stack:</h2>
          <pre style={{ color: '#64748b', background: '#1e293b', padding: '20px', borderRadius: '12px', overflow: 'auto', fontSize: '12px', lineHeight: '1.5' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const AccessRestrictedScreen = ({ requestedTab, onGoToPortal, onSwitchToPolice }) => {
  return (
    <div className="h-full flex items-center justify-center p-6 font-mono">
      <div className="max-w-md w-full bg-slate-900/90 border-2 border-red-500/40 rounded-3xl p-6 shadow-2xl space-y-4 glow-red">
        <div className="flex items-center space-x-3 text-red-400">
          <div className="p-3 rounded-2xl bg-red-500/20 border border-red-500/40">
            <Lock className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">IAM 403: Access Restricted</h3>
            <span className="text-[11px] text-red-400 font-bold">Traffic Police Officer Scope Required</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          You are currently logged in with the <strong className="text-amber-400 font-mono">CITIZEN / VEHICLE OWNER</strong> IAM role. 
          The live citywide dashboard, CCTV streams, signal timing reallocations, and emergency vehicle dispatch (EVP) are restricted strictly to authorized <strong className="text-emerald-400 font-mono">Traffic Police Officers</strong>.
        </p>

        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] space-y-1 text-slate-400 font-mono">
          <div>Requested Resource: <strong className="text-white">/{requestedTab.toUpperCase()}</strong></div>
          <div>Regulatory Policy: <strong className="text-emerald-400">ISO-27001 RBAC · Sec. 133A MV Act</strong></div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onGoToPortal}
            className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition font-mono flex items-center justify-center gap-1.5 shadow-lg"
          >
            <Car size={14} />
            <span>My Fines Portal</span>
          </button>
          <button
            onClick={onSwitchToPolice}
            className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition font-mono flex items-center justify-center gap-1.5 border border-slate-700"
          >
            <Shield size={14} />
            <span>Login as Officer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { activeTab, setActiveTab, currentRole, switchRole, isTabAllowed, selectedViolation } = useApp();

  const renderActivePage = () => {
    // Enforce IAM permissions
    if (isTabAllowed && !isTabAllowed(activeTab)) {
      return (
        <AccessRestrictedScreen 
          requestedTab={activeTab}
          onGoToPortal={() => setActiveTab('vehicle_owner_portal')}
          onSwitchToPolice={() => switchRole('TRAFFIC_POLICE')}
        />
      );
    }

    switch (activeTab) {
      case 'control_room':
        return <ControlRoom />;
      case 'evidence_viewer':
        return <EvidenceViewer />;
      case 'diversions':
        return <DiversionPanel />;
      case 'fines':
        return <FineManagement />;
      case 'testing':
        return <TestingConsole />;
      case 'vehicle_owner_portal':
      case 'citizen_vehicles':
      case 'citizen_evidence':
      case 'citizen_disputes':
        return <VehicleOwnerPortal activeSection={activeTab} />;
      case 'field_officer':
        return <FieldOfficerApp />;
      case 'camera_management':
        return <CameraManagement />;
      case 'analytics':
        return <ExecutiveAnalytics />;
      case 'simulation_display':
        return <SimulationDisplay />;
      default:
        return currentRole === 'CITIZEN' ? <VehicleOwnerPortal /> : <ControlRoom />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-hidden bg-slate-950/40">
          <ErrorBoundary>
            {renderActivePage()}
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Evidence Reviewer Modal */}
      {selectedViolation && <EvidenceViewer />}
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
