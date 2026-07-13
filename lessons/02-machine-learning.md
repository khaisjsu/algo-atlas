# Machine learning mental models · Mô hình tư duy học máy

## Supervised learning · Học có giám sát

**EN:** Learn a function from examples `(x, y)`. Training minimizes an objective on known examples; evaluation estimates performance on unseen examples.

**VI:** Học một hàm từ các ví dụ `(x, y)`. Huấn luyện tối thiểu hóa hàm mục tiêu trên dữ liệu đã biết; đánh giá ước lượng hiệu quả trên dữ liệu chưa thấy.

`model + loss + optimizer + data = training system`

## The essential algorithms · Các thuật toán thiết yếu

| Family | Mental model / Mô hình tư duy | Typical trade-off / Đánh đổi |
|---|---|---|
| Linear regression | Fit a weighted plane / Khớp một siêu phẳng có trọng số | Simple, sensitive to assumptions / Đơn giản, nhạy với giả định |
| Logistic regression | Linear score → probability / Điểm tuyến tính → xác suất | Interpretable boundary / Biên dễ giải thích |
| k-NN | Nearby examples vote / Ví dụ lân cận bỏ phiếu | Cheap training, expensive prediction / Train rẻ, dự đoán đắt |
| Decision tree | Repeated feature splits / Chia lặp theo đặc trưng | Interpretable, can overfit / Dễ hiểu, dễ overfit |
| Random forest | Average many varied trees / Trung bình nhiều cây khác nhau | Robust, larger model / Ổn định, mô hình lớn |
| Gradient boosting | Add models that correct errors / Thêm mô hình sửa lỗi | Powerful, tuning-sensitive / Mạnh, nhạy tham số |
| SVM | Maximize margin / Tối đa hóa lề | Strong geometry, scaling matters / Hình học tốt, cần scale |
| k-means | Alternate assign/update / Luân phiên gán/cập nhật | Fast, assumes compact clusters / Nhanh, giả định cụm gọn |
| PCA | Keep high-variance directions / Giữ hướng phương sai cao | Compression, linear only / Nén, chỉ tuyến tính |
| Neural network | Compose learned transforms / Kết hợp các phép biến đổi học được | Flexible, data/compute hungry / Linh hoạt, cần dữ liệu/tính toán |

## Evaluation before sophistication · Đánh giá trước độ phức tạp

Start with a baseline. Pick a metric that matches the real cost of errors. Keep the test set untouched until the end. Inspect failures by subgroup, not only one average number.

Bắt đầu bằng baseline. Chọn metric phản ánh chi phí lỗi thực tế. Giữ test set nguyên vẹn đến cuối. Phân tích lỗi theo từng nhóm, không chỉ một con số trung bình.

## Exercise · Bài tập

Choose a prediction problem. Write: target, unit of observation, available-at-prediction-time features, split strategy, baseline, primary metric, and the cost of false positives versus false negatives.

Chọn một bài toán dự đoán. Viết rõ: mục tiêu, đơn vị quan sát, đặc trưng có sẵn lúc dự đoán, cách chia dữ liệu, baseline, metric chính và chi phí của false positive so với false negative.

