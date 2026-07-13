# 24-week curriculum · Chương trình 24 tuần

Recommended pace: 7–10 hours/week. Each week follows **concept → implementation → exercises → explanation**.

Nhịp học đề xuất: 7–10 giờ/tuần. Mỗi tuần theo vòng lặp **khái niệm → cài đặt → bài tập → giải thích**.

## Phase 1 — Foundations · Nền tảng (Weeks 1–4)

### Week 1 — Programming model · Mô hình lập trình

- Values, variables, control flow, functions, scope, mutation.
- Giá trị, biến, luồng điều khiển, hàm, phạm vi, thay đổi trạng thái.
- Lab: implement linear search, maximum, frequency counter.
- Thực hành: cài đặt tìm kiếm tuyến tính, giá trị lớn nhất, đếm tần suất.

### Week 2 — Complexity · Độ phức tạp

- Big O, Ω, Θ; best/average/worst case; amortized analysis.
- Big O, Ω, Θ; trường hợp tốt/trung bình/xấu nhất; phân tích khấu hao.
- Learn the common order: `1 < log n < n < n log n < n² < 2ⁿ < n!`.

### Week 3 — Recursion and proof · Đệ quy và chứng minh

- Base case, recursive case, call stack, induction, loop invariants.
- Điều kiện dừng, bước đệ quy, call stack, quy nạp, bất biến vòng lặp.
- Lab: factorial, Fibonacci with memoization, binary search.

### Week 4 — Math toolkit · Công cụ toán

- Logic, sets, functions, combinatorics, probability, vectors, matrices.
- Logic, tập hợp, hàm, tổ hợp, xác suất, vector, ma trận.

## Phase 2 — Data structures · Cấu trúc dữ liệu (Weeks 5–8)

### Week 5 — Sequential structures · Cấu trúc tuần tự

- Arrays, dynamic arrays, strings, linked lists.
- Mảng, mảng động, chuỗi, danh sách liên kết.
- Patterns: two pointers, prefix sums, sliding window.

### Week 6 — Restricted access · Truy cập có giới hạn

- Stack, queue, deque, monotonic stack/queue.
- Ngăn xếp, hàng đợi, deque, stack/queue đơn điệu.
- Applications: parsing, undo, BFS, scheduling, next-greater element.

### Week 7 — Hashing · Băm

- Hash functions, collisions, chaining, open addressing, load factor.
- Hàm băm, xung đột, chaining, open addressing, hệ số tải.
- Understand expected `O(1)` versus worst-case `O(n)`.

### Week 8 — Trees and heaps · Cây và heap

- Binary trees, BST, balanced trees, trie, segment tree, Fenwick tree, heap.
- Cây nhị phân, BST, cây cân bằng, trie, segment tree, Fenwick tree, heap.

## Phase 3 — Algorithmic patterns · Mẫu thuật toán (Weeks 9–12)

### Week 9 — Search and sort · Tìm kiếm và sắp xếp

- Linear/binary search; bubble, insertion, selection, merge, quick, heap, counting, radix sort.
- Compare stability, in-place behavior, worst-case guarantees, and data assumptions.
- So sánh tính ổn định, in-place, bảo đảm trường hợp xấu nhất và giả định dữ liệu.

### Week 10 — Graphs · Đồ thị

- Representation, BFS, DFS, topological sort, connected components.
- Biểu diễn, BFS, DFS, sắp xếp topo, thành phần liên thông.
- Shortest path: Dijkstra, Bellman–Ford, Floyd–Warshall, A*.
- Minimum spanning tree: Kruskal, Prim; connectivity: union-find.

### Week 11 — Greedy and divide-conquer · Tham lam và chia để trị

- Exchange arguments, interval scheduling, Huffman coding.
- Lập luận trao đổi, lập lịch khoảng, mã hóa Huffman.
- Divide, solve, combine: merge sort, quicksort, closest pair.

### Week 12 — Dynamic programming · Quy hoạch động

- State, transition, base case, evaluation order, reconstruction.
- Trạng thái, chuyển trạng thái, cơ sở, thứ tự tính, truy vết.
- Problems: Fibonacci, knapsack, coin change, LCS, LIS, edit distance.

## Phase 4 — Systems and ML math · Hệ thống và toán ML (Weeks 13–16)

