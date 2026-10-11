import type { Action, Bilingual, Field, Step, VizModule } from "../types";
import { b, parseList, randInt } from "../types";
import type { Marks, TreeNode, TreeState } from "../views";

const valueField = (def: number): Field => ({ key: "value", label: b("Value", "Giá trị"), kind: "number", default: def, min: 0, max: 99 });

/* ------------------------------------------------------------------ */
/* Binary search tree                                                  */
/* ------------------------------------------------------------------ */

type BNode = { v: number; l: number | null; r: number | null };
type BST = { nodes: Record<number, BNode>; root: number | null; next: number };

const cloneBST = (t: BST): BST => ({ nodes: Object.fromEntries(Object.entries(t.nodes).map(([k, n]) => [k, { ...n }])), root: t.root, next: t.next });

const bstView = (t: BST, marks: Marks = {}, extra: Partial<TreeState> = {}): TreeState => {
  const nodes: Record<number, TreeNode> = {};
  for (const [k, n] of Object.entries(t.nodes)) nodes[Number(k)] = { label: String(n.v), kids: [n.l, n.r] };
  return { nodes, roots: t.root == null ? [] : [t.root], marks, ...extra };
};

function insertRaw(t: BST, v: number) {
  const id = t.next++;
  t.nodes[id] = { v, l: null, r: null };
  if (t.root == null) { t.root = id; return; }
  let cur = t.root;
  for (;;) {
    const n = t.nodes[cur];
    if (v < n.v) { if (n.l == null) { n.l = id; return; } cur = n.l; }
    else { if (n.r == null) { n.r = id; return; } cur = n.r; }
  }
}

const buildBST = (values: number[]) => {
  const t: BST = { nodes: {}, root: null, next: 1 };
  values.forEach((v) => insertRaw(t, v));
  return t;
};

const height = (t: BST, id: number | null): number => (id == null ? 0 : 1 + Math.max(height(t, t.nodes[id].l), height(t, t.nodes[id].r)));

class TreeTrace<M> {
  steps: Step<TreeState>[] = [];
  constructor(public view: (m: M, marks: Marks, extra?: Partial<TreeState>) => TreeState, public model: M) {}
  snap(line: number | number[], note: Bilingual, marks: Marks = {}, extra: Partial<TreeState> & { vars?: Record<string, string | number> } = {}) {
    const { vars, ...rest } = extra;
    this.steps.push({ state: this.view(this.model, marks, rest), line, note, vars });
  }
}

type BAction = Action<BST, TreeState>;

const bstInsert: BAction = {
  id: "insert",
  label: b("Insert", "Chèn"),
  fields: [valueField(33)],
  code: ["if root == null: root = new node(v); return", "cur = root", "loop", "  if v < cur.val: go left (insert there if empty)", "  else: go right (insert there if empty)"],
  run(m, val) {
    const v = Number(val.value);
    if (Object.keys(m.nodes).length >= 15) return { error: b("Demo tree is full (15 nodes).", "Cây demo đã đầy (15 nút).") };
    const t = new TreeTrace(bstView, cloneBST(m));
    if (t.model.root == null) {
      insertRaw(t.model, v);
      t.snap(0, b(`Empty tree: ${v} becomes the root.`, `Cây rỗng: ${v} trở thành gốc.`), { [t.model.root!]: "found" });
      return { steps: t.steps, model: t.model };
    }
    let cur = t.model.root;
    const path: Marks = {};
    t.snap(1, b(`Insert ${v}: start at the root.`, `Chèn ${v}: bắt đầu từ gốc.`), { [cur]: "compare" }, { vars: { v } });
    for (;;) {
      const n = t.model.nodes[cur];
      path[cur] = "path";
      const left = v < n.v;
      const nextId = left ? n.l : n.r;
      t.snap(left ? 3 : 4, left ? b(`${v} < ${n.v} → go left.`, `${v} < ${n.v} → sang trái.`) : b(`${v} ≥ ${n.v} → go right.`, `${v} ≥ ${n.v} → sang phải.`), { ...path, [cur]: "compare" }, { vars: { v, cur: n.v } });
      if (nextId == null) {
        const id = t.model.next++;
        t.model.nodes[id] = { v, l: null, r: null };
        if (left) n.l = id; else n.r = id;
        t.snap(left ? 3 : 4, b(`Empty spot found: attach ${v} as the ${left ? "left" : "right"} child of ${n.v}. Height is now ${height(t.model, t.model.root)}.`, `Tìm thấy chỗ trống: gắn ${v} làm con ${left ? "trái" : "phải"} của ${n.v}. Chiều cao hiện là ${height(t.model, t.model.root)}.`), { ...path, [id]: "found" }, { vars: { v } });
        return { steps: t.steps, model: t.model };
      }
      cur = nextId;
    }
  },
};

const bstSearch: BAction = {
  id: "search",
  label: b("Search", "Tìm"),
  fields: [valueField(41)],
  code: ["cur = root", "while cur != null", "  if v == cur.val: return cur", "  cur = v < cur.val ? cur.left : cur.right", "return not found"],
  run(m, val) {
    const v = Number(val.value);
    const t = new TreeTrace(bstView, m);
    let cur = m.root;
    const path: Marks = {};
    let depth = 0;
    t.snap(0, b(`Search for ${v} from the root.`, `Tìm ${v} từ gốc.`), {}, { vars: { v } });
    while (cur != null) {
      const n = m.nodes[cur];
      if (n.v === v) {
        t.snap([1, 2], b(`Found ${v} after visiting ${depth + 1} node(s).`, `Tìm thấy ${v} sau khi thăm ${depth + 1} nút.`), { ...path, [cur]: "found" }, { vars: { v, depth } });
        return { steps: t.steps, model: m };
      }
      path[cur] = "path";
      t.snap([1, 3], v < n.v ? b(`${v} < ${n.v}: the whole right subtree is skipped.`, `${v} < ${n.v}: bỏ qua cả cây con phải.`) : b(`${v} > ${n.v}: the whole left subtree is skipped.`, `${v} > ${n.v}: bỏ qua cả cây con trái.`), { ...path, [cur]: "compare" }, { vars: { v, cur: n.v, depth } });
      cur = v < n.v ? n.l : n.r;
      depth++;
    }
    t.snap(4, b(`Fell off the tree: ${v} is not present.`, `Ra khỏi cây: không có ${v}.`), path, { vars: { v, depth } });
    return { steps: t.steps, model: m };
  },
};

