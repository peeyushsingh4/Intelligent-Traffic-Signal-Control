// Demo-only records. They are not sourced from cameras, datasets, or real people.

export const CAMERAS = [
  { 
    id: 'cam-bkc-01', 
    name: 'BKC Junction (Bandra East, Mumbai)', 
    zone: 'BKC South Corridor', 
    speedLimitKmh: 60, 
    status: 'ONLINE', 
    fps: 30, 
    ip: '192.168.1.101', 
    lat: 19.0657, 
    lng: 72.8686,
    simulationScenario: 'bkc'
  },
  { 
    id: 'cam-vashi-02', 
    name: 'Vashi Interchange (Sion-Panvel Hwy)', 
    zone: 'Navi Mumbai Hub', 
    speedLimitKmh: 80, 
    status: 'ONLINE', 
    fps: 30, 
    ip: '192.168.1.102', 
    lat: 19.0770, 
    lng: 72.9986,
    simulationScenario: 'vashi'
  },
  { 
    id: 'cam-palm-03', 
    name: 'Palm Beach Road (Nerul, Navi Mumbai)', 
    zone: 'Coastal Bypass', 
    speedLimitKmh: 70, 
    status: 'ONLINE', 
    fps: 30, 
    ip: '192.168.1.103', 
    lat: 19.0330, 
    lng: 73.0160,
    simulationScenario: 'palm_beach'
  },
  { 
    id: 'cam-dadar-04', 
    name: 'Dadar TT Circle (Central Mumbai)', 
    zone: 'South-Central Arterial', 
    speedLimitKmh: 50, 
    status: 'ONLINE', 
    fps: 28, 
    ip: '192.168.1.104', 
    lat: 19.0178, 
    lng: 72.8478,
    simulationScenario: null
  },
  { 
    id: 'cam-weh-05', 
    name: 'WEH Airport Flyover (Andheri East)', 
    zone: 'Western Corridor', 
    speedLimitKmh: 80, 
    status: 'ONLINE', 
    fps: 30, 
    ip: '192.168.1.105', 
    lat: 19.1197, 
    lng: 72.8464,
    simulationScenario: null
  }
];

export const VIOLATION_TYPES = {
  RED_LIGHT: { label: 'Red Light Running', fine: 1000, severity: 'CRITICAL', icon: 'AlertTriangle' },
  OVERSPEEDING: { label: 'Over-Speeding', fine: 2000, severity: 'MAJOR', icon: 'Zap' },
  WRONG_LANE: { label: 'Wrong Lane Driving', fine: 1500, severity: 'MAJOR', icon: 'Navigation' },
  NO_HELMET: { label: 'No Helmet / Seatbelt', fine: 1000, severity: 'MINOR', icon: 'ShieldAlert' },
  ZEBRA_CROSSING: { label: 'Zebra Line Encroachment', fine: 500, severity: 'MINOR', icon: 'Minus' }
};

