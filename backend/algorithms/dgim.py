"""
DGIM (Datar-Gionis-Indyk-Motwani) Algorithm for Sliding-Window Stream Counting.

================================================================================
VIVA & ORAL EXAM THEORETICAL FOUNDATION:
================================================================================
1. PROBLEM MOTIVATION:
   In financial fraud detection, anti-money laundering (AML) regulations require
   monitoring the velocity of "High-Value Transactions" (e.g. transfers exceeding
   $200,000) over a sliding window of the last N transactions (e.g. N = 10,000).
   - Naive Solution: Store the last N bits (1 if amount > $200k, 0 otherwise) in an
     array and sum them. This requires O(N) memory.
   - DGIM Solution: Approximates the count of 1s in the sliding window of size N
     using O(log^2 N) bits of memory, with a mathematically guaranteed relative
     error bounded by at most 50% (or 1/r for configurable r).

2. ALGORITHM INVARIANTS & RULES:
   - Stream model: A stream of bits arrives sequentially {0, 1}.
   - Buckets: A bucket is represented as `(timestamp, size)` where:
       * `size` is strictly a power of 2 (1, 2, 4, 8, 16, ...).
       * `timestamp` is the arrival index of the most recent 1 in that bucket.
   - Invariant 1 (Power of 2): Bucket sizes are powers of 2.
   - Invariant 2 (Monotonicity): Buckets are stored from newest to oldest in
     non-decreasing order of size.
   - Invariant 3 (Count Constraint): For any size 2^j, there are at most 2 buckets
     (and at least 1, up to the maximum size bucket). There are NEVER 3 buckets of
     the same size.
   - Invariant 4 (Sliding Window Expiration): Any bucket whose timestamp falls
     strictly outside the window [current_time - N + 1, current_time] is dropped.

3. INSERTION & MERGE CASCADE:
   When a new bit arrives at time t:
   a. If the bit is 0: No new bucket is created. Check and evict expired buckets.
   b. If the bit is 1:
      i. Create a new bucket of size 1 with timestamp t.
      ii. Prepend it to the bucket list.
      iii. If there are now 3 buckets of size 1:
           Merge the OLDEST TWO buckets of size 1 into a single bucket of size 2.
           The merged bucket takes the timestamp of the newer of the two.
      iv. Repeat this check for size 2, 4, 8, ... (cascading merge) until no size
          has 3 buckets.
   c. Evict any bucket whose timestamp is older than (t - N).

4. QUERYING COUNT IN WINDOW k (where k <= N):
   To estimate the number of 1s in the last k transactions:
   a. Sum the sizes of all buckets whose timestamp is >= (current_time - k + 1),
      EXCEPT the oldest bucket that overlaps the boundary.
   b. Add HALF the size of the oldest overlapping bucket (since at least one of its
      1s fell inside the window, and at most all of them).
   c. Theoretical Error Bound:
      Max Error <= (Oldest Bucket Size / 2) / (Total Actual 1s) <= 50%.

5. COMPLEXITY:
   - Space Complexity: O(log^2 N) bits. For N = 1,000,000, log2(N) ≈ 20.
     There are at most 2 * 20 = 40 buckets, requiring negligible memory (~1 KB).
   - Time Complexity: O(1) amortized insertion per stream bit; O(log N) query time.
================================================================================
"""

from typing import List, Dict, Any


class Bucket:
    __slots__ = ("timestamp", "size")

    def __init__(self, timestamp: int, size: int):
        self.timestamp: int = timestamp
        self.size: int = size

    def __repr__(self) -> str:
        return f"Bucket(ts={self.timestamp}, size={self.size})"


