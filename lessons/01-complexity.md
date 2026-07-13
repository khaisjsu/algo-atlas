# Complexity · Độ phức tạp

## The idea · Ý tưởng

**EN:** Complexity describes how an algorithm's resource use grows with input size `n`. It is a model of scale, not an exact runtime measurement.

**VI:** Độ phức tạp mô tả tài nguyên của thuật toán tăng như thế nào theo kích thước đầu vào `n`. Đây là mô hình về quy mô, không phải phép đo thời gian chạy chính xác.

## Three bounds · Ba cận

- `O(f(n))`: asymptotic upper bound / cận trên tiệm cận.
- `Ω(f(n))`: asymptotic lower bound / cận dưới tiệm cận.
- `Θ(f(n))`: tight asymptotic bound / cận tiệm cận chặt.

If a loop visits every item once, its time is `Θ(n)`. Saying only `O(n)` is valid but less precise.

Nếu một vòng lặp duyệt mỗi phần tử đúng một lần, thời gian là `Θ(n)`. Chỉ nói `O(n)` vẫn đúng nhưng kém chính xác hơn.

## Space matters · Bộ nhớ cũng quan trọng

Merge sort takes `Θ(n log n)` time and `Θ(n)` auxiliary space in its common array implementation. An in-place heap sort takes `Θ(n log n)` time and `Θ(1)` auxiliary space. Neither is universally “better.”

Merge sort thường cần thời gian `Θ(n log n)` và bộ nhớ phụ `Θ(n)`. Heap sort in-place cần thời gian `Θ(n log n)` và bộ nhớ phụ `Θ(1)`. Không thuật toán nào luôn “tốt hơn.”

## Exercise · Bài tập

For each snippet you write, identify input size, dominant operation, time, auxiliary space, and worst-case input.

Với mỗi đoạn mã, xác định kích thước đầu vào, thao tác chính, thời gian, bộ nhớ phụ và đầu vào xấu nhất.

