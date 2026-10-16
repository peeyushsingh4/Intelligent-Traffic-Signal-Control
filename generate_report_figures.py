import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

os.environ['MPLCONFIGDIR'] = '/tmp/mpl_config'
os.makedirs('report_figures', exist_ok=True)

# -------------------------------------------------------------
# Common B&W Style Configuration
# -------------------------------------------------------------
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Helvetica']
plt.rcParams['text.color'] = '#000000'
plt.rcParams['axes.edgecolor'] = '#000000'
plt.rcParams['axes.linewidth'] = 1.5

def save_bw_fig(fig, filename):
    fig.patch.set_facecolor('#ffffff')
    output_path = os.path.join('report_figures', filename)
    fig.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='#ffffff', edgecolor='#000000')
    plt.close(fig)
    print(f"Generated: {output_path}")

# =============================================================
# FIGURE 3.1: Scope of the Work (Future Scope Map)
# =============================================================
fig, ax = plt.subplots(figsize=(11.5, 6.8))
ax.set_xlim(0, 11.5)
ax.set_ylim(0, 7)
ax.axis('off')

# Title Card
ax.text(5.75, 6.55, "iTraCS: SCOPE OF WORK & STRATEGIC ROADMAP", 
        ha='center', va='center', fontsize=13, fontweight='bold')
ax.plot([1.5, 10.0], [6.25, 6.25], color='black', lw=1.5)

# Central Core
core_box = patches.FancyBboxPatch((4.0, 4.4), 3.5, 1.4, boxstyle="round,pad=0.1", 
                                  fc="#f0f0f0", ec="black", lw=2)
ax.add_patch(core_box)
ax.text(5.75, 5.3, "Term I Foundation (Implemented)", ha='center', va='center', fontsize=10.5, fontweight='bold')
ax.text(5.75, 4.75, "Perception • Microscopic Simulation\nDQN Signal Split • Emergency EVP Corridor", 
        ha='center', va='center', fontsize=8)

# Three Strategic Pillars
pillars = [
    {
        "title": "THEME 1: SENSING & RESPONSE",
        "x": 0.4, "y": 0.4, "w": 3.4, "h": 3.4,
        "items": [
            "• Live Edge CCTV Integration (RTSP)",
            "• Edge Hardware-Accelerated YOLOv8",
            "• Emergency Ambulance GPS & Transponder",
            "• ISO-22951 Standard EVP Protocols",
            "• Sensor Fusion with In-Ground Loops"
        ]
    },
    {
        "title": "THEME 2: COORDINATION & SCALE",
        "x": 4.05, "y": 0.4, "w": 3.4, "h": 3.4,
        "items": [
            "• Multi-Junction Arterial Network Sync",
            "• Continuous Green Wave Arterials",
            "• Dynamic VMS Detour Signage Engine",
            "• NTCIP 1203 Variable Message Protocol",
            "• Smart City Command Integration (ICCC)"
        ]
    },
    {
        "title": "THEME 3: INTELLIGENCE & POLICY",
        "x": 7.7, "y": 0.4, "w": 3.4, "h": 3.4,
        "items": [
            "• Multi-Agent RL Policies (MARL / PPO)",
            "• Short-Term Flow Forecasting (LSTM)",
            "• HBEFA Carbon Emission Accounting",
            "• Section 65B Cryptographic Audit Proof",
            "• Multi-City Indian Traffic Adaptation"
        ]
    }
]

for p in pillars:
    box = patches.FancyBboxPatch((p['x'], p['y']), p['w'], p['h'], 
                                 boxstyle="round,pad=0.08", fc="#ffffff", ec="black", lw=1.5)
    ax.add_patch(box)
    # Header sub-box
    h_box = patches.Rectangle((p['x'], p['y'] + p['h'] - 0.65), p['w'], 0.65, 
                              fc="#e0e0e0", ec="black", lw=1.2)
    ax.add_patch(h_box)
    ax.text(p['x'] + p['w']/2, p['y'] + p['h'] - 0.32, p['title'], 
            ha='center', va='center', fontsize=8.2, fontweight='bold')
    
    # Text items
    y_text = p['y'] + p['h'] - 0.95
    for item in p['items']:
        ax.text(p['x'] + 0.15, y_text, item, ha='left', va='center', fontsize=7.8)
        y_text -= 0.46

    # Connecting arrows from Core
    ax.annotate("", xy=(p['x'] + p['w']/2, p['y'] + p['h']), xytext=(5.75, 4.4),
                arrowprops=dict(arrowstyle="-|>", lw=1.5, color="black"))