export const MOCK_VIOLATIONS = [
  {
    id: 'viol-mumbai-9001',
    plateNumber: 'MH 02 CZ 4921',
    datasetSource: 'Synthetic demo record — not a real vehicle or person',
    vehicleMakeModel: 'N/A (synthetic demo)',
    ownerName: 'Demo registrant (synthetic)',
    violationType: 'RED_LIGHT',
    confidence: 0.94,
    status: 'AUTO_FINED',
    fineAmount: 1000,
    multiplierApplied: '1x',
    repeatViolationsCount: 1,
    camera: CAMERAS[0],
    timestamp: '2026-08-27T09:12:30.000Z',
    evidenceUrls: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    id: 'viol-mumbai-9002',
    plateNumber: 'MH 04 ER 8812',
    datasetSource: 'Synthetic demo record — not a real vehicle or person',
    vehicleMakeModel: 'N/A (synthetic demo)',
    ownerName: 'Demo registrant (synthetic)',
    violationType: 'OVERSPEEDING',
    confidence: 0.78,
    status: 'OPERATOR_REVIEW',
    fineAmount: 2000,
    multiplierApplied: '1x',
    repeatViolationsCount: 2,
    camera: CAMERAS[1],
    timestamp: '2026-08-27T09:14:05.000Z',
    evidenceUrls: [
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    id: 'viol-mumbai-9003',
    plateNumber: 'KA 03 MN 9210',
    datasetSource: 'Synthetic demo record — not a real vehicle or person',
    vehicleMakeModel: 'N/A (synthetic demo)',
    ownerName: 'Demo registrant (synthetic)',
    violationType: 'RED_LIGHT',
    confidence: 0.96,
    status: 'AUTO_FINED',
    fineAmount: 2000,
    multiplierApplied: '2x (Repeat Offender 3+ in 90 Days)',
    repeatViolationsCount: 4,
    camera: CAMERAS[2],
    timestamp: '2026-08-27T09:15:22.000Z',
    evidenceUrls: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    id: 'viol-mumbai-9004',
    plateNumber: 'DL 01 AB 3490',
    datasetSource: 'Synthetic demo record — not a real vehicle or person',
    vehicleMakeModel: 'N/A (synthetic demo)',
    ownerName: 'Demo registrant (synthetic)',
    violationType: 'NO_HELMET',
    confidence: 0.89,
    status: 'AUTO_FINED',
    fineAmount: 1000,
    multiplierApplied: '1x',
    repeatViolationsCount: 1,
    camera: CAMERAS[3],
    timestamp: '2026-08-27T09:16:40.000Z',
    evidenceUrls: [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80'
    ]
  }
];

export const FINES_DATABASE = [
  {
    id: 'FINE-2026-8801',
    challanNo: 'MH-CHALLAN-2026-09481',
    plateNumber: 'MH 02 CZ 4921',
    datasetSource: 'Synthetic demo record — not a real vehicle or person',
    ownerName: 'Demo registrant (synthetic)',
    vehicleModel: 'N/A (synthetic demo)',
    offense: 'Red Light Running at BKC Junction',
    amount: 1000,
    dueDate: '2026-09-15',
    status: 'PAID',
    paymentMethod: 'UPI (GPay)',
    transactionId: 'UPI/6239102491/SUCCESS'
  },
  {
    id: 'FINE-2026-8802',
    challanNo: 'MH-CHALLAN-2026-09482',
    plateNumber: 'MH 04 ER 8812',
    datasetSource: 'Synthetic demo record — not a real vehicle or person',
    ownerName: 'Demo registrant (synthetic)',
    vehicleModel: 'N/A (synthetic demo)',
    offense: 'Over-Speeding (94 km/h in 80 km/h zone)',
    amount: 2000,
    dueDate: '2026-09-18',
    status: 'DISPUTED',
    disputeReason: 'Emergency Medical Evacuation to Lilavati Hospital',
    disputeStatus: 'UNDER_REVIEW'
  },
  {
    id: 'FINE-2026-8803',
    challanNo: 'MH-CHALLAN-2026-09483',
    plateNumber: 'KA 03 MN 9210',
    datasetSource: 'Synthetic demo record — not a real vehicle or person',
    ownerName: 'Demo registrant (synthetic)',
    vehicleModel: 'N/A (synthetic demo)',
    offense: 'Red Light Running (Repeat Offender Multiplier 2x)',
    amount: 2000,
    dueDate: '2026-09-10',
    status: 'PENDING',
    flaggedForSuspension: true
  },
  {
    id: 'FINE-2026-8804',
    challanNo: 'DL-CHALLAN-2026-09484',
    plateNumber: 'DL 01 AB 3490',
    datasetSource: 'Synthetic demo record — not a real vehicle or person',
    ownerName: 'Demo registrant (synthetic)',
    vehicleModel: 'N/A (synthetic demo)',
    offense: 'No Helmet / Passenger Safety Belt',
    amount: 1000,
    dueDate: '2026-09-20',
    status: 'PENDING'
  }
];

export const DIVERSION_TEMPLATES = [
  {
    id: 'div-01',
    title: 'WEH Heavy Congestion — BKC Arterial Detour',
    corridor: 'Western Express Highway Southbound',
    alternateRoute: 'LBS Marg -> Eastern Expressway Connector',
    timeSavingsMin: 24,
    status: 'ACTIVE',
    signageMessage: 'HEAVY QUEUE WEH SOUTH. DIVERSION: USE LBS MARG & EASTERN EXPWY. SAVINGS 24 MINS.'
  },
  {
    id: 'div-02',
    title: 'Monsoon Waterlogging — Palm Beach Coastal Bypass',
    corridor: 'Nerul Underpass Corridor',
    alternateRoute: 'Palm Beach Road Elevated Bypass',
    timeSavingsMin: 18,
    status: 'IDLE',
    signageMessage: 'WATERLOGGING AHEAD. LIGHT VEHICLES USE PALM BEACH ROAD ELEVATED ROUTE.'
  }
];

export const EXECUTIVE_METRICS = {
  violationDetectionRate: '+342%',
  avgCommuteSavings: '28.5%',
  fineCollectionRate: '84.2%',
  accidentReduction: '-32%'
};