const bstRemove: BAction = {
  id: "remove",
  label: b("Remove", "Xoá"),
  fields: [valueField(29)],
  code: ["find node x with value v", "case 0 children: detach x", "case 1 child: replace x by its child", "case 2 children: s = min of x.right (successor)", "  copy s.val into x; remove s from right subtree"],
  run(m, val) {
    const v = Number(val.value);
    const t = new TreeTrace(bstView, cloneBST(m));
    const T = t.model;
    let parent: number | null = null;
    let cur = T.root;
    const path: Marks = {};
    while (cur != null && T.nodes[cur].v !== v) {
      path[cur] = "path";
      t.snap(0, b(`Looking for ${v}: at ${T.nodes[cur].v}.`, `Đang tìm ${v}: tại ${T.nodes[cur].v}.`), { ...path, [cur]: "compare" });
      parent = cur;
      cur = v < T.nodes[cur].v ? T.nodes[cur].l : T.nodes[cur].r;
    }
    if (cur == null) {
      t.snap(0, b(`${v} is not in the tree.`, `${v} không có trong cây.`), path);
      return { steps: t.steps, model: m };
    }
    const x = T.nodes[cur];
    const replaceChild = (p: number | null, oldId: number, newId: number | null) => {
      if (p == null) T.root = newId;
      else if (T.nodes[p].l === oldId) T.nodes[p].l = newId;
      else T.nodes[p].r = newId;
    };
    if (x.l == null || x.r == null) {
      const child = x.l ?? x.r;
      const leaf = child == null;
      t.snap(leaf ? 1 : 2, leaf ? b(`${v} is a leaf: just detach it.`, `${v} là lá: chỉ cần gỡ ra.`) : b(`${v} has one child: its child takes its place.`, `${v} có một con: con của nó thế chỗ.`), { [cur]: "reject", ...(child != null ? { [child]: "active" } : {}) });
      replaceChild(parent, cur, child);
      delete T.nodes[cur];
      t.snap(leaf ? 1 : 2, b(`Removed ${v}.`, `Đã xoá ${v}.`), child != null ? { [child]: "found" } : {});
      return { steps: t.steps, model: T };
    }
    // Two children: find the in-order successor.
    t.snap(3, b(`${v} has two children. Replace it with its successor: the smallest value in its right subtree.`, `${v} có hai con. Thay bằng phần tử kế tiếp: giá trị nhỏ nhất ở cây con phải.`), { [cur]: "pivot" });
    let sp = cur;
    let s = x.r!;
    while (T.nodes[s].l != null) {
      t.snap(3, b(`Go left from ${T.nodes[s].v} to find the minimum.`, `Đi trái từ ${T.nodes[s].v} để tìm nhỏ nhất.`), { [cur]: "pivot", [s]: "compare" });
      sp = s;
      s = T.nodes[s].l!;
    }
    t.snap(3, b(`Successor is ${T.nodes[s].v} (it has no left child).`, `Phần tử kế tiếp là ${T.nodes[s].v} (không có con trái).`), { [cur]: "pivot", [s]: "found" });
    x.v = T.nodes[s].v;
    t.snap(4, b(`Copy ${x.v} into the node, then remove the old successor node.`, `Chép ${x.v} vào nút, rồi xoá nút kế tiếp cũ.`), { [cur]: "found", [s]: "reject" });
    if (sp === cur) T.nodes[sp].r = T.nodes[s].r;
    else T.nodes[sp].l = T.nodes[s].r;
    delete T.nodes[s];
    t.snap(4, b(`Removed ${v}; BST order is preserved.`, `Đã xoá ${v}; thứ tự BST vẫn được giữ.`), { [cur]: "found" });
    return { steps: t.steps, model: T };
  },
};

const bstTraverse: BAction = {
  id: "traverse",
  label: b("Traverse", "Duyệt cây"),
  fields: [{ key: "order", label: b("Order", "Thứ tự"), kind: "select", default: "in", options: [{ value: "in", label: b("In-order (sorted!)", "Trung thứ tự (đã sắp xếp!)") }, { value: "pre", label: b("Pre-order", "Tiền thứ tự") }, { value: "post", label: b("Post-order", "Hậu thứ tự") }, { value: "level", label: b("Level-order (BFS)", "Theo mức (BFS)") }] }],
  code: ["visit(node):", "  if node == null: return", "  [pre]  output node", "  visit(node.left)", "  [in]   output node", "  visit(node.right)", "  [post] output node"],
  run(m, val) {
    const order = val.order;
    const t = new TreeTrace(bstView, m);
    const out: string[] = [];
    const seen: Marks = {};
    const emit = (id: number, line: number) => {
      out.push(String(m.nodes[id].v));
      seen[id] = "done";
      t.snap(line, b(`Output ${m.nodes[id].v}.`, `Xuất ${m.nodes[id].v}.`), { ...seen, [id]: "found" }, { panels: [{ label: "output", items: out.slice() }] });
    };
    if (order === "level") {
      const q = m.root == null ? [] : [m.root];
      while (q.length) {
        const id = q.shift()!;
        emit(id, 2);
        const n = m.nodes[id];
        if (n.l != null) q.push(n.l);
        if (n.r != null) q.push(n.r);
      }
    } else {
      const visit = (id: number | null) => {
        if (id == null) return;
        t.snap(0, b(`Visit ${m.nodes[id].v}.`, `Thăm ${m.nodes[id].v}.`), { ...seen, [id]: "compare" }, { panels: [{ label: "output", items: out.slice() }] });
        if (order === "pre") emit(id, 2);
        visit(m.nodes[id].l);
        if (order === "in") emit(id, 4);
        visit(m.nodes[id].r);
        if (order === "post") emit(id, 6);
      };
      visit(m.root);
    }
    t.snap(-1, order === "in" ? b("In-order traversal of a BST lists the values in sorted order.", "Duyệt trung thứ tự của BST cho các giá trị theo thứ tự tăng dần.") : b("Traversal complete.", "Duyệt xong."), seen, { panels: [{ label: "output", items: out }] });
    return { steps: t.steps, model: m };
  },
};

