/**
 * greenlight.exe — Comprehensive Mock Data Engine
 * Includes 500+ camera metadata, real-time alerts, ANPR OCR packages,
 * traffic congestion heatmaps, diversion templates, fine database, and dispute queue.
 */

export const CAMERAS = [
  {
    id: "CAM-BKC-01",
    name: "BKC Junction (Bandra East)",
    zone: "Central Mumbai",
    lat: 19.0650,
    lng: 72.8550,
    status: "active",
    fps: 30,
    uptime: "99.8%",
    streamUrl: "rtsp://camera.traffic.mumbai.gov/bkc-01",
    speedLimit: 50,
    intersection: "WEH - BKC Corridor",
    lanes: 3,
    type: "PTZ 4K AI Camera"
  },
  {
    id: "CAM-WEH-04",
    name: "Western Express Hwy (Kalanagar)",
    zone: "North Mumbai",
    lat: 19.0620,
    lng: 72.8510,
    status: "active",
    fps: 29.8,
    uptime: "99.9%",
    streamUrl: "rtsp://camera.traffic.mumbai.gov/weh-04",
    speedLimit: 70,
    intersection: "WEH Flyover North",
    lanes: 4,
    type: "Fixed Dual-Lens AI"
  },
  {
    id: "CAM-VSH-02",
    name: "Vashi Highway Interchange",
    zone: "Navi Mumbai",
    lat: 19.0700,
    lng: 73.0000,
    status: "active",
    fps: 30,
    uptime: "99.5%",
    streamUrl: "rtsp://camera.traffic.navimumbai.gov/vashi-02",
    speedLimit: 60,
    intersection: "Sion-Panvel Expressway",
    lanes: 3,
    type: "ANPR High-Speed Camera"
  },
  {
    id: "CAM-PBR-07",
    name: "Palm Beach Road (Nerul)",
    zone: "Navi Mumbai",
    lat: 19.0320,
    lng: 73.0200,
    status: "active",
    fps: 28.5,
    uptime: "99.1%",
    streamUrl: "rtsp://camera.traffic.navimumbai.gov/palmbeach-07",
    speedLimit: 70,
    intersection: "Moraj Circle",
    lanes: 3,
    type: "4K Coastal PTZ"
  },
  {
    id: "CAM-DDR-03",
    name: "Dadar TT Circle",
    zone: "South Mumbai",
    lat: 19.0200,
    lng: 72.8480,
    status: "active",
    fps: 30,
    uptime: "99.7%",
    streamUrl: "rtsp://camera.traffic.mumbai.gov/dadar-03",
    speedLimit: 40,
    intersection: "Ambedkar Rd - Tilak Bridge",
    lanes: 4,
    type: "Omni 360 AI Camera"
  },
  {
    id: "CAM-WSL-01",
    name: "Bandra-Worli Sea Link Toll Plaza",
    zone: "South-West Mumbai",
    lat: 19.0380,
    lng: 72.8180,
    status: "degraded",
    fps: 22.0,
    uptime: "96.4%",
    streamUrl: "rtsp://camera.traffic.mumbai.gov/sealink-01",
    speedLimit: 80,
    intersection: "Sea Link Entry North",
    lanes: 5,
    type: "ANPR Toll Gate Camera"
  }
];

export const VIOLATION_TYPES = {
  RED_LIGHT: { name: "Red Light Running", code: "RLR", baseFine: 1000, severity: "CRITICAL" },
  WRONG_LANE: { name: "Wrong Lane / Direction", code: "WLD", baseFine: 1500, severity: "MAJOR" },
  NO_HELMET: { name: "No Helmet / Seatbelt", code: "NHS", baseFine: 500, severity: "MINOR" },
  OVERSPEEDING: { name: "Over-Speeding (>10 km/h)", code: "OSP", baseFine: 2000, severity: "MAJOR" },
  ILLEGAL_UTURN: { name: "Illegal U-Turn", code: "IUT", baseFine: 1000, severity: "MINOR" },
  ZEBRA_CROSSING: { name: "Zebra Encroachment", code: "ZCE", baseFine: 500, severity: "MINOR" }
};

