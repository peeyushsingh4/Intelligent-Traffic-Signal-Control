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
    mapCenter: [19.0660, 72.8640],
    mapZoom: 13,
    divertRatePct: 50,
    divertedCount: 742,
    hazard: {
      type: 'CONGESTION',
      label: 'WEH Kalanagar Bottleneck (Avg 6 km/h)',
      location: [19.061037, 72.846377],
      queueKm: 2.1,
      delayMin: 32,
      blockedPolyline: [
        [19.085962, 72.845241], // WEH Santacruz Southbound
        [19.084041, 72.846353], // Vakola Flyover
        [19.081179, 72.846540], // Vakola Junction
        [19.079314, 72.846722], // WEH Military Camp / Kalina approach
        [19.074460, 72.847094], // University / Kalanagar north corridor
        [19.068500, 72.846800], // Kalanagar Flyover approach
        [19.061037, 72.846377], // Kalanagar Junction Bottleneck (Avg 6 km/h)
        [19.055190, 72.846303], // Bandra Government Colony Merge
        [19.053044, 72.845644]  // Bandra ROB descent
      ]
    },
    bypassRoute: [
      [19.081179, 72.846540], // 1. Vakola Exit Slip-Ramp off WEH
      [19.080500, 72.850200], // 2. Vidyanagari Marg / Hans Bhugra connector
      [19.078800, 72.855400], // 3. CST Road past Kalina Campus
      [19.077200, 72.861500], // 4. Kalina CST Road straight
      [19.075200, 72.866500], // 5. CST Road towards Kurla West
      [19.073500, 72.871200], // 6. CST Road past Kurla telephone exchange
      [19.070638, 72.875339], // 7. Intersection of CST Road and LBS Marg
      [19.065800, 72.873200], // 8. Turning South onto LBS Marg / Kurla commercial strip
      [19.058976, 72.864538], // 9. BKC Connector entry ramp
      [19.053913, 72.868089], // 10. BKC Connector elevated viaduct
      [19.050638, 72.874852], // 11. BKC Elevated viaduct crossing Mithi river
      [19.053604, 72.882287], // 12. BKC Connector descending ramp onto EEH
      [19.054773, 72.884657], // 13. Merging onto Eastern Express Highway main carriageway
      [19.052500, 72.887000], // 14. Eastern Express Highway Southbound (Free Flow)
      [19.046500, 72.888500], // 15. EEH Priyadarshini Circle approach
      [19.041000, 72.889500]  // 16. Free flow merge into South Mumbai arterial
    ],
    vmsGantries: [
      { id: 'vms-01', name: 'VMS #04 (Vakola Gantry)', pos: [19.0805, 72.8515], message: 'DIVERSION: USE CST ROAD -> LBS MARG' },
      { id: 'vms-02', name: 'VMS #09 (CST Road Junction)', pos: [19.0725, 72.8730], message: 'EEH CONNECTOR CLEAR' }
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
    mapCenter: [19.0280, 73.0180],
    mapZoom: 13,
    divertRatePct: 55,
    divertedCount: 425,
    hazard: {
      type: 'FLOOD',
      label: 'Uran Phata Underpass Waterlogged (Depth 45cm)',
      location: [19.034240, 73.029770],
      queueKm: 1.6,
      delayMin: 28,
      blockedPolyline: [
        [19.044396, 73.026970], // LP Flyover / DY Patil Stadium
        [19.043295, 73.027980], // Sion-Panvel Highway Nerul East
        [19.041978, 73.028586], // Past DY Patil Medical Campus
        [19.038534, 73.029004], // Approaching Uran Phata
        [19.037017, 73.029080], // Uran Phata Flyover North Approach
        [19.034240, 73.029770], // Uran Phata Underpass (Waterlogged Epicenter)
        [19.030598, 73.030020], // Uran Phata South Descent
        [19.029870, 73.030526], // Sion-Panvel Highway Nerul Junction
        [19.029804, 73.031199], // Nerul-Seawoods Expressway Section
        [19.028863, 73.034520], // Seawoods Grand Central Highway curve
        [19.026504, 73.037185], // Seawoods-Darave Arterial
        [19.025862, 73.037907]  // Belapur Highway Convergence
      ]
    },
    bypassRoute: [
      [19.044396, 73.026970], // 1. LP Flyover Diversion Exit
      [19.043642, 73.021208], // 2. Rajiv Gandhi Flyover West Ramp
      [19.043590, 73.017099], // 3. Rajiv Gandhi Flyover over Railway Lines
      [19.043725, 73.014002], // 4. Mother Teresa Marg Connector
      [19.044025, 73.008097], // 5. Palm Beach Marg Entry Junction
      [19.043448, 73.008225], // 6. Palm Beach Marg Sector 14 Nerul West
      [19.032843, 73.007659], // 7. Palm Beach Marg past Sector 19
      [19.032167, 73.007604], // 8. Palm Beach Marg Nerul West
      [19.027335, 73.007026], // 9. Palm Beach Marg opposite Jewel of Navi Mumbai
      [19.026468, 73.006982], // 10. Palm Beach Marg along Lake shoreline
      [19.025624, 73.007119], // 11. Palm Beach Marg curve past Nerul Lake
      [19.023194, 73.008172], // 12. Palm Beach Marg approaching Karave
      [19.022595, 73.008364], // 13. Nag Devi Marg intersection
      [19.021407, 73.008409], // 14. Palm Beach 6-Lane Coastal section
      [19.019302, 73.008193], // 15. Seawoods Coastal stretch
      [19.017866, 73.008165], // 16. Palm Beach Elevated Viaduct approach
      [19.014514, 73.008444], // 17. Seawoods Coastal Link
      [19.012644, 73.009076], // 18. Palm Beach Coastal Viaduct over creek
      [19.011677, 73.009898], // 19. Belapur Coastal Curve North
      [19.010547, 73.011300], // 20. Belapur Coastal Curve Central
      [19.008183, 73.014400], // 21. Belapur Bay Curve
      [19.007690, 73.015550], // 22. CBD Belapur South approach
      [19.007517, 73.016419], // 23. CBD Belapur Coastal curve
      [19.008333, 73.022217], // 24. CBD Belapur Arterial Rejoin
      [19.009800, 73.028500], // 25. Belapur Mainline Connector
      [19.010823, 73.032875]  // 26. Sion-Panvel Highway Free-Flow Rejoin
    ],
    vmsGantries: [
      { id: 'vms-03', name: 'VMS #12 (LP Flyover Approach)', pos: [19.0436, 73.0215], message: 'UNDERPASS CLOSED - USE PALM BEACH' },
      { id: 'vms-04', name: 'VMS #15 (Mother Teresa Marg Entry)', pos: [19.0438, 73.0115], message: 'PALM BEACH BYPASS OPEN' }
    ]
  },
  {
    id: 'div-03',
    title: 'Dadar TT Urban Gridlock — RAK Marg Arterial Bypass',
    corridor: 'Dadar TT Circle - Dr. Ambedkar Road',
    affectedCorridor: 'Dr. Ambedkar Road Southbound (Khodadad Circle)',
    alternateRoute: 'Rafi Ahmed Kidwai (RAK) Marg -> Sewri-Parel Connector',
    recommendedRoute: 'RAK Marg -> Acharya Donde Marg -> Lalbaug',
    timeSavingsMin: 16,
    capacityImpact: '+28% Urban Relief',
    status: 'IDLE',
    signageMessage: 'DADAR TT GRIDLOCK. HEAVY TRAFFIC DIVERT VIA RAK MARG & SEWRI. SAVINGS 16 MINS.',
    mapCenter: [19.0180, 72.8510],
    mapZoom: 14,
    divertRatePct: 35,
    divertedCount: 245,
    hazard: {
      type: 'CONGESTION',
      label: 'Dadar TT Circle Gridlock (Bus Breakdown)',
      location: [19.017800, 72.847800],
      queueKm: 1.2,
      delayMin: 22,
      blockedPolyline: [
        [19.027500, 72.854000], // King's Circle (Maheshwari Udyan)
        [19.023200, 72.851200], // Ruia / Chitra Cinema North Approach
        [19.019500, 72.848800], // Dadar Fire Station Ground Approach
        [19.017800, 72.847800], // Khodadad Circle / Dadar TT Bottleneck
        [19.014200, 72.845800], // Hindmata Cinema ground road
        [19.010500, 72.844000], // Parel TT Ground Corridor
        [19.003587, 72.841882]  // Lalbaug Flyover Ground Merge
      ]
    },
    bypassRoute: [
      [19.027500, 72.854000], // 1. King's Circle (Maheshwari Udyan) Diversion Entry
      [19.029164, 72.857517], // 2. Turn onto Rafi Ahmed Kidwai (RAK) Marg
      [19.028703, 72.858593], // 3. RAK Marg Wadala Bridge curve
      [19.026147, 72.860195], // 4. RAK Marg along Five Gardens East
      [19.021889, 72.860727], // 5. RAK Marg Central Arterial
      [19.019022, 72.860293], // 6. RAK Marg past Naigaon crossroad
      [19.016965, 72.858757], // 7. RAK Marg past Naigaon Police Grounds
      [19.014793, 72.856200], // 8. RAK Marg approach to Sewri
      [19.013266, 72.855019], // 9. RAK Marg Sewri Hospital sector
      [19.011285, 72.854387], // 10. RAK Marg South sector
      [19.009921, 72.854240], // 11. RAK Marg Jerbai Wadia Road junction
      [19.004833, 72.853946], // 12. RAK Marg approach to Acharya Donde Marg
      [19.000583, 72.853722], // 13. Turn onto Acharya Donde Marg
      [19.000480, 72.846335], // 14. Acharya Donde Marg westbound
      [19.002066, 72.843636], // 15. Acharya Donde Marg Parel cross
      [19.003587, 72.841882]  // 16. Rejoining Dr. Ambedkar Road at Lalbaug (Free Flow)
    ],
    vmsGantries: [
      { id: 'vms-05', name: 'VMS #07 (Matunga Circle Gantry)', pos: [19.0285, 72.8565], message: 'DIVERSION: USE RAK MARG' },
      { id: 'vms-06', name: 'VMS #08 (RAK Marg Wadala)', pos: [19.0170, 72.8590], message: 'LALBAUG ARTERIAL CLEAR' }
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