save_bw_fig(fig, "fig3_1_scope_of_work.png")


# =============================================================
# FIGURE 3.2: Analysis / Framework / Algorithm Pipeline
# =============================================================
fig, ax = plt.subplots(figsize=(12, 4))
ax.set_xlim(0, 12)
ax.set_ylim(0, 4)
ax.axis('off')

ax.text(6.0, 3.6, "iTraCS DATA-FLOW & ALGORITHM PIPELINE (Sense -> Predict -> Decide -> Act)", 
        ha='center', va='center', fontsize=12, fontweight='bold')

stages = [
    {"label": "1. SENSING", "sub": "CCTV Camera Stream\nRTSP / 30 FPS\nVirtual ROI Setup", "x": 0.5},
    {"label": "2. PERCEPTION", "sub": "YOLOv8 Detection\nByteTrack Tracker\nSpeed / PCU Estimation", "x": 2.8},
    {"label": "3. STATE VECTOR", "sub": "Queue Density\nWaiting Times\nApproach Velocities", "x": 5.1},
    {"label": "4. RL DECISION", "sub": "DQN Agent Policy\nMATSim Multi-Agent\nWebster Optimization", "x": 7.4},
    {"label": "5. ACTUATION", "sub": "Adaptive Signal Split\nEmergency Preempt\nVMS Highway Diversion", "x": 9.7}
]

for i, s in enumerate(stages):
    box = patches.FancyBboxPatch((s['x'], 0.6), 1.8, 2.3, boxstyle="round,pad=0.08", 
                                 fc="#ffffff", ec="black", lw=1.5)
    ax.add_patch(box)
    
    # Title bar
    t_bar = patches.Rectangle((s['x'], 2.3), 1.8, 0.6, fc="#e8e8e8", ec="black", lw=1.2)
    ax.add_patch(t_bar)
    ax.text(s['x'] + 0.9, 2.6, s['label'], ha='center', va='center', fontsize=8.5, fontweight='bold')
    ax.text(s['x'] + 0.9, 1.45, s['sub'], ha='center', va='center', fontsize=8, linespacing=1.3)
    
    # Arrow
    if i < len(stages) - 1:
        ax.annotate("", xy=(s['x'] + 1.8 + 0.48, 1.75), xytext=(s['x'] + 1.8, 1.75),
                    arrowprops=dict(arrowstyle="-|>", lw=2, color="black"))

save_bw_fig(fig, "fig3_2_algorithm_pipeline.png")


# =============================================================
# FIGURE 3.3: Proposed System Flowchart
# =============================================================
fig, ax = plt.subplots(figsize=(10.5, 11))
ax.set_xlim(0, 10.5)
ax.set_ylim(0, 11)
ax.axis('off')

ax.text(5.25, 10.6, "iTraCS OPERATIONAL DECISION FLOWCHART", ha='center', va='center', 
        fontsize=12, fontweight='bold')

def draw_rect(x, y, w, h, text, title=None, fc="#ffffff"):
    box = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.08", fc=fc, ec="black", lw=1.5)
    ax.add_patch(box)
    if title:
        t_box = patches.Rectangle((x, y + h - 0.4), w, 0.4, fc="#e0e0e0", ec="black", lw=1)
        ax.add_patch(t_box)
        ax.text(x + w/2, y + h - 0.2, title, ha='center', va='center', fontsize=8, fontweight='bold')
        ax.text(x + w/2, y + (h - 0.4)/2, text, ha='center', va='center', fontsize=8)
    else:
        ax.text(x + w/2, y + h/2, text, ha='center', va='center', fontsize=8)

def draw_diamond(cx, cy, r, text):
    diamond = patches.Polygon([[cx, cy + r], [cx + r*1.4, cy], [cx, cy - r], [cx - r*1.4, cy]], 
                              closed=True, fc="#f4f4f4", ec="black", lw=1.5)
    ax.add_patch(diamond)
    ax.text(cx, cy, text, ha='center', va='center', fontsize=7.8, fontweight='bold')

