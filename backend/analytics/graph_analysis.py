"""
Graph Analytics Layer: Transaction Network & Fraud Ring Community Detection.

Builds a NetworkX directed transaction graph, applies Louvain community detection,
identifies circular laundering cycles, and scores clusters by fraud risk.
"""

import time
import logging
from typing import Dict, Any, List
import networkx as nx
from backend.storage.mongo_client import db_manager

logger = logging.getLogger("fraud_detection.graph_analysis")


async def analyze_fraud_rings(max_transactions: int = 5000) -> Dict[str, Any]:
    """
    Constructs a directed transaction network from recent database transactions,
    runs Louvain community detection, and calculates suspicion scores for each cluster.
    """
    start_time = time.time()
    db = await db_manager.get_db()

    # Fetch recent transactions
    cursor = db.transactions.find(
        {},
        {
            "_id": 0,
            "nameOrig": 1,
            "nameDest": 1,
            "amount": 1,
            "type": 1,
            "isFraud": 1,
            "is_flagged": 1,
            "flags": 1,
        },
    ).sort("timestamp", -1).limit(max_transactions)

    transactions = await cursor.to_list(length=max_transactions)

    if not transactions or len(transactions) < 4:
        return {
            "clusters": [],
            "total_nodes": 0,
            "total_edges": 0,
            "duration_ms": round((time.time() - start_time) * 1000, 2),
        }

    # 1. Build NetworkX Directed Graph
    G = nx.DiGraph()
    flagged_tx_count = 0

    for tx in transactions:
        orig = tx["nameOrig"]
        dest = tx["nameDest"]
        amt = float(tx.get("amount", 0.0))
        is_fraud = tx.get("isFraud", 0) == 1 or tx.get("is_flagged", False)
        if is_fraud:
            flagged_tx_count += 1

        if not G.has_node(orig):
            G.add_node(orig, volume=0.0, tx_count=0, is_flagged=False)
        if not G.has_node(dest):
            G.add_node(dest, volume=0.0, tx_count=0, is_flagged=False)

        G.nodes[orig]["volume"] += amt
        G.nodes[orig]["tx_count"] += 1
        G.nodes[dest]["volume"] += amt
        G.nodes[dest]["tx_count"] += 1

        if is_fraud:
            G.nodes[orig]["is_flagged"] = True
            G.nodes[dest]["is_flagged"] = True

        if G.has_edge(orig, dest):
            G[orig][dest]["weight"] += amt
            G[orig][dest]["count"] += 1
            if is_fraud:
                G[orig][dest]["is_fraud"] = True
        else:
            G.add_edge(orig, dest, weight=amt, count=1, is_fraud=is_fraud)

    # 2. Run Louvain Community Detection on undirected projection
    G_undirected = G.to_undirected()
    try:
        communities = nx.community.louvain_communities(G_undirected, seed=42)
    except Exception as exc:
        logger.warning("Louvain detection fallback: %s", exc)
        communities = [set(c) for c in nx.connected_components(G_undirected)]

    # 3. Analyze each community
    clusters: List[Dict[str, Any]] = []

    for idx, comm in enumerate(communities):
        comm_size = len(comm)
        # Skip trivial singletons or 2-node normal transactions unless they have fraud flags
        subgraph = G.subgraph(comm)
        sub_edges = subgraph.number_of_edges()

        if comm_size < 3 and sub_edges < 2:
            # Check if flagged
            has_flag = any(G.nodes[n].get("is_flagged", False) for n in comm)
            if not has_flag:
                continue

        # Calculate directed density
        max_possible_edges = comm_size * (comm_size - 1) if comm_size > 1 else 1
        density = sub_edges / max_possible_edges if max_possible_edges > 0 else 0.0

        # Cycle Detection (e.g. fund round-tripping A -> B -> C -> A)
        cycles = []
        try:
            # Look for small simple cycles
            cycle_gen = nx.simple_cycles(subgraph)
            for _ in range(5):  # Limit to first 5 cycles
                c = next(cycle_gen)
                if len(c) >= 3:
                    cycles.append(c)
        except (StopIteration, Exception):
            pass

        # Total cluster volume and fraud counts
        total_vol = sum(subgraph[u][v]["weight"] for u, v in subgraph.edges())
        cluster_fraud_edges = sum(1 for u, v in subgraph.edges() if subgraph[u][v].get("is_fraud", False))

        # Suspicion Score Formulation:
        # - Base: density * 30
        # - Fraud edge ratio * 35
        # - Cycles detected: +20 points
        # - High volume concentration: +15 points
        fraud_ratio = (cluster_fraud_edges / sub_edges) if sub_edges > 0 else 0.0
        suspicion = (
            (density * 30.0)
            + (fraud_ratio * 40.0)
            + (25.0 if len(cycles) > 0 else 0.0)
            + (15.0 if total_vol > 300000 else 5.0)
        )
        suspicion_score = min(100.0, round(suspicion, 1))

        # Node classification (hub, mule, consumer)
        cluster_nodes = []
        for n in comm:
            in_deg = G.in_degree(n)
            out_deg = G.out_degree(n)
            # Role heuristic
            if in_deg >= 2 and out_deg >= 2:
                role = "MULE_HUB"
            elif out_deg >= 2:
                role = "SOURCE"
            elif in_deg >= 2:
                role = "DESTINATION"
            else:
                role = "MEMBER"

            cluster_nodes.append({
                "id": n,
                "label": n,
                "role": role,
                "is_flagged": G.nodes[n].get("is_flagged", False),
                "volume": round(G.nodes[n].get("volume", 0.0), 2),
                "in_degree": in_deg,
                "out_degree": out_deg,
            })

        cluster_links = []
        for u, v in subgraph.edges():
            cluster_links.append({
                "source": u,
                "target": v,
                "weight": round(subgraph[u][v]["weight"], 2),
                "count": subgraph[u][v]["count"],
                "is_fraud": subgraph[u][v].get("is_fraud", False),
            })

        clusters.append({
            "cluster_id": f"RING_{idx + 1:03d}",
            "size": comm_size,
            "edge_count": sub_edges,
            "density": round(density, 3),
            "suspicion_score": suspicion_score,
            "total_volume": round(total_vol, 2),
            "cycle_count": len(cycles),
            "fraud_edges": cluster_fraud_edges,
            "nodes": cluster_nodes,
            "links": cluster_links,
        })

    # Sort clusters descending by suspicion score
    clusters.sort(key=lambda x: (x["suspicion_score"], x["size"]), reverse=True)

    duration = (time.time() - start_time) * 1000
    logger.info(
        "Graph community analysis complete: %d nodes, %d edges, %d clusters in %.1f ms.",
        G.number_of_nodes(),
        G.number_of_edges(),
        len(clusters),
        duration,
    )

    return {
        "clusters": clusters[:15],  # Return top 15 suspicious clusters
        "total_nodes": G.number_of_nodes(),
        "total_edges": G.number_of_edges(),
        "duration_ms": round(duration, 2),
    }
