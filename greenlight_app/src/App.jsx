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

const AppContent = () => {
  const { activeTab, selectedViolation } = useApp();

  const renderActivePage = () => {
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
        return <VehicleOwnerPortal />;
      case 'field_officer':
        return <FieldOfficerApp />;
      case 'camera_management':
        return <CameraManagement />;
      case 'analytics':
        return <ExecutiveAnalytics />;
      default:
        return <ControlRoom />;
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
