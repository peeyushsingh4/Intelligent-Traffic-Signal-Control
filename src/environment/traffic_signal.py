import traci
from typing import Optional

class TrafficSignalController:
    """Wrapper class for TraCI traffic light control functions."""
    
    # Phase constants
    NS_GREEN = 0
    NS_YELLOW = 1
    EW_GREEN = 2
    EW_YELLOW = 3
    
    def __init__(self, tls_id: str = "B0"):
        """Initialize the controller for a specific traffic light."""
        self.tls_id = tls_id
        
    def get_current_phase(self) -> int:
        """Get the current phase index of the traffic light."""
        try:
            return traci.trafficlight.getPhase(self.tls_id)
        except Exception:
            return 0
        
    def set_phase(self, phase_id: int):
        """Set the phase index of the traffic light."""
        try:
            traci.trafficlight.setPhase(self.tls_id, phase_id)
        except Exception:
            pass

    def apply_action(self, action: int):
        """Applies action from RL agent (0..3)."""
        valid_phase = int(action) % 4
        self.set_phase(valid_phase)
        
    def set_phase_duration(self, duration: float):
        """Set the remaining duration of the current phase."""
        try:
            traci.trafficlight.setPhaseDuration(self.tls_id, duration)
        except Exception:
            pass
        
    def get_phase_duration(self) -> float:
        """Get the total duration of the current phase."""
        try:
            return traci.trafficlight.getPhaseDuration(self.tls_id)
        except Exception:
            return 30.0
        
    def reset_to_default_program(self):
        """Reset the traffic light to its default program."""
        try:
            traci.trafficlight.setProgram(self.tls_id, "0")
        except Exception:
            pass
        
    def get_next_switch_time(self) -> float:
        """Get the next switch time of the traffic light."""
        try:
            return traci.trafficlight.getNextSwitch(self.tls_id)
        except Exception:
            return 0.0
