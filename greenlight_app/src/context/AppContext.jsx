import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_VIOLATIONS, CAMERAS, CONGESTION_HEATMAP, DIVERSION_TEMPLATES, FINES_DATABASE } from '../data/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('control_room');
  const [activePersona, setActivePersona] = useState('operator'); // operator, officer, owner, admin
  const [violations, setViolations] = useState(MOCK_VIOLATIONS);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [fines, setFines] = useState(FINES_DATABASE);
  const [cameras, setCameras] = useState(CAMERAS);
  const [activeCamera, setActiveCamera] = useState(CAMERAS[0]);
  const [diversions, setDiversions] = useState(DIVERSION_TEMPLATES);
  const [heatmapNodes, setHeatmapNodes] = useState(CONGESTION_HEATMAP);
  
  // Real-time simulated clock & alert counter
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [liveAlertCount, setLiveAlertCount] = useState(14);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const openEvidenceModal = (violation) => {
    setSelectedViolation(violation);
  };

  const closeEvidenceModal = () => {
    setSelectedViolation(null);
  };

  const handleApproveViolation = (violationId) => {
    setViolations(prev => prev.map(v => v.id === violationId ? { ...v, status: 'AUTO_FINED', operatorReviewed: true } : v));
    closeEvidenceModal();
  };

  const handleDismissViolation = (violationId) => {
    setViolations(prev => prev.map(v => v.id === violationId ? { ...v, status: 'DISMISSED', operatorReviewed: true } : v));
    closeEvidenceModal();
  };

  const handleActivateDiversion = (templateId) => {
    setDiversions(prev => prev.map(d => d.id === templateId ? { ...d, status: 'ACTIVE' } : d));
  };

  const handleResolveDispute = (fineId, decision) => {
    setFines(prev => prev.map(f => f.fineId === fineId ? { ...f, status: decision === 'UPHELD' ? 'PENDING' : 'DISMISSED' } : f));
  };

  return (
    <AppContext.Provider value={{
      activeTab,
      setActiveTab,
      activePersona,
      setActivePersona,
      violations,
      selectedViolation,
      setSelectedViolation,
      openEvidenceModal,
      closeEvidenceModal,
      handleApproveViolation,
      handleDismissViolation,
      fines,
      setFines,
      cameras,
      setCameras,
      activeCamera,
      setActiveCamera,
      diversions,
      handleActivateDiversion,
      heatmapNodes,
      currentTime,
      liveAlertCount,
      handleResolveDispute
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
