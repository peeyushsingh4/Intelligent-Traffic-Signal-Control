import pytest
from backend.algorithms.bloom_filter import BloomFilter


def test_bloom_filter_initialization():
    bf = BloomFilter(expected_elements=1000, false_positive_rate=0.01)
    assert bf.n == 1000
    assert bf.p == 0.01
    assert bf.m > 0
    assert bf.k >= 1
    assert bf.count == 0
    assert bf.fill_rate == 0.0


def test_bloom_filter_no_false_negatives():
    """Verify the fundamental Bloom Filter invariant: 0% false negatives."""
    bf = BloomFilter(expected_elements=500, false_positive_rate=0.01)
    test_accounts = [f"ACC_{i}" for i in range(200)]

    for acc in test_accounts:
        bf.add(acc)

    # Every inserted account MUST return True
    for acc in test_accounts:
        assert bf.contains(acc) is True, f"False negative detected for {acc}!"


def test_bloom_filter_check_and_add():
    bf = BloomFilter(expected_elements=500, false_positive_rate=0.01)

    # First time seeing acc1 -> should return False (new account) and add it
    assert bf.check_and_add("ACC_FIRST") is False

    # Second time seeing acc1 -> should return True (already present)
    assert bf.check_and_add("ACC_FIRST") is True
    assert bf.contains("ACC_FIRST") is True


def test_bloom_filter_false_positive_rate_bound():
    """Verify that false positive rate on unseen accounts remains near target p."""
    n = 2000
    target_p = 0.05
    bf = BloomFilter(expected_elements=n, false_positive_rate=target_p)

    inserted = [f"KNOWN_{i}" for i in range(n)]
    for item in inserted:
        bf.add(item)

    # Test on unseen elements
    unseen_test = [f"UNSEEN_{i}" for i in range(1000)]
    false_positives = sum(1 for item in unseen_test if bf.contains(item))
    empirical_fpr = false_positives / len(unseen_test)

    # Empirical FPR should be reasonably close to target (allow statistical wiggle room up to 3*p)
    assert empirical_fpr <= target_p * 3, f"FPR too high: {empirical_fpr} > {target_p * 3}"


def test_bloom_filter_reset():
    bf = BloomFilter(expected_elements=100, false_positive_rate=0.01)
    bf.add("ACC_1")
    assert bf.contains("ACC_1") is True
    bf.reset()
    assert bf.count == 0
    assert bf.set_bits_count == 0
    assert bf.contains("ACC_1") is False
