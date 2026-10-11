import { ArrayTrace, createArrayAction, idleArray, markRange, toItems } from "../trace";
import type { Action, VizModule } from "../types";
import { b } from "../types";
import type { ArrayState, Item } from "../views";

type SortModule = VizModule<Item[], ArrayState>;

const seed = () => toItems([29, 10, 14, 37, 13, 5, 44, 21, 3, 31, 18, 26]);

function sortAction(code: string[], body: (t: ArrayTrace) => void): Action<Item[], ArrayState> {
  return {
    id: "sort",
    label: b("Sort", "Sắp xếp"),
    code,
    run(model) {
      const t = new ArrayTrace(model.slice());
      body(t);
      const n = t.items.length;
      t.snap(-1, b("Done — the array is sorted.", "Xong — mảng đã được sắp xếp."), { marks: markRange(0, n - 1, "done") });
      return { steps: t.steps, model: t.items };
    },
  };
}

/* ------------------------------------------------------------------ */
/* Bubble sort                                                         */
/* ------------------------------------------------------------------ */

const bubbleCode = [
  "repeat",
  "  swapped = false",
  "  for i = 1 to last_unsorted",
  "    if A[i-1] > A[i]",
  "      swap(A[i-1], A[i]); swapped = true",
  "  mark A[last_unsorted] as sorted",
  "until not swapped",
];

const bubble: SortModule = {
  slug: "bubble-sort",
  title: b("Bubble sort", "Sắp xếp nổi bọt"),
  short: b("Swap neighbours until the largest values bubble to the end.", "Đổi chỗ các cặp kề nhau cho đến khi giá trị lớn nhất “nổi” về cuối."),
  category: "sorting",
  tags: ["comparison", "stable", "in-place", "O(n²)"],
  intro: b(
    "Bubble sort walks through the array comparing adjacent pairs and swapping any pair that is out of order. After each full pass, the largest remaining value has bubbled to its final position at the end.",
    "Sắp xếp nổi bọt duyệt mảng, so sánh từng cặp kề nhau và đổi chỗ nếu sai thứ tự. Sau mỗi lượt, giá trị lớn nhất còn lại “nổi” về đúng vị trí cuối cùng.",
  ),
  invariant: b(
    "After pass k, the last k elements are the k largest values, in their final order. If a pass makes no swaps, the array is sorted and we can stop early.",
    "Sau lượt thứ k, k phần tử cuối là k giá trị lớn nhất và đã đúng thứ tự. Nếu một lượt không có lần đổi chỗ nào, mảng đã sắp xếp và có thể dừng sớm.",
  ),
  complexity: [
    { label: b("Best", "Tốt nhất"), value: "O(n)" },
    { label: b("Average", "Trung bình"), value: "O(n²)" },
    { label: b("Worst", "Xấu nhất"), value: "O(n²)" },
    { label: b("Space", "Bộ nhớ"), value: "O(1)" },
    { label: b("Stable", "Ổn định"), value: "✓" },
  ],
  applications: [
    { title: b("Teaching invariants", "Dạy về bất biến"), body: b("Its loop invariant is the easiest to see, so it is a common first proof of correctness.", "Bất biến vòng lặp của nó dễ thấy nhất, nên thường là chứng minh tính đúng đắn đầu tiên.") },
    { title: b("Detecting sortedness", "Kiểm tra đã sắp xếp chưa"), body: b("A single pass with zero swaps proves an array is sorted in O(n).", "Một lượt không đổi chỗ nào chứng minh mảng đã sắp xếp trong O(n).") },
    { title: b("Tiny, nearly-sorted data", "Dữ liệu nhỏ, gần sắp xếp"), body: b("Embedded code sometimes fixes one or two out-of-place readings with a single bubble pass.", "Mã nhúng đôi khi sửa một hai giá trị lệch chỗ chỉ bằng một lượt nổi bọt.") },
  ],
  recognize: [
    b("You only may swap adjacent elements (e.g. counting adjacent swaps = inversions).", "Bạn chỉ được đổi chỗ phần tử kề nhau (ví dụ đếm số lần đổi chỗ kề = số nghịch thế)."),
    b("The question asks for the minimum number of adjacent swaps to sort.", "Đề bài hỏi số lần đổi chỗ kề nhau tối thiểu để sắp xếp."),
  ],
  pitfalls: [
    b("Forgetting the early-exit flag turns the best case from O(n) into O(n²).", "Quên cờ dừng sớm khiến trường hợp tốt nhất từ O(n) thành O(n²)."),
    b("Using >= instead of > breaks stability: equal items would be swapped.", "Dùng >= thay vì > làm mất tính ổn định: các phần tử bằng nhau bị đổi chỗ."),
  ],
  practice: [
    { name: "Sort an Array (912)", url: "https://leetcode.com/problems/sort-an-array/", level: "Medium" },
    { name: "Height Checker (1051)", url: "https://leetcode.com/problems/height-checker/", level: "Easy" },
    { name: "Minimum Adjacent Swaps to Make a Valid Array (2340)", url: "https://leetcode.com/problems/minimum-adjacent-swaps-to-make-a-valid-array/", level: "Medium" },
  ],
  python: `def bubble_sort(a):
    last = len(a) - 1
    swapped = True
    while swapped:
        swapped = False
        for i in range(1, last + 1):
            if a[i - 1] > a[i]:
                a[i - 1], a[i] = a[i], a[i - 1]
                swapped = True
        last -= 1          # a[last+1:] is now final
    return a`,
  quiz: [
    {
      q: b("Bubble sort runs on an already sorted array of 1,000 items. How many comparisons does the optimised version make?", "Chạy nổi bọt trên mảng 1.000 phần tử đã sắp xếp. Phiên bản tối ưu thực hiện bao nhiêu phép so sánh?"),
      options: [b("999", "999"), b("about 500,000", "khoảng 500.000"), b("1,000,000", "1.000.000")],
      answer: 0,
      why: b("One pass of n−1 comparisons sees no swap, so the loop stops.", "Một lượt n−1 phép so sánh không có đổi chỗ nên vòng lặp dừng."),
    },
    {
      q: b("After the 3rd pass, which part of the array is guaranteed final?", "Sau lượt thứ 3, phần nào của mảng chắc chắn đã đúng vị trí?"),
      options: [b("The first 3 elements", "3 phần tử đầu"), b("The last 3 elements", "3 phần tử cuối"), b("Nothing yet", "Chưa phần nào")],
      answer: 1,
      why: b("Each pass carries the largest unsorted value to the end.", "Mỗi lượt đưa giá trị lớn nhất chưa sắp xếp về cuối."),
    },
  ],
  view: "array",
  initial: seed,
  idle: (m) => idleArray(m),
  actions: [
    createArrayAction(),
    sortAction(bubbleCode, (t) => {
      const n = t.items.length;
      let last = n - 1;
      let swapped = true;
      let pass = 0;
      while (swapped) {
        swapped = false;
        pass++;
        t.snap([0, 1], b(`Pass ${pass}: scan the unsorted part A[0..${last}].`, `Lượt ${pass}: duyệt phần chưa sắp xếp A[0..${last}].`), { range: [0, last], vars: { pass, last } });
        for (let i = 1; i <= last; i++) {
          const x = t.v(i - 1), y = t.v(i);
          t.snap([2, 3], b(`Compare A[${i - 1}]=${x} and A[${i}]=${y}.`, `So sánh A[${i - 1}]=${x} và A[${i}]=${y}.`), {
            marks: { [i - 1]: "compare", [i]: "compare" }, range: [0, last], vars: { pass, i, swapped: String(swapped) },
          });
          if (x > y) {
            t.swap(i - 1, i);
            swapped = true;
            t.snap(4, b(`${x} > ${y}, so swap them.`, `${x} > ${y} nên đổi chỗ.`), {
              marks: { [i - 1]: "swap", [i]: "swap" }, range: [0, last], vars: { pass, i, swapped: "true" },
            });
          }
        }
        t.done.add(last);
        t.snap(5, b(`A[${last}]=${t.v(last)} is now in its final position.`, `A[${last}]=${t.v(last)} đã ở đúng vị trí cuối cùng.`), { vars: { pass, swapped: String(swapped) } });
        last--;
        if (last < 0) break;
      }
      t.snap(6, b("A pass with no swaps means everything left is already in order.", "Một lượt không có đổi chỗ nghĩa là phần còn lại đã đúng thứ tự."), { vars: { pass, swapped: "false" } });
    }),
  ],
};

