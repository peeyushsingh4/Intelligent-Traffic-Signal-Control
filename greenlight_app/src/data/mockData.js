// iTraCS — Intelligent Traffic & Challan System — Master Production Mock Data Engine

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
    simulationScenario: 'bkc',
    videoUrl: 'https://assets.mixkit.co/videos/1755/1755-720.mp4',
    livePlate: 'MH 02 CZ 4921',
    speedObserved: 64,
    violationTag: 'RED LIGHT RUNNING'
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
    simulationScenario: 'vashi',
    videoUrl: 'https://assets.mixkit.co/videos/4272/4272-720.mp4',
    livePlate: 'MH 04 ER 8812',
    speedObserved: 94,
    violationTag: 'OVERSPEEDING (94 in 80)'
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
    simulationScenario: 'palm_beach',
    videoUrl: 'https://assets.mixkit.co/videos/36261/36261-720.mp4',
    livePlate: 'KA 03 MN 9210',
    speedObserved: 72,
    violationTag: 'RED LIGHT RUNNING (2X REPEAT)'
  },
  { 
    id: 'cam-dadar-04', 
    name: 'Dadar TT Circle (Central Mumbai)', 
    zone: 'South-Central Arterial', 
    speedLimitKmh: 50, 
    status: 'ONLINE', 
    fps: 30, 
    ip: '192.168.1.104', 
    lat: 19.0178, 
    lng: 72.8478,
    simulationScenario: 'dadar',
    videoUrl: '/videos/istockphoto-1170897707-640_adpp_is_tracked.mp4',
    rawVideoUrl: '/videos/istockphoto-1170897707-640_adpp_is.mp4',
    tracksJson: '/videos/istockphoto-1170897707-640_adpp_is_compact.json',
    livePlate: 'MH 01 BK 2049',
    speedObserved: 48,
    violationTag: 'ZEBRA CROSSING PEDESTRIAN ENCROACHMENT'
  },
  { 
    id: 'cam-weh-05', 
    name: 'WEH Airport Flyover & Metro (Andheri East)', 
    zone: 'Western Corridor', 
    speedLimitKmh: 70, 
    status: 'ONLINE', 
    fps: 30, 
    ip: '192.168.1.105', 
    lat: 19.1197, 
    lng: 72.8464,
    simulationScenario: 'weh',
    videoUrl: '/videos/istockphoto-2228456242-640_adpp_is_tracked.mp4',
    rawVideoUrl: '/videos/istockphoto-2228456242-640_adpp_is.mp4',
    tracksJson: '/videos/istockphoto-2228456242-640_adpp_is_compact.json',
    livePlate: 'MH 02 EE 7731',
    speedObserved: 32,
    violationTag: 'DTC/BEST BUS LANE BLOCK'
  },
  { 
    id: 'cam-lbs-06', 
    name: 'Kurla - LBS Marg Metro Corridor (Mumbai)', 
    zone: 'Eastern Central Bypass', 
    speedLimitKmh: 60, 
    status: 'ONLINE', 
    fps: 30, 
    ip: '192.168.1.106', 
    lat: 19.0728, 
    lng: 72.8797,
    simulationScenario: 'lbs_metro',
    videoUrl: '/videos/istockphoto-2228456262-640_adpp_is_tracked.mp4',
    rawVideoUrl: '/videos/istockphoto-2228456262-640_adpp_is.mp4',
    tracksJson: '/videos/istockphoto-2228456262-640_adpp_is_compact.json',
    livePlate: 'MH 03 DZ 9140',
    speedObserved: 54,
    violationTag: 'ILLEGAL COMMERCIAL QUEUE'
  },
  { 
    id: 'cam-red-07', 
    name: 'BKC East Approach — Red Signal Stop Line (Lane Stopped)', 
    zone: 'BKC East Stop Line', 
    speedLimitKmh: 50, 
    status: 'ONLINE', 
    fps: 30, 
    ip: '192.168.1.107', 
    lat: 19.0660, 
    lng: 72.8710,
    simulationScenario: 'red_signal',
    signalState: 'RED',
    videoUrl: '/videos/istockphoto-1095606488-640_adpp_is_tracked.mp4',
    rawVideoUrl: '/videos/istockphoto-1095606488-640_adpp_is.mp4',
    tracksJson: '/videos/istockphoto-1095606488-640_adpp_is_compact.json',
    livePlate: 'MH 02 BG 3319',
    speedObserved: 0,
    violationTag: 'RED SIGNAL STOPPED LANE HOLD'
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
    datasetSource: 'Real-world traffic enforcement record',
    vehicleMake: 'Maruti Suzuki Swift',
    vehicleMakeModel: 'Maruti Suzuki Swift (White Hatchback)',
    vehicleColor: 'Pearl White',
    ownerName: 'Arun Patel',
    ownerPhone: '+91 98201 44921',
    ownerMobile: '+91 98201 44921',
    violationType: 'RED_LIGHT',
    confidence: 0.94,
    aiConfidence: 0.94,
    anprConfidence: 0.96,
    status: 'AUTO_FINED',
    fineAmount: 1000,
    multiplierApplied: '1x',
    repeatCount: 1,
    repeatViolationsCount: 1,
    camera: CAMERAS[0],
    timestamp: '2026-08-27T09:12:30.000Z',
    videoUrl: 'https://assets.mixkit.co/videos/1755/1755-720.mp4',
    snapshots: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80'
    ],
    evidenceUrls: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    id: 'viol-mumbai-9002',
    plateNumber: 'MH 04 ER 8812',
    datasetSource: 'Real-world traffic enforcement record',
    vehicleMake: 'Tata Nexon EV',
    vehicleMakeModel: 'Tata Nexon EV (Teal Blue SUV)',
    vehicleColor: 'Teal Blue',
    ownerName: 'Vikram Shinde',
    ownerPhone: '+91 98190 88812',
    ownerMobile: '+91 98190 88812',
    violationType: 'OVERSPEEDING',
    confidence: 0.78,
    aiConfidence: 0.78,
    anprConfidence: 0.88,
    status: 'OPERATOR_REVIEW',
    fineAmount: 2000,
    multiplierApplied: '1x',
    repeatCount: 2,
    repeatViolationsCount: 2,
    camera: CAMERAS[1],
    timestamp: '2026-08-27T09:14:05.000Z',
    videoUrl: 'https://assets.mixkit.co/videos/4272/4272-720.mp4',
    snapshots: [
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80'
    ],
    evidenceUrls: [
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    id: 'viol-mumbai-9003',
    plateNumber: 'KA 03 MN 9210',
    datasetSource: 'Real-world traffic enforcement record',
    vehicleMake: 'Mahindra Thar',
    vehicleMakeModel: 'Mahindra Thar (Napoli Black 4x4)',
    vehicleColor: 'Napoli Black',
    ownerName: 'Rajesh Kumar',
    ownerPhone: '+91 97400 99210',
    ownerMobile: '+91 97400 99210',
    violationType: 'RED_LIGHT',
    confidence: 0.96,
    aiConfidence: 0.96,
    anprConfidence: 0.98,
    status: 'AUTO_FINED',
    fineAmount: 2000,
    multiplierApplied: '2x (Repeat Offender 3+ in 90 Days)',
    repeatCount: 4,
    repeatViolationsCount: 4,
    camera: CAMERAS[2],
    timestamp: '2026-08-27T09:15:22.000Z',
    videoUrl: 'https://assets.mixkit.co/videos/36261/36261-720.mp4',
    snapshots: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80'
    ],
    evidenceUrls: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    id: 'viol-mumbai-9004',
    plateNumber: 'DL 01 AB 3490',
    datasetSource: 'Real-world traffic enforcement record',
    vehicleMake: 'Bajaj RE Auto-Rickshaw',
    vehicleMakeModel: 'Bajaj RE 4S Auto-Rickshaw (Yellow/Black)',
    vehicleColor: 'Yellow & Black',
    ownerName: 'Sanjay Sharma',
    ownerPhone: '+91 98111 33490',
    ownerMobile: '+91 98111 33490',
    violationType: 'NO_HELMET',
    confidence: 0.89,
    aiConfidence: 0.89,
    anprConfidence: 0.92,
    status: 'AUTO_FINED',
    fineAmount: 1000,
    multiplierApplied: '1x',
    repeatCount: 1,
    repeatViolationsCount: 1,
    camera: CAMERAS[3],
    timestamp: '2026-08-27T09:16:40.000Z',
    videoUrl: 'https://assets.mixkit.co/videos/11/11-720.mp4',
    snapshots: [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80'
    ],
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
    fineId: 'FINE-2026-8801',
    challanNo: 'MH-CHALLAN-2026-09481',
    plateNumber: 'MH 02 CZ 4921',
    ownerName: 'Arun Patel',
    vehicleModel: 'Maruti Suzuki Swift',
    offense: 'Red Light Running at BKC Junction',
    violationType: 'Red Light Running',
    amount: 1000,
    dueDate: '2026-09-15',
    status: 'PAID',
    paymentMethod: 'UPI (GPay)',
    transactionId: 'UPI/6239102491/SUCCESS'
  },
  {
    id: 'FINE-2026-8802',
    fineId: 'FINE-2026-8802',
    challanNo: 'MH-CHALLAN-2026-09482',
    plateNumber: 'MH 04 ER 8812',
    ownerName: 'Vikram Shinde',
    vehicleModel: 'Tata Nexon EV',
    offense: 'Over-Speeding (94 km/h in 80 km/h zone)',
    violationType: 'Over-Speeding',
    amount: 2000,
    dueDate: '2026-09-18',
    status: 'DISPUTED',
    disputeReason: 'Emergency Medical Evacuation to Lilavati Hospital',
    disputeStatus: 'UNDER_REVIEW'
  },
  {
    id: 'FINE-2026-8803',
    fineId: 'FINE-2026-8803',
    challanNo: 'MH-CHALLAN-2026-09483',
    plateNumber: 'KA 03 MN 9210',
    ownerName: 'Rajesh Kumar',
    vehicleModel: 'Mahindra Thar',
    offense: 'Red Light Running (Repeat Offender Multiplier 2x)',
    violationType: 'Red Light Running',
    amount: 2000,
    dueDate: '2026-09-10',
    status: 'PENDING',
    flaggedForSuspension: true
  },
  {
    id: 'FINE-2026-8804',
    fineId: 'FINE-2026-8804',
    challanNo: 'DL-CHALLAN-2026-09484',
    plateNumber: 'DL 01 AB 3490',
    ownerName: 'Sanjay Sharma',
    vehicleModel: 'Bajaj RE Auto-Rickshaw',
    offense: 'No Helmet / Passenger Safety Belt',
    violationType: 'No Helmet / Seatbelt',
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
    affectedCorridor: 'Western Express Highway Southbound',
    alternateRoute: 'LBS Marg -> Eastern Expressway Connector',
    recommendedRoute: 'CST Road -> LBS Marg -> EEH Connector',
    timeSavingsMin: 24,
    capacityImpact: '+35% Corridor Flow',
    status: 'ACTIVE',
    signageMessage: 'HEAVY QUEUE WEH SOUTH. DIVERSION: USE CST RD -> LBS MARG -> EEH. SAVINGS 24 MINS.',
    mapCenter: [19.0660, 72.8680],
    mapZoom: 13,
    divertRatePct: 50,
    divertedCount: 742,
    hazard: {
      type: 'CONGESTION',
      label: 'WEH Kalanagar Bottleneck (Avg 6 km/h)',
      location: [19.0620, 72.8502],
      queueKm: 2.1,
      delayMin: 32,
      blockedPolyline: [
        [19.0835, 72.8532], // WEH Santacruz Southbound
        [19.0785, 72.8525], // Vakola Flyover
        [19.0730, 72.8518], // WEH Military Camp
        [19.0675, 72.8510], // Kalanagar flyover approach
        [19.0620, 72.8502], // Kalanagar Junction Bottleneck (Avg 6 km/h)
        [19.0560, 72.8495]  // Bandra Government Colony Merge
      ]
    },
    bypassRoute: [
      [19.0815, 72.8535], // 1. Vakola Exit Slip-Ramp off WEH
      [19.0800, 72.8552], // 2. Curve into CST Road / Vidyanagari Marg
      [19.0785, 72.8580], // 3. CST Road past Kalina University gate
      [19.0772, 72.8615], // 4. Kalina CST Road straight
      [19.0758, 72.8655], // 5. CST Road towards Kurla West
      [19.0740, 72.8698], // 6. CST Road past Kurla telephone exchange
      [19.0722, 72.8735], // 7. Hans Bhugra Marg / CST Road Junction
      [19.0705, 72.8765], // 8. Intersection of CST Road and LBS Marg
      [19.0682, 72.8790], // 9. Turning South onto LBS Marg
      [19.0655, 72.8815], // 10. LBS Marg commercial corridor
      [19.0628, 72.8838], // 11. BKC-Chunabhatti Flyover Connector Ramp
      [19.0598, 72.8858], // 12. Chunabhatti Elevated Viaduct over railway tracks
      [19.0565, 72.8872], // 13. Elevated ramp descending towards Eastern Expressway
      [19.0525, 72.8885], // 14. Merging onto Eastern Express Highway main carriageway
      [19.0480, 72.8892], // 15. Eastern Express Highway Southbound (Free Flow)
      [19.0435, 72.8896], // 16. EEH Priyadarshini Circle approach
      [19.0390, 72.8898]  // 17. Free flow merge into South Mumbai arterial
    ],
    vmsGantries: [
      { id: 'vms-01', name: 'VMS #04 (Vakola Gantry)', pos: [19.0825, 72.8560], message: 'DIVERSION: USE CST ROAD -> LBS MARG' },
      { id: 'vms-02', name: 'VMS #09 (CST Road Junction)', pos: [19.0735, 72.8710], message: 'EEH CONNECTOR CLEAR' }
    ]
  },
  {
    id: 'div-02',
    title: 'Monsoon Waterlogging — Palm Beach Coastal Bypass',
    corridor: 'Nerul Underpass Corridor (Navi Mumbai)',
    affectedCorridor: 'Nerul Underpass Corridor (Navi Mumbai)',
    alternateRoute: 'Palm Beach Road Elevated Bypass',
    recommendedRoute: 'Palm Beach Road Elevated Bypass',
    timeSavingsMin: 18,
    capacityImpact: '+20% Flood Clearance',
    status: 'ACTIVE',
    signageMessage: 'WATERLOGGING AHEAD. LIGHT VEHICLES USE PALM BEACH ROAD ELEVATED ROUTE.',
    mapCenter: [19.0280, 73.0150],
    mapZoom: 13,
    divertRatePct: 55,
    divertedCount: 425,
    hazard: {
      type: 'FLOOD',
      label: 'Nerul Underpass Waterlogged (Depth 45cm)',
      location: [19.0340, 73.0195],
      queueKm: 1.6,
      delayMin: 28,
      blockedPolyline: [
        [19.0450, 73.0175],
        [19.0410, 73.0182],
        [19.0375, 73.0188],
        [19.0340, 73.0195],
        [19.0300, 73.0205],
        [19.0260, 73.0215]
      ]
    },
    bypassRoute: [
      [19.0480, 73.0125], // 1. LP Flyover Diversion Exit
      [19.0450, 73.0100], // 2. Connecting to Moraj Circle
      [19.0415, 73.0075], // 3. Moraj Circle - Palm Beach Road Entry
      [19.0375, 73.0068], // 4. Palm Beach Road 6-Lane Coastal Arterial
      [19.0330, 73.0065], // 5. Palm Beach Road along Nerul Lake
      [19.0285, 73.0070], // 6. Elevated Viaduct approach
      [19.0240, 73.0080], // 7. Palm Beach Elevated Viaduct over creek
      [19.0195, 73.0102], // 8. Seawoods Grand Central interchange
      [19.0150, 73.0135], // 9. Seawoods Coastal Link
      [19.0105, 73.0180], // 10. Belapur Coastal curve
      [19.0060, 73.0245]  // 11. CBD Belapur Mainline Rejoin (Free Flow)
    ],
    vmsGantries: [
      { id: 'vms-03', name: 'VMS #12 (LP Flyover Approach)', pos: [19.0485, 73.0145], message: 'UNDERPASS CLOSED - USE PALM BEACH' },
      { id: 'vms-04', name: 'VMS #15 (Moraj Circle Entry)', pos: [19.0405, 73.0090], message: 'ELEVATED VIADUCT OPEN' }
    ]
  },
  {
    id: 'div-03',
    title: 'Dadar TT Urban Gridlock — Ambedkar Elevated Bypass',
    corridor: 'Dadar TT Circle - Dr. Ambedkar Road',
    affectedCorridor: 'Dadar TT Circle - Dr. Ambedkar Road',
    alternateRoute: 'Dr. Ambedkar Road Elevated Flyover Corridor',
    recommendedRoute: 'Dr. Ambedkar Road Elevated Flyover Corridor',
    timeSavingsMin: 16,
    capacityImpact: '+28% Urban Relief',
    status: 'IDLE',
    signageMessage: 'DADAR TT GRIDLOCK. HEAVY VEHICLES DIVERT VIA AMBEDKAR ELEVATED VIADUCT.',
    mapCenter: [19.0180, 72.8440],
    mapZoom: 14,
    divertRatePct: 35,
    divertedCount: 210,
    hazard: {
      type: 'CONGESTION',
      label: 'Dadar TT Circle Gridlock (Bus Breakdown)',
      location: [19.0178, 72.8478],
      queueKm: 1.2,
      delayMin: 22,
      blockedPolyline: [
        [19.0250, 72.8465],
        [19.0215, 72.8472],
        [19.0178, 72.8478],
        [19.0140, 72.8460],
        [19.0110, 72.8445]
      ]
    },
    bypassRoute: [
      [19.0270, 72.8450], // 1. Matunga Post Office Exit
      [19.0235, 72.8435], // 2. Dr. Ambedkar Road Elevated Flyover Ramp
      [19.0195, 72.8420], // 3. Elevated Flyover soaring over Dadar TT Circle
      [19.0150, 72.8410], // 4. Hindmata Elevated Viaduct
      [19.0105, 72.8400], // 5. Parel TT Overpass
      [19.0060, 72.8390]  // 6. Lalbaug Flyover Connector (Free Flow)
    ],
    vmsGantries: [
      { id: 'vms-05', name: 'VMS #07 (Matunga Circle Gantry)', pos: [19.0275, 72.8465], message: 'TAKE ELEVATED FLYOVER' }
    ]
  }
];

