"""
PaySim CSV dataset loader and realistic sample data generator.

Ensures strict schema validation, defensive error handling, and realistic
synthetic fraud rings for testing and viva demonstration when external Kaggle
files are not available locally.
"""

import os
import csv
import logging
import random
from typing import Generator, Dict, Any, Tuple, Optional

logger = logging.getLogger("fraud_detection.ingestion")

EXPECTED_HEADERS = [
    "step",
    "type",
    "amount",
    "nameOrig",
    "oldbalanceOrg",
    "newbalanceOrig",
    "nameDest",
    "oldbalanceDest",
    "newbalanceDest",
    "isFraud",
    "isFlaggedFraud",
]

TX_TYPES = ["PAYMENT", "TRANSFER", "CASH_OUT", "CASH_IN", "DEBIT"]


def validate_row(row: Dict[str, str], line_num: int) -> Tuple[bool, Optional[Dict[str, Any]], Optional[str]]:
    """
    Strictly validates a CSV row against the PaySim schema.
    Returns (is_valid, parsed_dict, error_reason).
    """
    try:
        step = int(row["step"])
        tx_type = str(row["type"]).strip().upper()
        if tx_type not in TX_TYPES:
            return False, None, f"Invalid transaction type: {tx_type}"

        amount = float(row["amount"])
        if amount < 0:
            return False, None, "Negative transaction amount"

        name_orig = str(row["nameOrig"]).strip()
        old_bal_org = float(row["oldbalanceOrg"])
        new_bal_org = float(row["newbalanceOrig"])

        name_dest = str(row["nameDest"]).strip()
        old_bal_dest = float(row["oldbalanceDest"])
        new_bal_dest = float(row["newbalanceDest"])

        is_fraud = int(row.get("isFraud", 0))
        is_flagged_fraud = int(row.get("isFlaggedFraud", 0))

        parsed = {
            "step": step,
            "type": tx_type,
            "amount": round(amount, 2),
            "nameOrig": name_orig,
            "oldbalanceOrg": round(old_bal_org, 2),
            "newbalanceOrig": round(new_bal_org, 2),
            "nameDest": name_dest,
            "oldbalanceDest": round(old_bal_dest, 2),
            "newbalanceDest": round(new_bal_dest, 2),
            "isFraud": 1 if is_fraud == 1 else 0,
            "isFlaggedFraud": 1 if is_flagged_fraud == 1 else 0,
        }
        return True, parsed, None
    except (ValueError, KeyError, TypeError) as exc:
        return False, None, f"Malformed row at line {line_num}: {type(exc).__name__}"


