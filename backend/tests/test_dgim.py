import pytest
from backend.algorithms.dgim import DGIM


def test_dgim_bucket_powers_of_two():
    """Verify DGIM ensures all buckets have sizes that are powers of 2."""
    dgim = DGIM(window_size=100, high_value_threshold=1000.0)

    # Add several 1s
    for _ in range(25):
        dgim.add(True)

    for bucket in dgim.buckets:
        # Check power of 2: (size & (size - 1)) == 0 and size > 0
        assert (bucket.size & (bucket.size - 1)) == 0 and bucket.size > 0


def test_dgim_at_most_two_buckets_per_size():
    """Verify Invariant 3: At most 2 buckets of any given size."""
    dgim = DGIM(window_size=200, high_value_threshold=1000.0)

    for _ in range(50):
        dgim.add(True)

    size_counts = {}
    for bucket in dgim.buckets:
        size_counts[bucket.size] = size_counts.get(bucket.size, 0) + 1

    for size, count in size_counts.items():
        assert count <= 2, f"Found {count} buckets of size {size}, maximum allowed is 2!"


def test_dgim_window_expiration():
    """Verify buckets older than window size N are dropped."""
    window_n = 20
    dgim = DGIM(window_size=window_n, high_value_threshold=500.0)

    # Push 5 ones
    for _ in range(5):
        dgim.add(True)

    # Push window_n zeros
    for _ in range(window_n + 5):
        dgim.add(False)

    # All initial 1s should have expired out of the window
    assert dgim.count_in_window() == 0
    assert len(dgim.buckets) == 0


def test_dgim_relative_error_bound():
    """Verify DGIM relative error is strictly bounded <= 50% on test bit sequence."""
    window_n = 200
    dgim = DGIM(window_size=window_n, high_value_threshold=1000.0)

    # Feed sequence with alternating patterns
    pattern = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0] * 20
    for bit in pattern:
        dgim.add(bool(bit))

    estimated = dgim.count_in_window()
    exact = dgim.get_exact_count()

    assert exact > 0
    rel_error = abs(estimated - exact) / exact
    # Theoretical DGIM relative error bound is <= 50%
    assert rel_error <= 0.50, f"Relative error {rel_error:.2%} exceeded 50% bound!"


def test_dgim_add_transaction_threshold():
    dgim = DGIM(window_size=50, high_value_threshold=200000.0)

    assert dgim.add_transaction(150000.0) is False  # Below threshold
    assert dgim.add_transaction(250000.0) is True   # Above threshold
    assert dgim.count_in_window() == 1
