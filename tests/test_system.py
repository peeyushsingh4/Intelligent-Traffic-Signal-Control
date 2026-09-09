"""
Comprehensive Automated Unit & Integration Tests for iTraCS Traffic Control System.
"""

import json
import os
import unittest
from config import config
from src.simulation.matsim_engine import MatsimSimulationEngine
from src.emissions.analyzer import EmissionAnalyzer
from src.emissions.tracker import EmissionTracker


class TestConfiguration(unittest.TestCase):
    def test_scenarios_exist(self):
        from config import TRAFFIC_SCENARIOS
        self.assertIn("bkc", TRAFFIC_SCENARIOS)
        self.assertIn("vashi", TRAFFIC_SCENARIOS)
        self.assertIn("palm_beach", TRAFFIC_SCENARIOS)

    def test_emission_config(self):
        self.assertEqual(config.emission.co2_per_tree_per_year_kg, 22.0)
        self.assertTrue(len(config.emission.pollutants) > 0)


class TestMatsimSimulationEngine(unittest.TestCase):
    def setUp(self):
        self.engine = MatsimSimulationEngine("bkc")

    def test_engine_initial_state(self):
        state = self.engine.get_state()
        self.assertEqual(state["scenario"], "bkc")
        self.assertIn("simTime", state)
        self.assertIn("metrics", state)
        self.assertIn("vehicles", state)
        self.assertIn("co2SavedKg", state["metrics"])

    def test_engine_step(self):
        initial_time = self.engine.sim_time
        self.engine.step()
        self.assertGreater(self.engine.sim_time, initial_time)
        state = self.engine.get_state()
        self.assertTrue(len(state["vehicles"]) > 0)

    def test_emergency_preemption(self):
        self.engine.trigger_emergency_vehicle()
        state = self.engine.get_state()
        has_ev = any(v.get("is_emergency") for v in state["vehicles"])
        self.assertTrue(has_ev, "Emergency vehicle should be active after trigger")

    def test_dynamic_diversion(self):
        self.engine.activate_dynamic_diversion()
        state = self.engine.get_state()
        self.assertTrue(state.get("diversionActive", True))


class TestEmissionTracker(unittest.TestCase):
    def test_emission_summary(self):
        analyzer = EmissionAnalyzer()
        impact = analyzer.get_environmental_impact(co2_prevented_kg=22.0, simulation_hours=8760.0)
        self.assertAlmostEqual(impact["trees_equivalent"], 1.0, places=1)


class TestServerSecurityContract(unittest.TestCase):
    def test_server_allowed_origins(self):
        import server
        self.assertTrue(hasattr(server, "ALLOWED_ORIGINS"))
        self.assertIn("http://localhost:3000", server.ALLOWED_ORIGINS)
        self.assertEqual(server.MAX_PAYLOAD_BYTES, 1024 * 1024)

    def test_server_bridge_bounded_captures(self):
        import server
        bridge = server.MatsimServerBridge()
        for i in range(120):
            bridge.capture(f"Test {i}")
        self.assertLessEqual(len(bridge.captures), server.MAX_CAPTURES_BUFFER)


if __name__ == "__main__":
    unittest.main()