const bstCreate: BAction = {
  id: "create",
  label: b("Create", "Tạo"),
  fields: [
    { key: "shape", label: b("Input", "Dữ liệu"), kind: "select", default: "random", options: [{ value: "random", label: b("Random", "Ngẫu nhiên") }, { value: "skewed", label: b("Sorted input (skewed!)", "Dữ liệu đã sắp xếp (lệch!)") }, { value: "empty", label: b("Empty", "Rỗng") }, { value: "custom", label: b("Custom", "Tự nhập") }] },
    { key: "list", label: b("Values (insert order)", "Giá trị (thứ tự chèn)"), kind: "list", default: "41, 20, 65, 11, 29, 50, 91, 32, 72", when: ["shape", "custom"] },
  ],
  run(_m, v) {
    let values: number[];
    if (v.shape === "empty") values = [];
    else if (v.shape === "skewed") values = [8, 15, 23, 42, 57, 64];
    else if (v.shape === "custom") {
      const p = parseList(v.list ?? "");
      if (!p) return { error: b("Enter whole numbers separated by commas.", "Nhập số nguyên, cách nhau bởi dấu phẩy.") };
      if (p.length > 15) return { error: b("At most 15 values.", "Tối đa 15 giá trị.") };
      values = p;
    } else {
      const s = new Set<number>();
      while (s.size < 10) s.add(randInt(1, 99));
      values = [...s];
    }
    const tree = buildBST(values);
    return { model: tree, steps: [{ state: bstView(tree), line: -1, note: b(`Built a BST of height ${height(tree, tree.root)} from ${values.length} values.`, `Đã xây BST chiều cao ${height(tree, tree.root)} từ ${values.length} giá trị.`) }] };
  },
};

