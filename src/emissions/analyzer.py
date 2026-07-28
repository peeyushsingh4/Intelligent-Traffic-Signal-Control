import pandas as pd
from typing import Dict, Any, Optional

class EmissionAnalyzer:
    """Analyzes and compares emission data between different runs."""
    
    def __init__(self, summaries_or_config: Optional[Any] = None, baseline_method: str = "fixed"):
        """Initialize the analyzer."""
        if isinstance(summaries_or_config, dict):
            self.summaries = summaries_or_config
        else:
            self.summaries = {}
        self.baseline_method = baseline_method
        
    def _get_baseline_co2(self) -> float:
        if self.baseline_method in self.summaries:
            return self.summaries[self.baseline_method].get("total_co2_kg", 0.0)
        return 0.0

    def generate_comparison_table(self) -> pd.DataFrame:
        """Generate a comparison table of emissions."""
        baseline_co2 = self._get_baseline_co2()
        
        data = []
        for method, summary in self.summaries.items():
            co2 = summary.get("total_co2_kg", 0.0)
            fuel = summary.get("total_fuel_liters", 0.0)
            
            prevented = baseline_co2 - co2 if self.baseline_method in self.summaries else 0.0
            reduction = (prevented / baseline_co2 * 100.0) if baseline_co2 > 0 else 0.0
            
            data.append({
                "Method": method,
                "CO2 (kg)": round(co2, 2),
                "Fuel (L)": round(fuel, 2),
                "CO2 Prevented (kg)": round(prevented, 2),
                "Reduction (%)": round(reduction, 2)
            })
            
        return pd.DataFrame(data)
        
    def get_environmental_impact(self, co2_prevented_kg: float, simulation_hours: float = 1.0) -> Dict[str, float]:
        """Project environmental impact for a full year."""
        if simulation_hours <= 0:
            simulation_hours = 1.0
            
        hours_in_year = 8760
        annual_co2_prevented = co2_prevented_kg * (hours_in_year / simulation_hours)
        
        trees = annual_co2_prevented / 22.0
        gallons_saved = annual_co2_prevented / 8.887
        liters_saved = gallons_saved * 3.78541
        cars_off_road = (annual_co2_prevented / 1000.0) / 4.6
        
        return {
            "annual_co2_prevented_kg": round(annual_co2_prevented, 2),
            "annual_projection_tonnes": round(annual_co2_prevented / 1000.0, 3),
            "trees_equivalent": round(trees, 2),
            "trees_equivalent_yearly": round(trees, 2),
            "fuel_gallons_saved": round(gallons_saved, 2),
            "liters_gasoline_saved": round(liters_saved, 2),
            "cars_off_road_equivalent": round(cars_off_road, 2)
        }