def draw_arrow(p1, p2, text=None):
    ax.annotate("", xy=p2, xytext=p1, arrowprops=dict(arrowstyle="-|>", lw=1.5, color="black"))
    if text:
        mx = (p1[0] + p2[0]) / 2 + 0.15
        my = (p1[1] + p2[1]) / 2
        ax.text(mx, my, text, fontsize=7.5, fontweight='bold')

# Nodes (Centered at x=5.25)
draw_rect(3.6, 9.8, 3.3, 0.55, "START: RTSP Feed (30 FPS)", fc="#f0f0f0")
draw_arrow((5.25, 9.8), (5.25, 9.2))

draw_rect(3.0, 8.2, 4.5, 0.95, "YOLOv8 Detection & ByteTrack Multi-Class Tracking\n(Cars, Autos, Buses, Trucks, 2-Wheelers)")
draw_arrow((5.25, 8.2), (5.25, 7.5))

draw_rect(3.2, 6.7, 4.1, 0.8, "Virtual-ROI Passenger Car Unit (PCU) Calc\nQueue Density & Speed Extraction")
draw_arrow((5.25, 6.7), (5.25, 6.1))

# Diamond 1: Emergency?
draw_diamond(5.25, 5.5, 0.55, "Emergency\nVehicle\nDetected?")

# Branch YES (Left)
ax.plot([4.35, 2.2, 2.2], [5.5, 5.5, 4.6], color='black', lw=1.5)
ax.text(3.1, 5.7, "YES (EVP)", fontsize=7.5, fontweight='bold')
draw_rect(0.8, 3.8, 2.8, 0.8, "ISO-22951 Preemption:\nLock Opposing to RED\nForce Solid GREEN Wave")

# Branch NO (Down)
draw_arrow((5.25, 4.95), (5.25, 4.3), "NO")
draw_rect(3.4, 3.6, 3.7, 0.7, "Deep Q-Network (DQN) Inference\nWebster Adaptive Green-Time Split")
draw_arrow((5.25, 3.6), (5.25, 3.0))

# Diamond 2: Bottleneck?
draw_diamond(5.25, 2.45, 0.55, "Lane Saturation\n> 75% Capacity?")

# Branch YES (Right)
ax.plot([6.05, 8.3, 8.3], [2.45, 2.45, 1.9], color='black', lw=1.5)
ax.annotate("", xy=(8.3, 1.8), xytext=(8.3, 1.9), arrowprops=dict(arrowstyle="-|>", lw=1.5, color="black"))
ax.text(7.0, 2.65, "YES", fontsize=7.5, fontweight='bold')
draw_rect(7.0, 1.0, 2.6, 0.8, "NTCIP 1203 VMS Reroute:\nBroadcast Arterial Detour\nShed 65% Volume")

# Branch NO (Down)
draw_arrow((5.25, 1.9), (5.25, 1.5), "NO")

# Convergence to Hardware Actuation
draw_rect(3.3, 0.8, 3.9, 0.7, "Signal Hardware Actuation (TraCI / GPIO)\nLog Explainable AI Reasoning & CO2 Offset")

# Lines into convergence
ax.plot([2.2, 2.2, 3.3], [3.8, 1.15, 1.15], color='black', lw=1.5)
ax.annotate("", xy=(3.3, 1.15), xytext=(3.2, 1.15), arrowprops=dict(arrowstyle="-|>", lw=1.5, color="black"))

ax.plot([8.3, 8.3, 7.2], [1.0, 0.5, 0.5], color='black', lw=1.5)
ax.plot([7.2, 5.25, 5.25], [0.5, 0.5, 0.8], color='black', lw=1.5)

draw_arrow((5.25, 0.8), (5.25, 0.35))
draw_rect(3.85, 0.05, 2.8, 0.3, "CONTINUE NEXT FRAME", fc="#f0f0f0")

save_bw_fig(fig, "fig3_3_system_flowchart.png")