/* ------------------------------------------------------------------ */
/* Selection sort                                                      */
/* ------------------------------------------------------------------ */

const selectionCode = [
  "for i = 0 to n-2",
  "  min = i",
  "  for j = i+1 to n-1",
  "    if A[j] < A[min]: min = j",
  "  swap(A[i], A[min])",
  "  mark A[i] as sorted",
];

const selection: SortModule = {
  slug: "selection-sort",
  title: b("Selection sort", "Sắp xếp chọn"),
  short: b("Repeatedly select the minimum and move it to the front.", "Liên tục chọn phần tử nhỏ nhất và đưa lên đầu."),
  category: "sorting",
  tags: ["comparison", "in-place", "O(n²)", "few swaps"],
  intro: b(
    "Selection sort grows a sorted prefix one element at a time: scan the unsorted suffix for its minimum, then swap that minimum into the next position.",
    "Sắp xếp chọn mở rộng phần đầu đã sắp xếp từng phần tử một: tìm giá trị nhỏ nhất trong phần còn lại rồi đổi nó vào vị trí tiếp theo.",
  ),
  invariant: b(
    "Before iteration i, A[0..i−1] holds the i smallest values in sorted order, and every value there is ≤ every value in A[i..n−1].",
    "Trước vòng i, A[0..i−1] chứa i giá trị nhỏ nhất theo thứ tự, và mọi giá trị ở đó ≤ mọi giá trị trong A[i..n−1].",
  ),
  complexity: [
    { label: b("Best", "Tốt nhất"), value: "O(n²)" },
    { label: b("Average", "Trung bình"), value: "O(n²)" },
    { label: b("Worst", "Xấu nhất"), value: "O(n²)" },
    { label: b("Space", "Bộ nhớ"), value: "O(1)" },
    { label: b("Swaps", "Đổi chỗ"), value: "≤ n−1" },
  ],
  applications: [
    { title: b("Expensive writes", "Ghi dữ liệu tốn kém"), body: b("At most n−1 swaps, so it suits flash memory or EEPROM where writes wear the hardware.", "Tối đa n−1 lần đổi chỗ, phù hợp với bộ nhớ flash/EEPROM nơi mỗi lần ghi làm hao mòn phần cứng.") },
    { title: b("Top-k by hand", "Lấy top-k thủ công"), body: b("Stopping after k iterations gives the k smallest items in O(k·n) — fine for small k.", "Dừng sau k vòng cho k phần tử nhỏ nhất trong O(k·n) — ổn khi k nhỏ.") },
  ],
  recognize: [
    b("You need the minimum of a shrinking set many times (then upgrade to a heap).", "Bạn cần lấy min của một tập co dần nhiều lần (khi đó nên nâng cấp lên heap)."),
    b("Minimising the number of writes/swaps matters more than comparisons.", "Giảm số lần ghi/đổi chỗ quan trọng hơn số phép so sánh."),
  ],
  pitfalls: [
    b("It is not stable: a long-distance swap can jump over an equal key.", "Không ổn định: một lần đổi chỗ xa có thể vượt qua phần tử có khoá bằng nhau."),
    b("It never stops early — even sorted input costs n²/2 comparisons.", "Không bao giờ dừng sớm — kể cả dữ liệu đã sắp xếp vẫn tốn n²/2 phép so sánh."),
  ],
  practice: [
    { name: "Sort an Array (912)", url: "https://leetcode.com/problems/sort-an-array/", level: "Medium" },
    { name: "Kth Largest Element in an Array (215)", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/", level: "Medium" },
    { name: "Minimum Number of Swaps to Sort (GfG)", url: "https://www.geeksforgeeks.org/problems/minimum-swaps/1", level: "Medium" },
  ],
  python: `def selection_sort(a):
    n = len(a)
    for i in range(n - 1):
        smallest = i
        for j in range(i + 1, n):
            if a[j] < a[smallest]:
                smallest = j
        a[i], a[smallest] = a[smallest], a[i]
    return a`,
  quiz: [
    {
      q: b("How many swaps does selection sort perform on n items in the worst case?", "Sắp xếp chọn thực hiện tối đa bao nhiêu lần đổi chỗ với n phần tử?"),
      options: [b("n − 1", "n − 1"), b("n log n", "n log n"), b("n²/2", "n²/2")],
      answer: 0,
      why: b("Exactly one swap per outer iteration.", "Đúng một lần đổi chỗ cho mỗi vòng ngoài."),
    },
    {
      q: b("Is selection sort stable?", "Sắp xếp chọn có ổn định không?"),
      options: [b("Yes", "Có"), b("No", "Không")],
      answer: 1,
      why: b("Sorting [2a, 2b, 1] swaps 1 with 2a, putting 2a after 2b.", "Sắp xếp [2a, 2b, 1] đổi 1 với 2a, khiến 2a nằm sau 2b."),
    },
  ],
  view: "array",
  initial: seed,
  idle: (m) => idleArray(m),
  actions: [
    createArrayAction(),
    sortAction(selectionCode, (t) => {
      const n = t.items.length;
      for (let i = 0; i < n - 1; i++) {
        let min = i;
        t.snap([0, 1], b(`Find the minimum of A[${i}..${n - 1}]. Start with min = ${i}.`, `Tìm giá trị nhỏ nhất của A[${i}..${n - 1}]. Bắt đầu với min = ${i}.`), {
          marks: { [i]: "pivot" }, range: [i, n - 1], pointers: [{ i, label: "i" }, { i: min, label: "min", tone: "pivot" }], vars: { i, min },
        });
        for (let j = i + 1; j < n; j++) {
          const better = t.v(j) < t.v(min);
          t.snap([2, 3], better
            ? b(`A[${j}]=${t.v(j)} < A[min]=${t.v(min)} → new minimum.`, `A[${j}]=${t.v(j)} < A[min]=${t.v(min)} → giá trị nhỏ nhất mới.`)
            : b(`A[${j}]=${t.v(j)} ≥ A[min]=${t.v(min)}; keep min.`, `A[${j}]=${t.v(j)} ≥ A[min]=${t.v(min)}; giữ nguyên min.`), {
            marks: { [min]: "pivot", [j]: "compare" }, range: [i, n - 1], pointers: [{ i, label: "i" }, { i: j, label: "j" }], vars: { i, j, min },
          });
          if (better) min = j;
        }
        if (min !== i) {
          t.swap(i, min);
          t.snap(4, b(`Swap the minimum ${t.v(i)} into position ${i}.`, `Đổi giá trị nhỏ nhất ${t.v(i)} vào vị trí ${i}.`), { marks: { [i]: "swap", [min]: "swap" }, vars: { i, min } });
        } else {
          t.snap(4, b(`A[${i}] is already the minimum; no swap needed.`, `A[${i}] đã là nhỏ nhất; không cần đổi chỗ.`), { marks: { [i]: "pivot" }, vars: { i, min } });
        }
        t.done.add(i);
        t.snap(5, b(`A[0..${i}] is now sorted.`, `A[0..${i}] đã được sắp xếp.`), { vars: { i } });
      }
      t.done.add(n - 1);
    }),
  ],
};

/* ------------------------------------------------------------------ */
/* Insertion sort                                                      */
/* ------------------------------------------------------------------ */

const insertionCode = [
  "for i = 1 to n-1",
  "  key = A[i]; j = i - 1",
  "  while j >= 0 and A[j] > key",
  "    A[j+1] = A[j]   // shift right",
  "    j = j - 1",
  "  A[j+1] = key",
];

const insertion: SortModule = {
  slug: "insertion-sort",
  title: b("Insertion sort", "Sắp xếp chèn"),
  short: b("Insert each card into its place in the sorted hand.", "Chèn từng lá bài vào đúng chỗ trong phần đã sắp xếp."),
  category: "sorting",
  tags: ["comparison", "stable", "in-place", "adaptive", "online"],
  intro: b(
    "Insertion sort works like sorting playing cards in your hand. Take the next element and shift larger elements of the sorted prefix one step right until the gap is where it belongs.",
    "Sắp xếp chèn giống như xếp bài trên tay. Lấy phần tử tiếp theo và dịch các phần tử lớn hơn trong phần đã sắp xếp sang phải cho tới khi có chỗ trống đúng vị trí.",
  ),
  invariant: b(
    "Before iteration i, A[0..i−1] contains the original first i elements, in sorted order.",
    "Trước vòng i, A[0..i−1] chứa i phần tử ban đầu, theo thứ tự đã sắp xếp.",
  ),
  complexity: [
    { label: b("Best", "Tốt nhất"), value: "O(n)" },
    { label: b("Average", "Trung bình"), value: "O(n²)" },
    { label: b("Worst", "Xấu nhất"), value: "O(n²)" },
    { label: b("Space", "Bộ nhớ"), value: "O(1)" },
    { label: b("Work", "Công việc"), value: "O(n + inversions)" },
  ],
  applications: [
    { title: b("Inside production sorts", "Bên trong thư viện sắp xếp"), body: b("Timsort (Python, Java) and introsort (C++) switch to insertion sort for runs shorter than ~16–64 items because it has tiny constants.", "Timsort (Python, Java) và introsort (C++) chuyển sang sắp xếp chèn cho đoạn ngắn hơn ~16–64 phần tử vì hằng số rất nhỏ.") },
    { title: b("Streaming / online data", "Dữ liệu dòng (online)"), body: b("Keep a leaderboard sorted as scores arrive one by one.", "Giữ bảng xếp hạng luôn sắp xếp khi điểm số đến từng cái một.") },
    { title: b("Nearly sorted input", "Dữ liệu gần sắp xếp"), body: b("Log files with slightly out-of-order timestamps are sorted in near-linear time.", "File log có dấu thời gian hơi lệch được sắp xếp gần như tuyến tính.") },
  ],
  recognize: [
    b("Data arrives incrementally and must stay sorted after each arrival.", "Dữ liệu đến dần và phải luôn được sắp xếp sau mỗi lần thêm."),
    b("Each element is at most k positions away from its sorted spot.", "Mỗi phần tử cách vị trí đúng tối đa k bước."),
  ],
  pitfalls: [
    b("Checking j >= 0 after reading A[j] reads out of bounds.", "Kiểm tra j >= 0 sau khi đọc A[j] sẽ truy cập ngoài mảng."),
    b("On a linked list you can avoid shifting, but you lose binary search for the slot.", "Trên danh sách liên kết không cần dịch, nhưng mất khả năng tìm nhị phân vị trí chèn."),
  ],
  practice: [
    { name: "Insertion Sort List (147)", url: "https://leetcode.com/problems/insertion-sort-list/", level: "Medium" },
    { name: "Sort an Array (912)", url: "https://leetcode.com/problems/sort-an-array/", level: "Medium" },
    { name: "Find Median from Data Stream (295)", url: "https://leetcode.com/problems/find-median-from-data-stream/", level: "Hard" },
  ],
  python: `def insertion_sort(a):
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]     # shift right
            j -= 1
        a[j + 1] = key
    return a`,
  quiz: [
    {
      q: b("Insertion sort's running time is proportional to n plus the number of…", "Thời gian chạy của sắp xếp chèn tỉ lệ với n cộng số…"),
      options: [b("distinct values", "giá trị khác nhau"), b("inversions", "nghịch thế"), b("swaps in bubble sort squared", "bình phương số lần đổi chỗ")],
      answer: 1,
      why: b("Every shift fixes exactly one inverted pair.", "Mỗi lần dịch sửa đúng một cặp nghịch thế."),
    },
    {
      q: b("Why do Timsort and introsort use insertion sort for small pieces?", "Vì sao Timsort và introsort dùng sắp xếp chèn cho đoạn nhỏ?"),
      options: [b("Lower overhead on small n", "Chi phí thấp với n nhỏ"), b("It is O(n log n)", "Nó là O(n log n)"), b("It uses less memory than O(1)", "Nó dùng ít hơn O(1) bộ nhớ")],
      answer: 0,
      why: b("No recursion, cache-friendly, few instructions per step.", "Không đệ quy, thân thiện bộ nhớ đệm, ít lệnh mỗi bước."),
    },
  ],
  view: "array",
  initial: seed,
  idle: (m) => idleArray(m),
  actions: [
    createArrayAction({ max: 20 }),
    sortAction(insertionCode, (t) => {
      const n = t.items.length;
      t.done.add(0);
      t.snap(0, b("A single element A[0] is trivially sorted.", "Một phần tử A[0] hiển nhiên đã sắp xếp."), { vars: { i: 0 } });
      for (let i = 1; i < n; i++) {
        const key = t.items[i];
        let j = i - 1;
        t.snap(1, b(`Pick key = A[${i}] = ${key.v}.`, `Chọn key = A[${i}] = ${key.v}.`), { marks: { [i]: "pivot" }, pointers: [{ i, label: "key", tone: "pivot" }], vars: { i, key: key.v, j } });
        while (j >= 0) {
          const bigger = t.v(j) > key.v;
          t.snap(2, bigger
            ? b(`A[${j}]=${t.v(j)} > ${key.v}: shift it right.`, `A[${j}]=${t.v(j)} > ${key.v}: dịch sang phải.`)
            : b(`A[${j}]=${t.v(j)} ≤ ${key.v}: stop shifting.`, `A[${j}]=${t.v(j)} ≤ ${key.v}: dừng dịch.`), {
            marks: { [j]: "compare", [j + 1]: "pivot" }, pointers: [{ i: j, label: "j" }], vars: { i, key: key.v, j },
          });
          if (!bigger) break;
          t.swap(j, j + 1);
          t.snap([3, 4], b(`Shifted ${t.v(j + 1)} to index ${j + 1}.`, `Đã dịch ${t.v(j + 1)} tới chỉ số ${j + 1}.`), { marks: { [j + 1]: "swap", [j]: "pivot" }, vars: { i, key: key.v, j: j - 1 } });
          j--;
        }
        for (let k = 0; k <= i; k++) t.done.add(k);
        t.snap(5, b(`Place ${key.v} at index ${j + 1}. A[0..${i}] is sorted.`, `Đặt ${key.v} vào chỉ số ${j + 1}. A[0..${i}] đã sắp xếp.`), { marks: { [j + 1]: "found" }, vars: { i, key: key.v, j } });
      }
    }),
  ],
};

/* ------------------------------------------------------------------ */
/* Merge sort                                                          */
/* ------------------------------------------------------------------ */

const mergeCode = [
  "mergeSort(A, lo, hi):",
  "  if lo >= hi: return",
  "  mid = (lo + hi) / 2",
  "  mergeSort(A, lo, mid); mergeSort(A, mid+1, hi)",
  "  merge: repeatedly take the smaller head",
  "    of A[lo..mid] and A[mid+1..hi] into buffer",
  "  copy buffer back into A[lo..hi]",
];

const merge: SortModule = {
  slug: "merge-sort",
  title: b("Merge sort", "Sắp xếp trộn"),
  short: b("Split in half, sort each half, merge the results.", "Chia đôi, sắp xếp mỗi nửa, rồi trộn kết quả."),
  category: "sorting",
  tags: ["divide & conquer", "stable", "O(n log n)", "external sort"],
  intro: b(
    "Merge sort is the canonical divide-and-conquer algorithm. Split the array into halves until each piece has one element, then merge sorted pieces pairwise. Merging two sorted lists takes linear time because you only ever compare their heads.",
    "Sắp xếp trộn là thuật toán chia để trị kinh điển. Chia mảng làm đôi cho đến khi mỗi phần còn một phần tử, rồi trộn từng cặp đã sắp xếp. Trộn hai danh sách đã sắp xếp mất thời gian tuyến tính vì chỉ cần so sánh hai phần tử đầu.",
  ),
  invariant: b(
    "During a merge, the buffer holds the smallest elements of both halves in sorted order; each half's pointer marks its smallest unused element.",
    "Khi trộn, bộ đệm chứa các phần tử nhỏ nhất của hai nửa theo thứ tự; con trỏ của mỗi nửa chỉ vào phần tử nhỏ nhất chưa dùng.",
  ),
  complexity: [
    { label: b("Best", "Tốt nhất"), value: "O(n log n)" },
    { label: b("Average", "Trung bình"), value: "O(n log n)" },
    { label: b("Worst", "Xấu nhất"), value: "O(n log n)" },
    { label: b("Space", "Bộ nhớ"), value: "O(n)" },
    { label: b("Stable", "Ổn định"), value: "✓" },
  ],
  applications: [
    { title: b("External sorting", "Sắp xếp ngoài"), body: b("Databases sort data larger than RAM by sorting chunks, writing them to disk, then k-way merging the runs.", "Cơ sở dữ liệu sắp xếp dữ liệu lớn hơn RAM bằng cách sắp xếp từng khối, ghi ra đĩa rồi trộn k-đường các đoạn.") },
    { title: b("Counting inversions", "Đếm nghịch thế"), body: b("Count how 'unsorted' two rankings are (e.g. comparing two users' movie preferences) during the merge step.", "Đếm mức độ “lệch” giữa hai bảng xếp hạng (ví dụ so sở thích phim của hai người dùng) trong bước trộn.") },
    { title: b("Stable multi-key sort", "Sắp xếp ổn định nhiều khoá"), body: b("Sort by date, then stably by name, and rows with the same name keep date order — the basis of spreadsheet sorting.", "Sắp theo ngày rồi sắp ổn định theo tên, các dòng cùng tên giữ thứ tự ngày — nền tảng của sắp xếp bảng tính.") },
    { title: b("Linked lists", "Danh sách liên kết"), body: b("Merge sort needs no random access, so it is the go-to sort for linked lists with O(1) extra space.", "Không cần truy cập ngẫu nhiên nên là lựa chọn hàng đầu cho danh sách liên kết, bộ nhớ phụ O(1).") },
  ],
  recognize: [
    b("“Count pairs i < j with A[i] > A[j]” or any pairwise count across two halves.", "“Đếm cặp i < j với A[i] > A[j]” hoặc mọi bài đếm cặp giữa hai nửa."),
    b("Combining k sorted lists/streams.", "Gộp k danh sách/luồng đã sắp xếp."),
    b("You need a guaranteed O(n log n) worst case and stability.", "Cần đảm bảo O(n log n) trong mọi trường hợp và tính ổn định."),
  ],
  pitfalls: [
    b("Taking from the right half on ties (< instead of ≤) breaks stability.", "Lấy từ nửa phải khi bằng nhau (< thay vì ≤) làm mất tính ổn định."),
    b("Allocating a new buffer at every recursion level wastes time; allocate once.", "Cấp phát bộ đệm mới ở mỗi tầng đệ quy rất tốn; hãy cấp phát một lần."),
  ],
  practice: [
    { name: "Merge Sorted Array (88)", url: "https://leetcode.com/problems/merge-sorted-array/", level: "Easy" },
    { name: "Sort List (148)", url: "https://leetcode.com/problems/sort-list/", level: "Medium" },
    { name: "Merge k Sorted Lists (23)", url: "https://leetcode.com/problems/merge-k-sorted-lists/", level: "Hard" },
    { name: "Count of Smaller Numbers After Self (315)", url: "https://leetcode.com/problems/count-of-smaller-numbers-after-self/", level: "Hard" },
  ],
  python: `def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left, right = merge_sort(a[:mid]), merge_sort(a[mid:])
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:      # <= keeps it stable
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
    return out + left[i:] + right[j:]`,
  quiz: [
    {
      q: b("How many levels of recursion does merge sort use on n = 1,024 items?", "Sắp xếp trộn dùng bao nhiêu tầng đệ quy với n = 1.024?"),
      options: [b("10", "10"), b("32", "32"), b("512", "512")],
      answer: 0,
      why: b("Halving 1,024 reaches size 1 after log₂1024 = 10 levels.", "Chia đôi 1.024 đến kích thước 1 sau log₂1024 = 10 tầng."),
    },
    {
      q: b("Which input makes merge sort slower than O(n log n)?", "Đầu vào nào khiến sắp xếp trộn chậm hơn O(n log n)?"),
      options: [b("Reversed input", "Dữ liệu đảo ngược"), b("All equal values", "Toàn giá trị bằng nhau"), b("None", "Không có")],
      answer: 2,
      why: b("The split is always balanced, regardless of the values.", "Việc chia luôn cân bằng, bất kể giá trị."),
    },
  ],
  view: "array",
  initial: seed,
  idle: (m) => idleArray(m),
  actions: [
    createArrayAction({ max: 20 }),
    sortAction(mergeCode, (t) => {
      const n = t.items.length;
      const rec = (lo: number, hi: number, depth: number) => {
        if (lo >= hi) {
          t.snap(1, b(`A[${lo}] alone is sorted.`, `A[${lo}] một mình đã được sắp xếp.`), { range: [lo, hi], marks: { [lo]: "active" }, vars: { lo, hi, depth } });
          return;
        }
        const mid = (lo + hi) >> 1;
        t.snap(2, b(`Split A[${lo}..${hi}] at mid = ${mid}.`, `Chia A[${lo}..${hi}] tại mid = ${mid}.`), {
          range: [lo, hi], pointers: [{ i: lo, label: "lo" }, { i: mid, label: "mid", tone: "pivot" }, { i: hi, label: "hi" }], vars: { lo, mid, hi, depth },
        });
        rec(lo, mid, depth + 1);
        rec(mid + 1, hi, depth + 1);
        const left = t.items.slice(lo, mid + 1);
        const right = t.items.slice(mid + 1, hi + 1);
        const buf: Item[] = [];
        let i = 0, j = 0;
        const aux = () => ({ label: "buffer", cells: [...buf.map((x) => x.v), ...Array(hi - lo + 1 - buf.length).fill(null)] });
        while (i < left.length && j < right.length) {
          const li = lo + i, ri = mid + 1 + j;
          const takeLeft = left[i].v <= right[j].v;
          t.snap([4, 5], b(
            `Compare heads ${left[i].v} and ${right[j].v}; take ${takeLeft ? left[i].v : right[j].v}.`,
            `So sánh hai đầu ${left[i].v} và ${right[j].v}; lấy ${takeLeft ? left[i].v : right[j].v}.`,
          ), {
            range: [lo, hi],
            marks: { [li]: takeLeft ? "found" : "compare", [ri]: takeLeft ? "compare" : "found" },
            pointers: [{ i: li, label: "i" }, { i: ri, label: "j" }],
            aux: aux(), vars: { lo, mid, hi },
          });
          buf.push(takeLeft ? left[i++] : right[j++]);
        }
        while (i < left.length) buf.push(left[i++]);
        while (j < right.length) buf.push(right[j++]);
        t.snap(5, b("One half is empty; append the rest of the other half.", "Một nửa đã hết; nối phần còn lại của nửa kia."), { range: [lo, hi], aux: aux(), vars: { lo, mid, hi } });
        for (let k = 0; k < buf.length; k++) t.items[lo + k] = buf[k];
        if (lo === 0 && hi === n - 1) for (let k = 0; k < n; k++) t.done.add(k);
        t.snap(6, b(`Copy back: A[${lo}..${hi}] is sorted.`, `Chép lại: A[${lo}..${hi}] đã được sắp xếp.`), { range: [lo, hi], marks: markRange(lo, hi, "found"), vars: { lo, mid, hi } });
      };
      rec(0, n - 1, 0);
    }),
  ],
};

/* ------------------------------------------------------------------ */
/* Quick sort                                                          */
/* ------------------------------------------------------------------ */

const quickCode = [
  "quickSort(A, lo, hi):",
  "  if lo >= hi: return",
  "  pivot = A[hi]; store = lo",
  "  for i = lo to hi-1",
  "    if A[i] < pivot: swap(A[i], A[store]); store++",
  "  swap(A[store], A[hi])   // pivot in final place",
  "  quickSort(A, lo, store-1); quickSort(A, store+1, hi)",
];

const quick: SortModule = {
  slug: "quick-sort",
  title: b("Quick sort", "Sắp xếp nhanh"),
  short: b("Partition around a pivot, then recurse on both sides.", "Phân hoạch quanh chốt, rồi đệ quy hai phía."),
  category: "sorting",
  tags: ["divide & conquer", "in-place", "O(n log n) avg", "partition"],
  intro: b(
    "Quick sort picks a pivot and partitions the array so smaller values go left and larger values go right. The pivot is then in its final spot, and the two sides are sorted independently. This version uses the Lomuto partition with the last element as pivot.",
    "Sắp xếp nhanh chọn một chốt và phân hoạch mảng: giá trị nhỏ hơn sang trái, lớn hơn sang phải. Khi đó chốt nằm đúng vị trí cuối cùng, và hai phía được sắp xếp độc lập. Phiên bản này dùng phân hoạch Lomuto với chốt là phần tử cuối.",
  ),
  invariant: b(
    "During partition: A[lo..store−1] < pivot, A[store..i−1] ≥ pivot, and A[i..hi−1] is still unknown.",
    "Trong khi phân hoạch: A[lo..store−1] < chốt, A[store..i−1] ≥ chốt, và A[i..hi−1] chưa xét.",
  ),
  complexity: [
    { label: b("Best", "Tốt nhất"), value: "O(n log n)" },
    { label: b("Average", "Trung bình"), value: "O(n log n)" },
    { label: b("Worst", "Xấu nhất"), value: "O(n²)" },
    { label: b("Space", "Bộ nhớ"), value: "O(log n)" },
    { label: b("Stable", "Ổn định"), value: "✗" },
  ],
  applications: [
    { title: b("Standard library sorts", "Hàm sort của thư viện"), body: b("C++ std::sort (introsort) and Go's pdqsort are quick-sort variants — fastest in practice thanks to in-place, cache-friendly partitioning.", "std::sort của C++ (introsort) và pdqsort của Go là biến thể sắp xếp nhanh — nhanh nhất thực tế nhờ phân hoạch tại chỗ, thân thiện bộ nhớ đệm.") },
    { title: b("Quickselect: k-th element", "Quickselect: phần tử thứ k"), body: b("Recurse into only one side to find the median or the k-th largest in O(n) average — used for percentiles and outlier detection.", "Chỉ đệ quy một phía để tìm trung vị hoặc phần tử lớn thứ k trong O(n) trung bình — dùng cho phân vị và phát hiện ngoại lệ.") },
    { title: b("Partitioning problems", "Bài toán phân hoạch"), body: b("Dutch national flag (sort 0/1/2), moving zeros, separating evens and odds — all the partition step alone.", "Cờ Hà Lan (sắp 0/1/2), dồn số 0, tách chẵn lẻ — chỉ cần bước phân hoạch.") },
  ],
  recognize: [
    b("“k-th largest / smallest”, “top k”, or “median” without needing full order.", "“Lớn/nhỏ thứ k”, “top k” hoặc “trung vị” mà không cần sắp xếp toàn bộ."),
    b("Rearrange elements into groups around a value, in place.", "Sắp lại phần tử thành các nhóm quanh một giá trị, tại chỗ."),
  ],
  pitfalls: [
    b("Always picking the last element makes sorted input O(n²). Use a random or median-of-three pivot.", "Luôn chọn phần tử cuối khiến dữ liệu đã sắp xếp thành O(n²). Hãy chọn chốt ngẫu nhiên hoặc trung vị của ba."),
    b("Many duplicates also degrade Lomuto; use 3-way partitioning.", "Nhiều phần tử trùng cũng làm Lomuto chậm; hãy dùng phân hoạch 3 đường."),
    b("Recurse into the smaller side first to keep the stack O(log n).", "Đệ quy phía nhỏ hơn trước để ngăn xếp chỉ O(log n)."),
  ],
  practice: [
    { name: "Sort Colors (75)", url: "https://leetcode.com/problems/sort-colors/", level: "Medium" },
    { name: "Kth Largest Element in an Array (215)", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/", level: "Medium" },
    { name: "K Closest Points to Origin (973)", url: "https://leetcode.com/problems/k-closest-points-to-origin/", level: "Medium" },
    { name: "Wiggle Sort II (324)", url: "https://leetcode.com/problems/wiggle-sort-ii/", level: "Medium" },
  ],
  python: `import random

def quick_sort(a, lo=0, hi=None):
    if hi is None:
        hi = len(a) - 1
    if lo >= hi:
        return a
    p = random.randint(lo, hi)          # random pivot avoids O(n^2)
    a[p], a[hi] = a[hi], a[p]
    pivot, store = a[hi], lo
    for i in range(lo, hi):
        if a[i] < pivot:
            a[i], a[store] = a[store], a[i]
            store += 1
    a[store], a[hi] = a[hi], a[store]
    quick_sort(a, lo, store - 1)
    quick_sort(a, store + 1, hi)
    return a`,
  quiz: [
    {
      q: b("With 'last element' as pivot, which input is worst?", "Với chốt là phần tử cuối, đầu vào nào tệ nhất?"),
      options: [b("Random", "Ngẫu nhiên"), b("Already sorted", "Đã sắp xếp"), b("All distinct", "Toàn khác nhau")],
      answer: 1,
      why: b("Every partition is maximally unbalanced: sizes n−1 and 0.", "Mỗi lần phân hoạch lệch tối đa: kích thước n−1 và 0."),
    },
    {
      q: b("After one partition, what do we know for sure?", "Sau một lần phân hoạch, ta chắc chắn điều gì?"),
      options: [b("The pivot is in its final position", "Chốt đã ở vị trí cuối cùng"), b("The left side is sorted", "Phía trái đã sắp xếp"), b("The array is half sorted", "Mảng đã sắp xếp một nửa")],
      answer: 0,
      why: b("Everything smaller is left of it and everything larger is right.", "Mọi giá trị nhỏ hơn ở bên trái, lớn hơn ở bên phải."),
    },
  ],
  view: "array",
  initial: seed,
  idle: (m) => idleArray(m),
  actions: [
    createArrayAction({ max: 20 }),
    sortAction(quickCode, (t) => {
      const rec = (lo: number, hi: number) => {
        if (lo >= hi) {
          if (lo === hi) {
            t.done.add(lo);
            t.snap(1, b(`A[${lo}] alone is in place.`, `A[${lo}] một mình đã đúng chỗ.`), { range: [lo, hi], vars: { lo, hi } });
          }
          return;
        }
        const pivot = t.v(hi);
        let store = lo;
        t.snap(2, b(`Partition A[${lo}..${hi}] around pivot ${pivot}.`, `Phân hoạch A[${lo}..${hi}] quanh chốt ${pivot}.`), {
          range: [lo, hi], marks: { [hi]: "pivot" }, pointers: [{ i: store, label: "store" }], guide: { v: pivot, label: "pivot" }, vars: { lo, hi, pivot, store },
        });
        for (let i = lo; i < hi; i++) {
          const less = t.v(i) < pivot;
          const left: Record<number, "active"> = {};
          for (let k = lo; k < store; k++) left[k] = "active";
          t.snap(3, less
            ? b(`${t.v(i)} < ${pivot}: it belongs on the left.`, `${t.v(i)} < ${pivot}: thuộc phía trái.`)
            : b(`${t.v(i)} ≥ ${pivot}: leave it on the right.`, `${t.v(i)} ≥ ${pivot}: để ở phía phải.`), {
            range: [lo, hi], marks: { ...left, [hi]: "pivot", [i]: "compare" }, pointers: [{ i, label: "i" }, { i: store, label: "store" }], guide: { v: pivot, label: "pivot" }, vars: { lo, hi, pivot, i, store },
          });
          if (less) {
            t.swap(i, store);
            if (i !== store) {
              t.snap(4, b(`Swap A[${i}] and A[${store}]; store moves right.`, `Đổi A[${i}] và A[${store}]; store dịch phải.`), {
                range: [lo, hi], marks: { ...left, [hi]: "pivot", [i]: "swap", [store]: "swap" }, pointers: [{ i, label: "i" }, { i: store, label: "store" }], guide: { v: pivot, label: "pivot" }, vars: { lo, hi, pivot, i, store: store + 1 },
              });
            }
            store++;
          }
        }
        t.swap(store, hi);
        t.done.add(store);
        t.snap(5, b(`Move pivot ${pivot} to index ${store} — its final position.`, `Đưa chốt ${pivot} về chỉ số ${store} — vị trí cuối cùng của nó.`), {
          range: [lo, hi], marks: { [store]: "found" }, guide: { v: pivot, label: "pivot" }, vars: { lo, hi, pivot, store },
        });
        t.snap(6, b(`Recurse on A[${lo}..${store - 1}] and A[${store + 1}..${hi}].`, `Đệ quy trên A[${lo}..${store - 1}] và A[${store + 1}..${hi}].`), { range: [lo, hi], vars: { lo, hi, store } });
        rec(lo, store - 1);
        rec(store + 1, hi);
      };
      rec(0, t.items.length - 1);
    }),
  ],
};

/* ------------------------------------------------------------------ */
/* Counting sort                                                       */
/* ------------------------------------------------------------------ */

const countingCode = [
  "count = array of zeros, size max+1",
  "for x in A: count[x] += 1",
  "for i = 1 to max: count[i] += count[i-1]   // prefix sums",
  "for x in A, right to left:",
  "  count[x] -= 1; out[count[x]] = x",
  "A = out",
];

const counting: SortModule = {
  slug: "counting-sort",
  title: b("Counting sort", "Sắp xếp đếm"),
  short: b("Count each key, then place items by prefix sums — no comparisons.", "Đếm từng khoá, rồi đặt phần tử theo tổng tiền tố — không so sánh."),
  category: "sorting",
  tags: ["non-comparison", "stable", "O(n + k)", "radix building block"],
  intro: b(
    "When keys are small integers, you can beat the O(n log n) comparison bound. Count how often each key occurs, turn the counts into prefix sums (the end position of each key), then place every item directly into its slot.",
    "Khi khoá là số nguyên nhỏ, ta có thể vượt giới hạn O(n log n) của sắp xếp so sánh. Đếm số lần xuất hiện mỗi khoá, biến số đếm thành tổng tiền tố (vị trí kết thúc của mỗi khoá), rồi đặt từng phần tử thẳng vào chỗ của nó.",
  ),
  invariant: b(
    "After the prefix-sum pass, count[x] = number of items ≤ x, i.e. one past the last slot where x may go.",
    "Sau bước tổng tiền tố, count[x] = số phần tử ≤ x, tức là ngay sau ô cuối cùng mà x có thể nằm.",
  ),
  complexity: [
    { label: b("Time", "Thời gian"), value: "O(n + k)" },
    { label: b("Space", "Bộ nhớ"), value: "O(n + k)" },
    { label: b("Stable", "Ổn định"), value: "✓" },
  ],
  applications: [
    { title: b("Radix sort", "Sắp xếp cơ số"), body: b("Radix sort runs stable counting sort digit by digit — sorting millions of 32-bit IDs in linear time.", "Sắp xếp cơ số chạy sắp xếp đếm ổn định theo từng chữ số — sắp hàng triệu ID 32-bit trong thời gian tuyến tính.") },
    { title: b("Histograms & grading", "Biểu đồ tần suất & chấm điểm"), body: b("Exam scores 0–100, ages, ratings 1–5: bucket and rank them in one pass.", "Điểm thi 0–100, tuổi, đánh giá 1–5: gom nhóm và xếp hạng trong một lượt.") },
    { title: b("Suffix arrays", "Mảng hậu tố"), body: b("Building suffix arrays for full-text search uses counting/radix passes on character ranks.", "Xây mảng hậu tố cho tìm kiếm toàn văn dùng các lượt đếm/cơ số trên thứ hạng ký tự.") },
  ],
  recognize: [
    b("Values are bounded small integers (letters, digits, ages, scores).", "Giá trị là số nguyên nhỏ có giới hạn (chữ cái, chữ số, tuổi, điểm)."),
    b("“Sort characters by frequency”, “find the missing/duplicate number”.", "“Sắp ký tự theo tần suất”, “tìm số bị thiếu/trùng”."),
  ],
  pitfalls: [
    b("A huge key range (e.g. up to 10⁹) makes the count array impossible — use a hash map or radix sort.", "Miền khoá quá lớn (ví dụ tới 10⁹) khiến mảng đếm không khả thi — dùng bảng băm hoặc sắp xếp cơ số."),
    b("Iterate right-to-left in the placement pass or you lose stability.", "Duyệt từ phải sang trái khi đặt phần tử, nếu không sẽ mất tính ổn định."),
  ],
  practice: [
    { name: "Sort Colors (75)", url: "https://leetcode.com/problems/sort-colors/", level: "Medium" },
    { name: "H-Index (274)", url: "https://leetcode.com/problems/h-index/", level: "Medium" },
    { name: "Maximum Gap (164)", url: "https://leetcode.com/problems/maximum-gap/", level: "Medium" },
    { name: "Sort Characters By Frequency (451)", url: "https://leetcode.com/problems/sort-characters-by-frequency/", level: "Medium" },
  ],
  python: `def counting_sort(a, max_key):
    count = [0] * (max_key + 1)
    for x in a:
        count[x] += 1
    for i in range(1, max_key + 1):
        count[i] += count[i - 1]       # end position of key i
    out = [0] * len(a)
    for x in reversed(a):              # reversed keeps it stable
        count[x] -= 1
        out[count[x]] = x
    return out`,
  quiz: [
    {
      q: b("Why can counting sort beat O(n log n)?", "Vì sao sắp xếp đếm có thể nhanh hơn O(n log n)?"),
      options: [b("It never compares two items", "Nó không bao giờ so sánh hai phần tử"), b("It uses recursion", "Nó dùng đệ quy"), b("It is randomized", "Nó ngẫu nhiên hoá")],
      answer: 0,
      why: b("The Ω(n log n) bound only applies to comparison sorts.", "Cận Ω(n log n) chỉ áp dụng cho sắp xếp so sánh."),
    },
    {
      q: b("n = 10 items with values up to 1,000,000. Is counting sort a good idea?", "n = 10 phần tử, giá trị tới 1.000.000. Dùng sắp xếp đếm có hợp lý không?"),
      options: [b("Yes", "Có"), b("No — k dominates", "Không — k quá lớn")],
      answer: 1,
      why: b("O(n + k) = O(1,000,010): a million-cell array for ten numbers.", "O(n + k) = O(1.000.010): mảng một triệu ô cho mười số."),
    },
  ],
  view: "array",
  initial: () => toItems([4, 1, 3, 4, 2, 0, 3, 1, 4, 2, 0, 3]),
  idle: (m) => idleArray(m),
  actions: [
    { ...createArrayAction({ hi: 9, max: 16 }), run(model, values) {
      const base = createArrayAction({ hi: 9, max: 16 }).run(model, values);
      if ("error" in base) return base;
      if (base.model.some((x) => x.v > 9)) return { error: b("Counting sort demo uses keys 0–9.", "Bản demo sắp xếp đếm dùng khoá 0–9.") };
      return base;
    } },
    sortAction(countingCode, (t) => {
      const src = t.items.slice();
      const max = Math.max(...src.map((x) => x.v));
      const count = Array(max + 1).fill(0);
      const aux = (marks: Record<number, "active" | "found"> = {}) => ({ label: "count", cells: count.slice(), marks, index: true });
      t.snap(0, b(`Keys range 0..${max}: make a count array of ${max + 1} zeros.`, `Khoá trong khoảng 0..${max}: tạo mảng đếm ${max + 1} số 0.`), { aux: aux(), vars: { max } });
      src.forEach((x, i) => {
        count[x.v]++;
        t.snap(1, b(`Read A[${i}]=${x.v}: count[${x.v}] = ${count[x.v]}.`, `Đọc A[${i}]=${x.v}: count[${x.v}] = ${count[x.v]}.`), { marks: { [i]: "compare" }, aux: aux({ [x.v]: "active" }), vars: { i, x: x.v } });
      });
      for (let i = 1; i <= max; i++) {
        count[i] += count[i - 1];
        t.snap(2, b(`count[${i}] += count[${i - 1}] → ${count[i]} items are ≤ ${i}.`, `count[${i}] += count[${i - 1}] → có ${count[i]} phần tử ≤ ${i}.`), { aux: aux({ [i]: "active", [i - 1]: "found" }), vars: { i } });
      }
      const out: (Item | null)[] = Array(src.length).fill(null);
      for (let i = src.length - 1; i >= 0; i--) {
        const x = src[i];
        count[x.v]--;
        out[count[x.v]] = x;
        t.snap([3, 4], b(`${x.v} goes to out[${count[x.v]}] (scanning right to left keeps equal keys in order).`, `${x.v} vào out[${count[x.v]}] (duyệt phải sang trái giữ thứ tự khoá bằng nhau).`), {
          marks: { [i]: "compare" }, aux: { label: "out", cells: out.map((o) => (o ? o.v : null)), marks: { [count[x.v]]: "found" }, index: true }, vars: { i, x: x.v, pos: count[x.v] },
        });
      }
      t.items = out as Item[];
      t.items.forEach((_, i) => t.done.add(i));
      t.snap(5, b("Copy out back into A.", "Chép out trở lại A."), { vars: {} });
    }),
  ],
};

export const sortingModules = [bubble, selection, insertion, merge, quick, counting];
