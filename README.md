# Algo Atlas · English / Tiếng Việt

A bilingual, open learning path for algorithms, data structures, machine learning, and the computer-science theory that connects them.

Lộ trình học mở, song ngữ về thuật toán, cấu trúc dữ liệu, học máy và các lý thuyết khoa học máy tính liên quan.

> This is a broad, growing map—not a promise that a finite repository can contain every algorithm ever invented.
>
> Đây là một bản đồ kiến thức rộng và luôn phát triển—không phải tuyên bố rằng một kho mã nguồn hữu hạn có thể chứa mọi thuật toán từng được phát minh.

## Start here · Bắt đầu tại đây

1. Read [the 24-week curriculum](./CURRICULUM.md).
2. Run the examples: `python3 -m unittest discover -s python/tests -v`.
3. Pick one function in `python/algo_atlas`, hide its implementation, and rebuild it.
4. Explain the invariant and complexity aloud in both English and Vietnamese.

## Knowledge map · Bản đồ kiến thức

| Track | English | Tiếng Việt |
|---|---|---|
| 01 | Programming, Big O, recursion, discrete math | Lập trình, Big O, đệ quy, toán rời rạc |
| 02 | Arrays, linked lists, stacks, queues, hashes, trees | Mảng, danh sách liên kết, stack, queue, hash, cây |
| 03 | Search, sorting, divide-and-conquer, greedy, dynamic programming | Tìm kiếm, sắp xếp, chia để trị, tham lam, quy hoạch động |
| 04 | Graphs, databases, operating systems, networks, distributed systems | Đồ thị, cơ sở dữ liệu, hệ điều hành, mạng, hệ phân tán |
| 05 | Linear models, trees, ensembles, SVM, clustering, PCA | Mô hình tuyến tính, cây, ensemble, SVM, phân cụm, PCA |
| 06 | Neural networks, CNN, sequence models, attention, transformers, MLOps | Mạng nơ-ron, CNN, mô hình chuỗi, attention, transformer, MLOps |

## Repository · Kho mã nguồn

```text
.
├── app/                         # Bilingual learning website / Website học song ngữ
├── python/
│   ├── algo_atlas/
│   │   ├── algorithms.py        # Search, sort, graph, dynamic programming
│   │   ├── data_structures.py   # Stack, queue, hash map, heap, union-find
│   │   └── machine_learning.py  # Gradient descent, k-means, metrics
│   └── tests/                   # Executable examples and edge cases
├── lessons/                     # Bilingual concept notes / Ghi chú khái niệm
└── CURRICULUM.md                # 24-week plan / Kế hoạch 24 tuần
```

## The learning loop · Vòng lặp học tập

For every topic, answer four questions:

1. **Contract:** What problem does it solve? / Nó giải quyết bài toán gì?
2. **Invariant:** What remains true at every step? / Điều gì luôn đúng ở mỗi bước?
3. **Cost:** What are the time and space complexities? / Độ phức tạp thời gian và bộ nhớ là gì?
4. **Trade-off:** When should you not use it? / Khi nào không nên dùng?

## Run locally · Chạy trên máy

Website:

```bash
npm install
npm run dev
```

Interactive API:

```text
GET  /api/health
GET  /api/modules
GET  /api/modules/:slug
POST /api/modules/:slug/run
```

The API and the website use the same catalog in `app/lib/catalog.ts`. A run request accepts an action id and field values, then returns the executable trace: model, highlighted pseudocode lines, bilingual notes, variable watches, and total step count.

Python examples:

```bash
python3 -m unittest discover -s python/tests -v
```

## Study principles · Nguyên tắc học

- Implement before importing. / Tự cài đặt trước khi dùng thư viện.
- Test empty, one-item, duplicate, and extreme inputs. / Kiểm thử dữ liệu rỗng, một phần tử, trùng lặp và cực trị.
- Compare alternatives on the same input. / So sánh các giải pháp trên cùng dữ liệu.
- Prefer understanding over memorization. / Ưu tiên hiểu bản chất hơn ghi nhớ.
- Build one capstone that combines data, algorithms, and evaluation. / Làm một đồ án kết hợp dữ liệu, thuật toán và đánh giá.

## License and contributions · Giấy phép và đóng góp

Use these notes for learning, adapt them, and open an issue or pull request when an explanation can be clearer. Vietnamese terminology follows common university usage, with English terms retained where they are standard in industry.

Hãy dùng, chỉnh sửa và gửi issue hoặc pull request khi một phần giải thích có thể rõ hơn. Thuật ngữ tiếng Việt theo cách dùng phổ biến ở đại học; thuật ngữ tiếng Anh được giữ lại khi là chuẩn trong ngành.