# =============================================================
# FIGURE 3.4: Role-Based Access Control (IAM Gateway)
# =============================================================
fig, ax = plt.subplots(figsize=(11, 7))
ax.set_xlim(0, 11)
ax.set_ylim(0, 7)
ax.axis('off')

ax.text(5.5, 6.6, "iTraCS ROLE-BASED ACCESS CONTROL (IAM) ARCHITECTURE", 
        ha='center', va='center', fontsize=12, fontweight='bold')

# Gateway Box
gw_box = patches.FancyBboxPatch((3.5, 5.3), 4.0, 0.9, boxstyle="round,pad=0.1", fc="#e0e0e0", ec="black", lw=2)
ax.add_patch(gw_box)
ax.text(5.5, 5.85, "iTraCS IAM & SECURITY GATEWAY", ha='center', va='center', fontsize=10, fontweight='bold')
ax.text(5.5, 5.5, "Authentication • TLS 1.3 Encryption • RBAC Permission Check", 
        ha='center', va='center', fontsize=8)

# Officer Branch (Left)
ax.plot([4.2, 2.3, 2.3], [5.3, 4.6, 4.2], color='black', lw=1.5)
ax.annotate("", xy=(2.3, 4.2), xytext=(2.3, 4.3), arrowprops=dict(arrowstyle="-|>", lw=1.5, color="black"))

off_card = patches.FancyBboxPatch((0.5, 1.5), 3.6, 2.7, boxstyle="round,pad=0.1", fc="#ffffff", ec="black", lw=1.5)
ax.add_patch(off_card)
ax.text(2.3, 3.9, "OFFICER SCOPE (Traffic Police HQ)", ha='center', va='center', fontsize=9.5, fontweight='bold')
ax.plot([0.7, 3.9], [3.65, 3.65], color='black', lw=1)
off_items = [
    "• Live 6-Camera CCTV Matrix & Heatmap",
    "• Violation Review Queue & 1-Click Challan",
    "• Dynamic Signal Override & Emergency EVP",
    "• VMS Highway Diversion Command",
    "• MATSim Explainable AI Reasoning Logs"
]
y_pos = 3.35
for it in off_items:
    ax.text(0.8, y_pos, it, ha='left', va='center', fontsize=8)
    y_pos -= 0.38

# Citizen Branch (Right)
ax.plot([6.8, 8.7, 8.7], [5.3, 4.6, 4.2], color='black', lw=1.5)
ax.annotate("", xy=(8.7, 4.2), xytext=(8.7, 4.3), arrowprops=dict(arrowstyle="-|>", lw=1.5, color="black"))

cit_card = patches.FancyBboxPatch((6.9, 1.5), 3.6, 2.7, boxstyle="round,pad=0.1", fc="#ffffff", ec="black", lw=1.5)
ax.add_patch(cit_card)
ax.text(8.7, 3.9, "CITIZEN SCOPE (Vehicle Owner Portal)", ha='center', va='center', fontsize=9.5, fontweight='bold')
ax.plot([7.1, 10.3], [3.65, 3.65], color='black', lw=1)
cit_items = [
    "• Parivahan RC / Chassis Verification",
    "• View Active Challans with CCTV Proof",
    "• Instant Online Fine Settlement (UPI/Card)",
    "• Formal Dispute Grievance Filing",
    "• Download Cryptographic e-Receipts"
]
y_pos = 3.35
for it in cit_items:
    ax.text(7.2, y_pos, it, ha='left', va='center', fontsize=8)
    y_pos -= 0.38

# Core Database & Simulation Infrastructure (Bottom Center)
infra_box = patches.FancyBboxPatch((2.0, 0.15), 7.0, 0.95, boxstyle="round,pad=0.1", fc="#f4f4f4", ec="black", lw=1.5)
ax.add_patch(infra_box)
ax.text(5.5, 0.75, "SHARED INFRASTRUCTURE & REPOSITORY LAYER", ha='center', va='center', fontsize=8.5, fontweight='bold')
ax.text(5.5, 0.42, "PostgreSQL Database • Sec 65B Cryptographic Audit Logs • TraCI WebSocket • MQTT Event Bus", 
        ha='center', va='center', fontsize=7.5)