### Week 13 — Computer systems · Hệ thống máy tính

- Bits, memory hierarchy, CPU, processes, threads, synchronization.
- Bit, phân cấp bộ nhớ, CPU, tiến trình, luồng, đồng bộ hóa.

### Week 14 — Data and networks · Dữ liệu và mạng

- SQL, indexes/B-trees, transactions/ACID, HTTP, TCP/IP, DNS, caching.
- SQL, chỉ mục/B-tree, giao dịch/ACID, HTTP, TCP/IP, DNS, cache.

### Week 15 — Linear algebra and calculus · Đại số tuyến tính và giải tích

- Dot products, matrix multiplication, rank, eigenvectors, derivatives, chain rule.
- Tích vô hướng, nhân ma trận, hạng, vector riêng, đạo hàm, quy tắc chuỗi.

### Week 16 — Probability and optimization · Xác suất và tối ưu

- Random variables, expectation, variance, Bayes rule, likelihood.
- Biến ngẫu nhiên, kỳ vọng, phương sai, định lý Bayes, likelihood.
- Gradient descent, SGD, momentum, convexity, regularization.

## Phase 5 — Classical machine learning · Học máy cổ điển (Weeks 17–20)

### Week 17 — ML workflow · Quy trình ML

- Problem framing, train/validation/test splits, leakage, baselines.
- Định nghĩa bài toán, chia train/validation/test, rò rỉ dữ liệu, baseline.
- Bias–variance, under/overfitting, cross-validation, feature engineering.

### Week 18 — Supervised models · Mô hình có giám sát

- Linear and logistic regression, k-NN, Naive Bayes, SVM.
- Loss functions, regularization, calibration, interpretability.
- Hàm mất mát, regularization, calibration, khả năng giải thích.

### Week 19 — Trees and ensembles · Cây và ensemble

- Decision trees, random forests, bagging, AdaBoost, gradient boosting.
- Understand split criteria, feature importance, and leakage risks.
- Hiểu tiêu chí chia, độ quan trọng đặc trưng và nguy cơ rò rỉ.

### Week 20 — Unsupervised learning · Học không giám sát

- k-means, hierarchical clustering, DBSCAN, PCA, anomaly detection.
- Evaluate clusters cautiously: useful structure is task-dependent.
- Đánh giá cụm thận trọng: cấu trúc hữu ích phụ thuộc bài toán.

## Phase 6 — Deep learning and capstone · Học sâu và đồ án (Weeks 21–24)

### Week 21 — Neural networks · Mạng nơ-ron

- Perceptron, activations, loss, backpropagation, initialization, normalization.
- Perceptron, activation, loss, lan truyền ngược, khởi tạo, chuẩn hóa.

### Week 22 — Architectures · Kiến trúc

- CNNs for spatial data; RNN/LSTM/GRU for sequences; attention.
- CNN cho dữ liệu không gian; RNN/LSTM/GRU cho chuỗi; attention.

### Week 23 — Transformers and modern ML · Transformer và ML hiện đại

- Tokenization, embeddings, self-attention, positional information, pretraining, fine-tuning, retrieval.
- Tokenization, embedding, self-attention, thông tin vị trí, pretrain, fine-tune, truy xuất.

### Week 24 — Evaluation and capstone · Đánh giá và đồ án

- Classification: precision, recall, F1, ROC-AUC, PR-AUC, calibration.
- Regression: MAE, MSE/RMSE, R²; ranking/retrieval: MAP, MRR, nDCG.
- Reproducibility, monitoring, drift, fairness, privacy, safety, documentation.
- Tái lập, giám sát, drift, công bằng, riêng tư, an toàn, tài liệu hóa.

## Capstone definition · Định nghĩa đồ án

Build one end-to-end project with:

1. a clearly stated user problem / bài toán người dùng rõ ràng;
2. a simple baseline / baseline đơn giản;
3. a justified data structure and algorithm / cấu trúc dữ liệu và thuật toán có lý do;
4. a reproducible evaluation / đánh giá có thể tái lập;
5. error analysis in English and Vietnamese / phân tích lỗi bằng tiếng Anh và tiếng Việt;
6. a short ethics and failure-mode note / ghi chú về đạo đức và trường hợp thất bại.

