"""Dependency-free ML building blocks / Khối xây dựng ML không cần thư viện ngoài."""

from math import sqrt
from random import Random
from typing import Callable, Sequence


def gradient_descent(
    parameters: Sequence[float],
    gradient: Callable[[list[float]], Sequence[float]],
    learning_rate: float = 0.01,
    steps: int = 1_000,
) -> list[float]:
    """Minimize an objective using fixed-step gradient descent. / Tối ưu bằng hạ gradient bước cố định."""
    if learning_rate <= 0 or steps < 0:
        raise ValueError("learning_rate must be positive and steps non-negative")
    current = list(parameters)
    for _ in range(steps):
        change = list(gradient(current))
        if len(change) != len(current):
            raise ValueError("gradient dimension mismatch")
        current = [value - learning_rate * delta for value, delta in zip(current, change)]
    return current


def mean_squared_error(actual: Sequence[float], predicted: Sequence[float]) -> float:
    """Average squared prediction error. / Trung bình bình phương sai số."""
    if len(actual) != len(predicted) or not actual:
        raise ValueError("inputs must have the same non-zero length")
    return sum((truth - guess) ** 2 for truth, guess in zip(actual, predicted)) / len(actual)


def accuracy(actual: Sequence[int], predicted: Sequence[int]) -> float:
    """Fraction of exactly correct labels. / Tỷ lệ nhãn dự đoán chính xác."""
    if len(actual) != len(predicted) or not actual:
        raise ValueError("inputs must have the same non-zero length")
    return sum(truth == guess for truth, guess in zip(actual, predicted)) / len(actual)


def k_means(
    points: Sequence[Sequence[float]],
    k: int,
    *,
    max_iterations: int = 100,
    seed: int = 0,
) -> tuple[list[list[float]], list[int]]:
    """Cluster numeric points with Lloyd's algorithm. / Phân cụm điểm bằng thuật toán Lloyd."""
    if not points or not 0 < k <= len(points):
        raise ValueError("k must be between 1 and number of points")
    dimension = len(points[0])
    if dimension == 0 or any(len(point) != dimension for point in points):
        raise ValueError("points must share a non-zero dimension")

    rng = Random(seed)
    centers = [list(point) for point in rng.sample(list(points), k)]
    labels = [-1] * len(points)

    def squared_distance(first: Sequence[float], second: Sequence[float]) -> float:
        return sum((a - b) ** 2 for a, b in zip(first, second))

    for _ in range(max_iterations):
        next_labels = [
            min(range(k), key=lambda cluster: squared_distance(point, centers[cluster]))
            for point in points
        ]
        if next_labels == labels:
            break
        labels = next_labels
        for cluster in range(k):
            members = [point for point, label in zip(points, labels) if label == cluster]
            if members:
                centers[cluster] = [
                    sum(point[axis] for point in members) / len(members)
                    for axis in range(dimension)
                ]
    return centers, labels


def euclidean_distance(first: Sequence[float], second: Sequence[float]) -> float:
    """Euclidean distance helper. / Khoảng cách Euclid."""
    if len(first) != len(second):
        raise ValueError("dimension mismatch")
    return sqrt(sum((a - b) ** 2 for a, b in zip(first, second)))

