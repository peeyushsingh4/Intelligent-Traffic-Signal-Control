import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Brain, Zap, ShieldAlert, Navigation, Leaf, Activity, Clock, ArrowRight,
  Play, Pause, RotateCcw, ChevronRight, Gauge, Car, Truck, AlertTriangle,
  TrendingDown, CheckCircle2, Radio, Sliders, Eye, MapPin, FastForward
} from 'lucide-react';

/* ============================================================
   STANDALONE MATSim SIMULATION DISPLAY
   ============================================================
   Interactive Multi-Agent Transport Simulation with dynamic vehicle
   kinematics, within-day route diversion, signal reallocation,
   and Emergency Vehicle Priority (EVP) preemption.
   ============================================================ */

const VEHICLE_COLORS = {
  car: '#06b6d4',       // cyan-500
  truck: '#f59e0b',     // amber-500
  bus: '#8b5cf6',       // violet-500
  auto: '#10b981',      // emerald-500
  ambulance: '#ef4444', // red-500
};

// Helper to generate fresh vehicle fleet
const createFreshFleet = (scenario) => {
  const fleet = [
    { id: 'v1', type: 'car', lane: 'north', x: 360, y: 40, speed: 2.2, plate: 'MH 02 CZ 4921', diverted: scenario === 'diversion' },
    { id: 'v2', type: 'truck', lane: 'north', x: 360, y: -40, speed: 1.8, plate: 'MH 46 BB 3321', diverted: scenario === 'diversion' },
    { id: 'v3', type: 'car', lane: 'north', x: 360, y: -120, speed: 2.4, plate: 'MH 01 BT 3842', diverted: scenario === 'diversion' },
    { id: 'v4', type: 'auto', lane: 'north', x: 360, y: -200, speed: 2.0, plate: 'MH 43 AZ 1205', diverted: false },
    { id: 'v5', type: 'car', lane: 'north', x: 360, y: -280, speed: 2.3, plate: 'MH 04 ER 5510', diverted: scenario === 'diversion' },
    { id: 'v6', type: 'bus', lane: 'north', x: 360, y: -360, speed: 1.6, plate: 'MH 01 CV 2841', diverted: scenario === 'diversion' },

    // Southbound (moving up from south)
    { id: 's1', type: 'car', lane: 'south', x: 400, y: 560, speed: 2.1, plate: 'MH 43 BE 8812' },
    { id: 's2', type: 'auto', lane: 'south', x: 400, y: 640, speed: 1.8, plate: 'MH 12 QX 1144' },
    { id: 's3', type: 'car', lane: 'south', x: 400, y: 720, speed: 2.3, plate: 'MH 03 BT 9012' },

    // Eastbound (moving west from east)
    { id: 'e1', type: 'car', lane: 'east', x: 680, y: 280, speed: 2.0, plate: 'MH 05 TT 7744' },
    { id: 'e2', type: 'auto', lane: 'east', x: 760, y: 280, speed: 1.7, plate: 'MH 43 AZ 9901' },

    // Westbound (moving east from west)
    { id: 'w1', type: 'car', lane: 'west', x: 40, y: 320, speed: 2.2, plate: 'MH 03 CC 9090' },
    { id: 'w2', type: 'truck', lane: 'west', x: -60, y: 320, speed: 1.7, plate: 'MH 22 AB 1100' },
  ];

  if (scenario === 'congestion') {
    fleet.push(
      { id: 'c1', type: 'car', lane: 'north', x: 360, y: 120, speed: 0.8, plate: 'MH 01 XX 1010' },
      { id: 'c2', type: 'car', lane: 'north', x: 360, y: 160, speed: 0.6, plate: 'MH 02 YY 2020' },
      { id: 'c3', type: 'truck', lane: 'north', x: 360, y: 200, speed: 0.5, plate: 'MH 46 ZZ 3030' },
      { id: 'c4', type: 'car', lane: 'north', x: 360, y: -80, speed: 0.7, plate: 'MH 03 WW 4040' },
      { id: 'c5', type: 'bus', lane: 'north', x: 360, y: -160, speed: 0.5, plate: 'MH 43 AA 5050' }
    );
  }

  if (scenario === 'emergency') {
    fleet.push({
      id: 'amb-108',
      type: 'ambulance',
      lane: 'north',
      x: 360,
      y: -50,
      speed: 4.2,
      plate: 'AMB-108 (ICU)',
      isEmergency: true
    });
  }

  return fleet;
};

