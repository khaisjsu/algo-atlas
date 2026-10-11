import { ArrayTrace, createArrayAction, idleArray, markRange, toItems } from "../trace";
import type { Action, VizModule } from "../types";
import { b } from "../types";
import type { ArrayState, Item } from "../views";

type ArrModule = VizModule<Item[], ArrayState>;

const sortedSeed = () => toItems([3, 7, 9, 12, 15, 18, 22, 27, 31, 36, 40, 44, 51, 58]);

const targetField = (def: number, label = b("Target", "Giá trị cần tìm")) => ({ key: "target", label, kind: "number" as const, default: def, min: 0, max: 999 });

function arrayAction(id: string, label: ReturnType<typeof b>, code: string[], fields: Action<Item[], ArrayState>["fields"], body: (t: ArrayTrace, v: Record<string, string>) => void): Action<Item[], ArrayState> {
  return {
    id, label, code, fields,
    run(model, values) {
      const t = new ArrayTrace(model.slice());
      body(t, values);
      return { steps: t.steps, model };
    },
  };
}

/* ------------------------------------------------------------------ */

const binaryCode = [
  "lo = 0; hi = n - 1",
  "while lo <= hi",
  "  mid = lo + (hi - lo) / 2",
  "  if A[mid] == target: return mid",
  "  if A[mid] < target: lo = mid + 1",
  "  else: hi = mid - 1",
  "return -1   // not found",
];

