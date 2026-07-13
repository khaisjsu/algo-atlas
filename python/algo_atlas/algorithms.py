"""Core algorithms with bilingual docstrings / Thuật toán cốt lõi."""

from collections import deque
from heapq import heappop, heappush
from math import inf
from typing import Hashable, Iterable, Iterator, Mapping, Sequence, TypeVar

T = TypeVar("T")
Node = TypeVar("Node", bound=Hashable)


def binary_search(items: Sequence[T], target: T) -> int:
    """Return target index or -1. Input must be sorted. / Trả chỉ số hoặc -1; mảng phải được sắp xếp."""
    low, high = 0, len(items) - 1
    while low <= high:
        middle = low + (high - low) // 2
        if items[middle] == target:
            return middle
        if items[middle] < target:
            low = middle + 1
        else:
            high = middle - 1
    return -1


def merge_sort(items: Sequence[T]) -> list[T]:
    """Stable O(n log n) sort. / Sắp xếp ổn định O(n log n)."""
    if len(items) <= 1:
        return list(items)
    middle = len(items) // 2
    left = merge_sort(items[:middle])
    right = merge_sort(items[middle:])
    result: list[T] = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    return result + left[i:] + right[j:]


def bfs(graph: Mapping[Node, Iterable[Node]], start: Node) -> Iterator[Node]:
    """Yield reachable nodes layer by layer. / Trả các đỉnh theo từng lớp."""
    seen = {start}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        yield node
        for neighbor in graph.get(node, []):
            if neighbor not in seen:
                seen.add(neighbor)
                queue.append(neighbor)


def dijkstra(graph: Mapping[Node, Iterable[tuple[Node, float]]], start: Node) -> dict[Node, float]:
    """Shortest distances for non-negative edges. / Khoảng cách ngắn nhất khi trọng số không âm."""
    distances: dict[Node, float] = {node: inf for node in graph}
    distances[start] = 0.0
    heap: list[tuple[float, Node]] = [(0.0, start)]
    while heap:
        distance, node = heappop(heap)
        if distance != distances[node]:
            continue
        for neighbor, weight in graph.get(node, []):
            if weight < 0:
                raise ValueError("Dijkstra requires non-negative weights")
            candidate = distance + weight
            if candidate < distances.get(neighbor, inf):
                distances[neighbor] = candidate
                heappush(heap, (candidate, neighbor))
    return distances


def zero_one_knapsack(capacity: int, weights: Sequence[int], values: Sequence[int]) -> int:
    """Maximum 0/1 knapsack value in O(n·capacity). / Giá trị ba lô 0/1 lớn nhất."""
    if capacity < 0 or len(weights) != len(values):
        raise ValueError("invalid knapsack input")
    best = [0] * (capacity + 1)
    for weight, value in zip(weights, values):
        if weight <= 0:
            raise ValueError("weights must be positive")
        # Descending capacity is the invariant that prevents reusing an item.
        # Duyệt giảm dần để mỗi vật không bị dùng lại.
        for current in range(capacity, weight - 1, -1):
            best[current] = max(best[current], best[current - weight] + value)
    return best[capacity]