const SCENARIOS = {
  normal: {
    label: 'Normal Traffic Flow',
    description: 'Standard adaptive signal timing across all approaches (90s cycle)',
    signalState: { north: 'green', south: 'green', east: 'red', west: 'red' },
  },
  congestion: {
    label: 'Congestion → Signal Reallocation',
    description: 'High WEH queue (84%) → Free lane time reduced (30s→16s) & transferred to bottleneck (30s→44s)',
    signalState: { north: 'green', south: 'green', east: 'red', west: 'red' },
  },
  emergency: {
    label: 'Emergency Vehicle Priority',
    description: 'Ambulance AMB-108 detected → Green Wave preemption locks solid RED for cross traffic',
    signalState: { north: 'green', south: 'red', east: 'red', west: 'red' },
  },
  diversion: {
    label: 'Dynamic Traffic Diversion',
    description: 'Corridor saturated → Overhead VMS diverts 65% of traffic onto LBS Marg Alternate Detour',
    signalState: { north: 'green', south: 'green', east: 'green', west: 'red' },
  },
};

export const SimulationDisplay = () => {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const vehiclesRef = useRef(createFreshFleet('normal'));
  
  const [activeScenario, setActiveScenario] = useState('normal');
  const [isPlaying, setIsPlaying] = useState(true);
  const [simTime, setSimTime] = useState(0);
  const [co2Saved, setCo2Saved] = useState(1.842);
  const [divertedCounter, setDivertedCounter] = useState(0);
  const [machineThoughts, setMachineThoughts] = useState([]);
  const [signalState, setSignalState] = useState(SCENARIOS.normal.signalState);
  const [congestionLevel, setCongestionLevel] = useState(42);
  const [queuedVehicles, setQueuedVehicles] = useState(6);
  const [greenTimings, setGreenTimings] = useState({ north: 30, south: 30, east: 30, west: 30 });

  // ─── Thought logger ───
  const addThought = useCallback((phase, title, reasoning, confidence, telemetry) => {
    setMachineThoughts(prev => [{
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString(),
      phase,
      title,
      reasoning,
      confidence,
      telemetry
    }, ...prev.slice(0, 9)]);
  }, []);

  // ─── Reset / Switch to Normal ───
  const handleNormal = useCallback(() => {
    setActiveScenario('normal');
    setSignalState(SCENARIOS.normal.signalState);
    setCongestionLevel(42);
    setQueuedVehicles(6);
    setDivertedCounter(0);
    setGreenTimings({ north: 30, south: 30, east: 30, west: 30 });
    vehiclesRef.current = createFreshFleet('normal');

    addThought(
      'TELEMETRY',
      '📊 Normal Traffic Flow: Adaptive Multi-Agent Cycle Active',
      'All four approaches operating below 45% saturation. Signal timing distributed evenly (30s green per phase, 90s total cycle). Agents proceeding on nominal shortest-path trajectories.',
      0.94,
      { mode: 'Adaptive Nominal', saturation: '42%', cycleLength: '90s', diversion: 'INACTIVE' }
    );
  }, [addThought]);

  // ─── Congestion Trigger ───
  const handleCongestion = useCallback(() => {
    setActiveScenario('congestion');
    setSignalState({ north: 'green', south: 'green', east: 'red', west: 'red' });
    setCongestionLevel(84);
    setQueuedVehicles(18);
    setDivertedCounter(0);
    setGreenTimings({ north: 44, south: 44, east: 16, west: 16 });
    vehiclesRef.current = createFreshFleet('congestion');

    addThought(
      'SIGNAL_REALLOCATION',
      '⏱️ Congestion Spike Detected: 14s Green Time Transferred from Free Lanes',
      'Western Express Hwy density crossed critical threshold (84% load, 18 queued vehicles). AI signal controller subtracted 14 seconds from low-load East/West free lanes (30s → 16s) and transferred directly to congested North approach (30s → 44s) to flush queue.',
      0.96,
      { bottleneckDensity: '84%', donorLane: 'East/West (Free)', donorGreen: '16s (-14s)', beneficiaryGreen: '44s (+14s)', queueReduction: '-38%' }
    );
  }, [addThought]);

  // ─── Emergency Vehicle Priority (EVP) ───
  const handleEmergency = useCallback(() => {
    setActiveScenario('emergency');
    setSignalState({ north: 'green', south: 'red', east: 'red', west: 'red' });
    setCongestionLevel(45);
    setQueuedVehicles(5);
    setDivertedCounter(0);
    setGreenTimings({ north: 90, south: 0, east: 0, west: 0 });
    vehiclesRef.current = createFreshFleet('emergency');

    addThought(
      'EMERGENCY_EVP',
      '🚨 Ambulance AMB-108 Approaching: Green Wave Corridor LOCKED',
      'Emergency ICU Ambulance detected approaching at 64 km/h (North corridor). AI controller triggered ISO-22951 preemption: locked opposing signals to solid RED, cleared intersection zone, and held solid GREEN for emergency path.',
      0.99,
      { vehicle: 'AMB-108 (ICU)', speed: '64 km/h', preemptionTime: '0.8s', clearanceSignal: 'ALL_RED_OPPOSING', protocol: 'ISO-22951' }
    );
  }, [addThought]);

  // ─── Dynamic Traffic Diversion ───
  const handleDiversion = useCallback(() => {
    setActiveScenario('diversion');
    setSignalState({ north: 'green', south: 'green', east: 'green', west: 'red' });
    setCongestionLevel(68);
    setQueuedVehicles(4);
    setDivertedCounter(prev => Math.max(prev, 8));
    setGreenTimings({ north: 35, south: 35, east: 35, west: 15 });
    vehiclesRef.current = createFreshFleet('diversion');

    addThought(
      'DIVERSION_EXEC',
      '🔀 Dynamic Diversion Activated: 65% Traffic Rerouted to LBS Marg Bypass',
      'Western Express Highway approach reached bottleneck capacity (72%). Variable Message Signs (VMS) updated in real-time. Within-day dynamic routing activated: 65% of Southbound vehicles physically diverted onto LBS Marg Alternate Corridor, avoiding 14.2 minutes of delay.',
      0.97,
      { saturation: '72%', divertedRatio: '65%', alternateRoute: 'LBS Marg Detour', queueCollapse: '18 → 4 vehicles', delayAvoided: '-14.2 min', co2Offset: '+0.62 kg' }
    );
  }, [addThought]);

  // ─── Spawn extra wave to see diversion in action ───
  const handleInjectDivertedWave = () => {
    const wave = [
      { id: `div-${Date.now()}-1`, type: 'car', lane: 'north', x: 360, y: -20, speed: 2.4, plate: 'MH 02 AB 1111', diverted: true },
      { id: `div-${Date.now()}-2`, type: 'car', lane: 'north', x: 360, y: -80, speed: 2.2, plate: 'MH 04 ER 2222', diverted: true },
      { id: `div-${Date.now()}-3`, type: 'auto', lane: 'north', x: 360, y: -140, speed: 2.0, plate: 'MH 43 CC 3333', diverted: true },
      { id: `div-${Date.now()}-4`, type: 'truck', lane: 'north', x: 360, y: -210, speed: 1.8, plate: 'MH 46 ZZ 4444', diverted: true },
      { id: `div-${Date.now()}-5`, type: 'car', lane: 'north', x: 360, y: -270, speed: 2.5, plate: 'MH 01 TT 5555', diverted: true },
    ];
    vehiclesRef.current.push(...wave);
    setDivertedCounter(c => c + 5);
    setCo2Saved(c => Math.round((c + 0.12) * 1000) / 1000);
  };

  // ─── Initialize on mount ───
  useEffect(() => {
    handleNormal();
  }, [handleNormal]);

  // ─── CO2 Ticker ───
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setSimTime(t => t + 1);
      setCo2Saved(c => Math.round((c + 0.003) * 1000) / 1000);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // ─── Canvas Render & Kinematics Engine ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const CX = W / 2;     // 380
    const CY = H / 2;     // 300
    const ROAD_WIDTH = 80;
    const HALF_ROAD = 40;

    let frameCount = 0;

    const drawFrame = () => {
      frameCount++;
      ctx.clearRect(0, 0, W, H);

      // Background asphalt
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, W, H);

      // Grid mesh
      ctx.strokeStyle = '#151d2f';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // ─── Road Infrastructure ───
      // North-South Corridor (Western Express Highway)
      ctx.fillStyle = '#172033';
      ctx.fillRect(CX - HALF_ROAD, 0, ROAD_WIDTH, H);

      // East-West Corridor (LBS Marg / BKC Connector)
      ctx.fillRect(0, CY - HALF_ROAD, W, ROAD_WIDTH);

      // Intersection Core
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(CX - HALF_ROAD, CY - HALF_ROAD, ROAD_WIDTH, ROAD_WIDTH);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(CX - HALF_ROAD, CY - HALF_ROAD, ROAD_WIDTH, ROAD_WIDTH);

      // ─── Dedicated Diversion Detour Ramp (Smooth curved asphalt curve) ───
      if (activeScenario === 'diversion') {
        ctx.fillStyle = '#10372d';
        ctx.beginPath();
        ctx.moveTo(CX - HALF_ROAD, CY - HALF_ROAD - 80);
        ctx.quadraticCurveTo(CX - HALF_ROAD, CY - HALF_ROAD, CX + HALF_ROAD + 80, CY - HALF_ROAD);
        ctx.lineTo(CX + HALF_ROAD + 80, CY + HALF_ROAD);
        ctx.quadraticCurveTo(CX + HALF_ROAD, CY + HALF_ROAD, CX + HALF_ROAD, CY - HALF_ROAD - 80);
        ctx.closePath();
        ctx.fill();

        // Glowing bypass lane border
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(CX - 15, CY - HALF_ROAD - 90);
        ctx.quadraticCurveTo(CX - 15, CY - 15, CX + HALF_ROAD + 180, CY - 15);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ─── Lane Markings ───
      ctx.setLineDash([12, 8]);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      // N-S Center divider
      ctx.beginPath(); ctx.moveTo(CX, 0); ctx.lineTo(CX, CY - HALF_ROAD); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(CX, CY + HALF_ROAD); ctx.lineTo(CX, H); ctx.stroke();
      // E-W Center divider
      ctx.beginPath(); ctx.moveTo(0, CY); ctx.lineTo(CX - HALF_ROAD, CY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(CX + HALF_ROAD, CY); ctx.lineTo(W, CY); ctx.stroke();
      ctx.setLineDash([]);

      // Crosswalks
      ctx.fillStyle = '#334155';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(CX - HALF_ROAD + 8 + i * 18, CY - HALF_ROAD - 8, 12, 6);
        ctx.fillRect(CX - HALF_ROAD + 8 + i * 18, CY + HALF_ROAD + 2, 12, 6);
        ctx.fillRect(CX + HALF_ROAD + 2, CY - HALF_ROAD + 8 + i * 18, 6, 12);
        ctx.fillRect(CX - HALF_ROAD - 8, CY - HALF_ROAD + 8 + i * 18, 6, 12);
      }

      // ─── Traffic Signals ───
      const drawSignalLight = (x, y, state) => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x - 7, y - 20, 14, 40);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 7, y - 20, 14, 40);

        // Red
        ctx.beginPath();
        ctx.arc(x, y - 11, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = state === 'red' ? '#ef4444' : '#261214';
        ctx.fill();
        if (state === 'red') {
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Green
        ctx.beginPath();
        ctx.arc(x, y + 11, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = state === 'green' ? '#10b981' : '#0a2218';
        ctx.fill();
        if (state === 'green') {
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      };

      drawSignalLight(CX - HALF_ROAD - 14, CY - HALF_ROAD - 8, signalState.north);
      drawSignalLight(CX + HALF_ROAD + 14, CY + HALF_ROAD + 8, signalState.south);
      drawSignalLight(CX + HALF_ROAD + 8, CY - HALF_ROAD - 14, signalState.east);
      drawSignalLight(CX - HALF_ROAD - 8, CY + HALF_ROAD + 14, signalState.west);

      // ─── OVERHEAD VMS GANTRY (Variable Message Sign) ───
      if (activeScenario === 'diversion') {
        // Gantry Truss Structure
        ctx.fillStyle = '#042f24';
        ctx.fillRect(CX - 150, 60, 300, 36);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.strokeRect(CX - 150, 60, 300, 36);

        // Amber/Green LED Matrix Text
        const flash = Math.sin(frameCount * 0.1) > 0;
        ctx.fillStyle = flash ? '#34d399' : '#10b981';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🔀 OVERHEAD VMS: 65% FLOW DIVERTED', CX, 76);
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('USE LBS MARG ALTERNATE • SAVINGS: 14 MIN', CX, 90);
        ctx.textAlign = 'left';

        // Animated Streaming Green Chevron Arrows along the detour route
        const arrowOffset = (frameCount * 2.5) % 40;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        for (let i = 0; i < 7; i++) {
          const arrowX = CX + HALF_ROAD + 30 + i * 36 + arrowOffset;
          const arrowY = CY - 15;
          if (arrowX < W - 20) {
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY - 8);
            ctx.lineTo(arrowX + 8, arrowY);
            ctx.lineTo(arrowX, arrowY + 8);
            ctx.stroke();
          }
        }
      }

      // ─── Emergency Siren Pulse Glow ───
      if (activeScenario === 'emergency') {
        const sirenPulse = Math.sin(frameCount * 0.2) > 0;
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = sirenPulse ? '#ef4444' : '#3b82f6';
        ctx.fillRect(CX - HALF_ROAD, 0, ROAD_WIDTH, CY - HALF_ROAD);
        ctx.globalAlpha = 1;

        // EVP Green corridor banner
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(CX - 120, 20, 240, 26);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🚨 EMERGENCY WAVE: AMB-108 PREEMPTION', CX, 36);
        ctx.textAlign = 'left';
      }

      // ─── Vehicle Kinematics Update ───
      if (isPlaying) {
        vehiclesRef.current.forEach(v => {
          // Diverted vehicles (taking the LBS Marg curve)
          if (v.diverted) {
            // Stage 1: Coming down North lane
            if (v.y < CY - 60) {
              v.y += v.speed * 1.2;
            } 
            // Stage 2: In the curve zone — smooth transition to East
            else if (v.y >= CY - 60 && v.x < CX + HALF_ROAD + 30) {
              v.x += v.speed * 1.5;
              v.y += v.speed * 0.5;
            } 
            // Stage 3: On the Eastbound bypass lane
            else {
              v.x += v.speed * 1.8;
              v.y = CY - 15; // Lock to Eastbound detour lane
            }

            // Wrap around once exited right
            if (v.x > W + 40) {
              v.x = 360;
              v.y = -40;
              setDivertedCounter(c => c + 1);
            }
          } 
          // Standard vehicles
          else {
            if (v.lane === 'north') {
              // Stop at red light
              const atSignal = signalState.north === 'red' && v.y > CY - HALF_ROAD - 45 && v.y < CY - HALF_ROAD;
              if (!atSignal || v.isEmergency) {
                v.y += v.speed;
              }
              if (v.y > H + 40) {
                v.y = -30;
                // Randomly assign diversion if scenario is active
                if (activeScenario === 'diversion' && Math.random() > 0.3) {
                  v.diverted = true;
                }
              }
            } else if (v.lane === 'south') {
              const atSignal = signalState.south === 'red' && v.y < CY + HALF_ROAD + 45 && v.y > CY + HALF_ROAD;
              if (!atSignal) v.y -= v.speed;
              if (v.y < -40) v.y = H + 30;
            } else if (v.lane === 'east') {
              const atSignal = signalState.east === 'red' && v.x < CX + HALF_ROAD + 45 && v.x > CX + HALF_ROAD;
              if (!atSignal) v.x -= v.speed;
              if (v.x < -40) v.x = W + 30;
            } else if (v.lane === 'west') {
              const atSignal = signalState.west === 'red' && v.x > CX - HALF_ROAD - 45 && v.x < CX - HALF_ROAD;
              if (!atSignal) v.x += v.speed;
              if (v.x > W + 40) v.x = -30;
            }
          }
        });
      }

      // ─── Render Vehicles ───
      vehiclesRef.current.forEach(v => {
        const isAmbulance = v.type === 'ambulance';
        const isDiverted = v.diverted;
        const color = isAmbulance ? '#ef4444' : isDiverted ? '#10b981' : (VEHICLE_COLORS[v.type] || '#06b6d4');
        const size = isAmbulance ? 14 : v.type === 'truck' ? 14 : v.type === 'bus' ? 16 : 10;

        ctx.save();
        ctx.translate(v.x, v.y);

        // Rotation angle based on direction
        let angle = 0;
        if (v.diverted) {
          if (v.x > CX + 10) angle = Math.PI / 2; // Eastbound
          else if (v.y >= CY - 60) angle = Math.PI / 4; // Turning 45 deg
          else angle = Math.PI; // Southbound
        } else if (v.lane === 'north') {
          angle = Math.PI;
        } else if (v.lane === 'south') {
          angle = 0;
        } else if (v.lane === 'east') {
          angle = -Math.PI / 2;
        } else if (v.lane === 'west') {
          angle = Math.PI / 2;
        }

        ctx.rotate(angle);

        // Vehicle Glow for Diverted or Emergency
        if (isAmbulance) {
          const flash = Math.sin(frameCount * 0.3) > 0;
          ctx.shadowColor = flash ? '#ef4444' : '#3b82f6';
          ctx.shadowBlur = 18;
        } else if (isDiverted) {
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 12;
        }

        // Vehicle Chassis
        ctx.fillStyle = color;
        ctx.fillRect(-size / 2, -size * 0.7, size, size * 1.4);

        // Windshield
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-size / 2 + 1.5, -size * 0.4, size - 3, size * 0.35);

        ctx.shadowBlur = 0;
        ctx.restore();

        // Overhead Badge for Diverted Vehicle
        if (isDiverted) {
          ctx.fillStyle = '#064e3b';
          ctx.fillRect(v.x - 28, v.y - 20, 56, 12);
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1;
          ctx.strokeRect(v.x - 28, v.y - 20, 56, 12);
          ctx.fillStyle = '#34d399';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('🔀 DIVERTED', v.x, v.y - 11);
          ctx.textAlign = 'left';
        }

        // Overhead Badge for Ambulance
        if (isAmbulance) {
          ctx.fillStyle = '#450a0a';
          ctx.fillRect(v.x - 30, v.y - 22, 60, 13);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1;
          ctx.strokeRect(v.x - 30, v.y - 22, 60, 13);
          ctx.fillStyle = '#fca5a5';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('🚨 AMB-108', v.x, v.y - 13);
          ctx.textAlign = 'left';
        }
      });

      // ─── Road Directional Labels ───
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('WESTERN EXPRESS HWY ↓ (SOUTHBOUND)', CX, 18);
      ctx.fillText('↑ TOWARDS GOREGAON / DAHISAR', CX, H - 10);
      ctx.textAlign = 'left';

      ctx.save();
      ctx.translate(14, CY);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText('← BKC FINANCIAL CENTER', 0, 0);
      ctx.restore();

      ctx.save();
      ctx.translate(W - 14, CY);
      ctx.rotate(Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText('LBS MARG / SCLR DETOUR →', 0, 0);
      ctx.restore();

      // Intersection Tag
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(CX - 50, CY - 9, 100, 18);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(CX - 50, CY - 9, 100, 18);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BKC JUNCTION', CX, CY + 4);
      ctx.textAlign = 'left';

      animFrameRef.current = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [signalState, isPlaying, activeScenario]);

  // Phase Badge Helper
  const getPhaseBadge = (phase) => {
    switch (phase) {
      case 'SIGNAL_REALLOCATION':
        return { icon: Sliders, label: 'SIGNAL REALLOCATION', color: 'text-amber-300', bg: 'bg-amber-500/20 border-amber-500/40' };
      case 'EMERGENCY_EVP':
        return { icon: ShieldAlert, label: 'EMERGENCY PREEMPTION', color: 'text-red-300', bg: 'bg-red-500/20 border-red-500/40' };
      case 'DIVERSION_EXEC':
        return { icon: Navigation, label: 'DYNAMIC DIVERSION', color: 'text-emerald-300', bg: 'bg-emerald-500/20 border-emerald-500/40' };
      default:
        return { icon: Eye, label: 'TELEMETRY', color: 'text-cyan-300', bg: 'bg-cyan-500/20 border-cyan-500/40' };
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-auto p-4 lg:p-6 space-y-4">

      {/* ─── Top Header Bar ─── */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 glow-emerald">
            <Brain size={22} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white font-display flex items-center gap-2">
              MATSim Multi-Agent Simulation Engine
              <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full font-bold">
                LIVE
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              BKC Junction (Western Express Hwy × LBS Marg Detour) · Multi-Agent Transport Simulation · matsim.org
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 font-mono text-xs font-bold">
            <Leaf size={14} className="animate-pulse" />
            <span>CO₂ Saved: +{co2Saved} kg</span>
          </div>

          {activeScenario === 'diversion' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 font-mono text-xs font-bold">
              <Navigation size={13} className="text-emerald-400" />
              <span>Diverted: {divertedCounter} Vehicles (65%)</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 font-mono text-xs">
            <Clock size={13} />
            <span>T+{simTime}s</span>
          </div>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={() => {
              setSimTime(0);
              setCo2Saved(1.842);
              setDivertedCounter(0);
              handleNormal();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
            title="Reset to Normal"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

        {/* ─── Left Column: Scenarios & Controls (3 cols) ─── */}
        <div className="xl:col-span-3 flex flex-col space-y-3">

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
              <Zap size={14} className="text-amber-400" />
              Interactive AI Scenarios
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Trigger scenarios to observe the autonomous machine decisions, signal reallocation, green wave preemption, and diversion.
            </p>

            <div className="space-y-2 font-mono">
              <button
                onClick={handleNormal}
                className={`w-full p-3 rounded-xl border text-left text-xs transition ${
                  activeScenario === 'normal'
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200 glow-cyan font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity size={14} />
                  <span>1. Normal Traffic Flow</span>
                </div>
                <div className="text-[10px] mt-1 text-slate-400 font-sans font-normal">Standard 90s balanced cycle</div>
              </button>

              <button
                onClick={handleCongestion}
                className={`w-full p-3 rounded-xl border text-left text-xs transition ${
                  activeScenario === 'congestion'
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 glow-amber font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap size={14} />
                  <span>2. Congestion → Reallocation</span>
                </div>
                <div className="text-[10px] mt-1 text-slate-400 font-sans font-normal">Free lane green reduced (-14s)</div>
              </button>

              <button
                onClick={handleEmergency}
                className={`w-full p-3 rounded-xl border text-left text-xs transition ${
                  activeScenario === 'emergency'
                    ? 'bg-red-500/20 border-red-500/50 text-red-200 glow-red font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert size={14} />
                  <span>3. Emergency Priority (EVP)</span>
                </div>
                <div className="text-[10px] mt-1 text-slate-400 font-sans font-normal">Ambulance AMB-108 Green Wave</div>
              </button>

              <button
                onClick={handleDiversion}
                className={`w-full p-3 rounded-xl border text-left text-xs transition ${
                  activeScenario === 'diversion'
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 glow-emerald font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Navigation size={14} />
                  <span>4. Dynamic Traffic Diversion</span>
                </div>
                <div className="text-[10px] mt-1 text-slate-400 font-sans font-normal">65% flow diverted onto LBS Marg</div>
              </button>
            </div>

            {/* Special Interactive Trigger for Diversion */}
            {activeScenario === 'diversion' && (
              <button
                onClick={handleInjectDivertedWave}
                className="w-full mt-2 p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <FastForward size={14} />
                <span>Inject Diverted Car Wave</span>
              </button>
            )}
          </div>

          {/* Dynamic Timing Indicators */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3 font-mono">
            <h3 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
              <Sliders size={14} className="text-amber-400" />
              Dynamic Signal Allocation
            </h3>
            {Object.entries(greenTimings).map(([dir, seconds]) => {
              const isMax = seconds >= 44;
              const isMin = seconds <= 16 && seconds > 0;
              return (
                <div key={dir} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300 capitalize">{dir} Approach</span>
                    <span className={`font-bold ${isMax ? 'text-emerald-400' : isMin ? 'text-red-400' : 'text-slate-300'}`}>
                      {seconds}s {isMax ? '▲ boosted' : isMin ? '▼ reduced' : ''}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isMax ? 'bg-emerald-500' : isMin ? 'bg-red-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${(seconds / 90) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Traffic Health Stats */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2 font-mono text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Congestion Index</span>
              <span className={`font-bold ${congestionLevel > 70 ? 'text-red-400' : congestionLevel > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {congestionLevel}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Bottleneck Queue</span>
              <span className="font-bold text-white">{queuedVehicles} vehicles</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Overhead VMS Gantry</span>
              <span className={`font-bold ${activeScenario === 'diversion' ? 'text-emerald-400' : 'text-slate-500'}`}>
                {activeScenario === 'diversion' ? 'NTCIP 1203 ACTIVE' : 'Standby'}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Center Column: High-Fidelity 2D Simulation Canvas (5 cols) ─── */}
        <div className="xl:col-span-5 flex flex-col space-y-3">
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 relative shadow-2xl">
            
            {/* Scenario Banner */}
            <div className={`px-4 py-2.5 text-xs font-mono font-bold flex items-center justify-between ${
              activeScenario === 'emergency' ? 'bg-red-950/90 text-red-200 border-b border-red-500/40' :
              activeScenario === 'congestion' ? 'bg-amber-950/90 text-amber-200 border-b border-amber-500/40' :
              activeScenario === 'diversion' ? 'bg-emerald-950/90 text-emerald-200 border-b border-emerald-500/40' :
              'bg-slate-900/90 text-cyan-200 border-b border-slate-800'
            }`}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                {SCENARIOS[activeScenario].label}
              </span>
              <span className="text-[10px] text-slate-300 font-sans font-normal truncate max-w-[280px]">
                {SCENARIOS[activeScenario].description}
              </span>
            </div>

            <canvas
              ref={canvasRef}
              width={760}
              height={600}
              className="w-full"
              style={{ background: '#0b0f19' }}
            />

            {/* Canvas Legend */}
            <div className="px-4 py-2.5 bg-slate-900/95 border-t border-slate-800 flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: VEHICLE_COLORS.car }} /> Car</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: VEHICLE_COLORS.truck }} /> Truck</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: VEHICLE_COLORS.bus }} /> Bus</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: VEHICLE_COLORS.auto }} /> Auto</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: VEHICLE_COLORS.ambulance }} /> Ambulance</span>
              <span className="flex items-center gap-1.5 ml-auto text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                MATSim 2026.0
              </span>
            </div>
          </div>
        </div>

        {/* ─── Right Column: Machine Thought & Decision Log (4 cols) ─── */}
        <div className="xl:col-span-4 flex flex-col space-y-3">
          
          <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Brain size={16} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-display">Machine Decision Trace</h3>
                <p className="text-[10px] text-slate-400 font-mono">Real-time explainable cognitive engine</p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 flex-1 flex flex-col min-h-[520px]">
            <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 font-mono uppercase flex items-center gap-1.5">
                <Activity size={13} className="text-cyan-400" />
                Cognitive Reasoning Trace
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{machineThoughts.length} decisions</span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[540px]">
              {machineThoughts.map((t) => {
                const badge = getPhaseBadge(t.phase);
                const BadgeIcon = badge.icon;
                return (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 space-y-2 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md border font-bold flex items-center gap-1 ${badge.bg} ${badge.color}`}>
                          <BadgeIcon size={10} />
                          <span>{badge.label}</span>
                        </span>
                        <span className="text-slate-400 font-mono">{t.timestamp}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Confidence: <strong className="text-emerald-400">{((t.confidence || 0.95) * 100).toFixed(0)}%</strong>
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-100 font-sans">{t.title}</div>

                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                      {t.reasoning}
                    </p>

                    {t.telemetry && Object.keys(t.telemetry).length > 0 && (
                      <div className="flex flex-wrap gap-1 text-[9px] font-mono text-slate-400 pt-0.5">
                        {Object.entries(t.telemetry).map(([key, val]) => (
                          <span key={key} className="px-1.5 py-0.5 bg-slate-950 rounded border border-slate-800">
                            {key}: <strong className="text-slate-200">{String(val)}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
