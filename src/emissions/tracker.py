import traci
from typing import Dict, Any

class EmissionTracker:
    """Tracks vehicle emissions during simulation."""
    
    def __init__(self, step_length: float = 1.0):
        self.step_length = step_length
        self.totals = {
            "CO2": 0.0,
            "CO": 0.0,
            "HC": 0.0,
            "NOx": 0.0,
            "PMx": 0.0,
            "fuel": 0.0
        }
        
    def reset(self):
        """Clear accumulated emission data."""
        for key in self.totals:
            self.totals[key] = 0.0
            
    def collect(self):
        """Collect emissions for all vehicles at the current step."""
        for veh_id in traci.vehicle.getIDList():
            # TraCI returns emissions in mg/s. Multiply by step length to get mg.
            self.totals["CO2"] += traci.vehicle.getCO2Emission(veh_id) * self.step_length
            self.totals["CO"] += traci.vehicle.getCOEmission(veh_id) * self.step_length
            self.totals["HC"] += traci.vehicle.getHCEmission(veh_id) * self.step_length
            self.totals["NOx"] += traci.vehicle.getNOxEmission(veh_id) * self.step_length
            self.totals["PMx"] += traci.vehicle.getPMxEmission(veh_id) * self.step_length
            self.totals["fuel"] += traci.vehicle.getFuelConsumption(veh_id) * self.step_length
            
    @property
    def total_co2_kg(self) -> float:
        """Get total CO2 in kilograms."""
        return self.totals["CO2"] / 1e6
        
    @property
    def total_co2_grams(self) -> float:
        """Get total CO2 in grams."""
        return self.totals["CO2"] / 1000.0
        
    @property
    def total_fuel_liters(self) -> float:
        """Get total fuel consumption in liters. 
        Note: Assuming traci returns fuel in ml/s for this simple conversion, 
        often it's mg/s in SUMO default models, but we'll adapt depending on the model.
        For now, treating it as mg -> liters roughly or standard ml."""
        return self.totals["fuel"] / 1000.0
        
    def get_summary(self) -> Dict[str, float]:
        """Return a summary of all collected emissions."""
        return {
            "total_co2_kg": self.total_co2_kg,
            "total_co2_grams": self.total_co2_grams,
            "total_fuel_liters": self.total_fuel_liters,
            "total_co_mg": self.totals["CO"],
            "total_hc_mg": self.totals["HC"],
            "total_nox_mg": self.totals["NOx"],
            "total_pmx_mg": self.totals["PMx"]
        }
