import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  CAMERAS, MOCK_VIOLATIONS, FINES_DATABASE, DIVERSION_TEMPLATES, 
  REGISTERED_VEHICLES, IAM_ROLES 
} from '../data/mockData';

export const DEFAULT_HEATMAP_NODES = [
  { id: 'node-bkc', name: 'BKC Junction (Bandra East)', lat: 19.0657, lng: 72.8686, score: 85, color: '#ef4444', status: 'Severe Congestion', queue: 42, avgSpeed: 14 },
  { id: 'node-vashi', name: 'Vashi Highway Interchange', lat: 19.0770, lng: 72.9986, score: 72, color: '#f97316', status: 'Heavy Flow', queue: 28, avgSpeed: 38 },
  { id: 'node-palm', name: 'Palm Beach Road (Nerul)', lat: 19.0330, lng: 73.0160, score: 45, color: '#eab308', status: 'Moderate Flow', queue: 12, avgSpeed: 52 },
  { id: 'node-dadar', name: 'Dadar TT Circle', lat: 19.0178, lng: 72.8478, score: 68, color: '#f97316', status: 'Dense Urban Queue', queue: 24, avgSpeed: 22 },
  { id: 'node-weh', name: 'WEH Airport Flyover', lat: 19.1197, lng: 72.8464, score: 32, color: '#10b981', status: 'Free Flow', queue: 6, avgSpeed: 64 }
];

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // IAM Role state: 'TRAFFIC_POLICE' (Traffic Police Officer Dashboard) or 'CITIZEN' (Vehicle Owner Portal)
  const [currentRole, setCurrentRole] = useState('TRAFFIC_POLICE');
  const [activePersona, setActivePersona] = useState('TRAFFIC_POLICE');
  const [activeTab, setActiveTab] = useState('control_room');
  const [selectedViolation, setSelectedViolation] = useState(null);
  
  const [violations, setViolations] = useState(MOCK_VIOLATIONS);
  const [fines, setFines] = useState(FINES_DATABASE);
  const [cameras, setCameras] = useState(CAMERAS);
  const [diversions, setDiversions] = useState(DIVERSION_TEMPLATES);
  const [heatmapNodes, setHeatmapNodes] = useState(DEFAULT_HEATMAP_NODES);
  const [vehicles, setVehicles] = useState(REGISTERED_VEHICLES);

  const [activeCamera, setActiveCamera] = useState(CAMERAS[0]);

  // Theme state: 'dark' or 'light'
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('itracs-theme');
      if (saved) return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('itracs-theme', theme);
    } catch (e) {}

    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Global Toast Notifications Stack
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast = { id, type: 'info', duration: 4000, ...toast };
    
    setToasts((prev) => [...prev, newToast]);

    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
    return id;
  }, [removeToast]);

  const showSuccess = useCallback((message, title = 'Operation Successful') => {
    return addToast({ type: 'success', title, message });
  }, [addToast]);

  const showError = useCallback((message, title = 'Attention Required') => {
    return addToast({ type: 'error', title, message });
  }, [addToast]);

  const showInfo = useCallback((message, title = 'System Update') => {
    return addToast({ type: 'info', title, message });
  }, [addToast]);

  const showWarning = useCallback((message, title = 'System Warning') => {
    return addToast({ type: 'warning', title, message });
  }, [addToast]);

  // Dynamic Browser Tab Page Titles
  useEffect(() => {
    const titles = {
      control_room: 'iTraCS: Control Room (CCTV Live)',
      simulation_display: 'iTraCS: 2D Multi-Agent Transport Simulation',
      evidence_viewer: 'iTraCS: Violation & ANPR Review',
      diversions: 'iTraCS: Highway Diversions (OSM)',
      fines: 'iTraCS: Fines Adjudication Workspace',
      camera_management: 'iTraCS: Camera Fleet & Streams',
      field_officer: 'iTraCS: Field Officer Patrol Console',
      analytics: 'iTraCS: Executive Analytics & Safety',
      testing: 'iTraCS: Model Perception Testing',
      vehicle_owner_portal: 'iTraCS: Citizen Parivahan E-Challan Portal',
      citizen_vehicles: 'iTraCS: Citizen Vehicle & Challan Status',
      citizen_evidence: 'iTraCS: Citizen CCTV Photo Proof',
      citizen_disputes: 'iTraCS: Citizen Dispute & Grievance Portal',
      privacy_policy: 'iTraCS: Privacy and Data Protection Policy | DPDP Act 2023',
      terms_conditions: 'iTraCS: Terms and Conditions of Traffic Enforcement | Section 133A'
    };

    const targetTitle = titles[activeTab] || 'iTraCS: Intelligent Traffic & Challan System';
    document.title = targetTitle;
  }, [activeTab]);

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

  // IAM Role Switcher with automatic landing page redirection & toast
  const switchRole = (roleId) => {
    const targetRole = IAM_ROLES[roleId] ? roleId : 'TRAFFIC_POLICE';
    setCurrentRole(targetRole);
    setActivePersona(targetRole);
    const landing = IAM_ROLES[targetRole].landingTab;
    setActiveTab(landing);

    if (targetRole === 'TRAFFIC_POLICE') {
      showInfo('Switched to Traffic Police Officer scope (Insp. Rajesh Shinde). Full enforcement capabilities active.', 'IAM Context Switched');
    } else {
      showInfo('Switched to Citizen / Vehicle Owner scope (Arun Patel). Secure Parivahan e-challan viewing active.', 'IAM Context Switched');
    }
  };

  const isTabAllowed = (tabId) => {
    if (['privacy_policy', 'terms_conditions', 'not_found', '404'].includes(tabId)) return true;
    const roleConfig = IAM_ROLES[currentRole] || IAM_ROLES.TRAFFIC_POLICE;
    return roleConfig.allowedTabs.includes(tabId);
  };

  // Citizen Pay Fine Handler
  const handlePayFine = (fineId, paymentMethod = 'UPI (Instant)') => {
    const txnId = `UPI/${Date.now().toString().slice(-8)}/SUCCESS`;
    let paidAmount = 1000;
    let challanCode = fineId;

    setFines(prev => prev.map(f => {
      if (f.id === fineId || f.fineId === fineId || f.challanNo === fineId) {
        paidAmount = f.amount || 1000;
        challanCode = f.challanNo || fineId;
        return {
          ...f,
          status: 'PAID',
          paymentMethod,
          transactionId: txnId,
          paidAt: new Date().toISOString()
        };
      }
      return f;
    }));

    showSuccess(
      `Settlement of ₹${paidAmount} via ${paymentMethod} confirmed for ${challanCode}. Txn: ${txnId}`, 
      'Challan Payment Settled'
    );
    return txnId;
  };

  // Citizen Contest / Dispute Fine Handler
  const handleDisputeFine = (fineId, reason, note = '') => {
    setFines(prev => prev.map(f => {
      if (f.id === fineId || f.fineId === fineId || f.challanNo === fineId) {
        return {
          ...f,
          status: 'DISPUTED',
          disputeReason: reason,
          disputeNote: note,
          disputeStatus: 'UNDER_REVIEW',
          disputedAt: new Date().toISOString()
        };
      }
      return f;
    }));

    showSuccess(
      `Dispute ticket filed under reason "${reason}". Adjudication officer will review within 3 business days.`,
      'Grievance Registered'
    );
  };

  // Handle 1-Click Diversion Activation -> Triggers Python API Bridge Server on Port 5005
  const handleActivateDiversion = async (diversionId) => {
    setDiversions(prev => prev.map(d => 
      d.id === diversionId ? { ...d, status: 'ACTIVE' } : d
    ));

    showSuccess('1-Click Diversion Protocol Activated: Variable Message Signs (VMS) dispatched.', 'Diversion Deployed');

    try {
      const res = await fetch('http://localhost:5005/api/activate-diversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diversionId, action: 'activate' })
      });
      const data = await res.json();
      console.log("Backend diversion trigger response:", data);
    } catch (err) {
      console.warn("Backend API bridge note (server running on port 5005):", err);
    }
  };

  const handleDeactivateDiversion = async (diversionId) => {
    setDiversions(prev => prev.map(d => 
      d.id === diversionId ? { ...d, status: 'IDLE' } : d
    ));

    showInfo('Diversion protocol deactivated. Restoring standard corridor timing.', 'Flow Restored');

    try {
      await fetch('http://localhost:5005/api/activate-diversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diversionId, action: 'deactivate' })
      });
    } catch (err) {
      console.warn("Backend API bridge note:", err);
    }
  };

  const handleToggleDiversion = (diversionId) => {
    const item = diversions.find(d => d.id === diversionId);
    if (item && item.status === 'ACTIVE') {
      handleDeactivateDiversion(diversionId);
    } else {
      handleActivateDiversion(diversionId);
    }
  };

  const handleIncrementDivertedCount = (diversionId, amount = 1) => {
    setDiversions(prev => prev.map(d => 
      d.id === diversionId ? { ...d, divertedCount: (d.divertedCount || 0) + amount } : d
    ));
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
    showSuccess('Violation validated and endorsed. Official e-challan dispatched via SMS & Parivahan gateway.', 'Challan Approved');
  };

  const handleDismissFine = (violationId) => {
    setViolations(prev => prev.filter(v => v.id !== violationId));
    closeEvidenceModal();
    showInfo('Citation dismissed following officer review. Record marked invalid.', 'Citation Dismissed');
  };

  // Add New Camera Feed
  const handleAddCamera = (newCamera) => {
    const created = {
      id: `cam-${Date.now().toString().slice(-4)}`,
      fps: 30,
      status: 'ONLINE',
      ...newCamera
    };
    setCameras(prev => [created, ...prev]);
    setActiveCamera(created);
    showSuccess(`CCTV Feed "${created.name}" registered and streaming live on ${created.ip}.`, 'Camera Feed Online');
  };

  return (
    <AppContext.Provider value={{
      currentRole, setCurrentRole, switchRole, isTabAllowed,
      activePersona, setActivePersona,
      activeTab, setActiveTab,
      selectedViolation, openEvidenceModal, closeEvidenceModal,
      violations, fines, setFines,
      vehicles, setVehicles,
      cameras, setCameras, handleAddCamera,
      activeCamera, setActiveCamera,
      diversions, handleActivateDiversion, handleDeactivateDiversion, handleToggleDiversion, handleIncrementDivertedCount,
      handleApproveFine, handleDismissFine,
      handleApproveViolation: handleApproveFine,
      handleDismissViolation: handleDismissFine,
      handlePayFine, handleDisputeFine,
      heatmapNodes, setHeatmapNodes,
      currentTime, liveAlertCount,
      theme, setTheme, toggleTheme,
      toasts, addToast, removeToast, showSuccess, showError, showInfo, showWarning
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext) || {};