ax.plot([2.3, 2.3, 2.8], [1.5, 0.65, 0.65], color='black', lw=1.5)
ax.plot([8.7, 8.7, 8.2], [1.5, 0.65, 0.65], color='black', lw=1.5)

save_bw_fig(fig, "fig3_4_iam_workflow.png")


# =============================================================
# FIGURE 3.5: System Architecture (3-Tier)
# =============================================================
fig, ax = plt.subplots(figsize=(11, 7))
ax.set_xlim(0, 11)
ax.set_ylim(0, 7)
ax.axis('off')

ax.text(5.5, 6.6, "iTraCS THREE-TIER SYSTEM ARCHITECTURE", ha='center', va='center', 
        fontsize=13, fontweight='bold')

layers = [
    {
        "title": "TIER 1: PERCEPTION LAYER",
        "x": 0.5, "y": 0.5, "w": 3.0, "h": 5.7,
        "boxes": [
            ("RTSP CCTV Feed (30 FPS)", "Multi-Corridor Cameras\nBKC, Dadar, Palm Beach"),
            ("Edge Inference Engine", "YOLOv8 Detection\nByteTrack Multi-Object Tracking"),
            ("ANPR OCR Pipeline", "Automated License Plate\nCharacter Recognition Engine")
        ]
    },
    {
        "title": "TIER 2: INTELLIGENCE LAYER",
        "x": 4.0, "y": 0.5, "w": 3.0, "h": 5.7,
        "boxes": [
            ("Central FastAPI Server", "Bidirectional REST / SSE\nAsynchronous TraCI API Bridge"),
            ("Microscopic Simulators", "MATSim Multi-Agent Engine\nSUMO Physics Environment"),
            ("DQN & Emission Core", "Deep Q-Network Agent\nHBEFA CO2 Emission Calculator")
        ]
    },
    {
        "title": "TIER 3: ACTUATION LAYER",
        "x": 7.5, "y": 0.5, "w": 3.0, "h": 5.7,
        "boxes": [
            ("Signal Phase Actuator", "NTCIP 1202 Signal Controller\nEmergency Green Wave Hold"),
            ("VMS Diversion Gantries", "Overhead LED Route Display\nDynamic Arterial Bypass"),
            ("Police & Citizen Portals", "Command Control Dashboard\nParivahan e-Challan Gateway")
        ]
    }
]

for l in layers:
    outer = patches.FancyBboxPatch((l['x'], l['y']), l['w'], l['h'], boxstyle="round,pad=0.1", 
                                  fc="#ffffff", ec="black", lw=1.8, ls="--")
    ax.add_patch(outer)
    
    t_box = patches.Rectangle((l['x'], l['y'] + l['h'] - 0.6), l['w'], 0.6, fc="#e0e0e0", ec="black", lw=1.2)
    ax.add_patch(t_box)
    ax.text(l['x'] + l['w']/2, l['y'] + l['h'] - 0.3, l['title'], 
            ha='center', va='center', fontsize=8.8, fontweight='bold')
    
    y_box = l['y'] + l['h'] - 2.0
    for title, desc in l['boxes']:
        sbox = patches.FancyBboxPatch((l['x'] + 0.2, y_box), l['w'] - 0.4, 1.2, 
                                      boxstyle="round,pad=0.08", fc="#f9f9f9", ec="black", lw=1.2)
        ax.add_patch(sbox)
        ax.text(l['x'] + l['w']/2, y_box + 0.85, title, ha='center', va='center', fontsize=8.5, fontweight='bold')
        ax.text(l['x'] + l['w']/2, y_box + 0.4, desc, ha='center', va='center', fontsize=7.5, linespacing=1.2)
        y_box -= 1.6

for y_pt in [4.5, 2.9, 1.3]:
    ax.annotate("", xy=(4.0, y_pt), xytext=(3.5, y_pt), arrowprops=dict(arrowstyle="-|>", lw=1.8, color="black"))
    ax.annotate("", xy=(7.5, y_pt), xytext=(7.0, y_pt), arrowprops=dict(arrowstyle="-|>", lw=1.8, color="black"))

save_bw_fig(fig, "fig3_5_system_architecture.png")


