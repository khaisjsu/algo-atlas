import type { Bilingual, Mark, Step, VizModule } from "../types";
import { b, parseList } from "../types";
import type { GridState } from "../views";

class GridTrace {
  steps: Step<GridState>[] = [];
  marks: Record<string, Mark> = {};
  constructor(public rowHead: string[], public colHead: string[], public cells: string[][], public corner = "") {}
  set(r: number, c: number, v: string | number) {
    this.cells[r][c] = String(v);
  }
  snap(line: number | number[], note: Bilingual, x: { marks?: Record<string, Mark>; arrows?: Array<[string, string]>; panels?: GridState["panels"]; vars?: Record<string, string | number> } = {}) {
    this.steps.push({
      state: { rowHead: this.rowHead, colHead: this.colHead, cells: this.cells.map((r) => r.slice()), marks: { ...this.marks, ...x.marks }, corner: this.corner, arrows: x.arrows, panels: x.panels },
      line,
      note,
      vars: x.vars,
    });
  }
}

const emptyGrid = (r: number, c: number) => Array.from({ length: r }, () => Array<string>(c).fill(""));
const k = (r: number, c: number) => `${r},${c}`;

/* ------------------------------------------------------------------ */
/* Coin change (min coins)                                             */
/* ------------------------------------------------------------------ */

type CoinModel = { coins: number[]; amount: number };

const coinView = (m: CoinModel): GridState => ({
  rowHead: ["dp"],
  colHead: Array.from({ length: m.amount + 1 }, (_, i) => String(i)),
  cells: [Array(m.amount + 1).fill("")],
  marks: {},
  corner: "amount",
  panels: [{ label: "coins", items: m.coins.map(String) }],
});

