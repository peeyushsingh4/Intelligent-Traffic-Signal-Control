#!/usr/bin/env python3
"""
Mumbai & Navi Mumbai City Map Generator for SUMO.

Builds high-fidelity 3-lane signalized road networks for key Mumbai & Navi Mumbai locations
with real street names, induction loop detectors, auto-rickshaws, BEST buses,
and emergency priority vehicles.

Locations:
1. BKC Junction (Bandra East, Mumbai) — WEH ↔ BKC Corridor ↔ LBS Marg
2. Vashi Highway Interchange (Navi Mumbai) — Sion-Panvel Expressway ↔ Palm Beach Rd
3. Palm Beach Road (Nerul, Navi Mumbai) — 6-Lane Express Arterial Corridor
"""

import os
import sys
import subprocess
from typing import Dict, Any

# Ensure project root in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


LOCATIONS: Dict[str, Dict[str, Any]] = {
    "bkc": {
        "name": "BKC Junction (Bandra East, Mumbai)",
        "prefix": "bkc_mumbai",
        "east_street": "BKC Main Corridor",
        "west_street": "Western Express Hwy",
        "north_street": "LBS Marg Approach",
        "south_street": "Sion Link Road",
        "lanes": 3,
        "speed": 13.89,  # 50 km/h
        "traffic_flow": 800,
    },
    "vashi": {
        "name": "Vashi Highway Interchange (Navi Mumbai)",
        "prefix": "vashi_navimumbai",
        "east_street": "Sion-Panvel Expressway East",
        "west_street": "Sion-Panvel Expressway West",
        "north_street": "Vashi Sector 17 Rd",
        "south_street": "Palm Beach Road Entry",
        "lanes": 3,
        "speed": 16.67,  # 60 km/h
        "traffic_flow": 1000,
    },
    "palm_beach": {
        "name": "Palm Beach Road (Nerul, Navi Mumbai)",
        "prefix": "palm_beach_nerul",
        "east_street": "Palm Beach Rd Belapur",
        "west_street": "Palm Beach Rd Vashi",
        "north_street": "Nerul Sector 20 Ave",
        "south_street": "TS Chanakya Way",
        "lanes": 3,
        "speed": 19.44,  # 70 km/h
        "traffic_flow": 600,
    }
}


def find_netconvert_bin() -> str:
    venv_bin = os.path.join(os.path.dirname(__file__), 'venv', 'bin', 'netconvert')
    if os.path.exists(venv_bin):
        return venv_bin
    return 'netconvert'


def build_mumbai_network(key: str, loc: Dict[str, Any]):
    prefix = loc["prefix"]
    net_path = f"simulation/network/{prefix}.net.xml"
    nod_path = f"simulation/network/{prefix}.nod.xml"
    edg_path = f"simulation/network/{prefix}.edg.xml"
    
    os.makedirs("simulation/network", exist_ok=True)
    
    # 1. Write Nodes
    with open(nod_path, 'w') as f:
        f.write('''<?xml version="1.0" encoding="UTF-8"?>
<nodes>
    <node id="B0"  x="500.0" y="500.0"  type="traffic_light"/>
    <node id="A0"  x="0.0"   y="500.0"  type="priority"/>
    <node id="C0"  x="1000.0" y="500.0" type="priority"/>
    <node id="B1"  x="500.0" y="1000.0" type="priority"/>
    <node id="B-1" x="500.0" y="0.0"    type="priority"/>
</nodes>
''')

    # 2. Write Edges with Street Names
    lanes = loc["lanes"]
    speed = loc["speed"]
    with open(edg_path, 'w') as f:
        f.write(f'''<?xml version="1.0" encoding="UTF-8"?>
<edges>
    <edge id="A0B0"  from="A0"  to="B0"  numLanes="{lanes}" speed="{speed}" name="{loc['west_street']}"/>
    <edge id="B0A0"  from="B0"  to="A0"  numLanes="{lanes}" speed="{speed}" name="{loc['west_street']} Out"/>
    <edge id="C0B0"  from="C0"  to="B0"  numLanes="{lanes}" speed="{speed}" name="{loc['east_street']}"/>
    <edge id="B0C0"  from="B0"  to="C0"  numLanes="{lanes}" speed="{speed}" name="{loc['east_street']} Out"/>
    <edge id="B1B0"  from="B1"  to="B0"  numLanes="{lanes}" speed="{speed}" name="{loc['north_street']}"/>
    <edge id="B0B1"  from="B0"  to="B1"  numLanes="{lanes}" speed="{speed}" name="{loc['north_street']} Out"/>
    <edge id="B-1B0" from="B-1" to="B0"  numLanes="{lanes}" speed="{speed}" name="{loc['south_street']}"/>
    <edge id="B0B-1" from="B0"  to="B-1" numLanes="{lanes}" speed="{speed}" name="{loc['south_street']} Out"/>
</edges>
''')

    # 3. Convert via netconvert
    netconvert_bin = find_netconvert_bin()
    cmd = [
        netconvert_bin,
        f"--node-files={nod_path}",
        f"--edge-files={edg_path}",
        f"--output-file={net_path}",
        "--tls.guess", "true",
        "--junctions.corner-detail", "5",
        "--no-turnarounds", "true"
    ]
    subprocess.run(cmd, check=True)
    print(f"  ✅ Built SUMO network: {net_path}")