class DGIM:
    def __init__(self, window_size: int = 10000, high_value_threshold: float = 200000.0):
        """
        Initialize the DGIM stream counter.

        :param window_size: (N) Maximum sliding window length in transactions.
        :param high_value_threshold: Minimum transaction amount classified as '1'.
        """
        if window_size <= 0:
            raise ValueError("window_size must be a positive integer.")

        self.N: int = window_size
        self.threshold: float = high_value_threshold

        # Buckets maintained in order from newest (index 0) to oldest (index -1)
        self.buckets: List[Bucket] = []

        # Monotonic stream clock
        self.current_time: int = 0

        # Exact counter inside window (for live empirical accuracy comparison in dashboard)
        self.exact_window_history: List[int] = []

    def add_transaction(self, amount: float) -> bool:
        """
        Convenience wrapper: evaluates if transaction amount is high-value
        and pushes corresponding bit into the DGIM stream.

        Returns True if transaction is high-value (bit 1), False otherwise (bit 0).
        """
        is_high_value = amount >= self.threshold
        self.add(is_high_value)
        return is_high_value

    def add(self, bit: bool) -> None:
        """
        Inserts a single bit (True/1 or False/0) into the DGIM sliding window.
        """
        self.current_time += 1
        bit_val = 1 if bit else 0

        # Maintain exact window queue for viva comparison proofs
        self.exact_window_history.append(bit_val)
        if len(self.exact_window_history) > self.N:
            self.exact_window_history.pop(0)

        # Invariant 4: Prune expired buckets older than current_time - N
        self._prune_expired()

        if not bit:
            # Bit is 0; no new bucket created
            return

        # Bit is 1: Create and prepend new bucket of size 1 at current_time
        new_bucket = Bucket(timestamp=self.current_time, size=1)
        self.buckets.insert(0, new_bucket)

        # Enforce Invariant 3: At most 2 buckets of any size. Cascade merges if 3 exist.
        self._cascade_merge()

    def _cascade_merge(self) -> None:
        """
        Iterates through buckets. If three consecutive buckets have the same size 2^j,
        merges the oldest two into a single bucket of size 2^(j+1).
        """
        i = 0
        while i < len(self.buckets) - 2:
            # Check if 3 consecutive buckets have identical size
            b1 = self.buckets[i]
            b2 = self.buckets[i + 1]
            b3 = self.buckets[i + 2]

            if b1.size == b2.size == b3.size:
                # Merge the oldest two (b2 and b3)
                # Merged bucket takes the timestamp of b2 (the newer of the two merged)
                # and double the size
                merged_bucket = Bucket(timestamp=b2.timestamp, size=b2.size * 2)
                # Replace b2 and b3 with merged_bucket
                self.buckets[i + 1] = merged_bucket
                del self.buckets[i + 2]
                # Re-check from current index or continue cascade
                # Do not increment i, as the merged bucket may trigger another cascade
            else:
                i += 1

    def _prune_expired(self) -> None:
        """Evicts any buckets whose timestamps are strictly outside [current_time - N + 1, current_time]."""
        cutoff_time = self.current_time - self.N
        while self.buckets and self.buckets[-1].timestamp <= cutoff_time:
            self.buckets.pop()

    def count_in_window(self, k: int = None) -> int:
        """
        Estimates the count of 1s (high-value transactions) in the last k stream elements.
        If k is None, defaults to the full window size N.

        :param k: Window length to query (1 <= k <= N).
        :return: Estimated count of 1s with relative error <= 50%.
        """
        if not self.buckets or self.current_time == 0:
            return 0

        if k is None or k > self.N:
            k = self.N
        k = max(1, k)

        cutoff_time = self.current_time - k
        total_estimate: int = 0
        last_overlapping_bucket: Bucket = None

        for b in self.buckets:
            if b.timestamp > cutoff_time:
                # Fully inside query window
                total_estimate += b.size
                last_overlapping_bucket = b
            else:
                # First bucket outside or overlapping cutoff
                last_overlapping_bucket = b
                break

        # If a boundary bucket was included, subtract half its size as the DGIM boundary estimator
        if last_overlapping_bucket is not None and last_overlapping_bucket.timestamp > cutoff_time:
            # If the oldest bucket in the window partially overlaps the earliest edge
            total_estimate -= (last_overlapping_bucket.size // 2)

        return max(0, total_estimate)

    def get_exact_count(self) -> int:
        """Returns the ground-truth exact count of 1s in the current sliding window."""
        return sum(self.exact_window_history)

    def get_stats(self) -> Dict[str, Any]:
        """Returns diagnostic data, bucket breakdown, and empirical error metrics."""
        estimated = self.count_in_window()
        exact = self.get_exact_count()
        abs_error = abs(estimated - exact)
        rel_error = (abs_error / exact) if exact > 0 else 0.0

        # Bucket distribution by size
        size_counts: Dict[int, int] = {}
        for b in self.buckets:
            size_counts[b.size] = size_counts.get(b.size, 0) + 1

        return {
            "window_size_n": self.N,
            "high_value_threshold": self.threshold,
            "current_time": self.current_time,
            "total_active_buckets": len(self.buckets),
            "estimated_high_value_count": estimated,
            "exact_high_value_count": exact,
            "absolute_error": abs_error,
            "relative_error_pct": round(rel_error * 100, 2),
            "theoretical_max_error_pct": 50.0,
            "bucket_sizes_breakdown": size_counts,
            "memory_usage_bytes": len(self.buckets) * 16,  # ~16 bytes per Bucket object
        }

    def reset(self) -> None:
        """Resets stream time and clears all buckets."""
        self.buckets.clear()
        self.current_time = 0
        self.exact_window_history.clear()
