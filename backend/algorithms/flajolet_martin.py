"""
Flajolet-Martin (FM) Algorithm for Streaming Distinct Elements (Cardinality) Estimation.

================================================================================
VIVA & ORAL EXAM THEORETICAL FOUNDATION:
================================================================================
1. PROBLEM MOTIVATION:
   In high-frequency financial networks, monitoring the number of distinct transacting
   accounts in real time (e.g., in a sliding window of 50,000 transactions) is vital
   to detect:
   - Distributed bot attacks & credential stuffing (thousands of distinct origin accounts)
   - Sybil attacks / synthetic identity rings
   Exact counting with a HashSet requires O(N) memory, where N is the distinct account count.
   The Flajolet-Martin algorithm approximates distinct elements (F0 moment) using
   bounded sublinear memory O(log(N_max)) bits per hash function.

2. ALGORITHMIC MECHANISM:
   For an incoming account ID 'x':
   a. Hash 'x' to an L-bit binary integer using a 2-universal or uniform hash function h(x).
   b. Count the number of trailing zeros in the binary representation of h(x):
          rho(y) = number of trailing zeros in binary y
      Example:
          y = 12 (binary ...01100) -> 2 trailing zeros -> rho = 2
          y = 8  (binary ...01000) -> 3 trailing zeros -> rho = 3
   c. The probability that a hash value ends in at least r zeros is (1/2)^r.
      Therefore, observing an outcome with r trailing zeros implies that roughly
      2^r distinct elements have passed through the stream!
   d. Maintain R = max_{x in stream} rho(h(x)).
   e. Raw estimate = 2^R / phi, where phi ≈ 0.77351 is the Flajolet-Martin correction constant.

3. VARIANCE REDUCTION - Stochastic Averaging / Median of Means:
   A single hash function has high variance (its estimate is always a power of 2).
   To achieve high accuracy:
   a. We instantiate M independent hash functions (e.g., M = 32 or 64).
   b. Partition the M hash functions into 'num_groups' groups of size 'group_size'.
   c. For each group, compute the arithmetic mean of 2^R / phi.
   d. Take the MEDIAN across all groups to eliminate susceptibility to extreme outliers.
   This guarantees that the standard error is bounded by O(1 / sqrt(M)).

4. COMPLEXITY:
   - Update Time: O(M) operations per stream element (constant time, O(1) in stream size).
   - Space Complexity: M * O(log L) bits (e.g., 32 integers * 8 bits = 32 bytes!).
================================================================================
"""

import math
import hashlib
from typing import List, Dict, Any