def generate_paysim_sample(output_file: str, num_rows: int = 50000) -> str:
    """
    Generates a realistic PaySim-compliant CSV dataset containing:
    1. Normal consumer & merchant transactions (Cash In/Out, Payment, Transfer)
    2. High-value transactions (> $200k) for DGIM testing
    3. New account introductions for Bloom Filter testing
    4. Injected Fraud Rings (colluding clusters, circular fund cycling, mule cash-outs)
    """
    os.makedirs(os.path.dirname(os.path.abspath(output_file)), exist_ok=True)
    logger.info("Generating realistic PaySim sample dataset with %d rows at %s...", num_rows, output_file)

    random.seed(42)  # Deterministic seed for reproducible testing & grading

    # Pool of regular accounts
    regular_accounts = [f"C{random.randint(10000000, 99999999)}" for _ in range(3000)]
    merchants = [f"M{random.randint(10000000, 99999999)}" for _ in range(500)]
    account_balances = {acc: round(random.uniform(500.0, 50000.0), 2) for acc in regular_accounts}
    account_balances.update({m: round(random.uniform(5000.0, 500000.0), 2) for m in merchants})

    # Dedicated Fraud Rings for Community Detection / NetworkX tests
    # Ring 1: Circular fund cycling (A -> B -> C -> D -> A)
    ring_1 = [f"C_RING1_{i}" for i in range(6)]
    for acc in ring_1:
        account_balances[acc] = 150000.0

    # Ring 2: Smurfing / Funnel Mule Ring (10 small originators funneling into 1 aggregator, then cashout)
    ring_2_senders = [f"C_MULE_FEED_{i}" for i in range(12)]
    ring_2_hub = "C_MULE_AGGREGATOR"
    ring_2_cashout = "C_MULE_CASHOUT_DEST"
    for acc in ring_2_senders:
        account_balances[acc] = 80000.0
    account_balances[ring_2_hub] = 5000.0
    account_balances[ring_2_cashout] = 1000.0

    # Ring 3: Dense bipartite laundering group
    ring_3_layer1 = [f"C_RING3_L1_{i}" for i in range(4)]
    ring_3_layer2 = [f"C_RING3_L2_{j}" for j in range(4)]
    for acc in ring_3_layer1 + ring_3_layer2:
        account_balances[acc] = 120000.0

    with open(output_file, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(EXPECTED_HEADERS)

        current_step = 1
        for i in range(num_rows):
            # Advance step roughly every 700 transactions
            if i % 700 == 0 and i > 0:
                current_step += 1

            # Decide transaction nature:
            # 88% Legitimate, 6% DGIM High-Value legitimate, 6% Structured Fraud Ring
            p_type = random.random()

            if p_type < 0.88:
                # Normal transaction
                tx_type = random.choices(
                    ["PAYMENT", "TRANSFER", "CASH_OUT", "CASH_IN", "DEBIT"],
                    weights=[0.35, 0.20, 0.25, 0.15, 0.05],
                )[0]

                # Introduce occasionally unseen accounts for Bloom Filter
                if random.random() < 0.05:
                    name_orig = f"C{random.randint(90000000, 99999999)}"
                    account_balances[name_orig] = round(random.uniform(100.0, 10000.0), 2)
                else:
                    name_orig = random.choice(regular_accounts)

                if tx_type == "PAYMENT":
                    name_dest = random.choice(merchants)
                    amount = round(random.uniform(5.0, 1500.0), 2)
                else:
                    name_dest = random.choice(regular_accounts)
                    amount = round(random.uniform(50.0, 25000.0), 2)

                old_bal_org = account_balances.get(name_orig, 1000.0)
                amount = min(amount, max(10.0, old_bal_org))
                new_bal_org = max(0.0, round(old_bal_org - amount, 2))
                account_balances[name_orig] = new_bal_org

                old_bal_dest = account_balances.get(name_dest, 0.0)
                new_bal_dest = round(old_bal_dest + amount, 2)
                account_balances[name_dest] = new_bal_dest

                is_fraud = 0
                is_flagged = 0

            elif p_type < 0.94:
                # High-Value Transaction (> $200,000 for DGIM detection)
                tx_type = random.choice(["TRANSFER", "CASH_OUT"])
                name_orig = random.choice(regular_accounts)
                name_dest = random.choice(regular_accounts)
                amount = round(random.uniform(205000.0, 950000.0), 2)

                old_bal_org = amount + round(random.uniform(1000.0, 50000.0), 2)
                new_bal_org = round(old_bal_org - amount, 2)
                old_bal_dest = account_balances.get(name_dest, 5000.0)
                new_bal_dest = round(old_bal_dest + amount, 2)

                account_balances[name_orig] = new_bal_org
                account_balances[name_dest] = new_bal_dest

                is_fraud = 0
                is_flagged = 1 if amount >= 200000 else 0

            else:
                # Fraud Ring Activity
                ring_choice = random.choice([1, 2, 3])
                is_fraud = 1
                is_flagged = 0

                if ring_choice == 1:
                    # Ring 1: Circular transaction
                    idx = random.randint(0, len(ring_1) - 1)
                    name_orig = ring_1[idx]
                    name_dest = ring_1[(idx + 1) % len(ring_1)]
                    tx_type = "TRANSFER"
                    amount = round(random.uniform(45000.0, 180000.0), 2)
                elif ring_choice == 2:
                    # Ring 2: Funnel or cashout
                    if random.random() < 0.7:
                        # Funnel in
                        name_orig = random.choice(ring_2_senders)
                        name_dest = ring_2_hub
                        tx_type = "TRANSFER"
                        amount = round(random.uniform(9500.0, 19500.0), 2)  # Smurfing under reporting caps
                    else:
                        # Cashout from aggregator
                        name_orig = ring_2_hub
                        name_dest = ring_2_cashout
                        tx_type = "CASH_OUT"
                        amount = round(random.uniform(50000.0, 250000.0), 2)
                else:
                    # Ring 3: Bipartite cross-layer transfers
                    name_orig = random.choice(ring_3_layer1)
                    name_dest = random.choice(ring_3_layer2)
                    tx_type = "TRANSFER"
                    amount = round(random.uniform(60000.0, 220000.0), 2)

                old_bal_org = account_balances.get(name_orig, 200000.0)
                # Draining balance pattern typical of fraud
                new_bal_org = 0.0 if tx_type == "CASH_OUT" else max(0.0, round(old_bal_org - amount, 2))
                old_bal_dest = account_balances.get(name_dest, 0.0)
                new_bal_dest = round(old_bal_dest + amount, 2)

                account_balances[name_orig] = new_bal_org
                account_balances[name_dest] = new_bal_dest

            writer.writerow([
                current_step,
                tx_type,
                f"{amount:.2f}",
                name_orig,
                f"{old_bal_org:.2f}",
                f"{new_bal_org:.2f}",
                name_dest,
                f"{old_bal_dest:.2f}",
                f"{new_bal_dest:.2f}",
                is_fraud,
                is_flagged,
            ])

    logger.info("Successfully generated sample dataset at %s with %d rows.", output_file, num_rows)
    return output_file


def stream_csv_dataset(csv_path: str) -> Generator[Dict[str, Any], None, None]:
    """
    Generator that streams and yields validated PaySim transactions one row at a time.
    If the file does not exist, automatically generates a realistic sample.
    """
    if not os.path.exists(csv_path):
        logger.warning("Dataset not found at %s. Triggering automatic sample generation...", csv_path)
        generate_paysim_sample(csv_path, num_rows=50000)

    with open(csv_path, mode="r", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        line_num = 1
        for row in reader:
            line_num += 1
            is_valid, parsed_tx, error_msg = validate_row(row, line_num)
            if is_valid and parsed_tx:
                yield parsed_tx
            else:
                logger.debug("Skipping invalid row %d: %s", line_num, error_msg)
