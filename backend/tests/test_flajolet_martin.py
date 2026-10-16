import pytest
from backend.algorithms.flajolet_martin import FlajoletMartin


def test_flajolet_martin_trailing_zeros():
    # 12 (binary 1100) -> 2 trailing zeros
    assert FlajoletMartin._count_trailing_zeros(12) == 2
    # 8 (binary 1000) -> 3 trailing zeros
    assert FlajoletMartin._count_trailing_zeros(8) == 3
    # 1 (binary 1) -> 0 trailing zeros
    assert FlajoletMartin._count_trailing_zeros(1) == 0
    # 0 -> 64
    assert FlajoletMartin._count_trailing_zeros(0, 64) == 64


def test_flajolet_martin_empty():
    fm = FlajoletMartin(num_hashes=32, num_groups=4)
    assert fm.estimate() == 0
    assert fm.total_processed == 0


def test_flajolet_martin_estimate_scale():
    """Verify FM distinct count approximates true cardinality within statistical factor."""
    fm = FlajoletMartin(num_hashes=32, num_groups=4)
    distinct_count = 1000

    # Stream distinct elements
    for i in range(distinct_count):
        fm.add(f"ACCOUNT_{i}")

    # Re-stream duplicates to confirm it counts DISTINCT items
    for i in range(distinct_count // 2):
        fm.add(f"ACCOUNT_{i}")

    assert fm.total_processed == distinct_count + (distinct_count // 2)

    estimate = fm.estimate()
    # Flajolet-Martin is an asymptotic estimator.
    # For 1000 distinct items, estimate should fall within a factor of 0.3 to 3.0 of true value.
    assert distinct_count * 0.3 <= estimate <= distinct_count * 3.0, (
        f"FM estimate {estimate} diverged excessively from {distinct_count}"
    )


def test_flajolet_martin_stats():
    fm = FlajoletMartin(num_hashes=16, num_groups=4)
    fm.add("ACC_A")
    fm.add("ACC_B")
    stats = fm.get_stats()
    assert stats["num_hashes_m"] == 16
    assert stats["total_processed"] == 2
    assert "estimated_distinct_accounts" in stats
