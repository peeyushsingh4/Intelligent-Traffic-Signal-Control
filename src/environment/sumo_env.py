import os
import sys
import shutil
import traci
import numpy as np
from typing import Optional, Dict, Any, List, Union

if 'SUMO_HOME' in os.environ:
    sys.path.append(os.path.join(os.environ['SUMO_HOME'], 'tools'))

class SumoEnvironment:
    """SUMO environment wrapper class for reinforcement learning and traffic control."""
    
    def __init__(self, 
                 config_or_path: Union[str, Any],
                 use_gui: bool = False,
                 step_length: float = 0.5,
                 junction_id: str = "B0",
                 tls_id: str = "B0",
                 emission_tracker = None,
                 ev_detector = None):
        if hasattr(config_or_path, 'config_file'):
            self.sumocfg_path = config_or_path.config_file
            self.use_gui = (config_or_path.sumo_binary == "sumo-gui") or use_gui
            self.step_length = config_or_path.step_length
            self.junction_id = config_or_path.junction_id
            self.tls_id = config_or_path.tls_id
            self.binary_name = config_or_path.sumo_binary
        else:
            self.sumocfg_path = str(config_or_path)
            self.use_gui = use_gui
            self.step_length = step_length
            self.junction_id = junction_id
            self.tls_id = tls_id
            self.binary_name = "sumo-gui" if use_gui else "sumo"

        self.emission_tracker = emission_tracker
        self.emergency_detector = ev_detector or None

        self.sim_time = 0.0
        self._running = False
        
    def _find_sumo_binary(self, force_headless: bool = False) -> str:
        """Find full path to sumo / sumo-gui executable."""
        binary_name = "sumo" if force_headless or not self.use_gui else "sumo-gui"
        
        venv_bin = os.path.join(sys.prefix, 'bin', binary_name)
        if os.path.exists(venv_bin):
            return venv_bin
            
        which_path = shutil.which(binary_name)
        if which_path:
            return which_path

        if 'SUMO_HOME' in os.environ:
            sh_bin = os.path.join(os.environ['SUMO_HOME'], 'bin', binary_name)
            if os.path.exists(sh_bin):
                return sh_bin
                
        return binary_name

    def reset(self) -> np.ndarray:
        """Reset the simulation environment and start TraCI."""
        # Always safely close any active TraCI connection to avoid 'Connection default is already active' error
        try:
            if traci.isLoaded():
                traci.close()
        except Exception:
            pass
            
        self._running = False
            
        binary = self._find_sumo_binary()
        sumo_cmd = [
            binary,
            "-c", self.sumocfg_path,
            "--step-length", str(self.step_length),
            "--no-step-log", "true",
            "--waiting-time-memory", "1000"
        ]
        
        try:
            traci.start(sumo_cmd)
        except Exception as e:
            if self.use_gui:
                print("\n  ⚠ GUI display error encountered (X11 display unavailable).")
                print("  🔄 Falling back to high-performance headless mode ('sumo')...")
                try:
                    traci.close()
                except Exception:
                    pass
                self.use_gui = False
                fallback_binary = self._find_sumo_binary(force_headless=True)
                sumo_cmd[0] = fallback_binary
                traci.start(sumo_cmd)
            else:
                # If already active, attempt close and retry once
                try:
                    traci.close()
                    traci.start(sumo_cmd)
                except Exception:
                    raise e

        self._running = True
        self.sim_time = 0.0
        
        if self.emission_tracker:
            self.emission_tracker.reset()
            
        return self._get_observation()
        
    def step(self) -> np.ndarray:
        """Advance the simulation by one step."""
        if not self._running:
            raise RuntimeError("Simulation is not running. Call reset() first.")
            
        traci.simulationStep()
        self.sim_time += self.step_length
        
        if self.emission_tracker:
            self.emission_tracker.collect()
            
        if self.emergency_detector:
            self.emergency_detector.detect()
            
        return self._get_observation()
        
    def is_running(self) -> bool:
        """Check if simulation is currently active and vehicles remain."""
        if not self._running:
            return False
        try:
            return traci.simulation.getMinExpectedNumber() > 0
        except traci.exceptions.TraCIException:
            self._running = False
            return False
            
    def get_queue_lengths(self) -> Dict[str, int]:
        """Get queue lengths for all incoming edges."""
        incoming_edges = ["B1B0", "B-1B0", "C0B0", "A0B0"]
        queues = {}
        for edge in incoming_edges:
            try:
                queues[edge] = traci.edge.getLastStepHaltingNumber(edge)
            except traci.exceptions.TraCIException:
                queues[edge] = 0
        return queues
        
    def get_waiting_times(self) -> Dict[str, float]:
        """Get total waiting time per incoming edge."""
        incoming_edges = ["B1B0", "B-1B0", "C0B0", "A0B0"]
        waits = {}
        for edge in incoming_edges:
            try:
                waits[edge] = traci.edge.getWaitingTime(edge)
            except traci.exceptions.TraCIException:
                waits[edge] = 0.0
        return waits
        
    def get_vehicle_count(self) -> int:
        """Get total number of active vehicles in simulation."""
        try:
            return traci.vehicle.getIDCount()
        except traci.exceptions.TraCIException:
            return 0

    def get_ev_waiting_time(self) -> float:
        """Get total waiting time of active emergency vehicles."""
        try:
            ev_waiting = 0.0
            for veh_id in traci.vehicle.getIDList():
                if traci.vehicle.getVehicleClass(veh_id) == "emergency":
                    ev_waiting += traci.vehicle.getAccumulatedWaitingTime(veh_id)
            return ev_waiting
        except traci.exceptions.TraCIException:
            return 0.0
        
    def _get_observation(self) -> np.ndarray:
        """Collect observations for the current state."""
        incoming_edges = ["B1B0", "B-1B0", "C0B0", "A0B0"]
        queue_lengths = []
        avg_speeds = []
        
        for edge in incoming_edges:
            try:
                queue = float(traci.edge.getLastStepHaltingNumber(edge))
                speed = float(traci.edge.getLastStepMeanSpeed(edge))
            except traci.exceptions.TraCIException:
                queue = 0.0
                speed = 0.0
            queue_lengths.append(queue)
            avg_speeds.append(speed)
            
        try:
            current_phase = float(traci.trafficlight.getPhase(self.tls_id))
        except traci.exceptions.TraCIException:
            current_phase = 0.0
            
        state = queue_lengths + avg_speeds + [current_phase]
        return np.array(state, dtype=np.float32)
        
    def close(self):
        """Close the simulation environment."""
        try:
            if traci.isLoaded():
                traci.close()
        except Exception:
            pass
        self._running = False