const bst: VizModule<BST, TreeState> = {
  slug: "binary-search-tree",
  title: b("Binary search tree", "Cây nhị phân tìm kiếm"),
  short: b("Left < node ≤ right: search, insert and delete in O(height).", "Trái < nút ≤ phải: tìm, chèn, xoá trong O(chiều cao)."),
  category: "trees",
  tags: ["O(log n) if balanced", "ordered", "in-order = sorted"],
  intro: b(
    "A binary search tree keeps every value in the left subtree smaller than the node and every value in the right subtree at least as large. Each comparison lets you skip a whole subtree, like binary search — but on a structure that supports fast inserts and deletes. Try the “sorted input” example to see why balance matters.",
    "Cây nhị phân tìm kiếm giữ mọi giá trị ở cây con trái nhỏ hơn nút và mọi giá trị ở cây con phải lớn hơn hoặc bằng. Mỗi phép so sánh bỏ qua cả một cây con, giống tìm kiếm nhị phân — nhưng trên cấu trúc hỗ trợ chèn và xoá nhanh. Hãy thử ví dụ “dữ liệu đã sắp xếp” để thấy vì sao cân bằng quan trọng.",
  ),
  invariant: b("For every node x: all keys in x.left < x.key ≤ all keys in x.right.", "Với mọi nút x: mọi khoá ở x.left < x.key ≤ mọi khoá ở x.right."),
  complexity: [
    { label: b("search / insert / delete", "tìm / chèn / xoá"), value: "O(h)" },
    { label: b("balanced h", "h khi cân bằng"), value: "O(log n)" },
    { label: b("worst h (sorted input)", "h xấu nhất (đã sắp xếp)"), value: "O(n)" },
    { label: b("in-order walk", "duyệt trung thứ tự"), value: "O(n)" },
  ],
  applications: [
    { title: b("Ordered maps & sets", "Map & set có thứ tự"), body: b("C++ std::map, Java TreeMap and many databases' in-memory indexes are balanced BSTs (red-black trees).", "std::map của C++, TreeMap của Java và nhiều chỉ mục trong bộ nhớ là BST cân bằng (cây đỏ-đen).") },
    { title: b("Range queries", "Truy vấn khoảng"), body: b("“All orders between $50 and $100” or “next appointment after 3pm”: floor/ceiling and range scans hash tables cannot do.", "“Mọi đơn hàng từ 50 đến 100 đô” hay “lịch hẹn kế tiếp sau 3 giờ chiều”: floor/ceiling và quét khoảng mà bảng băm không làm được.") },
    { title: b("Schedulers", "Bộ lập lịch"), body: b("Linux's Completely Fair Scheduler keeps runnable tasks in a red-black tree keyed by virtual runtime.", "Completely Fair Scheduler của Linux giữ các tác vụ trong cây đỏ-đen theo thời gian chạy ảo.") },
    { title: b("Database indexes", "Chỉ mục cơ sở dữ liệu"), body: b("B-trees generalise BSTs to wide nodes that match disk pages.", "B-tree tổng quát hoá BST thành nút rộng khớp với trang đĩa.") },
  ],
  recognize: [
    b("You need both fast lookup and sorted order / predecessor / successor.", "Cần cả tra cứu nhanh và thứ tự / phần tử trước / phần tử sau."),
    b("“k-th smallest”, “closest value”, “validate a BST”.", "“Nhỏ thứ k”, “giá trị gần nhất”, “kiểm tra BST hợp lệ”."),
  ],
  pitfalls: [
    b("Inserting sorted data creates a linked list of height n — use a self-balancing tree (AVL, red-black).", "Chèn dữ liệu đã sắp xếp tạo danh sách liên kết cao n — hãy dùng cây tự cân bằng (AVL, đỏ-đen)."),
    b("Validating a BST by checking only parent–child pairs is wrong; pass down (min, max) bounds.", "Kiểm tra BST chỉ bằng cặp cha–con là sai; hãy truyền xuống cận (min, max)."),
  ],
  practice: [
    { name: "Search in a BST (700)", url: "https://leetcode.com/problems/search-in-a-binary-search-tree/", level: "Easy" },
    { name: "Validate Binary Search Tree (98)", url: "https://leetcode.com/problems/validate-binary-search-tree/", level: "Medium" },
    { name: "Kth Smallest Element in a BST (230)", url: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/", level: "Medium" },
    { name: "Delete Node in a BST (450)", url: "https://leetcode.com/problems/delete-node-in-a-bst/", level: "Medium" },
  ],
  python: `class Node:
    def __init__(self, val):
        self.val, self.left, self.right = val, None, None

def insert(root, val):
    if root is None:
        return Node(val)
    if val < root.val:
        root.left = insert(root.left, val)
    else:
        root.right = insert(root.right, val)
    return root

def search(root, val):
    while root and root.val != val:
        root = root.left if val < root.val else root.right
    return root

def inorder(root):          # yields values in sorted order
    if root:
        yield from inorder(root.left)
        yield root.val
        yield from inorder(root.right)`,
  quiz: [
    {
      q: b("You insert 1, 2, 3, …, 1000 into an empty plain BST. Its height is…", "Chèn 1, 2, 3, …, 1000 vào BST thường rỗng. Chiều cao là…"),
      options: [b("about 10", "khoảng 10"), b("1000", "1000"), b("500", "500")],
      answer: 1,
      why: b("Each value goes right of the previous one — a linked list.", "Mỗi giá trị nằm bên phải giá trị trước — thành danh sách liên kết."),
    },
    {
      q: b("Which traversal outputs a BST's values in sorted order?", "Cách duyệt nào xuất giá trị BST theo thứ tự tăng?"),
      options: [b("Pre-order", "Tiền thứ tự"), b("In-order", "Trung thứ tự"), b("Level-order", "Theo mức")],
      answer: 1,
      why: b("Left subtree (smaller), node, right subtree (larger).", "Cây con trái (nhỏ hơn), nút, cây con phải (lớn hơn)."),
    },
  ],
  view: "tree",
  initial: () => buildBST([41, 20, 65, 11, 29, 50, 91, 32, 72, 99]),
  idle: (m) => bstView(m),
  actions: [bstCreate, bstInsert, bstSearch, bstRemove, bstTraverse],
};

/* ------------------------------------------------------------------ */
/* Binary heap (max-heap)                                              */
/* ------------------------------------------------------------------ */

type Heap = number[];

const heapView = (h: Heap, marks: Marks = {}, extra: Partial<TreeState> = {}): TreeState => {
  const nodes: Record<number, TreeNode> = {};
  h.forEach((v, i) => {
    const l = 2 * i + 1, r = 2 * i + 2;
    nodes[i] = { label: String(v), kids: [l < h.length ? l : null, r < h.length ? r : null] };
  });
  return {
    nodes,
    roots: h.length ? [0] : [],
    marks,
    tags: Object.fromEntries(h.map((_, i) => [i, `[${i}]`])),
    strip: { label: "A", cells: h.map(String), marks },
    ...extra,
  };
};

type HAction = Action<Heap, TreeState>;
const HEAP_MAX = 15;

function siftDown(t: TreeTrace<Heap>, i: number, n: number, line: number) {
  const h = t.model;
  for (;;) {
    const l = 2 * i + 1, r = 2 * i + 2;
    let big = i;
    if (l < n && h[l] > h[big]) big = l;
    if (r < n && h[r] > h[big]) big = r;
    const kids: Marks = {};
    if (l < n) kids[l] = "compare";
    if (r < n) kids[r] = "compare";
    if (big === i) {
      t.snap(line, l < n ? b(`${h[i]} ≥ its children — heap order restored here.`, `${h[i]} ≥ các con — thứ tự heap đã đúng ở đây.`) : b(`${h[i]} is a leaf — stop.`, `${h[i]} là lá — dừng.`), { ...kids, [i]: "found" }, { vars: { i } });
      return;
    }
    t.snap(line, b(`Larger child of ${h[i]} is ${h[big]}; swap them.`, `Con lớn hơn của ${h[i]} là ${h[big]}; đổi chỗ.`), { ...kids, [i]: "active", [big]: "swap" }, { vars: { i, child: big } });
    [h[i], h[big]] = [h[big], h[i]];
    i = big;
  }
}

const heapInsert: HAction = {
  id: "insert",
  label: b("Insert", "Chèn"),
  fields: [valueField(80)],
  code: ["A.append(v); i = last index", "while i > 0 and A[parent(i)] < A[i]", "  swap(A[i], A[parent(i)]); i = parent(i)   // sift up"],
  run(m, val) {
    if (m.length >= HEAP_MAX) return { error: b("Demo heap is full (15).", "Heap demo đã đầy (15).") };
    const v = Number(val.value);
    const t = new TreeTrace(heapView, m.slice());
    t.model.push(v);
    let i = t.model.length - 1;
    t.snap(0, b(`Append ${v} at the next free spot (index ${i}) to keep the tree complete.`, `Thêm ${v} vào chỗ trống kế tiếp (chỉ số ${i}) để cây luôn đầy đủ.`), { [i]: "found" }, { vars: { i } });
    while (i > 0) {
      const p = (i - 1) >> 1;
      const h = t.model;
      if (h[p] >= h[i]) {
        t.snap(1, b(`Parent ${h[p]} ≥ ${h[i]}: heap order holds. Done.`, `Cha ${h[p]} ≥ ${h[i]}: thứ tự heap đúng. Xong.`), { [p]: "compare", [i]: "found" }, { vars: { i, parent: p } });
        return { steps: t.steps, model: t.model };
      }
      t.snap(1, b(`Parent ${h[p]} < ${h[i]}: violation, sift up.`, `Cha ${h[p]} < ${h[i]}: vi phạm, đẩy lên.`), { [p]: "compare", [i]: "swap" }, { vars: { i, parent: p } });
      [h[p], h[i]] = [h[i], h[p]];
      i = p;
      t.snap(2, b(`Swapped. ${h[i]} is now at index ${i}.`, `Đã đổi. ${h[i]} giờ ở chỉ số ${i}.`), { [i]: "swap" }, { vars: { i } });
    }
    t.snap(1, b(`${t.model[0]} reached the root — it is the new maximum.`, `${t.model[0]} lên tới gốc — là giá trị lớn nhất mới.`), { 0: "found" });
    return { steps: t.steps, model: t.model };
  },
};

const heapExtract: HAction = {
  id: "extract",
  label: b("Extract max", "Lấy max"),
  code: ["max = A[0]", "A[0] = A.pop()   // move last leaf to root", "sift down from 0: swap with larger child while smaller", "return max"],
  run(m) {
    if (!m.length) return { error: b("Heap is empty.", "Heap rỗng.") };
    const t = new TreeTrace(heapView, m.slice());
    const max = t.model[0];
    t.snap(0, b(`The maximum is always at the root: ${max}.`, `Giá trị lớn nhất luôn ở gốc: ${max}.`), { 0: "found" }, { vars: { max } });
    const last = t.model.pop()!;
    if (!t.model.length) {
      t.snap(3, b(`Removed ${max}; the heap is now empty.`, `Đã lấy ${max}; heap giờ rỗng.`), {});
      return { steps: t.steps, model: t.model };
    }
    t.model[0] = last;
    t.snap(1, b(`Move the last leaf ${last} to the root.`, `Đưa lá cuối ${last} lên gốc.`), { 0: "active" }, { vars: { max } });
    siftDown(t, 0, t.model.length, 2);
    t.snap(3, b(`Returned ${max}. Cost: O(log n) swaps at most.`, `Trả về ${max}. Chi phí: tối đa O(log n) lần đổi chỗ.`), {}, { vars: { max } });
    return { steps: t.steps, model: t.model };
  },
};

const heapBuild: HAction = {
  id: "build",
  label: b("Build heap", "Xây heap"),
  fields: [
    { key: "shape", label: b("Input", "Dữ liệu"), kind: "select", default: "random", options: [{ value: "random", label: b("Random", "Ngẫu nhiên") }, { value: "custom", label: b("Custom", "Tự nhập") }] },
    { key: "list", label: b("Values", "Giá trị"), kind: "list", default: "12, 41, 7, 33, 95, 18, 60, 25, 3, 70", when: ["shape", "custom"] },
  ],
  code: ["A = input array (any order)", "for i = n/2 - 1 down to 0", "  sift down from i"],
  run(_m, v) {
    let values: number[];
    if (v.shape === "custom") {
      const p = parseList(v.list ?? "");
      if (!p || !p.length) return { error: b("Enter whole numbers separated by commas.", "Nhập số nguyên, cách nhau bởi dấu phẩy.") };
      if (p.length > HEAP_MAX) return { error: b("At most 15 values.", "Tối đa 15 giá trị.") };
      values = p;
    } else values = Array.from({ length: 11 }, () => randInt(1, 99));
    const t = new TreeTrace(heapView, values.slice());
    t.snap(0, b("Start from the raw array viewed as a complete tree. It is not a heap yet.", "Bắt đầu từ mảng thô xem như cây đầy đủ. Nó chưa phải heap."), {});
    for (let i = (values.length >> 1) - 1; i >= 0; i--) {
      t.snap(1, b(`Fix the subtree rooted at index ${i} (${t.model[i]}). Leaves are already heaps.`, `Sửa cây con gốc tại chỉ số ${i} (${t.model[i]}). Các lá đã là heap.`), { [i]: "pivot" }, { vars: { i } });
      siftDown(t, i, t.model.length, 2);
    }
    t.snap(-1, b("Heap built in O(n) — cheaper than n inserts, because most nodes are near the bottom.", "Xây heap trong O(n) — rẻ hơn n lần chèn, vì hầu hết các nút ở gần đáy."), {});
    return { steps: t.steps, model: t.model };
  },
};

const heapSort: HAction = {
  id: "heapsort",
  label: b("Heap sort", "Sắp xếp vun đống"),
  code: ["build max-heap", "for end = n-1 down to 1", "  swap(A[0], A[end])   // max goes to its final slot", "  sift down from 0 within A[0..end-1]"],
  run(m) {
    const t = new TreeTrace(heapView, m.slice());
    const n = t.model.length;
    const done: Marks = {};
    t.snap(0, b("The array is already a max-heap.", "Mảng đã là max-heap."), {});
    for (let end = n - 1; end >= 1; end--) {
      t.snap(2, b(`Swap max ${t.model[0]} with A[${end}] = ${t.model[end]}.`, `Đổi max ${t.model[0]} với A[${end}] = ${t.model[end]}.`), { ...done, 0: "swap", [end]: "swap" }, { vars: { end } });
      [t.model[0], t.model[end]] = [t.model[end], t.model[0]];
      done[end] = "done";
      const sub = new TreeTrace<Heap>((h, mk, ex) => heapView(h, { ...done, ...mk }, ex), t.model);
      siftDown(sub, 0, end, 3);
      t.steps.push(...sub.steps);
    }
    done[0] = "done";
    t.snap(-1, b(`Sorted ascending in place: ${t.model.join(", ")}. O(n log n), O(1) extra space.`, `Đã sắp tăng dần tại chỗ: ${t.model.join(", ")}. O(n log n), bộ nhớ phụ O(1).`), done);
    const rebuilt = t.model.slice().sort((a, c) => c - a);
    return { steps: t.steps, model: rebuilt };
  },
};

const heap: VizModule<Heap, TreeState> = {
  slug: "binary-heap",
  title: b("Binary heap & priority queue", "Heap nhị phân & hàng đợi ưu tiên"),
  short: b("A complete tree in an array; the max is always at the root.", "Cây đầy đủ lưu trong mảng; giá trị lớn nhất luôn ở gốc."),
  category: "trees",
  tags: ["priority queue", "O(log n)", "array-backed", "heap sort"],
  intro: b(
    "A max-heap is a complete binary tree where every parent is ≥ its children. Because it is complete, it fits in an array with no pointers: the children of index i are 2i+1 and 2i+2. Insert sifts a value up; extract-max moves the last leaf to the root and sifts it down. Both cost O(log n).",
    "Max-heap là cây nhị phân đầy đủ mà mọi nút cha ≥ các con. Vì đầy đủ nên lưu được trong mảng không cần con trỏ: con của chỉ số i là 2i+1 và 2i+2. Chèn đẩy giá trị lên; lấy max đưa lá cuối lên gốc rồi đẩy xuống. Cả hai tốn O(log n).",
  ),
  invariant: b("A[parent(i)] ≥ A[i] for every i > 0, where parent(i) = ⌊(i−1)/2⌋.", "A[cha(i)] ≥ A[i] với mọi i > 0, trong đó cha(i) = ⌊(i−1)/2⌋."),
  complexity: [
    { label: b("peek max", "xem max"), value: "O(1)" },
    { label: b("insert / extract", "chèn / lấy"), value: "O(log n)" },
    { label: b("build heap", "xây heap"), value: "O(n)" },
    { label: b("heap sort", "sắp xếp vun đống"), value: "O(n log n)" },
  ],
  applications: [
    { title: b("Schedulers & event simulation", "Lập lịch & mô phỏng sự kiện"), body: b("OS schedulers, timers in Node.js/Go, and discrete-event simulators always pull the next most urgent item.", "Bộ lập lịch HĐH, bộ hẹn giờ trong Node.js/Go và mô phỏng sự kiện rời rạc luôn lấy mục khẩn cấp nhất kế tiếp.") },
    { title: b("Dijkstra & Prim", "Dijkstra & Prim"), body: b("The priority queue inside shortest-path and MST algorithms is a heap.", "Hàng đợi ưu tiên bên trong thuật toán đường đi ngắn nhất và cây khung là heap.") },
    { title: b("Top-k & streaming", "Top-k & dữ liệu dòng"), body: b("Keep a min-heap of size k to track the k largest values in a stream of billions (trending topics, leaderboards).", "Giữ min-heap kích thước k để theo dõi k giá trị lớn nhất trong luồng hàng tỷ phần tử (chủ đề thịnh hành, bảng xếp hạng).") },
    { title: b("Median maintenance", "Duy trì trung vị"), body: b("Two heaps (max-heap of the low half, min-heap of the high half) give the running median in O(log n).", "Hai heap (max-heap nửa dưới, min-heap nửa trên) cho trung vị liên tục trong O(log n).") },
  ],
  recognize: [
    b("“k largest / smallest / closest”, “k-th”, “merge k sorted”.", "“k lớn / nhỏ / gần nhất”, “thứ k”, “trộn k danh sách”."),
    b("Repeatedly take the best/smallest item while new items keep arriving.", "Liên tục lấy phần tử tốt/nhỏ nhất trong khi phần tử mới vẫn đến."),
  ],
  pitfalls: [
    b("Python's heapq is a min-heap; push negated values for a max-heap.", "heapq của Python là min-heap; đẩy giá trị âm để có max-heap."),
    b("A heap is not sorted — only the root is guaranteed; iterating it does not give order.", "Heap không được sắp xếp — chỉ gốc được đảm bảo; duyệt nó không cho thứ tự."),
    b("Searching for an arbitrary value is O(n).", "Tìm một giá trị bất kỳ là O(n)."),
  ],
  practice: [
    { name: "Kth Largest Element in a Stream (703)", url: "https://leetcode.com/problems/kth-largest-element-in-a-stream/", level: "Easy" },
    { name: "Last Stone Weight (1046)", url: "https://leetcode.com/problems/last-stone-weight/", level: "Easy" },
    { name: "Top K Frequent Elements (347)", url: "https://leetcode.com/problems/top-k-frequent-elements/", level: "Medium" },
    { name: "Find Median from Data Stream (295)", url: "https://leetcode.com/problems/find-median-from-data-stream/", level: "Hard" },
  ],
  python: `import heapq

nums = [5, 1, 8, 3]
heapq.heapify(nums)          # O(n) min-heap
heapq.heappush(nums, 2)      # O(log n)
smallest = heapq.heappop(nums)

# k largest from a stream with a size-k min-heap
def top_k(stream, k):
    h = []
    for x in stream:
        heapq.heappush(h, x)
        if len(h) > k:
            heapq.heappop(h)     # drop the smallest
    return sorted(h, reverse=True)`,
  quiz: [
    {
      q: b("In a 0-indexed array heap, where are the children of index 4?", "Trong heap dạng mảng bắt đầu từ 0, con của chỉ số 4 ở đâu?"),
      options: [b("8 and 9", "8 và 9"), b("9 and 10", "9 và 10"), b("5 and 6", "5 và 6")],
      answer: 1,
      why: b("2·4+1 = 9 and 2·4+2 = 10.", "2·4+1 = 9 và 2·4+2 = 10."),
    },
    {
      q: b("Why is build-heap O(n) and not O(n log n)?", "Vì sao xây heap là O(n) chứ không phải O(n log n)?"),
      options: [b("Half the nodes are leaves needing 0 work; few nodes sift far", "Nửa số nút là lá không cần làm gì; rất ít nút phải đẩy xa"), b("It uses counting sort", "Nó dùng sắp xếp đếm"), b("It is actually O(n log n)", "Thực ra là O(n log n)")],
      answer: 0,
      why: b("Σ (nodes at height h)·h = n·Σ h/2ʰ = O(n).", "Σ (số nút ở độ cao h)·h = n·Σ h/2ʰ = O(n)."),
    },
  ],
  view: "tree",
  initial: () => [95, 70, 60, 33, 41, 18, 7, 25, 3, 12],
  idle: (m) => heapView(m),
  actions: [heapBuild, heapInsert, heapExtract, heapSort],
};

/* ------------------------------------------------------------------ */
/* Union-find                                                          */
/* ------------------------------------------------------------------ */

type DSU = { parent: number[]; rank: number[] };

const dsuView = (d: DSU, marks: Marks = {}, extra: Partial<TreeState> = {}): TreeState => {
  const nodes: Record<number, TreeNode> = {};
  d.parent.forEach((_, i) => (nodes[i] = { label: String(i), kids: [] }));
  const roots: number[] = [];
  d.parent.forEach((p, i) => (p === i ? roots.push(i) : nodes[p].kids.push(i)));
  return {
    nodes,
    roots,
    marks,
    strip: { label: "parent", cells: d.parent.map(String), marks, caption: d.parent.map((_, i) => String(i)) },
    ...extra,
  };
};

function findTrace(t: TreeTrace<DSU>, x: number, line: number): number {
  const d = t.model;
  const path: number[] = [];
  let r = x;
  while (d.parent[r] !== r) {
    path.push(r);
    t.snap(line, b(`${r}'s parent is ${d.parent[r]}; keep climbing.`, `Cha của ${r} là ${d.parent[r]}; tiếp tục leo.`), { ...Object.fromEntries(path.map((p) => [p, "path"])), [d.parent[r]]: "compare" });
    r = d.parent[r];
  }
  t.snap(line, b(`${r} is its own parent: root of ${x}'s set.`, `${r} là cha của chính nó: gốc của tập chứa ${x}.`), { ...Object.fromEntries(path.map((p) => [p, "path"])), [r]: "found" });
  if (path.some((p) => d.parent[p] !== r)) {
    path.forEach((p) => (d.parent[p] = r));
    t.snap(line, b(`Path compression: point ${path.join(", ")} straight at ${r}.`, `Nén đường: cho ${path.join(", ")} trỏ thẳng tới ${r}.`), { ...Object.fromEntries(path.map((p) => [p, "active"])), [r]: "found" });
  }
  return r;
}

const nodeField = (key: string, label: Bilingual, def: number): Field => ({ key, label, kind: "number", default: def, min: 0, max: 15 });

const dsu: VizModule<DSU, TreeState> = {
  slug: "union-find",
  title: b("Union-find (disjoint sets)", "Union-find (tập rời nhau)"),
  short: b("Merge groups and ask “same group?” in almost O(1).", "Gộp nhóm và hỏi “cùng nhóm?” gần như O(1)."),
  category: "trees",
  tags: ["near O(1)", "path compression", "union by rank", "connectivity"],
  intro: b(
    "Union-find keeps a collection of disjoint sets as a forest: each element points to a parent, and the root names the set. find(x) climbs to the root; union(a, b) links one root under the other. Two tricks — union by rank and path compression — make each operation effectively constant time.",
    "Union-find lưu các tập rời nhau dưới dạng rừng: mỗi phần tử trỏ tới cha, và gốc là tên của tập. find(x) leo lên gốc; union(a, b) gắn một gốc dưới gốc kia. Hai mẹo — hợp theo hạng và nén đường — khiến mỗi thao tác gần như hằng số.",
  ),
  invariant: b("Two elements are in the same set exactly when find returns the same root for both.", "Hai phần tử cùng tập khi và chỉ khi find trả về cùng một gốc cho cả hai."),
  complexity: [
    { label: b("find / union", "find / union"), value: "O(α(n)) ≈ O(1)" },
    { label: b("Space", "Bộ nhớ"), value: "O(n)" },
    { label: b("α(n) for n < 10⁸⁰", "α(n) với n < 10⁸⁰"), value: "≤ 4" },
  ],
  applications: [
    { title: b("Kruskal's MST", "Cây khung Kruskal"), body: b("Union-find answers “would this edge create a cycle?” instantly.", "Union-find trả lời ngay “cạnh này có tạo chu trình không?”.") },
    { title: b("Network connectivity", "Kết nối mạng"), body: b("Are two computers connected after these cables are plugged in? Percolation simulations use the same idea.", "Hai máy tính có kết nối không sau khi cắm các dây này? Mô phỏng thấm dùng cùng ý tưởng.") },
    { title: b("Image processing", "Xử lý ảnh"), body: b("Connected-component labelling groups adjacent pixels of the same colour.", "Gán nhãn thành phần liên thông gom các điểm ảnh kề nhau cùng màu.") },
    { title: b("Account merging & dedup", "Gộp tài khoản & loại trùng"), body: b("Merge user records that share any email or phone number.", "Gộp bản ghi người dùng có chung email hoặc số điện thoại.") },
  ],
  recognize: [
    b("Groups get merged over time and you ask “are x and y connected?”.", "Các nhóm được gộp dần và bạn hỏi “x và y có liên thông không?”."),
    b("Count components / detect a redundant edge in an undirected graph.", "Đếm thành phần / tìm cạnh thừa trong đồ thị vô hướng."),
  ],
  pitfalls: [
    b("It cannot split sets — deletions need a different structure.", "Không tách tập được — xoá cần cấu trúc khác."),
    b("Without union by rank/size and path compression, trees can degrade to O(n) chains.", "Thiếu hợp theo hạng/kích thước và nén đường, cây có thể thành chuỗi O(n)."),
  ],
  practice: [
    { name: "Number of Provinces (547)", url: "https://leetcode.com/problems/number-of-provinces/", level: "Medium" },
    { name: "Redundant Connection (684)", url: "https://leetcode.com/problems/redundant-connection/", level: "Medium" },
    { name: "Accounts Merge (721)", url: "https://leetcode.com/problems/accounts-merge/", level: "Medium" },
    { name: "Longest Consecutive Sequence (128)", url: "https://leetcode.com/problems/longest-consecutive-sequence/", level: "Medium" },
  ],
  python: `class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])   # path compression
        return self.parent[x]

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.rank[ra] < self.rank[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra                             # union by rank
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1
        return True`,
  quiz: [
    {
      q: b("union(1,2), union(3,4), union(2,4). Are 1 and 3 connected?", "union(1,2), union(3,4), union(2,4). 1 và 3 có liên thông không?"),
      options: [b("Yes", "Có"), b("No", "Không")],
      answer: 0,
      why: b("1–2–4–3 are all in one set.", "1–2–4–3 đều cùng một tập."),
    },
  ],
  view: "tree",
  initial: () => {
    const parent = [0, 0, 1, 3, 3, 5, 5, 6, 8, 8];
    return { parent, rank: [2, 1, 0, 1, 0, 2, 1, 0, 1, 0] };
  },
  idle: (m) => dsuView(m),
  actions: [
    {
      id: "reset", label: b("Reset", "Đặt lại"),
      fields: [{ key: "n", label: b("Elements", "Số phần tử"), kind: "number", default: 10, min: 2, max: 16 }],
      run(_m, v) {
        const n = Math.max(2, Math.min(16, Number(v.n) || 10));
        const d = { parent: Array.from({ length: n }, (_, i) => i), rank: Array(n).fill(0) };
        return { model: d, steps: [{ state: dsuView(d), line: -1, note: b(`${n} singleton sets: each element is its own root.`, `${n} tập đơn: mỗi phần tử là gốc của chính nó.`) }] };
      },
    },
    {
      id: "union", label: b("Union", "Hợp (union)"),
      fields: [nodeField("a", b("a", "a"), 2), nodeField("b", b("b", "b"), 7)],
      code: ["ra = find(a); rb = find(b)", "if ra == rb: already together", "attach the lower-rank root under the higher", "if ranks equal: rank[new root] += 1"],
      run(m, v) {
        const a = Number(v.a), c = Number(v.b), n = m.parent.length;
        if (!(a >= 0 && a < n && c >= 0 && c < n)) return { error: b(`Pick elements 0..${n - 1}.`, `Chọn phần tử 0..${n - 1}.`) };
        const t = new TreeTrace(dsuView, { parent: m.parent.slice(), rank: m.rank.slice() });
        const ra = findTrace(t, a, 0);
        const rb = findTrace(t, c, 0);
        if (ra === rb) {
          t.snap(1, b(`Both roots are ${ra}: ${a} and ${c} are already in the same set.`, `Cả hai gốc là ${ra}: ${a} và ${c} đã cùng tập.`), { [ra]: "found" });
          return { steps: t.steps, model: t.model };
        }
        const d = t.model;
        const [hi, lo] = d.rank[ra] >= d.rank[rb] ? [ra, rb] : [rb, ra];
        t.snap(2, b(`rank[${ra}] = ${d.rank[ra]}, rank[${rb}] = ${d.rank[rb]}: attach ${lo} under ${hi} to keep trees shallow.`, `rank[${ra}] = ${d.rank[ra]}, rank[${rb}] = ${d.rank[rb]}: gắn ${lo} dưới ${hi} để cây luôn thấp.`), { [hi]: "pivot", [lo]: "compare" });
        d.parent[lo] = hi;
        if (d.rank[ra] === d.rank[rb]) d.rank[hi]++;
        t.snap(3, b(`Merged. ${hi} is the root of the combined set (rank ${d.rank[hi]}).`, `Đã gộp. ${hi} là gốc của tập chung (hạng ${d.rank[hi]}).`), { [hi]: "found", [lo]: "path" });
        return { steps: t.steps, model: d };
      },
    },
    {
      id: "find", label: b("Find", "Tìm (find)"),
      fields: [nodeField("x", b("x", "x"), 2)],
      code: ["r = x", "while parent[r] != r: r = parent[r]", "compress: point every node on the path to r", "return r"],
      run(m, v) {
        const x = Number(v.x);
        if (!(x >= 0 && x < m.parent.length)) return { error: b(`Pick an element 0..${m.parent.length - 1}.`, `Chọn phần tử 0..${m.parent.length - 1}.`) };
        const t = new TreeTrace(dsuView, { parent: m.parent.slice(), rank: m.rank.slice() });
        t.snap(0, b(`find(${x}): climb parent pointers to the root.`, `find(${x}): leo theo con trỏ cha tới gốc.`), { [x]: "compare" });
        const r = findTrace(t, x, 1);
        t.snap(3, b(`find(${x}) = ${r}.`, `find(${x}) = ${r}.`), { [r]: "found", [x]: "path" });
        return { steps: t.steps, model: t.model };
      },
    },
  ],
};

export const treeModules = [bst, heap, dsu];