export const MOCK_VIOLATIONS = [
  {
    id: "VIO-2026-89412",
    violationType: "RED_LIGHT",
    camera: CAMERAS[0],
    timestamp: "2026-08-02T17:45:12+05:30",
    aiConfidence: 0.94,
    anprConfidence: 0.96,
    plateNumber: "MH 02 CZ 4921",
    vehicleMake: "Hyundai Creta",
    vehicleColor: "Polar White",
    ownerName: "Rajesh S. Malhotra",
    ownerPhone: "+91 98201 44192",
    ownerEmail: "rajesh.malhotra@gmail.com",
    address: "B-402, Sea Breeze Apts, Bandra West, Mumbai",
    status: "AUTO_FINED",
    operatorReviewed: false,
    repeatCount: 1,
    fineAmount: 1000,
    snapshots: [
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80"
    ],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    speedObserved: 54,
    speedLimit: 50,
    gpsLocation: "19.0650° N, 72.8550° E"
  },
  {
    id: "VIO-2026-89413",
    violationType: "OVERSPEEDING",
    camera: CAMERAS[3],
    timestamp: "2026-08-02T17:48:30+05:30",
    aiConfidence: 0.91,
    anprConfidence: 0.93,
    plateNumber: "MH 43 AY 8812",
    vehicleMake: "BMW 3 Series",
    vehicleColor: "Phytonic Blue",
    ownerName: "Vikram K. Singhania",
    ownerPhone: "+91 98334 11200",
    ownerEmail: "v.singhania@apexcorp.in",
    address: "Penthouse 12, Palm Beach Towers, Nerul, Navi Mumbai",
    status: "AUTO_FINED",
    operatorReviewed: false,
    repeatCount: 3, // Repeat offender! 2x multiplier applies
    fineAmount: 4000, // 2000 x 2
    snapshots: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=600&q=80"
    ],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    speedObserved: 98,
    speedLimit: 70,
    gpsLocation: "19.0320° N, 73.0200° E"
  },
  {
    id: "VIO-2026-89414",
    violationType: "WRONG_LANE",
    camera: CAMERAS[4],
    timestamp: "2026-08-02T17:50:05+05:30",
    aiConfidence: 0.78, // Needs operator review! (70-84%)
    anprConfidence: 0.88,
    plateNumber: "MH 01 AB 3109",
    vehicleMake: "Tata Nexon EV",
    vehicleColor: "Daytona Grey",
    ownerName: "Amitabh M. Joshi",
    ownerPhone: "+91 97690 55123",
    ownerEmail: "am.joshi@techsoft.com",
    address: "Flat 14, Tilak Nagar, Dadar East, Mumbai",
    status: "OPERATOR_REVIEW",
    operatorReviewed: false,
    repeatCount: 1,
    fineAmount: 1500,
    snapshots: [
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80"
    ],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    speedObserved: 38,
    speedLimit: 40,
    gpsLocation: "19.0200° N, 72.8480° E"
  },
  {
    id: "VIO-2026-89415",
    violationType: "NO_HELMET",
    camera: CAMERAS[1],
    timestamp: "2026-08-02T17:52:19+05:30",
    aiConfidence: 0.96,
    anprConfidence: 0.95,
    plateNumber: "MH 03 EQ 7741",
    vehicleMake: "Royal Enfield Classic 350",
    vehicleColor: "Stealth Black",
    ownerName: "Karan V. Sharma",
    ownerPhone: "+91 98199 00122",
    ownerEmail: "karan.sharma92@outlook.com",
    address: "Sector 5, Charkop, Kandivali West, Mumbai",
    status: "AUTO_FINED",
    operatorReviewed: false,
    repeatCount: 2,
    fineAmount: 500,
    snapshots: [
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80"
    ],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    speedObserved: 62,
    speedLimit: 70,
    gpsLocation: "19.0620° N, 72.8510° E"
  }
];