export const REGISTERED_VEHICLES = {
  'MH 02 CZ 4921': {
    plateNumber: 'MH 02 CZ 4921',
    ownerName: 'Arun Patel',
    phone: '+91 98201 44921',
    email: 'arun.patel@gmail.com',
    model: 'Maruti Suzuki Swift VXi',
    vehicleClass: 'Motor Car (LMV)',
    fuelType: 'Petrol / BS-VI',
    color: 'Pearl Arctic White',
    rto: 'MH-02 Mumbai West (Andheri)',
    registrationDate: '14-Mar-2022',
    chassisNo: 'MA3EWB31S0091823',
    engineNo: 'K12MN8712093',
    insuranceCompany: 'HDFC ERGO General Insurance',
    insurancePolicyNo: 'HDFC-MOT-2026-99182',
    insuranceExpiry: '12-Mar-2027',
    pucCertNo: 'MH02PUC20268819',
    pucExpiry: '28-Nov-2026',
    status: 'ACTIVE_REGISTERED'
  },
  'MH 04 ER 8812': {
    plateNumber: 'MH 04 ER 8812',
    ownerName: 'Vikram Shinde',
    phone: '+91 98190 88812',
    email: 'vikram.shinde@outlook.com',
    model: 'Tata Nexon EV Max',
    vehicleClass: 'Electric Passenger Car (LMV)',
    fuelType: 'Battery Electric Vehicle (Zero Emission)',
    color: 'Intensi-Teal Dual Tone',
    rto: 'MH-04 Thane RTO',
    registrationDate: '02-Jan-2024',
    chassisNo: 'MAT62341P0019284',
    engineNo: 'EM9082341829',
    insuranceCompany: 'ICICI Lombard General Insurance',
    insurancePolicyNo: 'IL-EV-2026-44019',
    insuranceExpiry: '01-Jan-2027',
    pucCertNo: 'EXEMPT_ELECTRIC',
    pucExpiry: 'PERMANENT_EXEMPT',
    status: 'ACTIVE_REGISTERED'
  },
  'KA 03 MN 9210': {
    plateNumber: 'KA 03 MN 9210',
    ownerName: 'Rajesh Kumar',
    phone: '+91 97400 99210',
    email: 'rajesh.k@gmail.com',
    model: 'Hyundai Creta SX (O)',
    vehicleClass: 'Motor Car (SUV)',
    fuelType: 'Diesel / BS-VI',
    color: 'Titan Grey Metallic',
    rto: 'KA-03 Bangalore East (Indiranagar)',
    registrationDate: '19-Aug-2021',
    chassisNo: 'MALC341BS0081294',
    engineNo: 'D4FA9948192',
    insuranceCompany: 'Bajaj Allianz General Insurance',
    insurancePolicyNo: 'BAJAJ-MOT-2026-11928',
    insuranceExpiry: '18-Aug-2027',
    pucCertNo: 'KA03PUC20264102',
    pucExpiry: '15-Dec-2026',
    status: 'ACTIVE_REGISTERED'
  },
  'DL 01 AB 3490': {
    plateNumber: 'DL 01 AB 3490',
    ownerName: 'Sanjay Sharma',
    phone: '+91 98111 33490',
    email: 'sanjay.auto@gmail.com',
    model: 'Bajaj RE Compact 4S Auto-Rickshaw',
    vehicleClass: 'Three-Wheeler Passenger (3WT)',
    fuelType: 'CNG / BS-VI',
    color: 'Yellow & Green',
    rto: 'DL-01 North Delhi (Mall Road)',
    registrationDate: '10-Feb-2020',
    chassisNo: 'MD2AA24FZ0091823',
    engineNo: 'AFZ20209182',
    insuranceCompany: 'New India Assurance',
    insurancePolicyNo: 'NIA-CV-2026-77192',
    insuranceExpiry: '09-Feb-2027',
    pucCertNo: 'DL01PUC20261928',
    pucExpiry: '08-Oct-2026',
    status: 'ACTIVE_COMMERCIAL'
  }
};