const binary: ArrModule = {
  slug: "binary-search",
  title: b("Binary search", "Tìm kiếm nhị phân"),
  short: b("Halve a sorted search space every step.", "Chia đôi không gian tìm kiếm đã sắp xếp mỗi bước."),
  category: "searching",
  tags: ["O(log n)", "sorted input", "decrease & conquer"],
  intro: b(
    "Binary search finds a target in a sorted array by checking the middle and discarding the half that cannot contain it. Twenty steps are enough for a million items. More importantly, the same idea works on any monotone yes/no question — “binary search on the answer”.",
    "Tìm kiếm nhị phân tìm giá trị trong mảng đã sắp xếp bằng cách xét phần tử giữa và loại bỏ nửa không thể chứa nó. Hai mươi bước là đủ cho một triệu phần tử. Quan trọng hơn, ý tưởng này áp dụng cho mọi câu hỏi có/không đơn điệu — “tìm kiếm nhị phân trên đáp án”.",
  ),
  invariant: b(
    "If the target exists, it is inside A[lo..hi]. Every iteration shrinks that window by at least half.",
    "Nếu giá trị tồn tại, nó nằm trong A[lo..hi]. Mỗi vòng lặp thu hẹp cửa sổ ít nhất một nửa.",
  ),
  complexity: [
    { label: b("Time", "Thời gian"), value: "O(log n)" },
    { label: b("Space", "Bộ nhớ"), value: "O(1)" },
    { label: b("Needs", "Yêu cầu"), value: "sorted / monotone" },
  ],
  applications: [
    { title: b("Database indexes", "Chỉ mục cơ sở dữ liệu"), body: b("B-tree pages are searched with binary search; this is why indexed lookups stay fast on billions of rows.", "Các trang B-tree được tìm bằng tìm kiếm nhị phân; vì vậy tra cứu có chỉ mục vẫn nhanh trên hàng tỷ dòng.") },
    { title: b("git bisect", "git bisect"), body: b("Find the commit that introduced a bug among 1,000 commits in ~10 test runs.", "Tìm commit gây lỗi trong 1.000 commit chỉ với ~10 lần chạy thử.") },
    { title: b("Binary search on the answer", "Tìm nhị phân trên đáp án"), body: b("“Minimum ship capacity to deliver in D days”: if capacity C works, any larger C works too — so search for the smallest C.", "“Sức chở tối thiểu để giao trong D ngày”: nếu sức chở C được thì mọi C lớn hơn cũng được — nên tìm C nhỏ nhất.") },
    { title: b("Numerical methods", "Phương pháp số"), body: b("Bisection finds square roots and roots of continuous functions to any precision.", "Phương pháp chia đôi tìm căn bậc hai và nghiệm của hàm liên tục với độ chính xác tuỳ ý.") },
  ],
  recognize: [
    b("Input is sorted, or the answer space is monotone (feasible ⇒ larger is feasible).", "Dữ liệu đã sắp xếp, hoặc không gian đáp án đơn điệu (khả thi ⇒ lớn hơn cũng khả thi)."),
    b("Phrases like “minimum maximum”, “maximum minimum”, “first/last position”.", "Cụm từ như “nhỏ nhất của lớn nhất”, “lớn nhất của nhỏ nhất”, “vị trí đầu/cuối”."),
    b("Constraints up to 10⁹ with an O(n) check per guess.", "Ràng buộc tới 10⁹ với phép kiểm tra O(n) mỗi lần đoán."),
  ],
  pitfalls: [
    b("(lo + hi) / 2 overflows 32-bit ints; use lo + (hi − lo) / 2.", "(lo + hi) / 2 tràn số nguyên 32-bit; dùng lo + (hi − lo) / 2."),
    b("Off-by-one: decide if hi is inclusive and keep it consistent, or you loop forever.", "Lệch một: quyết định hi có bao gồm hay không và giữ nhất quán, nếu không sẽ lặp vô hạn."),
    b("It silently returns garbage on unsorted data.", "Trên dữ liệu chưa sắp xếp, nó âm thầm trả kết quả sai."),
  ],
  practice: [
    { name: "Binary Search (704)", url: "https://leetcode.com/problems/binary-search/", level: "Easy" },
    { name: "Find First and Last Position (34)", url: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/", level: "Medium" },
    { name: "Search in Rotated Sorted Array (33)", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/", level: "Medium" },
    { name: "Capacity To Ship Packages Within D Days (1011)", url: "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/", level: "Medium" },
    { name: "Median of Two Sorted Arrays (4)", url: "https://leetcode.com/problems/median-of-two-sorted-arrays/", level: "Hard" },
  ],
  python: `def binary_search(a, target):
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if a[mid] == target:
            return mid
        if a[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

# Binary search on the answer: smallest x with ok(x) True
def first_true(lo, hi, ok):
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid): hi = mid
        else:       lo = mid + 1
    return lo`,
  quiz: [
    {
      q: b("At most how many comparisons does binary search need for 1,000,000 sorted items?", "Tìm nhị phân cần tối đa bao nhiêu phép so sánh với 1.000.000 phần tử?"),
      options: [b("20", "20"), b("1,000", "1.000"), b("500,000", "500.000")],
      answer: 0,
      why: b("2²⁰ ≈ 1,048,576, so ⌈log₂ 10⁶⌉ = 20.", "2²⁰ ≈ 1.048.576 nên ⌈log₂ 10⁶⌉ = 20."),
    },
    {
      q: b("“Find the smallest speed so Koko eats all bananas in h hours.” Which technique?", "“Tìm tốc độ nhỏ nhất để Koko ăn hết chuối trong h giờ.” Dùng kỹ thuật nào?"),
      options: [b("Dynamic programming", "Quy hoạch động"), b("Binary search on the answer", "Tìm nhị phân trên đáp án"), b("BFS", "BFS")],
      answer: 1,
      why: b("If speed s works, every faster speed also works — a monotone predicate.", "Nếu tốc độ s được thì mọi tốc độ nhanh hơn cũng được — vị từ đơn điệu."),
    },
  ],
  view: "array",
  initial: sortedSeed,
  idle: (m) => idleArray(m),
  actions: [
    createArrayAction({ sorted: true, max: 24, defaultN: 14, hi: 80 }),
    arrayAction("search", b("Search", "Tìm"), binaryCode, [targetField(31)], (t, v) => {
      const target = Number(v.target);
      let lo = 0, hi = t.items.length - 1, steps = 0;
      const guide = { v: target, label: "target" };
      t.snap(0, b(`Search for ${target}. The whole array is the candidate range.`, `Tìm ${target}. Cả mảng là khoảng ứng viên.`), { range: [lo, hi], guide, pointers: [{ i: lo, label: "lo" }, { i: hi, label: "hi" }], vars: { target, lo, hi } });
      while (lo <= hi) {
        steps++;
        const mid = lo + ((hi - lo) >> 1);
        const x = t.v(mid);
        const ptr = [{ i: lo, label: "lo" }, { i: mid, label: "mid", tone: "pivot" as const }, { i: hi, label: "hi" }];
        t.snap([1, 2], b(`Window [${lo}, ${hi}] → check the middle, A[${mid}] = ${x}.`, `Cửa sổ [${lo}, ${hi}] → xét phần tử giữa, A[${mid}] = ${x}.`), { range: [lo, hi], guide, marks: { [mid]: "compare" }, pointers: ptr, vars: { target, lo, mid, hi, steps } });
        if (x === target) {
          t.snap(3, b(`Found ${target} at index ${mid} after ${steps} comparison${steps > 1 ? "s" : ""}.`, `Tìm thấy ${target} tại chỉ số ${mid} sau ${steps} phép so sánh.`), { guide, marks: { [mid]: "found" }, pointers: [{ i: mid, label: "mid", tone: "found" }], vars: { target, mid, steps } });
          return;
        }
        if (x < target) {
          t.snap(4, b(`${x} < ${target}, so the target is right of mid. Discard A[${lo}..${mid}].`, `${x} < ${target} nên giá trị nằm bên phải mid. Loại A[${lo}..${mid}].`), { range: [mid + 1, hi], guide, marks: markRange(lo, mid, "reject"), vars: { target, lo: mid + 1, hi, steps } });
          lo = mid + 1;
        } else {
          t.snap(5, b(`${x} > ${target}, so the target is left of mid. Discard A[${mid}..${hi}].`, `${x} > ${target} nên giá trị nằm bên trái mid. Loại A[${mid}..${hi}].`), { range: [lo, mid - 1], guide, marks: markRange(mid, hi, "reject"), vars: { target, lo, hi: mid - 1, steps } });
          hi = mid - 1;
        }
      }
      t.snap(6, b(`lo > hi: the window is empty, so ${target} is not in the array (${steps} comparisons).`, `lo > hi: cửa sổ rỗng nên ${target} không có trong mảng (${steps} phép so sánh).`), { guide, marks: markRange(0, t.items.length - 1, "dim"), vars: { target, lo, hi, steps } });
    }),
  ],
};

/* ------------------------------------------------------------------ */

const linearCode = [
  "for i = 0 to n-1",
  "  if A[i] == target: return i",
  "return -1",
];

const linear: ArrModule = {
  slug: "linear-search",
  title: b("Linear search", "Tìm kiếm tuyến tính"),
  short: b("Check every element until you find it.", "Kiểm tra từng phần tử cho đến khi tìm thấy."),
  category: "searching",
  tags: ["O(n)", "unsorted ok", "baseline"],
  intro: b(
    "The simplest search: look at each element in order. It needs no preprocessing and works on any sequence — including linked lists and streams — so it is the baseline every faster method is measured against.",
    "Cách tìm đơn giản nhất: xét từng phần tử theo thứ tự. Không cần tiền xử lý và chạy trên mọi dãy — kể cả danh sách liên kết và luồng dữ liệu — nên là mốc so sánh cho mọi phương pháp nhanh hơn.",
  ),
  invariant: b("Before checking index i, the target is not in A[0..i−1].", "Trước khi xét chỉ số i, giá trị cần tìm không nằm trong A[0..i−1]."),
  complexity: [
    { label: b("Best", "Tốt nhất"), value: "O(1)" },
    { label: b("Worst", "Xấu nhất"), value: "O(n)" },
    { label: b("Space", "Bộ nhớ"), value: "O(1)" },
  ],
  applications: [
    { title: b("Small or one-off searches", "Tìm kiếm nhỏ hoặc một lần"), body: b("Sorting first costs O(n log n); for a single query on unsorted data, a scan is cheaper.", "Sắp xếp trước tốn O(n log n); với một truy vấn trên dữ liệu chưa sắp xếp, duyệt tuyến tính rẻ hơn.") },
    { title: b("Streams & logs", "Luồng & log"), body: b("grep scans text line by line; you cannot binary-search data you have not seen yet.", "grep duyệt văn bản từng dòng; không thể tìm nhị phân trên dữ liệu chưa đến.") },
  ],
  recognize: [b("Data is unsorted and you will only query it once or twice.", "Dữ liệu chưa sắp xếp và chỉ truy vấn một hai lần.")],
  pitfalls: [b("Running it inside a loop silently creates O(n²) — use a hash set for repeated membership tests.", "Đặt nó trong vòng lặp âm thầm tạo O(n²) — hãy dùng tập băm cho kiểm tra thành viên lặp lại.")],
  practice: [
    { name: "Two Sum (1)", url: "https://leetcode.com/problems/two-sum/", level: "Easy" },
    { name: "Find Numbers with Even Number of Digits (1295)", url: "https://leetcode.com/problems/find-numbers-with-even-number-of-digits/", level: "Easy" },
  ],
  python: `def linear_search(a, target):
    for i, x in enumerate(a):
        if x == target:
            return i
    return -1`,
  quiz: [
    {
      q: b("You must answer 10,000 membership queries on 10,000 unsorted numbers. Best plan?", "Cần trả lời 10.000 truy vấn thành viên trên 10.000 số chưa sắp xếp. Cách tốt nhất?"),
      options: [b("Linear search each time", "Tìm tuyến tính mỗi lần"), b("Build a hash set once", "Tạo tập băm một lần")],
      answer: 1,
      why: b("10⁸ steps vs about 2·10⁴.", "10⁸ bước so với khoảng 2·10⁴."),
    },
  ],
  view: "array",
  initial: () => toItems([29, 10, 14, 37, 13, 5, 44, 21, 3, 31, 18, 26]),
  idle: (m) => idleArray(m),
  actions: [
    createArrayAction(),
    arrayAction("search", b("Search", "Tìm"), linearCode, [targetField(21)], (t, v) => {
      const target = Number(v.target);
      const guide = { v: target, label: "target" };
      for (let i = 0; i < t.items.length; i++) {
        const seen = markRange(0, i - 1, "reject");
        t.snap([0, 1], b(`Is A[${i}] = ${t.v(i)} equal to ${target}?`, `A[${i}] = ${t.v(i)} có bằng ${target} không?`), { guide, marks: { ...seen, [i]: "compare" }, pointers: [{ i, label: "i" }], vars: { target, i } });
        if (t.v(i) === target) {
          t.snap(1, b(`Yes — found at index ${i} after ${i + 1} checks.`, `Có — tìm thấy tại chỉ số ${i} sau ${i + 1} lần kiểm tra.`), { guide, marks: { ...seen, [i]: "found" }, vars: { target, i } });
          return;
        }
      }
      t.snap(2, b(`Checked all ${t.items.length} elements: not found.`, `Đã kiểm tra cả ${t.items.length} phần tử: không tìm thấy.`), { guide, marks: markRange(0, t.items.length - 1, "reject"), vars: { target } });
    }),
  ],
};

/* ------------------------------------------------------------------ */

const twoPtrCode = [
  "l = 0; r = n - 1",
  "while l < r",
  "  s = A[l] + A[r]",
  "  if s == target: return (l, r)",
  "  if s < target: l = l + 1   // need bigger",
  "  else: r = r - 1            // need smaller",
  "return none",
];

const twoPointers: ArrModule = {
  slug: "two-pointers",
  title: b("Two pointers", "Hai con trỏ"),
  short: b("Move two indices toward each other to prune pairs.", "Di chuyển hai chỉ số về phía nhau để loại bớt cặp."),
  category: "searching",
  tags: ["pattern", "O(n)", "sorted input", "pairs"],
  intro: b(
    "Checking every pair costs O(n²). On a sorted array, the two-pointer pattern finds a pair with a given sum in O(n): if the sum is too small, only moving the left pointer right can help; if it is too big, only moving the right pointer left can.",
    "Xét mọi cặp tốn O(n²). Trên mảng đã sắp xếp, mẫu hai con trỏ tìm cặp có tổng cho trước trong O(n): nếu tổng quá nhỏ, chỉ có dịch con trỏ trái sang phải mới giúp được; nếu quá lớn, chỉ có dịch con trỏ phải sang trái.",
  ),
  invariant: b(
    "No valid pair uses an index outside [l, r]. Each move discards a whole row or column of the n×n pair table.",
    "Không cặp hợp lệ nào dùng chỉ số ngoài [l, r]. Mỗi bước loại bỏ cả một hàng hoặc cột của bảng n×n các cặp.",
  ),
  complexity: [
    { label: b("Time", "Thời gian"), value: "O(n)" },
    { label: b("Space", "Bộ nhớ"), value: "O(1)" },
    { label: b("vs brute force", "so với vét cạn"), value: "O(n²)" },
  ],
  applications: [
    { title: b("Budget matching", "Ghép theo ngân sách"), body: b("Find two products whose prices sum exactly to a gift-card value, after sorting the catalogue.", "Tìm hai sản phẩm có tổng giá đúng bằng thẻ quà tặng, sau khi sắp xếp danh mục.") },
    { title: b("Merging & deduplicating", "Trộn & loại trùng"), body: b("Merging sorted lists and removing duplicates in place use a read pointer and a write pointer.", "Trộn danh sách đã sắp xếp và loại trùng tại chỗ dùng một con trỏ đọc và một con trỏ ghi.") },
    { title: b("Container with most water", "Bình chứa nhiều nước nhất"), body: b("Shrink from the shorter wall — the same argument that only one side can improve.", "Thu hẹp từ bức tường thấp hơn — cùng lập luận chỉ một phía có thể cải thiện.") },
  ],
  recognize: [
    b("Sorted array + “pair/triplet with sum”.", "Mảng đã sắp xếp + “cặp/bộ ba có tổng”."),
    b("Palindromes, reversing, partitioning in place.", "Palindrome, đảo ngược, phân hoạch tại chỗ."),
  ],
  pitfalls: [
    b("It requires sorted input — sorting first costs O(n log n) and loses original indices.", "Yêu cầu dữ liệu đã sắp xếp — sắp xếp trước tốn O(n log n) và mất chỉ số gốc."),
    b("For 3Sum, skip duplicate values or you report the same triplet many times.", "Với 3Sum, bỏ qua giá trị trùng nếu không sẽ báo cùng một bộ ba nhiều lần."),
  ],
  practice: [
    { name: "Two Sum II (167)", url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/", level: "Medium" },
    { name: "3Sum (15)", url: "https://leetcode.com/problems/3sum/", level: "Medium" },
    { name: "Container With Most Water (11)", url: "https://leetcode.com/problems/container-with-most-water/", level: "Medium" },
    { name: "Trapping Rain Water (42)", url: "https://leetcode.com/problems/trapping-rain-water/", level: "Hard" },
  ],
  python: `def pair_with_sum(a, target):        # a is sorted
    l, r = 0, len(a) - 1
    while l < r:
        s = a[l] + a[r]
        if s == target:
            return l, r
        if s < target:
            l += 1
        else:
            r -= 1
    return None`,
  quiz: [
    {
      q: b("A[l] + A[r] is larger than the target. Why is it safe to move r left?", "A[l] + A[r] lớn hơn target. Vì sao dịch r sang trái là an toàn?"),
      options: [b("A[r] + anything ≥ A[l] is too big", "A[r] + mọi giá trị ≥ A[l] đều quá lớn"), b("Because r > l", "Vì r > l"), b("It is a heuristic", "Đó chỉ là phỏng đoán")],
      answer: 0,
      why: b("Every remaining partner of A[r] is ≥ A[l], so all those sums are too big too.", "Mọi bạn ghép còn lại của A[r] đều ≥ A[l], nên các tổng đó cũng quá lớn."),
    },
  ],
  view: "array",
  initial: sortedSeed,
  idle: (m) => idleArray(m),
  actions: [
    createArrayAction({ sorted: true, max: 20, defaultN: 12, hi: 50 }),
    arrayAction("pair", b("Find pair", "Tìm cặp"), twoPtrCode, [targetField(49, b("Target sum", "Tổng cần tìm"))], (t, v) => {
      const target = Number(v.target);
      let l = 0, r = t.items.length - 1;
      const rejected: Record<number, "reject"> = {};
      t.snap(0, b(`Find two values summing to ${target}. Start at both ends.`, `Tìm hai giá trị có tổng ${target}. Bắt đầu từ hai đầu.`), { pointers: [{ i: l, label: "l" }, { i: r, label: "r" }], vars: { target, l, r } });
      while (l < r) {
        const s = t.v(l) + t.v(r);
        t.snap([1, 2], b(`A[${l}] + A[${r}] = ${t.v(l)} + ${t.v(r)} = ${s}.`, `A[${l}] + A[${r}] = ${t.v(l)} + ${t.v(r)} = ${s}.`), { marks: { ...rejected, [l]: "compare", [r]: "compare" }, pointers: [{ i: l, label: "l" }, { i: r, label: "r" }], vars: { target, l, r, sum: s } });
        if (s === target) {
          t.snap(3, b(`${s} = ${target}: found the pair (${l}, ${r}).`, `${s} = ${target}: tìm thấy cặp (${l}, ${r}).`), { marks: { ...rejected, [l]: "found", [r]: "found" }, pointers: [{ i: l, label: "l", tone: "found" }, { i: r, label: "r", tone: "found" }], vars: { target, l, r, sum: s } });
          return;
        }
        if (s < target) {
          rejected[l] = "reject";
          t.snap(4, b(`${s} < ${target}: A[${l}] is too small even with the largest partner. Move l right.`, `${s} < ${target}: A[${l}] quá nhỏ kể cả với bạn ghép lớn nhất. Dịch l sang phải.`), { marks: { ...rejected }, pointers: [{ i: l + 1, label: "l" }, { i: r, label: "r" }], vars: { target, l: l + 1, r, sum: s } });
          l++;
        } else {
          rejected[r] = "reject";
          t.snap(5, b(`${s} > ${target}: A[${r}] is too big even with the smallest partner. Move r left.`, `${s} > ${target}: A[${r}] quá lớn kể cả với bạn ghép nhỏ nhất. Dịch r sang trái.`), { marks: { ...rejected }, pointers: [{ i: l, label: "l" }, { i: r - 1, label: "r" }], vars: { target, l, r: r - 1, sum: s } });
          r--;
        }
      }
      t.snap(6, b("Pointers met: no pair has that sum.", "Hai con trỏ gặp nhau: không có cặp nào có tổng đó."), { marks: markRange(0, t.items.length - 1, "reject"), vars: { target } });
    }),
  ],
};

/* ------------------------------------------------------------------ */

const windowCode = [
  "best = ∞; sum = 0; l = 0",
  "for r = 0 to n-1",
  "  sum += A[r]                 // grow window",
  "  while sum >= target",
  "    best = min(best, r - l + 1)",
  "    sum -= A[l]; l += 1       // shrink window",
  "return best",
];

const slidingWindow: ArrModule = {
  slug: "sliding-window",
  title: b("Sliding window", "Cửa sổ trượt"),
  short: b("Grow on the right, shrink on the left, never look back.", "Mở rộng bên phải, thu hẹp bên trái, không bao giờ quay lại."),
  category: "searching",
  tags: ["pattern", "O(n)", "subarrays", "streaming"],
  intro: b(
    "Many questions ask about the best contiguous subarray. Instead of recomputing every window from scratch (O(n²)), keep a running summary of the current window: extend it with the right pointer, then shrink it from the left while it stays valid. Each element enters and leaves once. Demo: the shortest subarray with sum ≥ target.",
    "Nhiều bài hỏi về đoạn con liên tiếp tốt nhất. Thay vì tính lại mọi cửa sổ từ đầu (O(n²)), giữ một tóm tắt của cửa sổ hiện tại: mở rộng bằng con trỏ phải, rồi thu hẹp từ trái khi vẫn hợp lệ. Mỗi phần tử vào và ra đúng một lần. Ví dụ: đoạn con ngắn nhất có tổng ≥ target.",
  ),
  invariant: b(
    "sum always equals A[l] + … + A[r]. With non-negative values, shrinking from the left can only lower the sum.",
    "sum luôn bằng A[l] + … + A[r]. Với giá trị không âm, thu hẹp từ trái chỉ có thể làm tổng giảm.",
  ),
  complexity: [
    { label: b("Time", "Thời gian"), value: "O(n)" },
    { label: b("Space", "Bộ nhớ"), value: "O(1)" },
    { label: b("Pointer moves", "Lần dịch con trỏ"), value: "≤ 2n" },
  ],
  applications: [
    { title: b("Rate limiting", "Giới hạn tần suất"), body: b("APIs count requests in the last 60 seconds with a sliding window over timestamps.", "API đếm số yêu cầu trong 60 giây gần nhất bằng cửa sổ trượt trên dấu thời gian.") },
    { title: b("Network protocols", "Giao thức mạng"), body: b("TCP's sliding window controls how many unacknowledged bytes may be in flight.", "Cửa sổ trượt của TCP kiểm soát số byte chưa được xác nhận đang truyền.") },
    { title: b("Monitoring & analytics", "Giám sát & phân tích"), body: b("Moving averages of CPU usage or stock prices update in O(1) per new sample.", "Trung bình động của CPU hay giá cổ phiếu cập nhật O(1) cho mỗi mẫu mới.") },
    { title: b("Strings", "Chuỗi"), body: b("Longest substring without repeats, smallest window containing all letters of a word.", "Chuỗi con dài nhất không lặp, cửa sổ nhỏ nhất chứa mọi chữ cái của một từ.") },
  ],
  recognize: [
    b("“Longest / shortest contiguous subarray or substring such that …”.", "“Đoạn con / chuỗi con liên tiếp dài nhất / ngắn nhất sao cho …”."),
    b("A window property that changes monotonically when you add/remove one item.", "Tính chất cửa sổ thay đổi đơn điệu khi thêm/bớt một phần tử."),
  ],
  pitfalls: [
    b("With negative numbers, shrinking no longer lowers the sum — use prefix sums + a deque or hash map instead.", "Với số âm, thu hẹp không còn làm tổng giảm — hãy dùng tổng tiền tố + deque hoặc bảng băm."),
    b("Update the answer at the right moment: before shrinking for “shortest”, after for “longest”.", "Cập nhật đáp án đúng lúc: trước khi thu hẹp với “ngắn nhất”, sau khi thu hẹp với “dài nhất”."),
  ],
  practice: [
    { name: "Minimum Size Subarray Sum (209)", url: "https://leetcode.com/problems/minimum-size-subarray-sum/", level: "Medium" },
    { name: "Longest Substring Without Repeating Characters (3)", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", level: "Medium" },
    { name: "Sliding Window Maximum (239)", url: "https://leetcode.com/problems/sliding-window-maximum/", level: "Hard" },
    { name: "Minimum Window Substring (76)", url: "https://leetcode.com/problems/minimum-window-substring/", level: "Hard" },
  ],
  python: `def shortest_subarray_at_least(a, target):   # a[i] >= 0
    best, total, l = float("inf"), 0, 0
    for r, x in enumerate(a):
        total += x                       # grow
        while total >= target:
            best = min(best, r - l + 1)
            total -= a[l]; l += 1        # shrink
    return 0 if best == float("inf") else best`,
  quiz: [
    {
      q: b("Why is the sliding window O(n) even though it has a nested while loop?", "Vì sao cửa sổ trượt là O(n) dù có vòng while lồng nhau?"),
      options: [b("l only moves forward, at most n times in total", "l chỉ tiến, tổng cộng tối đa n lần"), b("The inner loop runs once", "Vòng trong chạy một lần"), b("It is actually O(n²)", "Thực ra là O(n²)")],
      answer: 0,
      why: b("Amortised analysis: both pointers move right at most n times.", "Phân tích khấu hao: mỗi con trỏ dịch phải tối đa n lần."),
    },
  ],
  view: "array",
  initial: () => toItems([2, 3, 1, 2, 4, 3, 7, 1, 2, 5, 1, 3]),
  idle: (m) => idleArray(m),
  actions: [
    createArrayAction({ hi: 12 }),
    arrayAction("run", b("Shortest ≥ target", "Ngắn nhất ≥ target"), windowCode, [targetField(11, b("Target sum", "Tổng cần đạt"))], (t, v) => {
      const target = Number(v.target);
      let best = Infinity, sum = 0, l = 0, bestRange: [number, number] | null = null;
      const bestMarks = () => (bestRange ? markRange(bestRange[0], bestRange[1], "path") : {});
      t.snap(0, b(`Find the shortest window with sum ≥ ${target}.`, `Tìm cửa sổ ngắn nhất có tổng ≥ ${target}.`), { vars: { target, sum, best: "∞" } });
      for (let r = 0; r < t.items.length; r++) {
        sum += t.v(r);
        t.snap([1, 2], b(`Grow: add A[${r}]=${t.v(r)} → sum = ${sum}.`, `Mở rộng: cộng A[${r}]=${t.v(r)} → sum = ${sum}.`), { marks: { ...markRange(l, r, "active"), [r]: "compare" }, pointers: [{ i: l, label: "l" }, { i: r, label: "r" }], vars: { target, l, r, sum, best: best === Infinity ? "∞" : best } });
        while (sum >= target) {
          const len = r - l + 1;
          const improved = len < best;
          if (improved) { best = len; bestRange = [l, r]; }
          t.snap([3, 4], improved
            ? b(`sum ${sum} ≥ ${target} with length ${len} → new best!`, `sum ${sum} ≥ ${target} với độ dài ${len} → kỷ lục mới!`)
            : b(`sum ${sum} ≥ ${target}, length ${len} (best is ${best}).`, `sum ${sum} ≥ ${target}, độ dài ${len} (tốt nhất là ${best}).`), {
            marks: markRange(l, r, "found"), pointers: [{ i: l, label: "l" }, { i: r, label: "r" }], vars: { target, l, r, sum, best },
          });
          sum -= t.v(l);
          l++;
          t.snap(5, b(`Shrink: drop A[${l - 1}]=${t.v(l - 1)} → sum = ${sum}.`, `Thu hẹp: bỏ A[${l - 1}]=${t.v(l - 1)} → sum = ${sum}.`), { marks: { ...markRange(l, r, "active"), [l - 1]: "reject" }, pointers: [{ i: Math.min(l, r), label: "l" }, { i: r, label: "r" }], vars: { target, l, r, sum, best } });
        }
      }
      t.snap(6, best === Infinity
        ? b(`No window reaches ${target}.`, `Không cửa sổ nào đạt ${target}.`)
        : b(`Shortest window has length ${best}: A[${bestRange![0]}..${bestRange![1]}].`, `Cửa sổ ngắn nhất có độ dài ${best}: A[${bestRange![0]}..${bestRange![1]}].`), { marks: bestMarks(), vars: { target, best: best === Infinity ? 0 : best } });
    }),
  ],
};

export const searchingModules = [linear, binary, twoPointers, slidingWindow];
