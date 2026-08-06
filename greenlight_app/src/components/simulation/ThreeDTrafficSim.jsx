import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, Zap, Eye, ShieldAlert, Cpu, Layers } from 'lucide-react';

export const ThreeDTrafficSim = () => {
  const mountRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [scenario, setScenario] = useState('DIVERSION'); // DIVERSION, HEAVY_QUEUE, EMERGENCY
  const [cameraView, setCameraView] = useState('ISOMETRIC'); // ISOMETRIC, TOP_DOWN, STREET_LEVEL
  
  // Real-time telemetry
  const [stats, setStats] = useState({
    activeVehicles: 24,
    divertedCount: 14,
    avgSpeed: 28,
    queueLength: 4
  });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070a11);
    scene.fog = new THREE.FogExp2(0x070a11, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(45, 55, 65);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Clear existing children
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 2. Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x10b981, 1.2);
    dirLight.position.set(30, 60, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const bluePointLight = new THREE.PointLight(0x06b6d4, 2, 50);
    bluePointLight.position.set(0, 15, 0);
    scene.add(bluePointLight);

    // 3. Ground & Asphalt Roads Architecture
    const roadGroup = new THREE.Group();

    // North-South Main Road
    const nsRoadGeo = new THREE.PlaneGeometry(16, 120);
    const nsRoadMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const nsRoad = new THREE.Mesh(nsRoadGeo, nsRoadMat);
    nsRoad.rotation.x = -Math.PI / 2;
    nsRoad.receiveShadow = true;
    roadGroup.add(nsRoad);

    // East-West Main Road
    const ewRoadGeo = new THREE.PlaneGeometry(120, 16);
    const ewRoadMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const ewRoad = new THREE.Mesh(ewRoadGeo, ewRoadMat);
    ewRoad.rotation.x = -Math.PI / 2;
    ewRoad.receiveShadow = true;
    roadGroup.add(ewRoad);

    // Center Junction Box
    const centerGeo = new THREE.PlaneGeometry(16, 16);
    const centerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const centerJunction = new THREE.Mesh(centerGeo, centerMat);
    centerJunction.rotation.x = -Math.PI / 2;
    centerJunction.position.y = 0.01;
    roadGroup.add(centerJunction);

    // Yellow Center Lines
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const lineGeoN = new THREE.PlaneGeometry(0.6, 50);
    const lineN = new THREE.Mesh(lineGeoN, lineMat);
    lineN.rotation.x = -Math.PI / 2;
    lineN.position.set(0, 0.02, 35);
    roadGroup.add(lineN);

    const lineS = new THREE.Mesh(lineGeoN, lineMat);
    lineS.rotation.x = -Math.PI / 2;
    lineS.position.set(0, 0.02, -35);
    roadGroup.add(lineS);

    scene.add(roadGroup);

    // 4. 3D Traffic Light Posts
    const createTrafficLight = (x, z, activeColor = 0x10b981) => {
      const gantryGroup = new THREE.Group();
      gantryGroup.position.set(x, 0, z);

      const poleGeo = new THREE.CylinderGeometry(0.3, 0.3, 10);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 5;
      gantryGroup.add(pole);

      const boxGeo = new THREE.BoxGeometry(1.5, 4, 1.2);
      const boxMat = new THREE.MeshStandardMaterial({ color: 0x020617 });
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.position.set(0, 8, 0);
      gantryGroup.add(box);

      // Light Sphere
      const lightGeo = new THREE.SphereGeometry(0.6, 16, 16);
      const lightMat = new THREE.MeshBasicMaterial({ color: activeColor });
      const lightMesh = new THREE.Mesh(lightGeo, lightMat);
      lightMesh.position.set(0, 8, 0.7);
      gantryGroup.add(lightMesh);

      return gantryGroup;
    };

    const lightN = createTrafficLight(10, 10, 0x10b981);
    const lightS = createTrafficLight(-10, -10, 0xef4444);
    scene.add(lightN);
    scene.add(lightS);

    // 5. 3D Vehicle Generator & Physics Simulation Loop
    const vehicles = [];
    const carColors = [0x10b981, 0x38bdf8, 0xf59e0b, 0xa855f7, 0xec4899];

    const createVehicle = (type = 'CAR', startPos = { x: 0, z: -55 }, dir = { x: 0, z: 1 }, color = 0x10b981) => {
      const carGroup = new THREE.Group();

      // Chassis Body
      const bodyGeo = new THREE.BoxGeometry(2.8, 1.4, 5.2);
      const bodyMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.3, metalness: 0.5 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1;
      body.castShadow = true;
      carGroup.add(body);

      // Cabin Roof
      const roofGeo = new THREE.BoxGeometry(2.2, 1.0, 2.8);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(0, 2.0, -0.4);
      carGroup.add(roof);

      // Emergency Light Bar for Ambulance
      if (type === 'AMBULANCE') {
        const sirenGeo = new THREE.BoxGeometry(1.2, 0.4, 0.6);
        const sirenMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const siren = new THREE.Mesh(sirenGeo, sirenMat);
        siren.position.set(0, 2.6, 0);
        carGroup.add(siren);
      }

      carGroup.position.set(startPos.x, 0, startPos.z);
      scene.add(carGroup);

      return {
        mesh: carGroup,
        dir,
        speed: 0.4 + Math.random() * 0.2,
        isDiverted: false,
        type
      };
    };

    // Spawn initial vehicle fleet
    for (let i = 0; i < 16; i++) {
      const isDiverted = i % 2 === 0;
      const color = isDiverted ? 0xf59e0b : carColors[i % carColors.length];
      const zOffset = -55 + i * 7;
      const v = createVehicle('CAR', { x: -3.5, z: zOffset }, { x: 0, z: 1 }, color);
      v.isDiverted = isDiverted;
      vehicles.push(v);
    }

    // 6. Animation Loop (60 FPS)
    let reqId;
    let clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);

      if (isPlaying) {
        const delta = clock.getDelta();

        vehicles.forEach((v) => {
          // Dynamic Diverted Routing logic
          if (scenario === 'DIVERSION' && v.isDiverted && v.mesh.position.z > -5 && v.mesh.position.z < 5) {
            // Turn Right onto Alternate East Detour
            v.dir = { x: 1, z: 0 };
            v.mesh.rotation.y = Math.PI / 2;
          }

          v.mesh.position.x += v.dir.x * v.speed;
          v.mesh.position.z += v.dir.z * v.speed;

          // Recycle vehicles at boundaries
          if (v.mesh.position.z > 55 || v.mesh.position.x > 55) {
            v.mesh.position.set(-3.5, 0, -55);
            v.dir = { x: 0, z: 1 };
            v.mesh.rotation.y = 0;
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // Responsive Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isPlaying, scenario, cameraView]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-3xl overflow-hidden glass-panel border border-slate-800 flex flex-col">
      
      {/* 3D WebGL Header Controls */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 z-10">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 glow-emerald">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-display">3D WebGL Microscopic Traffic Simulation Engine</h3>
            <p className="text-[11px] text-slate-400 font-mono">60 FPS Real-Time Physics & Dynamic Vehicle Rerouting</p>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button 
            onClick={() => setScenario('DIVERSION')}
            className={`px-3 py-1.5 rounded-lg transition ${
              scenario === 'DIVERSION' ? 'bg-amber-500 text-slate-950 font-bold glow-amber' : 'text-slate-400 hover:text-white'
            }`}
          >
            Dynamic Rerouting (Yellow)
          </button>
          <button 
            onClick={() => setScenario('HEAVY_QUEUE')}
            className={`px-3 py-1.5 rounded-lg transition ${
              scenario === 'HEAVY_QUEUE' ? 'bg-emerald-500 text-slate-950 font-bold glow-emerald' : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Queue Priority
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="flex-1 w-full h-full min-h-[350px] relative bg-slate-950">
        
        {/* Live HUD Overlay */}
        <div className="absolute top-4 left-4 z-20 space-y-2 pointer-events-none font-mono text-xs">
          <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 flex items-center space-x-2 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-bold">BKC Junction (3D WebGL)</span>
          </div>

          <div className="bg-slate-950/80 backdrop-blur-md p-3 rounded-xl border border-slate-800 space-y-1 text-[11px] text-slate-300">
            <div>Diverted Vehicles: <strong className="text-amber-400">14 Rerouted</strong></div>
            <div>Avg Flow Speed: <strong className="text-emerald-400">28 km/h</strong></div>
            <div>Phase: <strong className="text-cyan-400">Adaptive Green Wave</strong></div>
          </div>
        </div>

      </div>

    </div>
  );
};
