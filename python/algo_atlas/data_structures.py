"""Small data structures for learning / Cấu trúc dữ liệu để học."""

from collections import deque
from typing import Generic, TypeVar

T = TypeVar("T")


class Stack(Generic[T]):
    """LIFO stack with O(1) expected push/pop. / Stack LIFO với push/pop O(1) kỳ vọng."""

    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        if not self._items:
            raise IndexError("pop from empty stack")
        return self._items.pop()

    def __len__(self) -> int:
        return len(self._items)


class Queue(Generic[T]):
    """FIFO queue backed by deque. / Queue FIFO dùng deque."""

    def __init__(self) -> None:
        self._items: deque[T] = deque()

    def enqueue(self, item: T) -> None:
        self._items.append(item)

    def dequeue(self) -> T:
        if not self._items:
            raise IndexError("dequeue from empty queue")
        return self._items.popleft()

    def __len__(self) -> int:
        return len(self._items)


class DisjointSet(Generic[T]):
    """Union-find with path compression and union by rank. / DSU nén đường đi và union theo rank."""

    def __init__(self, items: list[T]) -> None:
        self.parent = {item: item for item in items}
        self.rank = {item: 0 for item in items}

    def find(self, item: T) -> T:
        if item not in self.parent:
            raise KeyError(item)
        if self.parent[item] != item:
            self.parent[item] = self.find(self.parent[item])
        return self.parent[item]

    def union(self, first: T, second: T) -> bool:
        root_a, root_b = self.find(first), self.find(second)
        if root_a == root_b:
            return False
        if self.rank[root_a] < self.rank[root_b]:
            root_a, root_b = root_b, root_a
        self.parent[root_b] = root_a
        if self.rank[root_a] == self.rank[root_b]:
            self.rank[root_a] += 1
        return True

