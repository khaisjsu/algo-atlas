import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from algo_atlas.algorithms import bfs, binary_search, dijkstra, merge_sort, zero_one_knapsack
from algo_atlas.data_structures import DisjointSet, Queue, Stack
from algo_atlas.machine_learning import accuracy, gradient_descent, k_means, mean_squared_error


class AlgorithmTests(unittest.TestCase):
    def test_binary_search_handles_found_and_missing(self):
        items = [1, 3, 5, 7, 9]
        self.assertEqual(binary_search(items, 7), 3)
        self.assertEqual(binary_search(items, 8), -1)

    def test_merge_sort_is_non_mutating(self):
        items = [4, 1, 3, 1, 2]
        self.assertEqual(merge_sort(items), [1, 1, 2, 3, 4])
        self.assertEqual(items, [4, 1, 3, 1, 2])

    def test_graph_algorithms(self):
        graph = {"A": ["B", "C"], "B": ["D"], "C": [], "D": []}
        self.assertEqual(list(bfs(graph, "A")), ["A", "B", "C", "D"])
        weighted = {"A": [("B", 2), ("C", 7)], "B": [("C", 1)], "C": []}
        self.assertEqual(dijkstra(weighted, "A")["C"], 3)

    def test_dynamic_programming(self):
        self.assertEqual(zero_one_knapsack(5, [2, 3, 4], [4, 5, 7]), 9)


class DataStructureTests(unittest.TestCase):
    def test_stack_queue_and_disjoint_set(self):
        stack = Stack[int]()
        stack.push(1); stack.push(2)
        self.assertEqual(stack.pop(), 2)
        queue = Queue[int]()
        queue.enqueue(1); queue.enqueue(2)
        self.assertEqual(queue.dequeue(), 1)
        groups = DisjointSet(["a", "b", "c"])
        self.assertTrue(groups.union("a", "b"))
        self.assertEqual(groups.find("a"), groups.find("b"))
        self.assertNotEqual(groups.find("a"), groups.find("c"))


class MachineLearningTests(unittest.TestCase):
    def test_gradient_descent_minimizes_quadratic(self):
        result = gradient_descent([8.0], lambda x: [2 * (x[0] - 3)], learning_rate=0.1, steps=100)
        self.assertAlmostEqual(result[0], 3.0, places=8)

    def test_metrics(self):
        self.assertEqual(mean_squared_error([1, 2], [1, 4]), 2)
        self.assertEqual(accuracy([1, 0, 1], [1, 1, 1]), 2 / 3)

    def test_k_means_separates_two_groups(self):
        centers, labels = k_means([[0, 0], [0, 1], [9, 9], [9, 8]], 2, seed=2)
        self.assertEqual(labels[0], labels[1])
        self.assertEqual(labels[2], labels[3])
        self.assertNotEqual(labels[0], labels[2])
        self.assertEqual(len(centers), 2)


if __name__ == "__main__":
    unittest.main()

