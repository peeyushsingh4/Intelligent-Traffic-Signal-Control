from typing import Dict, Any, Optional

class FixedTimeController:
    """Implements traditional fixed-time signal control."""
    
    def __init__(self, ns_green: int = 30, ew_green: int = 30, yellow: int = 5):
        self.ns_green = ns_green
        self.ew_green = ew_green
        self.yellow = yellow
        
        self.cycle_length = self.ns_green + self.yellow + self.ew_green + self.yellow
        self.current_step = 0
        
    def get_action(self, current_time: int) -> int:
        """
        Returns phase based on time.
        0: NS Green
        1: NS Yellow
        2: EW Green
        3: EW Yellow
        """
        t_in_cycle = current_time % self.cycle_length
        
        if t_in_cycle < self.ns_green:
            return 0  # NS Green
        elif t_in_cycle < self.ns_green + self.yellow:
            return 1  # NS Yellow
        elif t_in_cycle < self.ns_green + self.yellow + self.ew_green:
            return 2  # EW Green
        else:
            return 3  # EW Yellow

    def choose_action(self, state: Optional[Any] = None) -> int:
        """Interface compatibility method for evaluation/training loops."""
        action = self.get_action(self.current_step)
        self.current_step += 1
        return action

    def get_phase_schedule(self) -> Dict[str, int]:
        """Returns full schedule dict."""
        return {
            "ns_green": self.ns_green,
            "ns_yellow": self.yellow,
            "ew_green": self.ew_green,
            "ew_yellow": self.yellow,
            "cycle_length": self.cycle_length
        }