class FlajoletMartin:
    # Flajolet-Martin bias correction factor phi ≈ 0.77351
    # Derived analytically by Philippe Flajolet and G. Nigel Martin (1985)
    PHI: float = 0.77351077

    def __init__(self, num_hashes: int = 32, num_groups: int = 4, hash_bits: int = 64):
        """
        Initialize the Flajolet-Martin cardinality estimator.

        :param num_hashes: Total number of independent hash functions (M). Default: 32.
        :param num_groups: Number of groups for median-of-means variance reduction. Default: 4.
        :param hash_bits: Bit length of the hash space (L). Default: 64 bits.
        """
        if num_hashes <= 0:
            raise ValueError("num_hashes must be positive.")
        if num_groups <= 0 or num_hashes % num_groups != 0:
            # Adjust num_groups if it doesn't divide evenly
            num_groups = max(1, min(num_groups, num_hashes))

        self.m: int = num_hashes
        self.num_groups: int = num_groups
        self.group_size: int = self.m // self.num_groups
        self.hash_bits: int = hash_bits

        # Independent hash seeds (a_i, b_i) for universal linear congruential hashing
        # h_i(x) = (a_i * hash(x) + b_i) mod 2^L
        self.seeds: List[int] = [
            (1000003 + i * 314159265 + (i * i * 7919)) & 0xFFFFFFFFFFFFFFFF
            for i in range(self.m)
        ]

        # Array holding the maximum trailing zeros observed by each hash function: R_i
        self.max_trailing_zeros: List[int] = [0] * self.m

        # Diagnostics: track total stream elements processed
        self.total_processed: int = 0

    @staticmethod
    def _count_trailing_zeros(value: int, max_bits: int = 64) -> int:
        """
        Computes rho(y): the count of trailing zero bits in the binary representation of value.
        Equivalent to __builtin_ctz in C/C++.
        """
        if value == 0:
            return max_bits
        # (value & -value) isolates the lowest set bit.
        # bit_length() - 1 gives the exact power of 2 / count of trailing zeros.
        lowest_set_bit = value & -value
        return lowest_set_bit.bit_length() - 1

    def _hash_element(self, element: str, hash_index: int) -> int:
        """
        Computes the hash value for an element using the hash_index-th independent hash function.
        Combines MD5 64-bit base digest with seed permutation.
        """
        # MD5 produces 128-bit digest, take upper 64 bits as base integer
        digest = hashlib.md5(element.encode("utf-8")).digest()
        base_int = int.from_bytes(digest[:8], byteorder="big", signed=False)
        seed = self.seeds[hash_index]
        # Linear Congruential Hash: h(x) = (base_int ^ seed) * 0x5deece66d + 0xb
        hashed = ((base_int ^ seed) * 6364136223846793005 + 1442695040888963407) & 0xFFFFFFFFFFFFFFFF
        return hashed

    def add(self, element: str) -> None:
        """
        Updates the FM sketch with an incoming account ID or element from the stream.
        """
        self.total_processed += 1
        for i in range(self.m):
            h_val = self._hash_element(element, i)
            trailing_zeros = self._count_trailing_zeros(h_val, self.hash_bits)
            if trailing_zeros > self.max_trailing_zeros[i]:
                self.max_trailing_zeros[i] = trailing_zeros

    def estimate(self) -> int:
        """
        Computes the estimated distinct element count using Median of Means.

        1. For each group of hash functions:
           Compute average of (2^R / phi).
        2. Take the median across the group averages.
        """
        if self.total_processed == 0:
            return 0

        group_estimates: List[float] = []

        for g in range(self.num_groups):
            start_idx = g * self.group_size
            end_idx = start_idx + self.group_size
            group_r_values = self.max_trailing_zeros[start_idx:end_idx]

            # Compute average of 2^R / phi within this group
            estimates = [(2 ** r) / self.PHI for r in group_r_values]
            group_avg = sum(estimates) / len(estimates)
            group_estimates.append(group_avg)

        # Sort group estimates to compute the median
        group_estimates.sort()
        mid = len(group_estimates) // 2
        if len(group_estimates) % 2 == 1:
            median_val = group_estimates[mid]
        else:
            median_val = (group_estimates[mid - 1] + group_estimates[mid]) / 2.0

        # Cardinality cannot exceed total processed transactions
        final_estimate = max(0, min(int(round(median_val)), self.total_processed))
        return final_estimate

    def get_stats(self) -> Dict[str, Any]:
        """Returns internal state and diagnostic statistics for dashboard HUD."""
        current_est = self.estimate()
        return {
            "num_hashes_m": self.m,
            "num_groups": self.num_groups,
            "group_size": self.group_size,
            "hash_bits": self.hash_bits,
            "phi_constant": self.PHI,
            "total_processed": self.total_processed,
            "estimated_distinct_accounts": current_est,
            "max_trailing_zeros_distribution": self.max_trailing_zeros,
            "theoretical_std_error": round(1.30 / math.sqrt(self.m), 4),
            "memory_usage_bytes": self.m * 4,  # e.g., 32 * 4 = 128 bytes
        }

    def reset(self) -> None:
        """Resets sketch registers and element count."""
        self.max_trailing_zeros = [0] * self.m
        self.total_processed = 0