# =============================================================
# FIGURE 3.6: Formal UML Use Case Diagram
# =============================================================
fig, ax = plt.subplots(figsize=(11, 7.5))
ax.set_xlim(0, 11)
ax.set_ylim(0, 7.5)
ax.axis('off')

ax.text(5.5, 7.1, "iTraCS SYSTEM USE CASE DIAGRAM (UML 2.5)", ha='center', va='center', 
        fontsize=13, fontweight='bold')

sys_box = patches.Rectangle((2.3, 0.4), 6.4, 6.3, fc="#ffffff", ec="black", lw=2)
ax.add_patch(sys_box)
ax.text(5.5, 6.45, "iTraCS System Boundary", ha='center', va='center', fontsize=9.5, fontweight='bold', fontstyle='italic')

def draw_stick_actor(x, y, name):
    head = patches.Circle((x, y + 0.4), 0.18, fc="#ffffff", ec="black", lw=1.5)
    ax.add_patch(head)
    ax.plot([x, x], [y + 0.22, y - 0.25], color='black', lw=1.5)
    ax.plot([x - 0.3, x + 0.3], [y + 0.05, y + 0.05], color='black', lw=1.5)
    ax.plot([x, x - 0.25], [y - 0.25, y - 0.65], color='black', lw=1.5)
    ax.plot([x, x + 0.25], [y - 0.25, y - 0.65], color='black', lw=1.5)
    ax.text(x, y - 0.9, name, ha='center', va='center', fontsize=8, fontweight='bold')

draw_stick_actor(1.1, 5.0, "Traffic Police\nOfficer")
draw_stick_actor(1.1, 2.0, "Emergency\nVehicle Driver")
draw_stick_actor(9.8, 3.8, "Vehicle Owner\n/ Citizen")

ext_actor = patches.Rectangle((9.0, 1.0), 1.6, 0.9, fc="#f0f0f0", ec="black", lw=1.5)
ax.add_patch(ext_actor)
ax.text(9.8, 1.6, "<<system>>", ha='center', va='center', fontsize=7, fontstyle='italic')
ax.text(9.8, 1.3, "Parivahan\nPortal", ha='center', va='center', fontsize=8, fontweight='bold')

def draw_oval(cx, cy, rx, ry, text):
    oval = patches.Ellipse((cx, cy), rx*2, ry*2, fc="#ffffff", ec="black", lw=1.4)
    ax.add_patch(oval)
    ax.text(cx, cy, text, ha='center', va='center', fontsize=7.8)

draw_oval(3.8, 5.6, 1.1, 0.38, "Monitor Live\nCCTV Streams")
draw_oval(6.8, 5.6, 1.1, 0.38, "Detect Traffic\nViolations (YOLO)")
draw_oval(5.4, 4.4, 1.1, 0.38, "Issue e-Challan\nNotice")
draw_oval(7.4, 3.4, 1.1, 0.38, "Sync Vehicle\nRegistration")
draw_oval(3.8, 3.2, 1.1, 0.38, "Adaptive Signal\nTiming (DQN)")
draw_oval(3.8, 1.8, 1.1, 0.38, "Emergency Green\nWave (EVP)")
draw_oval(5.6, 2.0, 1.1, 0.38, "Broadcast Corridor\nDiversion (VMS)")
draw_oval(7.4, 2.2, 1.1, 0.38, "View & Pay\nChallan Online")
draw_oval(5.4, 0.9, 1.1, 0.38, "Adjudicate Fine\nDispute Appeal")

ax.plot([1.4, 2.7], [5.0, 5.6], color='black', lw=1.2)
ax.plot([1.4, 2.7], [5.0, 3.2], color='black', lw=1.2)
ax.plot([1.4, 4.3], [5.0, 0.9], color='black', lw=1.2)

ax.plot([1.4, 2.7], [2.0, 1.8], color='black', lw=1.2)

ax.plot([9.5, 8.5], [3.8, 2.2], color='black', lw=1.2)
ax.plot([9.5, 6.5], [3.8, 0.9], color='black', lw=1.2)

ax.plot([9.0, 8.5], [1.45, 3.4], color='black', lw=1.2)