const coin: VizModule<CoinModel, GridState> = {
  slug: "coin-change",
  title: b("Coin change", "Đổi tiền xu"),
  short: b("Fewest coins for an amount — the gateway DP problem.", "Số xu ít nhất cho một số tiền — bài nhập môn quy hoạch động."),
  category: "dp",
  tags: ["1-D DP", "unbounded", "O(amount · coins)"],
  intro: b(
    "Greedy (always take the biggest coin) fails for coins like {1, 3, 4} and amount 6: greedy gives 4+1+1, but 3+3 is better. Dynamic programming solves every smaller amount first: dp[a] = 1 + min(dp[a − c]) over all coins c. Each answer is built from answers you already trust.",
    "Tham lam (luôn lấy xu lớn nhất) thất bại với xu {1, 3, 4} và số tiền 6: tham lam cho 4+1+1, nhưng 3+3 tốt hơn. Quy hoạch động giải mọi số tiền nhỏ hơn trước: dp[a] = 1 + min(dp[a − c]) với mọi xu c. Mỗi đáp án được xây từ các đáp án đã tin cậy.",
  ),
  invariant: b("When dp[a] is computed, dp[0..a−1] already hold the optimal coin counts.", "Khi tính dp[a], dp[0..a−1] đã chứa số xu tối ưu."),
  complexity: [
    { label: b("Time", "Thời gian"), value: "O(A · C)" },
    { label: b("Space", "Bộ nhớ"), value: "O(A)" },
    { label: b("States", "Trạng thái"), value: "A + 1" },
  ],
  applications: [
    { title: b("Cash machines & vending", "Máy ATM & bán hàng tự động"), body: b("Dispense change with the fewest notes for any currency system, not just ‘canonical’ ones.", "Trả tiền thối với ít tờ nhất cho mọi hệ tiền, không chỉ hệ “chuẩn”.") },
    { title: b("Resource allocation", "Phân bổ tài nguyên"), body: b("Fill a target capacity with the fewest standard-size containers, VMs or packets.", "Lấp đầy dung lượng mục tiêu bằng ít thùng chứa, VM hoặc gói tin kích thước chuẩn nhất.") },
    { title: b("Pattern for many problems", "Khuôn mẫu cho nhiều bài"), body: b("Perfect squares, minimum cost tickets and word break all share this ‘best over last choice’ recurrence.", "Số chính phương, vé chi phí thấp nhất và tách từ đều dùng chung truy hồi “tốt nhất theo lựa chọn cuối”.") },
  ],
  recognize: [
    b("“Minimum number of … to reach exactly X” with reusable pieces.", "“Số … tối thiểu để đạt đúng X” với các phần dùng lại được."),
    b("Greedy seems right but you can find a counter-example.", "Tham lam có vẻ đúng nhưng bạn tìm được phản ví dụ."),
  ],
  pitfalls: [
    b("Initialise unreachable amounts to ∞, not 0, or min() picks them.", "Khởi tạo số tiền không đạt được là ∞, không phải 0, nếu không min() sẽ chọn chúng."),
    b("Counting combinations (coin change II) needs the coin loop outside, or you count permutations.", "Đếm tổ hợp (coin change II) cần vòng lặp xu ở ngoài, nếu không sẽ đếm hoán vị."),
  ],
  practice: [
    { name: "Climbing Stairs (70)", url: "https://leetcode.com/problems/climbing-stairs/", level: "Easy" },
    { name: "Coin Change (322)", url: "https://leetcode.com/problems/coin-change/", level: "Medium" },
    { name: "Coin Change II (518)", url: "https://leetcode.com/problems/coin-change-ii/", level: "Medium" },
    { name: "Perfect Squares (279)", url: "https://leetcode.com/problems/perfect-squares/", level: "Medium" },
  ],
  python: `def coin_change(coins, amount):
    INF = float("inf")
    dp = [0] + [INF] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
    return dp[amount] if dp[amount] < INF else -1`,
  quiz: [
    {
      q: b("Coins {1, 3, 4}, amount 6. What does greedy (largest first) return, and what is optimal?", "Xu {1, 3, 4}, số tiền 6. Tham lam (lớn trước) cho bao nhiêu, tối ưu là bao nhiêu?"),
      options: [b("3 coins vs 2 coins", "3 xu so với 2 xu"), b("2 vs 2", "2 so với 2"), b("3 vs 3", "3 so với 3")],
      answer: 0,
      why: b("Greedy: 4+1+1. Optimal: 3+3.", "Tham lam: 4+1+1. Tối ưu: 3+3."),
    },
  ],
  view: "grid",
  initial: () => ({ coins: [1, 3, 4], amount: 10 }),
  idle: coinView,
  actions: [
    {
      id: "solve",
      label: b("Solve", "Giải"),
      fields: [
        { key: "coins", label: b("Coins", "Mệnh giá"), kind: "list", default: "1, 3, 4" },
        { key: "amount", label: b("Amount", "Số tiền"), kind: "number", default: 10, min: 1, max: 18 },
      ],
      code: ["dp[0] = 0; dp[1..A] = ∞", "for a = 1 to A", "  for each coin c ≤ a", "    dp[a] = min(dp[a], dp[a - c] + 1)", "return dp[A]"],
      run(_m, v) {
        const coins = parseList(v.coins ?? "");
        const A = Math.max(1, Math.min(18, Number(v.amount) || 10));
        if (!coins || !coins.length || coins.some((c) => c < 1 || c > 20)) return { error: b("Coins must be whole numbers 1–20.", "Mệnh giá phải là số nguyên 1–20.") };
        const model = { coins: [...new Set(coins)].sort((a, c) => a - c), amount: A };
        const base = coinView(model);
        const t = new GridTrace(base.rowHead, base.colHead, base.cells, "amount");
        const panels = base.panels;
        const dp = [0, ...Array(A).fill(Infinity)];
        const choice = Array(A + 1).fill(0);
        t.set(0, 0, 0);
        for (let a = 1; a <= A; a++) t.set(0, a, "∞");
        t.snap(0, b("Zero coins make amount 0; everything else starts unreachable.", "Không xu nào tạo ra 0; mọi số tiền khác ban đầu chưa đạt được."), { panels });
        for (let a = 1; a <= A; a++) {
          for (const c of model.coins) {
            if (c > a) continue;
            const cand = dp[a - c] + 1;
            const better = cand < dp[a];
            t.snap([2, 3], better
              ? b(`Use coin ${c}: dp[${a - c}] + 1 = ${cand} beats ${dp[a] === Infinity ? "∞" : dp[a]}.`, `Dùng xu ${c}: dp[${a - c}] + 1 = ${cand} tốt hơn ${dp[a] === Infinity ? "∞" : dp[a]}.`)
              : b(`Use coin ${c}: dp[${a - c}] + 1 = ${cand === Infinity ? "∞" : cand}, no better.`, `Dùng xu ${c}: dp[${a - c}] + 1 = ${cand === Infinity ? "∞" : cand}, không tốt hơn.`), {
              marks: { [k(0, a)]: "active", [k(0, a - c)]: "compare" }, arrows: [[k(0, a), k(0, a - c)]], panels, vars: { a, c, "dp[a-c]+1": cand === Infinity ? "∞" : cand },
            });
            if (better) { dp[a] = cand; choice[a] = c; t.set(0, a, cand); }
          }
          t.marks[k(0, a)] = dp[a] === Infinity ? "reject" : "done";
        }
        if (dp[A] === Infinity) {
          t.snap(4, b(`Amount ${A} cannot be made with these coins.`, `Không thể tạo ${A} từ các xu này.`), { panels });
        } else {
          const used: number[] = [];
          const path: Record<string, Mark> = {};
          for (let a = A; a > 0; a -= choice[a]) { used.push(choice[a]); path[k(0, a)] = "path"; }
          t.snap(4, b(`dp[${A}] = ${dp[A]}: use ${used.join(" + ")}. Follow the path back through the table.`, `dp[${A}] = ${dp[A]}: dùng ${used.join(" + ")}. Lần ngược đường đi trong bảng.`), { marks: path, panels: [...(panels ?? []), { label: "solution", items: used.map(String) }] });
        }
        return { steps: t.steps, model };
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 0/1 knapsack                                                        */
/* ------------------------------------------------------------------ */

type KModel = { w: number[]; v: number[]; cap: number };

const kView = (m: KModel): GridState => ({
  rowHead: ["∅", ...m.w.map((w, i) => `#${i + 1} w${w} $${m.v[i]}`)],
  colHead: Array.from({ length: m.cap + 1 }, (_, i) => String(i)),
  cells: emptyGrid(m.w.length + 1, m.cap + 1),
  marks: {},
  corner: "item \\ cap",
});

const knapsack: VizModule<KModel, GridState> = {
  slug: "knapsack",
  title: b("0/1 knapsack", "Bài toán cái túi 0/1"),
  short: b("Pick items under a weight limit to maximise value.", "Chọn đồ vật trong giới hạn khối lượng để tối đa giá trị."),
  category: "dp",
  tags: ["2-D DP", "take / skip", "O(n · W)"],
  intro: b(
    "Each item can be taken once or not at all. dp[i][c] is the best value using only the first i items with capacity c. For item i you either skip it (dp[i−1][c]) or take it (value + dp[i−1][c − weight]). The table fills row by row; the answer is the bottom-right cell.",
    "Mỗi đồ vật được lấy một lần hoặc không lấy. dp[i][c] là giá trị tốt nhất khi chỉ dùng i đồ vật đầu với sức chứa c. Với đồ vật i, ta bỏ qua (dp[i−1][c]) hoặc lấy (giá trị + dp[i−1][c − khối lượng]). Bảng được điền từng hàng; đáp án ở ô dưới cùng bên phải.",
  ),
  invariant: b("dp[i][c] is optimal for the sub-problem (first i items, capacity c) — the principle of optimal substructure.", "dp[i][c] tối ưu cho bài toán con (i đồ vật đầu, sức chứa c) — nguyên lý cấu trúc con tối ưu."),
  complexity: [
    { label: b("Time", "Thời gian"), value: "O(n · W)" },
    { label: b("Space", "Bộ nhớ"), value: "O(n · W) → O(W)" },
    { label: b("Note", "Lưu ý"), value: "pseudo-polynomial" },
  ],
  applications: [
    { title: b("Budget allocation", "Phân bổ ngân sách"), body: b("Choose projects with the highest return under a fixed budget; choose ads to fit a time slot.", "Chọn dự án có lợi nhuận cao nhất trong ngân sách cố định; chọn quảng cáo vừa khung giờ.") },
    { title: b("Cloud & cargo packing", "Đóng gói đám mây & hàng hoá"), body: b("Fit the most valuable jobs onto a machine with limited memory, or cargo into a plane.", "Xếp các tác vụ giá trị nhất lên máy có bộ nhớ hạn chế, hoặc hàng hoá lên máy bay.") },
    { title: b("Subset sum & partition", "Tổng tập con & chia đôi"), body: b("“Can these numbers be split into two equal halves?” is knapsack with value = weight.", "“Có chia được các số này thành hai nửa bằng nhau không?” là cái túi với giá trị = khối lượng.") },
    { title: b("Cryptography history", "Lịch sử mật mã"), body: b("The Merkle–Hellman cryptosystem was built on knapsack hardness (and later broken).", "Hệ mật Merkle–Hellman được xây trên độ khó của bài toán cái túi (và sau đó bị phá).") },
  ],
  recognize: [
    b("Each item used at most once, a capacity/budget constraint, maximise or count.", "Mỗi vật dùng tối đa một lần, ràng buộc sức chứa/ngân sách, tối đa hoá hoặc đếm."),
    b("“Can we reach sum S using a subset?”", "“Có đạt tổng S bằng một tập con không?”"),
  ],
  pitfalls: [
    b("With a 1-D array, loop capacity downwards, or an item gets reused (that is unbounded knapsack).", "Với mảng 1 chiều, duyệt sức chứa giảm dần, nếu không một vật bị dùng lại (thành cái túi không giới hạn)."),
    b("O(n·W) is exponential in the number of bits of W — huge capacities need other methods.", "O(n·W) là hàm mũ theo số bit của W — sức chứa rất lớn cần cách khác."),
  ],
  practice: [
    { name: "Partition Equal Subset Sum (416)", url: "https://leetcode.com/problems/partition-equal-subset-sum/", level: "Medium" },
    { name: "Target Sum (494)", url: "https://leetcode.com/problems/target-sum/", level: "Medium" },
    { name: "Ones and Zeroes (474)", url: "https://leetcode.com/problems/ones-and-zeroes/", level: "Medium" },
    { name: "Last Stone Weight II (1049)", url: "https://leetcode.com/problems/last-stone-weight-ii/", level: "Medium" },
  ],
  python: `def knapsack(weights, values, cap):
    dp = [0] * (cap + 1)
    for w, v in zip(weights, values):
        for c in range(cap, w - 1, -1):     # downwards: each item once
            dp[c] = max(dp[c], dp[c - w] + v)
    return dp[cap]`,
  quiz: [
    {
      q: b("In the 1-D version, why must capacity loop from high to low?", "Ở phiên bản 1 chiều, vì sao sức chứa phải duyệt từ cao xuống thấp?"),
      options: [b("So dp[c − w] still refers to the previous row", "Để dp[c − w] vẫn là của hàng trước"), b("For speed", "Để nhanh hơn"), b("It doesn't matter", "Không quan trọng")],
      answer: 0,
      why: b("Low-to-high would let the same item be added again in this row.", "Duyệt thấp lên cao khiến cùng một vật được thêm lại trong hàng này."),
    },
  ],
  view: "grid",
  initial: () => ({ w: [1, 3, 4, 5], v: [1, 4, 5, 7], cap: 7 }),
  idle: kView,
  actions: [
    {
      id: "solve",
      label: b("Solve", "Giải"),
      fields: [
        { key: "w", label: b("Weights", "Khối lượng"), kind: "list", default: "1, 3, 4, 5" },
        { key: "v", label: b("Values", "Giá trị"), kind: "list", default: "1, 4, 5, 7" },
        { key: "cap", label: b("Capacity", "Sức chứa"), kind: "number", default: 7, min: 1, max: 12 },
      ],
      code: ["dp[0][*] = 0", "for i = 1 to n", "  for c = 0 to W", "    skip = dp[i-1][c]", "    take = v[i] + dp[i-1][c - w[i]]   (if w[i] ≤ c)", "    dp[i][c] = max(skip, take)", "trace back from dp[n][W] to list chosen items"],
      run(_m, val) {
        const w = parseList(val.w ?? ""), v = parseList(val.v ?? "");
        const cap = Math.max(1, Math.min(12, Number(val.cap) || 7));
        if (!w || !v || !w.length || w.length !== v.length) return { error: b("Give the same number of weights and values.", "Nhập số khối lượng bằng số giá trị.") };
        if (w.length > 6) return { error: b("Use at most 6 items.", "Tối đa 6 đồ vật.") };
        if (w.some((x) => x < 1)) return { error: b("Weights must be ≥ 1.", "Khối lượng phải ≥ 1.") };
        const model = { w, v, cap };
        const base = kView(model);
        const t = new GridTrace(base.rowHead, base.colHead, base.cells, base.corner);
        const n = w.length;
        const dp = Array.from({ length: n + 1 }, () => Array(cap + 1).fill(0));
        for (let c = 0; c <= cap; c++) { t.set(0, c, 0); t.marks[k(0, c)] = "done"; }
        t.snap(0, b("With no items, every capacity has value 0.", "Không có đồ vật, mọi sức chứa đều có giá trị 0."));
        for (let i = 1; i <= n; i++) {
          for (let c = 0; c <= cap; c++) {
            const skip = dp[i - 1][c];
            const can = w[i - 1] <= c;
            const take = can ? v[i - 1] + dp[i - 1][c - w[i - 1]] : -Infinity;
            dp[i][c] = Math.max(skip, take);
            t.set(i, c, dp[i][c]);
            const arrows: Array<[string, string]> = [[k(i, c), k(i - 1, c)]];
            const marks: Record<string, Mark> = { [k(i, c)]: "active", [k(i - 1, c)]: "compare" };
            if (can) { arrows.push([k(i, c), k(i - 1, c - w[i - 1])]); marks[k(i - 1, c - w[i - 1])] = "compare"; }
            t.snap([3, 4, 5], can
              ? b(`Item ${i} (w=${w[i - 1]}, $${v[i - 1]}), cap ${c}: skip = ${skip}, take = ${v[i - 1]} + ${dp[i - 1][c - w[i - 1]]} = ${take} → ${dp[i][c]}.`, `Vật ${i} (w=${w[i - 1]}, $${v[i - 1]}), sức chứa ${c}: bỏ = ${skip}, lấy = ${v[i - 1]} + ${dp[i - 1][c - w[i - 1]]} = ${take} → ${dp[i][c]}.`)
              : b(`Item ${i} weighs ${w[i - 1]} > ${c}: can't take it, copy ${skip}.`, `Vật ${i} nặng ${w[i - 1]} > ${c}: không lấy được, chép ${skip}.`), { marks, arrows, vars: { i, c, skip, take: can ? take : "—" } });
            t.marks[k(i, c)] = "done";
          }
        }
        const chosen: number[] = [];
        const path: Record<string, Mark> = {};
        for (let i = n, c = cap; i > 0; i--) {
          path[k(i, c)] = "path";
          if (dp[i][c] !== dp[i - 1][c]) { chosen.push(i); c -= w[i - 1]; }
          if (i === 1) path[k(0, c)] = "path";
        }
        t.snap(6, b(`Best value ${dp[n][cap]}: take item(s) ${chosen.reverse().map((i) => `#${i}`).join(", ") || "none"}. A value change between rows means the item was taken.`, `Giá trị tốt nhất ${dp[n][cap]}: lấy vật ${chosen.map((i) => `#${i}`).join(", ") || "không có"}. Giá trị thay đổi giữa hai hàng nghĩa là vật đó được lấy.`), { marks: path });
        return { steps: t.steps, model };
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Longest common subsequence & edit distance                          */
/* ------------------------------------------------------------------ */

type SModel = { a: string; b: string };

const sView = (m: SModel): GridState => ({
  rowHead: ["ε", ...m.a.split("")],
  colHead: ["ε", ...m.b.split("")],
  cells: emptyGrid(m.a.length + 1, m.b.length + 1),
  marks: {},
  corner: "",
});

const strFields = (a: string, c: string) => [
  { key: "a", label: b("String A", "Chuỗi A"), kind: "list" as const, default: a },
  { key: "b", label: b("String B", "Chuỗi B"), kind: "list" as const, default: c },
];

const checkStrings = (v: Record<string, string>): { error: Bilingual } | { A: string; B: string } => {
  const A = (v.a ?? "").trim().toUpperCase().replace(/\s+/g, "");
  const B = (v.b ?? "").trim().toUpperCase().replace(/\s+/g, "");
  if (!A || !B) return { error: b("Both strings need at least one character.", "Cả hai chuỗi cần ít nhất một ký tự.") };
  if (A.length > 9 || B.length > 9) return { error: b("Keep strings to 9 characters so the table fits.", "Giữ chuỗi tối đa 9 ký tự để bảng vừa màn hình.") };
  return { A, B };
};

const lcs: VizModule<SModel, GridState> = {
  slug: "longest-common-subsequence",
  title: b("Longest common subsequence", "Dãy con chung dài nhất"),
  short: b("The backbone of diff, DNA alignment and plagiarism checks.", "Xương sống của diff, căn chỉnh DNA và kiểm tra đạo văn."),
  category: "dp",
  tags: ["2-D DP", "strings", "O(n · m)", "diff"],
  intro: b(
    "A subsequence keeps order but may skip characters. dp[i][j] is the LCS length of the first i characters of A and the first j of B. If A[i] = B[j], extend the diagonal (+1); otherwise take the better of dropping a character from either string.",
    "Dãy con giữ thứ tự nhưng có thể bỏ ký tự. dp[i][j] là độ dài LCS của i ký tự đầu của A và j ký tự đầu của B. Nếu A[i] = B[j], kéo dài đường chéo (+1); nếu không, lấy kết quả tốt hơn khi bỏ một ký tự ở một trong hai chuỗi.",
  ),
  invariant: b("Every cell depends only on its top, left and top-left neighbours, which are already filled.", "Mỗi ô chỉ phụ thuộc vào ô trên, trái và chéo trên-trái, đều đã được điền."),
  complexity: [
    { label: b("Time", "Thời gian"), value: "O(n · m)" },
    { label: b("Space", "Bộ nhớ"), value: "O(n · m) → O(min)" },
  ],
  applications: [
    { title: b("diff & git", "diff & git"), body: b("Line-based diff finds the longest common subsequence of lines; everything else is shown as added or removed.", "diff theo dòng tìm dãy con chung dài nhất của các dòng; phần còn lại hiển thị là thêm hoặc xoá.") },
    { title: b("Bioinformatics", "Tin sinh học"), body: b("Aligning DNA/protein sequences (Needleman–Wunsch) is this table with scores.", "Căn chỉnh chuỗi DNA/protein (Needleman–Wunsch) chính là bảng này có tính điểm.") },
    { title: b("Plagiarism & similarity", "Đạo văn & độ tương đồng"), body: b("LCS length relative to text length is a simple similarity score.", "Độ dài LCS so với độ dài văn bản là một thước đo tương đồng đơn giản.") },
  ],
  recognize: [
    b("Two sequences, “common”, order matters, gaps allowed.", "Hai dãy, “chung”, thứ tự quan trọng, cho phép khoảng trống."),
    b("“Minimum deletions to make two strings equal” = n + m − 2·LCS.", "“Số lần xoá tối thiểu để hai chuỗi bằng nhau” = n + m − 2·LCS."),
  ],
  pitfalls: [
    b("Subsequence ≠ substring: substrings must be contiguous (different recurrence).", "Dãy con ≠ chuỗi con: chuỗi con phải liên tiếp (truy hồi khác)."),
    b("Index carefully: dp has one extra row/column for the empty prefix.", "Cẩn thận chỉ số: dp có thêm một hàng/cột cho tiền tố rỗng."),
  ],
  practice: [
    { name: "Longest Common Subsequence (1143)", url: "https://leetcode.com/problems/longest-common-subsequence/", level: "Medium" },
    { name: "Delete Operation for Two Strings (583)", url: "https://leetcode.com/problems/delete-operation-for-two-strings/", level: "Medium" },
    { name: "Uncrossed Lines (1035)", url: "https://leetcode.com/problems/uncrossed-lines/", level: "Medium" },
    { name: "Shortest Common Supersequence (1092)", url: "https://leetcode.com/problems/shortest-common-supersequence/", level: "Hard" },
  ],
  python: `def lcs(a, b):
    n, m = len(a), len(b)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[n][m]`,
  quiz: [
    {
      q: b("LCS of “ABCBDAB” and “BDCABA” has length…", "LCS của “ABCBDAB” và “BDCABA” có độ dài…"),
      options: [b("3", "3"), b("4", "4"), b("5", "5")],
      answer: 1,
      why: b("For example “BCBA” or “BDAB”.", "Ví dụ “BCBA” hoặc “BDAB”."),
    },
  ],
  view: "grid",
  initial: () => ({ a: "ABCBDAB", b: "BDCABA" }),
  idle: sView,
  actions: [
    {
      id: "solve",
      label: b("Solve", "Giải"),
      fields: strFields("ABCBDAB", "BDCABA"),
      code: ["dp[0][*] = dp[*][0] = 0", "for i = 1 to n, j = 1 to m", "  if A[i] == B[j]: dp[i][j] = dp[i-1][j-1] + 1", "  else: dp[i][j] = max(dp[i-1][j], dp[i][j-1])", "walk back from dp[n][m] collecting matches"],
      run(_m, v) {
        const s = checkStrings(v);
        if ("error" in s) return s;
        const { A, B } = s;
        const model = { a: A, b: B };
        const base = sView(model);
        const t = new GridTrace(base.rowHead, base.colHead, base.cells);
        const n = A.length, m = B.length;
        const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
        for (let i = 0; i <= n; i++) { t.set(i, 0, 0); t.marks[k(i, 0)] = "done"; }
        for (let j = 0; j <= m; j++) { t.set(0, j, 0); t.marks[k(0, j)] = "done"; }
        t.snap(0, b("An empty prefix has nothing in common with anything: first row and column are 0.", "Tiền tố rỗng không có gì chung: hàng và cột đầu bằng 0."));
        for (let i = 1; i <= n; i++)
          for (let j = 1; j <= m; j++) {
            if (A[i - 1] === B[j - 1]) {
              dp[i][j] = dp[i - 1][j - 1] + 1;
              t.set(i, j, dp[i][j]);
              t.snap(2, b(`A[${i}] = B[${j}] = '${A[i - 1]}': extend the diagonal → ${dp[i][j]}.`, `A[${i}] = B[${j}] = '${A[i - 1]}': kéo dài đường chéo → ${dp[i][j]}.`), { marks: { [k(i, j)]: "found", [k(i - 1, j - 1)]: "compare" }, arrows: [[k(i, j), k(i - 1, j - 1)]], vars: { i, j } });
            } else {
              dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
              t.set(i, j, dp[i][j]);
              const from = dp[i - 1][j] >= dp[i][j - 1] ? k(i - 1, j) : k(i, j - 1);
              t.snap(3, b(`'${A[i - 1]}' ≠ '${B[j - 1]}': max(top ${dp[i - 1][j]}, left ${dp[i][j - 1]}) = ${dp[i][j]}.`, `'${A[i - 1]}' ≠ '${B[j - 1]}': max(trên ${dp[i - 1][j]}, trái ${dp[i][j - 1]}) = ${dp[i][j]}.`), { marks: { [k(i, j)]: "active", [k(i - 1, j)]: "compare", [k(i, j - 1)]: "compare" }, arrows: [[k(i, j), from]], vars: { i, j } });
            }
            t.marks[k(i, j)] = "done";
          }
        const path: Record<string, Mark> = {};
        let out = "";
        for (let i = n, j = m; i > 0 && j > 0; ) {
          path[k(i, j)] = "path";
          if (A[i - 1] === B[j - 1]) { out = A[i - 1] + out; path[k(i, j)] = "found"; i--; j--; }
          else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
          else j--;
        }
        t.snap(4, b(`LCS length ${dp[n][m]}: “${out}”. Green cells on the path are the matched characters.`, `Độ dài LCS ${dp[n][m]}: “${out}”. Các ô xanh trên đường là ký tự khớp.`), { marks: path, panels: [{ label: "LCS", items: out.split("") }] });
        return { steps: t.steps, model };
      },
    },
  ],
};

const edit: VizModule<SModel, GridState> = {
  slug: "edit-distance",
  title: b("Edit distance (Levenshtein)", "Khoảng cách chỉnh sửa (Levenshtein)"),
  short: b("Fewest inserts, deletes and substitutions to turn one word into another.", "Số lần chèn, xoá, thay thế ít nhất để biến từ này thành từ kia."),
  category: "dp",
  tags: ["2-D DP", "strings", "spell-check", "O(n · m)"],
  intro: b(
    "dp[i][j] = the minimum edits to turn the first i letters of A into the first j letters of B. If the letters match, it costs nothing extra (diagonal). Otherwise pay 1 for the cheapest of: replace (diagonal), delete from A (up), or insert into A (left).",
    "dp[i][j] = số thao tác tối thiểu để biến i chữ đầu của A thành j chữ đầu của B. Nếu hai chữ khớp, không tốn thêm (đường chéo). Nếu không, trả 1 cho lựa chọn rẻ nhất: thay (chéo), xoá khỏi A (trên), hoặc chèn vào A (trái).",
  ),
  invariant: b("Row 0 and column 0 are the costs of building from / erasing to the empty string: j inserts or i deletes.", "Hàng 0 và cột 0 là chi phí xây từ / xoá về chuỗi rỗng: j lần chèn hoặc i lần xoá."),
  complexity: [
    { label: b("Time", "Thời gian"), value: "O(n · m)" },
    { label: b("Space", "Bộ nhớ"), value: "O(n · m) → O(m)" },
  ],
  applications: [
    { title: b("Spell checkers & search", "Kiểm tra chính tả & tìm kiếm"), body: b("“Did you mean …?” suggests dictionary words within edit distance 1–2 of your typo.", "“Có phải bạn muốn …?” gợi ý các từ trong từ điển cách lỗi gõ 1–2 thao tác.") },
    { title: b("Fuzzy matching", "So khớp mờ"), body: b("Deduplicate customer names, match addresses, compare OCR output with ground truth.", "Loại trùng tên khách hàng, khớp địa chỉ, so kết quả OCR với văn bản gốc.") },
    { title: b("Speech & translation metrics", "Thước đo giọng nói & dịch"), body: b("Word error rate (WER) for speech recognition is edit distance over words.", "Tỷ lệ lỗi từ (WER) của nhận dạng giọng nói là khoảng cách chỉnh sửa trên từ.") },
  ],
  recognize: [
    b("“Minimum operations to convert string A to B”.", "“Số thao tác tối thiểu để chuyển chuỗi A thành B”."),
    b("How similar are two strings when typos are allowed?", "Hai chuỗi giống nhau đến đâu khi cho phép lỗi gõ?"),
  ],
  pitfalls: [
    b("Forgetting the base row/column (they are 0..n, not all zeros).", "Quên hàng/cột cơ sở (chúng là 0..n, không phải toàn 0)."),
    b("Mixing up which direction is insert vs delete when reconstructing the edits.", "Nhầm hướng nào là chèn, hướng nào là xoá khi dựng lại các thao tác."),
  ],
  practice: [
    { name: "Edit Distance (72)", url: "https://leetcode.com/problems/edit-distance/", level: "Medium" },
    { name: "One Edit Distance (161)", url: "https://leetcode.com/problems/one-edit-distance/", level: "Medium" },
    { name: "Minimum ASCII Delete Sum (712)", url: "https://leetcode.com/problems/minimum-ascii-delete-sum-for-two-strings/", level: "Medium" },
  ],
  python: `def edit_distance(a, b):
    n, m = len(a), len(b)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1): dp[i][0] = i
    for j in range(m + 1): dp[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j - 1],   # replace
                                   dp[i - 1][j],       # delete
                                   dp[i][j - 1])       # insert
    return dp[n][m]`,
  quiz: [
    {
      q: b("Edit distance from “kitten” to “sitting”?", "Khoảng cách chỉnh sửa từ “kitten” tới “sitting”?"),
      options: [b("2", "2"), b("3", "3"), b("4", "4")],
      answer: 1,
      why: b("k→s, e→i, insert g.", "k→s, e→i, chèn g."),
    },
  ],
  view: "grid",
  initial: () => ({ a: "KITTEN", b: "SITTING" }),
  idle: sView,
  actions: [
    {
      id: "solve",
      label: b("Solve", "Giải"),
      fields: strFields("KITTEN", "SITTING"),
      code: ["dp[i][0] = i; dp[0][j] = j", "for i = 1 to n, j = 1 to m", "  if A[i] == B[j]: dp[i][j] = dp[i-1][j-1]", "  else: dp[i][j] = 1 + min(replace ↖, delete ↑, insert ←)", "walk back to list the edits"],
      run(_m, v) {
        const s = checkStrings(v);
        if ("error" in s) return s;
        const { A, B } = s;
        const model = { a: A, b: B };
        const base = sView(model);
        const t = new GridTrace(base.rowHead, base.colHead, base.cells);
        const n = A.length, m = B.length;
        const dp = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
        for (let i = 0; i <= n; i++) { t.set(i, 0, i); t.marks[k(i, 0)] = "done"; }
        for (let j = 0; j <= m; j++) { t.set(0, j, j); t.marks[k(0, j)] = "done"; }
        t.snap(0, b("Base cases: turning a prefix into ε costs i deletes; building B's prefix from ε costs j inserts.", "Trường hợp cơ sở: biến tiền tố thành ε tốn i lần xoá; xây tiền tố của B từ ε tốn j lần chèn."));
        for (let i = 1; i <= n; i++)
          for (let j = 1; j <= m; j++) {
            if (A[i - 1] === B[j - 1]) {
              dp[i][j] = dp[i - 1][j - 1];
              t.set(i, j, dp[i][j]);
              t.snap(2, b(`'${A[i - 1]}' matches: free, copy the diagonal ${dp[i][j]}.`, `'${A[i - 1]}' khớp: miễn phí, chép đường chéo ${dp[i][j]}.`), { marks: { [k(i, j)]: "found", [k(i - 1, j - 1)]: "compare" }, arrows: [[k(i, j), k(i - 1, j - 1)]], vars: { i, j } });
            } else {
              const rep = dp[i - 1][j - 1], del = dp[i - 1][j], ins = dp[i][j - 1];
              dp[i][j] = 1 + Math.min(rep, del, ins);
              t.set(i, j, dp[i][j]);
              const from = rep <= del && rep <= ins ? k(i - 1, j - 1) : del <= ins ? k(i - 1, j) : k(i, j - 1);
              t.snap(3, b(`'${A[i - 1]}' ≠ '${B[j - 1]}': 1 + min(replace ${rep}, delete ${del}, insert ${ins}) = ${dp[i][j]}.`, `'${A[i - 1]}' ≠ '${B[j - 1]}': 1 + min(thay ${rep}, xoá ${del}, chèn ${ins}) = ${dp[i][j]}.`), { marks: { [k(i, j)]: "active", [k(i - 1, j - 1)]: "compare", [k(i - 1, j)]: "compare", [k(i, j - 1)]: "compare" }, arrows: [[k(i, j), from]], vars: { i, j } });
            }
            t.marks[k(i, j)] = "done";
          }
        const ops: string[] = [];
        const path: Record<string, Mark> = { [k(0, 0)]: "path" };
        for (let i = n, j = m; i > 0 || j > 0; ) {
          path[k(i, j)] = "path";
          if (i > 0 && j > 0 && A[i - 1] === B[j - 1]) { i--; j--; }
          else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) { ops.unshift(`${A[i - 1]}→${B[j - 1]}`); i--; j--; }
          else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) { ops.unshift(`−${A[i - 1]}`); i--; }
          else { ops.unshift(`+${B[j - 1]}`); j--; }
        }
        t.snap(4, b(`Distance ${dp[n][m]}. Edits: ${ops.join(", ") || "none"}.`, `Khoảng cách ${dp[n][m]}. Thao tác: ${ops.join(", ") || "không có"}.`), { marks: path, panels: [{ label: "edits", items: ops }] });
        return { steps: t.steps, model };
      },
    },
  ],
};

export const dpModules = [coin, knapsack, lcs, edit];
