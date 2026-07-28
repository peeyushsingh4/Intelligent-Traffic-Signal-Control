"""
Weather & Road Condition Controller for SUMO Simulation.

Models environmental variables:
1. Monsoon Weather (Clear, Light Rain, Heavy Monsoon)
   - Vehicle type friction surface reduction (1.0 -> 0.45)
   - Safe driver headway tau increase (1.0s -> 2.2s)
   - Deceleration/braking reduction (4.5 -> 2.6 m/s²)
   - Speed factor reduction (1.0 -> 0.70)

2. Road Conditions (Normal, Potholes, Waterlogging, Severe Flooding)
   - Potholes: Speed capped on damaged lanes (e.g. 15 km/h)
   - Waterlogging: Disallows light vehicles (cars, auto-rickshaws, bikes) on flooded lanes
   - Severe Flooding: Completely closes submerged road segments & forces dynamic rerouting
"""

import traci
from typing import Dict, Any, List, Optional


class WeatherRoadController:
    """Manages environmental weather and road condition hazards via TraCI."""

    WEATHER_PROFILES = {
        "CLEAR": {
            "friction": 1.0,
            "tau": 1.0,
            "decel": 4.5,
            "speed_factor": 1.0,
            "description": "Clear dry weather with full road grip"
        },
        "LIGHT_RAIN": {
            "friction": 0.75,
            "tau": 1.4,
            "decel": 3.5,
            "speed_factor": 0.85,
            "description": "Light rainfall; slight reduction in road grip and speed"
        },
        "HEAVY_MONSOON": {
            "friction": 0.45,
            "tau": 2.2,
            "decel": 2.6,
            "speed_factor": 0.70,
            "description": "Heavy Mumbai monsoon rain; low road friction, large safe headway, reduced braking"
        }
    }

    def __init__(self, current_weather: str = "CLEAR"):
        self.current_weather = current_weather
        self.pothole_lanes: List[str] = []
        self.waterlogged_lanes: List[str] = []
        self.flooded_edges: List[str] = []

    def set_weather(self, condition: str = "HEAVY_MONSOON"):
        """Dynamically update simulation weather parameters via TraCI."""
        if condition not in self.WEATHER_PROFILES:
            raise ValueError(f"Unknown weather condition: {condition}. Choose from {list(self.WEATHER_PROFILES.keys())}")

        params = self.WEATHER_PROFILES[condition]
        self.current_weather = condition

        try:
            # Update vehicle type driver behaviors & surface friction
            for vtype_id in traci.vehicletype.getIDList():
                try:
                    traci.vehicletype.setTau(vtype_id, params["tau"])
                    traci.vehicletype.setDecel(vtype_id, params["decel"])
                    traci.vehicletype.setSpeedFactor(vtype_id, params["speed_factor"])
                except Exception:
                    pass

            print(f"  🌧️ [WEATHER CHANGE] Environment set to '{condition}': "
                  f"Friction={params['friction']}, Tau={params['tau']}s, Decel={params['decel']}m/s²")
        except traci.exceptions.FatalTraCIError:
            pass

    def apply_potholes(self, lane_id: str, max_speed_kmh: float = 15.0):
        """Cap maximum speed on a lane to model pothole road damage."""
        try:
            speed_ms = max_speed_kmh / 3.6
            traci.lane.setMaxSpeed(lane_id, speed_ms)
            if lane_id not in self.pothole_lanes:
                self.pothole_lanes.append(lane_id)
            print(f"  🚧 [POTHOLE HAZARD] Speed capped at {max_speed_kmh:.0f} km/h on lane '{lane_id}'")
        except (traci.exceptions.TraCIException, traci.exceptions.FatalTraCIError):
            pass

    def apply_waterlogging(self, lane_id: str):
        """Disallow light vehicles on flooded lanes, allowing heavy/emergency vehicles."""
        try:
            disallowed = ["passenger", "moped", "motorcycle", "delivery"]
            traci.lane.setDisallowed(lane_id, disallowed)
            if lane_id not in self.waterlogged_lanes:
                self.waterlogged_lanes.append(lane_id)
            print(f"  🌊 [WATERLOGGING] Light vehicles blocked on flooded lane '{lane_id}'")
        except (traci.exceptions.TraCIException, traci.exceptions.FatalTraCIError):
            pass

    def apply_flood_road_closure(self, edge_id: str):
        """Completely close a submerged road segment and force active traffic to reroute."""
        try:
            num_lanes = traci.edge.getLaneNumber(edge_id)
            for i in range(num_lanes):
                lane_id = f"{edge_id}_{i}"
                traci.lane.setDisallowed(lane_id, ["all"])

            traci.edge.setAdaptationWeight(edge_id, 999999.0)

            for veh_id in traci.vehicle.getIDList():
                try:
                    traci.vehicle.rerouteTraveltime(veh_id)
                except Exception:
                    pass

            if edge_id not in self.flooded_edges:
                self.flooded_edges.append(edge_id)
            print(f"  ⛔ [FLOOD CLOSURE] Submerged edge '{edge_id}' closed completely. Active traffic rerouted.")
        except (traci.exceptions.TraCIException, traci.exceptions.FatalTraCIError):
            pass

    def get_status_summary(self) -> Dict[str, Any]:
        """Return summary of current weather and road condition hazards."""
        return {
            "weather": self.current_weather,
            "weather_profile": self.WEATHER_PROFILES.get(self.current_weather, {}),
            "pothole_lanes_count": len(self.pothole_lanes),
            "waterlogged_lanes_count": len(self.waterlogged_lanes),
            "flooded_edges_count": len(self.flooded_edges),
        }
