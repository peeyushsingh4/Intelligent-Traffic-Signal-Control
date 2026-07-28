import traci
import math
from typing import List, Dict, Any, Optional, Tuple

class EmergencyVehicleDetector:
    """Detects emergency vehicles approaching a specific junction."""
    
    def __init__(self, 
                 junction_id: str = "B0", 
                 junction_position: Optional[Tuple[float, float]] = (500.0, 500.0),
                 approach_edges: Optional[Dict[str, str]] = None,
                 detection_radius: float = 200.0):
        """Initialize the detector."""
        self.junction_id = junction_id
        self.junction_position = junction_position or (500.0, 500.0)
        self.detection_radius = detection_radius
        
        if approach_edges:
            self.road_to_direction = {v: k for k, v in approach_edges.items()}
        else:
            self.road_to_direction = {
                f"B1{self.junction_id}": "NORTH",
                f"B-1{self.junction_id}": "SOUTH",
                f"C0{self.junction_id}": "EAST",
                f"A0{self.junction_id}": "WEST"
            }
        
    def _get_junction_position(self) -> Tuple[float, float]:
        """Get the (x,y) position of the junction."""
        try:
            return traci.junction.getPosition(self.junction_id)
        except Exception:
            return self.junction_position or (500.0, 500.0)

    def scan(self) -> List[Dict[str, Any]]:
        """Scan for emergency vehicles within the detection radius."""
        detected_evs = []
        try:
            junction_pos = self._get_junction_position()
            
            for veh_id in traci.vehicle.getIDList():
                try:
                    v_class = traci.vehicle.getVehicleClass(veh_id)
                    if v_class == "emergency":
                        pos = traci.vehicle.getPosition(veh_id)
                        distance = math.hypot(pos[0] - junction_pos[0], pos[1] - junction_pos[1])
                        
                        if distance <= self.detection_radius:
                            speed = traci.vehicle.getSpeed(veh_id)
                            road_id = traci.vehicle.getRoadID(veh_id)
                            direction = self.road_to_direction.get(road_id, "UNKNOWN")
                            
                            detected_evs.append({
                                "id": veh_id,
                                "position": pos,
                                "distance": distance,
                                "speed": speed,
                                "road_id": road_id,
                                "direction": direction,
                                "approach_direction": direction
                            })
                except Exception:
                    continue
        except Exception:
            pass
            
        return detected_evs
        
    def get_closest_ev(self) -> Optional[Dict[str, Any]]:
        """Get the nearest emergency vehicle."""
        evs = self.scan()
        if not evs:
            return None
        return min(evs, key=lambda ev: ev["distance"])