def draw_dashed_arrow(p1, p2, text):
    ax.annotate("", xy=p2, xytext=p1, 
                arrowprops=dict(arrowstyle="-|>", lw=1.2, color="black", linestyle="--"))
    mx = (p1[0] + p2[0]) / 2
    my = (p1[1] + p2[1]) / 2 + 0.12
    ax.text(mx, my, text, ha='center', va='center', fontsize=7, fontweight='bold', backgroundcolor='#ffffff')

draw_dashed_arrow((4.9, 5.6), (5.7, 5.6), "<<include>>")
draw_dashed_arrow((6.8, 5.22), (5.9, 4.75), "<<extend>>")
draw_dashed_arrow((6.5, 4.4), (7.4, 3.78), "<<include>>")
draw_dashed_arrow((7.4, 2.58), (7.4, 3.02), "<<include>>")
draw_dashed_arrow((3.8, 2.82), (3.8, 2.18), "<<extend>>")
draw_dashed_arrow((4.6, 2.9), (5.2, 2.35), "<<extend>>")

save_bw_fig(fig, "fig3_6_usecase_diagram.png")


# =============================================================
# FIGURE 3.7: Methodology Workflow
# =============================================================
fig, ax = plt.subplots(figsize=(13.5, 6.2))
ax.set_xlim(0, 13.5)
ax.set_ylim(0, 6.2)
ax.axis('off')

ax.text(6.75, 5.7, "iTraCS END-TO-END METHODOLOGY & VALIDATION WORKFLOW", 
        ha='center', va='center', fontsize=12.5, fontweight='bold')

steps = [
    {"num": "STEP 1", "title": "Perception & Tracking", 
     "desc": "• RTSP Ingestion @ 30 FPS\n• YOLOv8 Detection\n• ByteTrack Persistent ID\n• Pixel-to-Speed Matrix"},
    {"num": "STEP 2", "title": "Network Calibration", 
     "desc": "• SUMO / MATSim Grid\n• Mumbai BKC & Dadar\n• Left-Hand Drive (LHT)\n• Heterogeneous PCUs"},
    {"num": "STEP 3", "title": "DQN Adaptive Control", 
     "desc": "• State: Density & Speeds\n• Reward: Min Queue Delay\n• Dynamic Phase Split\n• Free-to-Congested Shift"},
    {"num": "STEP 4", "title": "EVP & Diversions", 
     "desc": "• ISO-22951 Preemption\n• Green Wave Corridor\n• >75% Saturation Detour\n• 65% Traffic Shedding"},
    {"num": "STEP 5", "title": "Audits & Metrics", 
     "desc": "• HBEFA CO2 Calculation\n• Waiting Delay vs Baseline\n• Sec 65B Audit Records\n• Explainable AI Trace"}
]

box_w = 2.35
x_start = 0.4
x_gap = 0.28

for i, s in enumerate(steps):
    bx = x_start + i * (box_w + x_gap)
    card = patches.FancyBboxPatch((bx, 0.6), box_w, 4.4, boxstyle="round,pad=0.08", 
                                  fc="#ffffff", ec="black", lw=1.5)
    ax.add_patch(card)
    
    # Step Number Badge
    nbadge = patches.Rectangle((bx, 4.3), box_w, 0.7, fc="#e0e0e0", ec="black", lw=1)
    ax.add_patch(nbadge)
    ax.text(bx + box_w/2, 4.65, s['num'], ha='center', va='center', fontsize=9.5, fontweight='bold')
    
    # Title
    ax.text(bx + box_w/2, 3.9, s['title'], ha='center', va='center', fontsize=8.6, fontweight='bold')
    ax.plot([bx + 0.1, bx + box_w - 0.1], [3.6, 3.6], color='black', lw=0.8)
    
    # Description
    ax.text(bx + 0.15, 2.3, s['desc'], ha='left', va='center', fontsize=7.8, linespacing=1.4)
    
    # Arrow between cards
    if i < len(steps) - 1:
        ax.annotate("", xy=(bx + box_w + x_gap, 2.8), xytext=(bx + box_w, 2.8),
                    arrowprops=dict(arrowstyle="-|>", lw=1.8, color="black"))

save_bw_fig(fig, "fig3_7_methodology_workflow.png")

print("All figures regenerated with pristine padding and layout!")