export const IAM_ROLES = {
  TRAFFIC_POLICE: {
    id: 'TRAFFIC_POLICE',
    title: 'Traffic Police Officer / Operator',
    badgeText: 'Traffic Police Officer',
    badgeId: 'MH-TP-4091',
    userName: 'Insp. Rajesh Shinde',
    department: 'Mumbai Traffic Police (Headquarters)',
    jurisdiction: 'Greater Mumbai & Navi Mumbai Corridors',
    description: 'Authorized to monitor live CCTV feeds, control signal reallocations, dispatch emergency priority, review ANPR violations, and adjudicate disputes.',
    permissions: [
      'VIEW_DASHBOARD',
      'VIEW_ALL_CAMERAS',
      'MANAGE_SIGNALS',
      'TRIGGER_EVP_EMERGENCY',
      'TRIGGER_DIVERSION',
      'REVIEW_VIOLATIONS',
      'APPROVE_CHALLANS',
      'DISMISS_VIOLATIONS',
      'ADJUDICATE_DISPUTES',
      'VIEW_ANALYTICS'
    ],
    allowedTabs: [
      'control_room',
      'simulation_display',
      'evidence_viewer',
      'diversions',
      'fines',
      'camera_management',
      'field_officer',
      'analytics',
      'testing'
    ],
    landingTab: 'control_room'
  },
  CITIZEN: {
    id: 'CITIZEN',
    title: 'Citizen / Vehicle Owner',
    badgeText: 'Citizen User',
    badgeId: 'CITIZEN-USER',
    userName: 'Arun Patel',
    registeredVehicle: 'MH 02 CZ 4921',
    phone: '+91 98201 44921',
    description: 'Public access to look up registered vehicle details, review issued e-challans with photographic evidence, make instant fine payments, and file disputes.',
    permissions: [
      'VIEW_OWN_VEHICLES',
      'SEARCH_CHALLAN',
      'PAY_FINES',
      'CONTEST_DISPUTE',
      'DOWNLOAD_RECEIPT'
    ],
    allowedTabs: [
      'vehicle_owner_portal',
      'citizen_vehicles',
      'citizen_evidence',
      'citizen_disputes'
    ],
    landingTab: 'citizen_vehicles'
  }
};

export const EXECUTIVE_METRICS = {
  violationDetectionRate: '+342%',
  avgCommuteSavings: '28.5%',
  fineCollectionRate: '84.2%',
  accidentReduction: '-32%'
};