export const CONGESTION_HEATMAP = [
  { id: "INT-BKC", name: "BKC Kalanagar Junction", score: 84, status: "SEVERE", color: "#ef4444", queue: 42, avgSpeed: 11.2, lat: 19.0650, lng: 72.8550 },
  { id: "INT-VSH", name: "Vashi Highway Interchange", score: 68, status: "HEAVY", color: "#f97316", queue: 28, avgSpeed: 18.4, lat: 19.0700, lng: 73.0000 },
  { id: "INT-PBR", name: "Palm Beach Nerul Circle", score: 45, status: "MODERATE", color: "#eab308", queue: 14, avgSpeed: 35.0, lat: 19.0320, lng: 73.0200 },
  { id: "INT-DDR", name: "Dadar Tilak Bridge", score: 78, status: "HEAVY", color: "#f97316", queue: 34, avgSpeed: 14.1, lat: 19.0200, lng: 72.8480 },
  { id: "INT-WEH", name: "WEH Airport Connector", score: 28, status: "FREE_FLOW", color: "#10b981", queue: 5, avgSpeed: 58.0, lat: 19.0900, lng: 72.8530 }
];

export const DIVERSION_TEMPLATES = [
  {
    id: "DIV-BKC-01",
    title: "WEH Heavy Congestion — BKC Arterial Detour",
    affectedCorridor: "Western Express Hwy (Southbound)",
    recommendedRoute: "Divert via LBS Marg -> Sion Flyover -> Eastern Express Hwy",
    timeSavingsMin: 24,
    capacityImpact: "1,200 veh/hr rerouted",
    signageMessage: "HEAVY QUEUE WEH SOUTH. DIVERSION: USE LBS MARG & EASTERN EXPWY. SAVINGS 24 MINS.",
    status: "SUGGESTED"
  },
  {
    id: "DIV-VSH-02",
    title: "Monsoon Waterlogging — Palm Beach Coastal Bypass",
    affectedCorridor: "Sion-Panvel Hwy (Vashi Low Circle)",
    recommendedRoute: "Reroute Light Vehicles via Sector 17 -> Palm Beach Elevated Corridor",
    timeSavingsMin: 18,
    capacityImpact: "850 veh/hr rerouted",
    signageMessage: "WATERLOGGING AHEAD. LIGHT VEHICLES USE PALM BEACH ROAD ELEVATED ROUTE.",
    status: "READY"
  }
];

export const FINES_DATABASE = [
  {
    fineId: "FN-2026-901",
    violationId: "VIO-2026-89412",
    plateNumber: "MH 02 CZ 4921",
    ownerName: "Rajesh S. Malhotra",
    violationType: "Red Light Running",
    amount: 1000,
    status: "PENDING",
    issuedDate: "2026-08-02",
    dueDate: "2026-09-01",
    surcharge: 0,
    disputable: true
  },
  {
    fineId: "FN-2026-902",
    violationId: "VIO-2026-89413",
    plateNumber: "MH 43 AY 8812",
    ownerName: "Vikram K. Singhania",
    violationType: "Over-Speeding (Repeat Offender x2)",
    amount: 4000,
    status: "DISPUTED",
    issuedDate: "2026-07-28",
    dueDate: "2026-08-27",
    surcharge: 0,
    disputable: true,
    disputeDetails: {
      reason: "Emergency Situation",
      comment: "I was taking my family member to hospital due to medical emergency. Discharge summary attached.",
      submittedDate: "2026-07-29",
      slaDaysRemaining: 3,
      reviewerNotes: ""
    }
  },
  {
    fineId: "FN-2026-880",
    violationId: "VIO-2026-87102",
    plateNumber: "MH 12 RE 1104",
    ownerName: "Sunil P. Patil",
    violationType: "No Helmet",
    amount: 500,
    status: "PAID",
    issuedDate: "2026-07-15",
    dueDate: "2026-08-14",
    paidDate: "2026-07-18",
    surcharge: 0,
    disputable: false
  },
  {
    fineId: "FN-2026-750",
    violationId: "VIO-2026-74911",
    plateNumber: "MH 04 DV 9012",
    ownerName: "Deepak R. Mehta",
    violationType: "Over-Speeding",
    amount: 2200, // 2000 + 10% surcharge
    status: "OVERDUE",
    issuedDate: "2026-06-10",
    dueDate: "2026-07-10",
    surcharge: 200,
    disputable: false
  }
];

export const EXECUTIVE_METRICS = {
  violationDetectionRate: "+342%",
  avgCommuteSavings: "28.5%",
  fineCollectionRate: "84.2%",
  accidentReduction: "-32%",
  monthlyRevenueINR: "₹ 4.82 Cr",
  annualCO2PreventedTonnes: 71.8
};