def generate_mumbai_routes_and_cfg(key: str, loc: Dict[str, Any]):
    prefix = loc["prefix"]
    flow_rate = loc["traffic_flow"]
    routes_path = f"simulation/routes/{prefix}.rou.xml"
    cfg_path = f"simulation/config/{prefix}.sumocfg"
    
    os.makedirs("simulation/routes", exist_ok=True)
    os.makedirs("simulation/config", exist_ok=True)

    # 1. Write Route File
    with open(routes_path, 'w') as f:
        f.write(f'''<routes>
    <!-- Mumbai & Navi Mumbai Vehicle Types -->
    <vType id="car" vClass="passenger" length="4.5" maxSpeed="13.89" accel="2.6" decel="4.5" emissionClass="HBEFA3/PC_G_EU4" color="0.2,0.6,1.0"/>
    <vType id="auto_rickshaw" vClass="passenger" length="2.8" maxSpeed="11.11" accel="2.0" decel="3.5" emissionClass="HBEFA3/PC_G_EU4" color="1.0,0.8,0.0"/>
    <vType id="best_bus" vClass="bus" length="12.0" maxSpeed="11.11" accel="1.2" decel="4.0" emissionClass="HBEFA3/Bus" color="0.9,0.1,0.1"/>
    
    <!-- Emergency Vehicles with Blue Light Devices -->
    <vType id="ambulance" vClass="emergency" guiShape="emergency" length="6.5" maxSpeed="38.89" accel="3.5" decel="4.5" emergencyDecel="9.0" speedFactor="1.3" emissionClass="HBEFA3/HDV" color="1.0,0.0,0.0">
        <param key="has.bluelight.device" value="true"/>
    </vType>
    <vType id="firetruck" vClass="emergency" guiShape="firebrigade" length="10.0" maxSpeed="33.33" accel="2.5" decel="4.0" emergencyDecel="8.0" speedFactor="1.2" emissionClass="HBEFA3/HDV" color="1.0,0.3,0.0">
        <param key="has.bluelight.device" value="true"/>
    </vType>

    <!-- Standard Routes -->
    <route id="r_WE" edges="A0B0 B0C0"/>
    <route id="r_EW" edges="C0B0 B0A0"/>
    <route id="r_NS" edges="B1B0 B0B-1"/>
    <route id="r_SN" edges="B-1B0 B0B1"/>

    <!-- Traffic Demand Flows ({flow_rate} veh/hr) -->
    <flow id="f_WE_cars" type="car" route="r_WE" begin="0" end="3600" vehsPerHour="{int(flow_rate * 0.4)}"/>
    <flow id="f_WE_rickshaw" type="auto_rickshaw" route="r_WE" begin="0" end="3600" vehsPerHour="{int(flow_rate * 0.1)}"/>
    <flow id="f_EW_cars" type="car" route="r_EW" begin="0" end="3600" vehsPerHour="{int(flow_rate * 0.4)}"/>
    <flow id="f_NS_cars" type="car" route="r_NS" begin="0" end="3600" vehsPerHour="{int(flow_rate * 0.3)}"/>
    <flow id="f_NS_bus" type="best_bus" route="r_NS" begin="0" end="3600" vehsPerHour="25"/>
    <flow id="f_SN_cars" type="car" route="r_SN" begin="0" end="3600" vehsPerHour="{int(flow_rate * 0.3)}"/>

    <!-- Emergency Priority Vehicles -->
    <vehicle id="AMBULANCE_108" type="ambulance" route="r_NS" depart="140.0"/>
    <vehicle id="FIRE_BRIGADE" type="firetruck" route="r_EW" depart="320.0"/>
    <vehicle id="AMBULANCE_CITY" type="ambulance" route="r_WE" depart="650.0"/>
</routes>
''')

    # 2. Write Config File (.sumocfg)
    with open(cfg_path, 'w') as f:
        f.write(f'''<configuration>
    <input>
        <net-file value="../network/{prefix}.net.xml"/>
        <route-files value="../routes/{prefix}.rou.xml"/>
        <additional-files value="../additional/detectors.add.xml"/>
    </input>
    <time>
        <begin value="0"/>
        <end value="3600"/>
        <step-length value="0.5"/>
    </time>
    <output>
        <emission-output value="../output/emissions/{prefix}_emissions.xml"/>
        <tripinfo-output value="../output/tripinfo/{prefix}_tripinfo.xml"/>
        <statistic-output value="../output/statistics/{prefix}_statistics.xml"/>
    </output>
    <processing>
        <lateral-resolution value="0.8"/>
    </processing>
</configuration>
''')
    print(f"  ✅ Created route file: {routes_path}")
    print(f"  ✅ Created config file: {cfg_path}")


def main():
    print("=" * 70)
    print("  MUMBAI & NAVI MUMBAI CITY MAP GENERATOR FOR SUMO")
    print("=" * 70)

    for key, loc in LOCATIONS.items():
        print(f"\n📍 Location: {loc['name']}")
        build_mumbai_network(key, loc)
        generate_mumbai_routes_and_cfg(key, loc)

    print("\n🎉 All Mumbai and Navi Mumbai city maps & scenarios ready!")


if __name__ == "__main__":
    main()
