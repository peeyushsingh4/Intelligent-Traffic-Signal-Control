"""
Bloom Filter Implementation for Streaming New-Account Anomaly Detection.

================================================================================
VIVA & ORAL EXAM THEORETICAL FOUNDATION:
================================================================================
1. PROBLEM MOTIVATION:
   In financial fraud systems, transactions initiated by previously unseen accounts
   represent heightened risk (e.g., disposable mule accounts, identity theft).
   Storing millions of account IDs in an exact hash set requires O(N) memory
   (e.g., 10 million UUID strings = ~500 MB to 1 GB).
   A Bloom Filter provides an O(m) bit probabilistic membership test:
   - False Negatives: IMPOSSIBLE (0%). If the filter returns False, the account is 100% new.
   - False Positives: Bounded by tunable probability 'p'. If the filter returns True, the
     account is PROBABLY known.

2. MATHEMATICAL DERIVATION:
   Given:
     n = Expected number of items to insert (capacity)
     p = Desired false-positive probability (e.g. 0.01 = 1%)

   - Optimal Bit Array Size (m):
       m = - (n * ln(p)) / (ln(2)^2) ≈ - 1.44269 * n * log2(p)
     For n = 100,000 and p = 0.01:
       m = - (100,000 * -4.60517) / (0.693147^2) ≈ 958,506 bits ≈ 117 KB!
       (Over 95% memory savings compared to a hash set).

   - Optimal Number of Hash Functions (k):
       k = (m / n) * ln(2)
     For n = 100,000 and m ≈ 958,506:
       k = 9.585 * 0.693147 ≈ 6.64 -> 7 hash functions.

3. HASHING TECHNIQUE - Kirsch-Mitzenmacher Optimization:
   Computing k distinct cryptographic hashes (SHA/MD5) is computationally prohibitive.
   Kirsch & Mitzenmacher proved (2006) that two independent hash functions h1(x) and h2(x)
   can simulate k independent hash functions without degrading asymptotic false-positive rates:
       gi(x) = (h1(x) + i * h2(x)) mod m,   for i in 0, ..., k-1
   We derive h1 and h2 from 64-bit halves of a single 128-bit Murmur3/SHA-256 digest.

4. COMPLEXITY:
   - Time Complexity: O(k) for lookup and insertion (constant time with small k, e.g., k=7).
   - Space Complexity: O(m) bits = O(n * log(1/p)) bits, strictly bounded.
================================================================================
"""

import math
import hashlib
from typing import Dict, Any, Tuple


class BloomFilter:
    def __init__(self, expected_elements: int = 100000, false_positive_rate: float = 0.01):
        """
        Initialize the Bloom Filter with optimal sizing parameters.

        :param expected_elements: (n) Expected number of distinct elements to store.
        :param false_positive_rate: (p) Desired false positive probability (0 < p < 1).
        """
        if expected_elements <= 0:
            raise ValueError("expected_elements must be a positive integer.")
        if not (0.0 < false_positive_rate < 1.0):
            raise ValueError("false_positive_rate must be between 0 and 1 exclusive.")

        self.n: int = expected_elements
        self.p: float = false_positive_rate

        # Calculate optimal bit array size m in bits
        # Formula: m = ceil(- (n * ln(p)) / (ln(2)^2))
        m_bits = math.ceil(-(self.n * math.log(self.p)) / (math.log(2) ** 2))
        # Ensure m is at least 64 bits
        self.m: int = max(64, m_bits)

        # Calculate optimal number of hash functions k
        # Formula: k = round((m / n) * ln(2))
        k_hashes = round((self.m / self.n) * math.log(2))
        self.k: int = max(1, k_hashes)

        # Bit array implemented as bytearray for efficient memory footprint
        # bytearray size = ceil(m / 8) bytes
        self.byte_count: int = (self.m + 7) // 8
        self.bit_array: bytearray = bytearray(self.byte_count)

        # Operational metrics tracking
        self.count: int = 0
        self.set_bits_count: int = 0

    def _get_hash_seeds(self, item: str) -> Tuple[int, int]:
        """
        Generates two 64-bit hash values h1 and h2 from a single SHA-256 digest of the item.
        Used for Kirsch-Mitzenmacher double hashing: gi(x) = (h1 + i * h2) % m.
        """
        digest = hashlib.sha256(item.encode("utf-8")).digest()
        # Extract two 64-bit unsigned integers from the 32-byte digest
        h1 = int.from_bytes(digest[0:8], byteorder="big", signed=False)
        h2 = int.from_bytes(digest[8:16], byteorder="big", signed=False)
        # Ensure h2 is odd to guarantee coprime with m if m is power of 2,
        # or non-zero to avoid degenerate constant sequence
        if h2 == 0:
            h2 = 1
        return h1, h2

    def _get_bit_indices(self, item: str):
        """Yields the k bit indices for a given item using double hashing."""
        h1, h2 = self._get_hash_seeds(item)
        for i in range(self.k):
            yield (h1 + i * h2) % self.m

    def add(self, item: str) -> None:
        """
        Inserts an item into the Bloom Filter by setting all k hash bit positions to 1.
        """
        for bit_idx in self._get_bit_indices(item):
            byte_idx = bit_idx >> 3  # bit_idx // 8
            bit_offset = bit_idx & 7  # bit_idx % 8
            mask = 1 << bit_offset
            if not (self.bit_array[byte_idx] & mask):
                self.bit_array[byte_idx] |= mask
                self.set_bits_count += 1
        self.count += 1

    def contains(self, item: str) -> bool:
        """
        Queries if an item is likely in the set.

        Returns:
            True: Item is PROBABLY in the set (subject to false-positive probability p).
            False: Item is DEFINITELY NOT in the set (0% false negative rate).
        """
        for bit_idx in self._get_bit_indices(item):
            byte_idx = bit_idx >> 3
            bit_offset = bit_idx & 7
            if not (self.bit_array[byte_idx] & (1 << bit_offset)):
                return False
        return True

    def check_and_add(self, item: str) -> bool:
        """
        Atomic query-and-insert for streaming pipelines.

        Returns:
            True if the account was ALREADY in the filter (known account).
            False if the account was NOT in the filter (new account alert) and adds it.
        """
        already_present = self.contains(item)
        if not already_present:
            self.add(item)
        return already_present

    @property
    def fill_rate(self) -> float:
        """Proportion of bits set to 1 in the bit array (saturation metric)."""
        return self.set_bits_count / self.m if self.m > 0 else 0.0

    @property
    def current_false_positive_rate(self) -> float:
        """
        Theoretical false-positive rate given the current number of set bits:
            P_fp ≈ (set_bits / m)^k
        Or from number of inserted elements n':
            P_fp ≈ (1 - exp(-k * n' / m))^k
        """
        if self.m == 0:
            return 1.0
        # Empirical approximation based on active bit density
        return (self.fill_rate) ** self.k

    def get_stats(self) -> Dict[str, Any]:
        """Returns diagnostic statistics for viva defense and live dashboard HUD."""
        return {
            "expected_elements": self.n,
            "target_false_positive_rate": self.p,
            "bit_array_size_m": self.m,
            "hash_functions_count_k": self.k,
            "inserted_count": self.count,
            "set_bits_count": self.set_bits_count,
            "fill_rate": round(self.fill_rate, 4),
            "estimated_current_fpr": round(self.current_false_positive_rate, 6),
            "memory_usage_bytes": self.byte_count,
        }

    def reset(self) -> None:
        """Clears the bit array and resets counters."""
        for i in range(len(self.bit_array)):
            self.bit_array[i] = 0
        self.count = 0
        self.set_bits_count = 0
