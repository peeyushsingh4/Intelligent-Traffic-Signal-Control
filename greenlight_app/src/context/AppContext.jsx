import React, { createContext, useContext, useState, useEffect } from 'react';
import { CAMERAS, MOCK_VIOLATIONS, FINES_DATABASE, DIVERSION_TEMPLATES } from '../data/mockData';

export const DEFAULT_HEATMAP_NODES = [
  { id: 'node-bkc', name: 'BKC Junction (Bandra East)', lat: 19.0657, lng: 72.8686, score: 85, color: '#ef4444', status: 'Severe Congestion', queue: 42, avgSpeed: 14 },
  { id: 'node-vashi', name: 'Vashi Highway Interchange', lat: 19.0770, lng: 72.9986, score: 72, color: '#f97316', status: 'Heavy Flow', queue: 28, avgSpeed: 38 },
  { id: 'node-palm', name: 'Palm Beach Road (Nerul)', lat: 19.0330, lng: 73.0160, score: 45, color: '#eab308', status: 'Moderate Flow', queue: 12, avgSpeed: 52 },
  { id: 'node-dadar', name: 'Dadar TT Circle', lat: 19.0178, lng: 72.8478, score: 68, color: '#f97316', status: 'Dense Urban Queue', queue: 24, avgSpeed: 22 },
  { id: 'node-weh', name: 'WEH Airport Flyover', lat: 19.1197, lng: 72.8464, score: 32, color: '#10b981', status: 'Free Flow', queue: 6, avgSpeed: 64 }
];

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activePersona, setActivePersona] = useState('OPERATOR');
  const [activeTab, setActiveTab] = useState('control_room');
  const [selectedViolation, setSelectedViolation] = useState(null);
  
  const [violations, setViolations] = useState(MOCK_VIOLATIONS);
  const [fines, setFines] = useState(FINES_DATABASE);
  const [cameras, setCameras] = useState(CAMERAS);
  const [diversions, setDiversions] = useState(DIVERSION_TEMPLATES);
  const [heatmapNodes, setHeatmapNodes] = useState(DEFAULT_HEATMAP_NODES);

  const [activeCamera, setActiveCamera] = useState(CAMERAS[0]);

  // Live clock for Navbar
  const [currentTime, setCurrentTime] = useState('');
  useEffect(() => {
    const tick = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const liveAlertCount = violations.filter(v => v.status === 'OPERATOR_REVIEW').length;

  // Handle 1-Click Diversion Activation -> Triggers Python API Bridge Server on Port 5005
  const handleActivateDiversion = async (diversionId) => {
    setDiversions(prev => prev.map(d => 
      d.id === diversionId ? { ...d, status: 'ACTIVE' } : d
    ));

    try {
      const res = await fetch('http://localhost:5005/api/activate-diversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diversionId })
      });
      const data = await res.json();
      console.log("SUMO-GUI Launch Response:", data);
    } catch (err) {
      console.warn("Backend API bridge note (server running on port 5005):", err);
    }
  };

  const openEvidenceModal = (violation) => {
    setSelectedViolation(violation);
  };

  const closeEvidenceModal = () => {
    setSelectedViolation(null);
  };

  const handleApproveFine = (violationId) => {
    setViolations(prev => prev.map(v => v.id === violationId ? { ...v, status: 'AUTO_FINED' } : v));
    closeEvidenceModal();
  };

  const handleDismissFine = (violationId) => {
    setViolations(prev => prev.filter(v => v.id !== violationId));
    closeEvidenceModal();
  };

  return (
    <AppContext.Provider value={{
      activePersona, setActivePersona,
      activeTab, setActiveTab,
      selectedViolation, openEvidenceModal, closeEvidenceModal,
      violations, fines, setFines,
      cameras, setCameras,
      activeCamera, setActiveCamera,
      diversions, handleActivateDiversion,
      handleApproveFine, handleDismissFine,
      handleApproveViolation: handleApproveFine,
      handleDismissViolation: handleDismissFine,
      heatmapNodes, setHeatmapNodes,
      currentTime, liveAlertCount
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext) || {};
