import traci

class TrafficSignalController:
    """Wrapper class for TraCI traffic light control functions."""
    
    # Phase constants
    NS_GREEN = 0
    NS_YELLOW = 1
    EW_GREEN = 2
    EW_YELLOW = 3
    
    def __init__(self, tls_id: str):
        """Initialize the controller for a specific traffic light.
        
        Args:
            tls_id: ID of the traffic light to control.
        """
        self.tls_id = tls_id
        
    def get_current_phase(self) -> int:
        """Get the current phase index of the traffic light."""
        return traci.trafficlight.getPhase(self.tls_id)
        
    def set_phase(self, phase_id: int):
        """Set the phase index of the traffic light."""
        traci.trafficlight.setPhase(self.tls_id, phase_id)
        
    def set_phase_duration(self, duration: float):
        """Set the remaining duration of the current phase."""
        traci.trafficlight.setPhaseDuration(self.tls_id, duration)
        
    def get_phase_duration(self) -> float:
        """Get the total duration of the current phase."""
        return traci.trafficlight.getPhaseDuration(self.tls_id)
        
    def reset_to_default_program(self):
        """Reset the traffic light to its default program."""
        # Typically the default program is "0"
        traci.trafficlight.setProgram(self.tls_id, "0")
        
    def get_next_switch_time(self) -> float:
        """Get the next switch time of the traffic light."""
        return traci.trafficlight.getNextSwitch(self.tls_id)
