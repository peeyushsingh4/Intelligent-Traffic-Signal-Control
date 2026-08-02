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
          {renderActivePage()}
        </main>
      </div>

      {/* Global Evidence Reviewer Modal */}
      {selectedViolation && <EvidenceViewer />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
