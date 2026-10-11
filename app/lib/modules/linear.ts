import { toItems } from "../trace";
import type { Action, Bilingual, Field, Step, VizModule } from "../types";
import { b, parseList, randomList } from "../types";
import type { Item, ListState, Marks, Pointer } from "../views";

type LModel = Item[];
type LModule = VizModule<LModel, ListState>;
type LAction = Action<LModel, ListState>;

const valueField = (def = 42): Field => ({ key: "value", label: b("Value", "Giá trị"), kind: "number", default: def, min: 0, max: 99 });
const indexField = (def = 1): Field => ({ key: "index", label: b("Index", "Chỉ số"), kind: "number", default: def, min: 0, max: 20 });

class ListTrace {
  steps: Step<ListState>[] = [];
  chars = false;
  constructor(public kind: ListState["kind"], public items: Item[]) {}
  snap(line: number | number[], note: Bilingual, x: { marks?: Marks; pointers?: Pointer[]; ghost?: ListState["ghost"]; panels?: ListState["panels"]; vars?: Record<string, string | number>; flipped?: number } = {}) {
    this.steps.push({
      state: { kind: this.kind, items: this.items.slice(), marks: x.marks ?? {}, pointers: x.pointers, ghost: x.ghost ?? null, panels: x.panels, chars: this.chars, flipped: x.flipped },
      line,
      note,
      vars: x.vars,
    });
  }
}

function createList(kind: ListState["kind"], max = 10): LAction {
  return {
    id: "create",
    label: b("Create", "Tạo"),
    fields: [
      { key: "shape", label: b("Input", "Dữ liệu"), kind: "select", default: "random", options: [{ value: "random", label: b("Random", "Ngẫu nhiên") }, { value: "empty", label: b("Empty", "Rỗng") }, { value: "custom", label: b("Custom", "Tự nhập") }] },
      { key: "n", label: b("Size", "Kích thước"), kind: "number", default: 5, min: 1, max, when: ["shape", "random"] },
      { key: "list", label: b("Values", "Giá trị"), kind: "list", default: "12, 7, 30, 18", when: ["shape", "custom"] },
    ],
    run(_m, v) {
      let values: number[];
      if (v.shape === "empty") values = [];
      else if (v.shape === "custom") {
        const p = parseList(v.list ?? "");
        if (!p) return { error: b("Enter whole numbers separated by commas.", "Nhập số nguyên, cách nhau bởi dấu phẩy.") };
        if (p.length > max) return { error: b(`At most ${max} values.`, `Tối đa ${max} giá trị.`) };
        values = p;
      } else values = randomList(Math.min(max, Math.max(1, Number(v.n) || 5)), 1, 99);
      const items = toItems(values);
      return { model: items, steps: [{ state: { kind, items, marks: {} }, line: -1, note: b(`Created with ${items.length} item(s).`, `Đã tạo với ${items.length} phần tử.`) }] };
    },
  };
}

const full = (max: number) => ({ error: b(`Demo capacity is ${max}; remove something first.`, `Sức chứa demo là ${max}; hãy xoá bớt trước.`) });
const empty = { error: b("It is empty — nothing to remove.", "Đang rỗng — không có gì để xoá.") };

/* ------------------------------------------------------------------ */
/* Stack                                                               */
/* ------------------------------------------------------------------ */

const STACK_MAX = 9;

const stack: LModule = {
  slug: "stack",
  title: b("Stack", "Ngăn xếp (Stack)"),
  short: b("Last in, first out: push and pop at the top in O(1).", "Vào sau, ra trước: push và pop ở đỉnh trong O(1)."),
  category: "linear",
  tags: ["LIFO", "O(1)", "recursion", "undo"],
  intro: b(
    "A stack only lets you touch its top: push adds there, pop removes from there. That restriction is exactly what you need whenever the most recent unfinished thing must be handled first — nested brackets, function calls, undo history.",
    "Ngăn xếp chỉ cho chạm vào đỉnh: push thêm vào đó, pop lấy ra từ đó. Hạn chế này chính là điều cần khi việc chưa xong gần nhất phải được xử lý trước — ngoặc lồng nhau, lời gọi hàm, lịch sử hoàn tác.",
  ),
  invariant: b("The top is always the most recently pushed item that has not been popped.", "Đỉnh luôn là phần tử được push gần nhất chưa bị pop."),
  complexity: [
    { label: b("push / pop / peek", "push / pop / peek"), value: "O(1)" },
    { label: b("search", "tìm kiếm"), value: "O(n)" },
    { label: b("Space", "Bộ nhớ"), value: "O(n)" },
  ],
  applications: [
    { title: b("Function calls", "Lời gọi hàm"), body: b("Every program has a call stack; a stack overflow is literally this structure running out of room.", "Mọi chương trình có ngăn xếp gọi hàm; “stack overflow” chính là cấu trúc này hết chỗ.") },
    { title: b("Undo / back button", "Hoàn tác / nút quay lại"), body: b("Editors push each action; Ctrl+Z pops the latest. Browsers keep a back stack.", "Trình soạn thảo push mỗi thao tác; Ctrl+Z pop thao tác mới nhất. Trình duyệt giữ ngăn xếp quay lại.") },
    { title: b("Parsing", "Phân tích cú pháp"), body: b("Compilers and JSON/HTML parsers match brackets and tags with a stack; calculators evaluate expressions with two stacks.", "Trình biên dịch và bộ phân tích JSON/HTML khớp ngoặc và thẻ bằng ngăn xếp; máy tính tính biểu thức với hai ngăn xếp.") },
    { title: b("Monotonic stack", "Ngăn xếp đơn điệu"), body: b("“Next greater element”, stock span and largest rectangle in a histogram — all O(n) with a monotonic stack.", "“Phần tử lớn hơn kế tiếp”, nhịp cổ phiếu và hình chữ nhật lớn nhất trong biểu đồ — đều O(n) với ngăn xếp đơn điệu.") },
  ],
  recognize: [
    b("Matching pairs: brackets, tags, “remove adjacent duplicates”.", "Ghép cặp: ngoặc, thẻ, “xoá cặp trùng kề nhau”."),
    b("“Next greater/smaller element” or anything that needs the nearest previous bigger value.", "“Phần tử lớn/nhỏ hơn kế tiếp” hoặc cần giá trị lớn hơn gần nhất phía trước."),
    b("Turning recursion into iteration.", "Chuyển đệ quy thành vòng lặp."),
  ],
  pitfalls: [
    b("Popping an empty stack — always check isEmpty first.", "Pop ngăn xếp rỗng — luôn kiểm tra isEmpty trước."),
    b("In Python use list.append/pop (end of list), never insert(0)/pop(0), which are O(n).", "Trong Python dùng list.append/pop (cuối danh sách), đừng dùng insert(0)/pop(0) vì là O(n)."),
  ],
  practice: [
    { name: "Valid Parentheses (20)", url: "https://leetcode.com/problems/valid-parentheses/", level: "Easy" },
    { name: "Min Stack (155)", url: "https://leetcode.com/problems/min-stack/", level: "Medium" },
    { name: "Daily Temperatures (739)", url: "https://leetcode.com/problems/daily-temperatures/", level: "Medium" },
    { name: "Largest Rectangle in Histogram (84)", url: "https://leetcode.com/problems/largest-rectangle-in-histogram/", level: "Hard" },
  ],
  python: `stack = []
stack.append(3)      # push
stack.append(7)
top = stack[-1]      # peek → 7
stack.pop()          # pop  → 7

def is_balanced(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    st = []
    for ch in s:
        if ch in "([{":
            st.append(ch)
        elif not st or st.pop() != pairs[ch]:
            return False
    return not st`,
  quiz: [
    {
      q: b("Push 1, 2, 3, pop, push 4, pop, pop. What is left?", "Push 1, 2, 3, pop, push 4, pop, pop. Còn lại gì?"),
      options: [b("[1]", "[1]"), b("[1, 2]", "[1, 2]"), b("[3]", "[3]")],
      answer: 0,
      why: b("Pops remove 3, then 4, then 2.", "Các lần pop lấy 3, rồi 4, rồi 2."),
    },
  ],
  view: "list",
  initial: () => toItems([12, 7, 30]),
  idle: (m) => ({ kind: "stack", items: m, marks: {} }),
  actions: [
    createList("stack", STACK_MAX),
    {
      id: "push", label: b("Push", "Push"), fields: [valueField()],
      code: ["if full: error", "top = top + 1", "A[top] = value"],
      run(m, v) {
        if (m.length >= STACK_MAX) return full(STACK_MAX);
        const val = Number(v.value);
        const t = new ListTrace("stack", m.slice());
        t.snap(0, b(`Push ${val}: there is room on top.`, `Push ${val}: còn chỗ ở đỉnh.`), { ghost: { v: val, side: "in", at: m.length }, vars: { top: m.length - 1, value: val } });
        const [item] = toItems([val]);
        t.items.push(item);
        t.snap([1, 2], b(`${val} is the new top. Size = ${t.items.length}.`, `${val} là đỉnh mới. Kích thước = ${t.items.length}.`), { marks: { [t.items.length - 1]: "found" }, vars: { top: t.items.length - 1 } });
        return { steps: t.steps, model: t.items };
      },
    },
    {
      id: "pop", label: b("Pop", "Pop"),
      code: ["if empty: error", "value = A[top]", "top = top - 1; return value"],
      run(m) {
        if (!m.length) return empty;
        const t = new ListTrace("stack", m.slice());
        const top = t.items.length - 1;
        t.snap([0, 1], b(`Read the top value ${t.items[top].v}.`, `Đọc giá trị đỉnh ${t.items[top].v}.`), { marks: { [top]: "compare" }, vars: { top } });
        const out = t.items.pop()!;
        t.snap(2, b(`Removed ${out.v}. ${t.items.length ? `New top: ${t.items[t.items.length - 1].v}.` : "The stack is empty."}`, `Đã lấy ${out.v}. ${t.items.length ? `Đỉnh mới: ${t.items[t.items.length - 1].v}.` : "Ngăn xếp rỗng."}`), { ghost: { v: out.v, side: "out", at: top }, vars: { top: top - 1, returned: out.v } });
        return { steps: t.steps, model: t.items };
      },
    },
    {
      id: "brackets", label: b("Check brackets", "Kiểm tra ngoặc"),
      fields: [{ key: "expr", label: b("Expression", "Biểu thức"), kind: "list", default: "{[()()]}" }],
      code: ["for ch in s", "  if ch is opening: push(ch)", "  else if empty or pop() doesn't match ch: invalid", "valid iff stack is empty"],
      run(m, v) {
        const s = (v.expr ?? "").replace(/[^()[\]{}]/g, "").slice(0, 14);
        if (!s) return { error: b("Type some brackets like ([]{}).", "Nhập một vài dấu ngoặc như ([]{}).") };
        const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
        const t = new ListTrace("stack", []);
        t.chars = true;
        const codes: Record<string, number> = { "(": 40, "[": 91, "{": 123 };
        const panel = (i: number) => [{ label: "input", items: s.split("").map((c, k) => (k === i ? `▸${c}` : c)) }];
        let ok = true;
        for (let i = 0; i < s.length; i++) {
          const ch = s[i];
          if ("([{".includes(ch)) {
            t.items.push(...toItems([codes[ch]]));
            t.snap([0, 1], b(`'${ch}' opens a group → push it.`, `'${ch}' mở một nhóm → push.`), { marks: { [t.items.length - 1]: "found" }, panels: panel(i), vars: { i, ch } });
          } else {
            const top = t.items[t.items.length - 1];
            const topCh = top ? String.fromCharCode(top.v) : "∅";
            if (!top || topCh !== pairs[ch]) {
              t.snap(2, b(`'${ch}' does not match top '${topCh}' → invalid.`, `'${ch}' không khớp đỉnh '${topCh}' → không hợp lệ.`), { marks: top ? { [t.items.length - 1]: "reject" } : {}, panels: panel(i), vars: { i, ch } });
              ok = false;
              break;
            }
            t.snap(2, b(`'${ch}' matches top '${topCh}' → pop.`, `'${ch}' khớp đỉnh '${topCh}' → pop.`), { marks: { [t.items.length - 1]: "compare" }, panels: panel(i), vars: { i, ch } });
            t.items.pop();
          }
        }
        if (ok) t.snap(3, t.items.length ? b(`Unclosed brackets remain → invalid.`, `Còn ngoặc chưa đóng → không hợp lệ.`) : b(`Stack is empty → "${s}" is balanced!`, `Ngăn xếp rỗng → "${s}" cân bằng!`), { panels: panel(-1) });
        return { steps: t.steps, model: m };
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Queue                                                               */
/* ------------------------------------------------------------------ */

const QUEUE_MAX = 9;

const queue: LModule = {
  slug: "queue",
  title: b("Queue", "Hàng đợi (Queue)"),
  short: b("First in, first out: enqueue at the back, dequeue from the front.", "Vào trước, ra trước: thêm ở cuối, lấy ở đầu."),
  category: "linear",
  tags: ["FIFO", "O(1)", "BFS", "buffering"],
  intro: b(
    "A queue is a line at the counter: whoever arrived first is served first. It is implemented with a circular buffer or a linked list so both ends are O(1). A deque (double-ended queue) allows both ends for both operations.",
    "Hàng đợi giống hàng người chờ: ai đến trước được phục vụ trước. Nó được cài đặt bằng bộ đệm vòng hoặc danh sách liên kết để cả hai đầu đều O(1). Deque (hàng đợi hai đầu) cho phép thêm/lấy ở cả hai đầu.",
  ),
  invariant: b("Items leave in exactly the order they arrived.", "Các phần tử rời đi đúng theo thứ tự chúng đến."),
  complexity: [
    { label: b("enqueue / dequeue", "enqueue / dequeue"), value: "O(1)" },
    { label: b("peek front", "xem đầu"), value: "O(1)" },
    { label: b("Space", "Bộ nhớ"), value: "O(n)" },
  ],
  applications: [
    { title: b("Task & message queues", "Hàng đợi tác vụ & tin nhắn"), body: b("Kafka, RabbitMQ and SQS buffer work between services so spikes do not overload consumers.", "Kafka, RabbitMQ và SQS đệm công việc giữa các dịch vụ để đột biến không làm quá tải bên xử lý.") },
    { title: b("Operating systems", "Hệ điều hành"), body: b("Round-robin CPU scheduling, printer spoolers and keyboard buffers are queues.", "Lập lịch CPU xoay vòng, hàng đợi máy in và bộ đệm bàn phím đều là hàng đợi.") },
    { title: b("Breadth-first search", "Tìm kiếm theo chiều rộng"), body: b("BFS is a queue plus a visited set — see the graph traversal module.", "BFS là hàng đợi cộng tập đã thăm — xem module duyệt đồ thị.") },
    { title: b("Streaming windows", "Cửa sổ dữ liệu dòng"), body: b("Keep the last k events; a monotonic deque gives the sliding-window maximum in O(n).", "Giữ k sự kiện gần nhất; deque đơn điệu cho giá trị lớn nhất cửa sổ trượt trong O(n).") },
  ],
  recognize: [
    b("Process things in arrival order, or level by level.", "Xử lý theo thứ tự đến, hoặc theo từng lớp."),
    b("“Simulate” a line, a time-ordered process, or a recent-calls counter.", "“Mô phỏng” hàng chờ, quá trình theo thời gian, hoặc bộ đếm cuộc gọi gần đây."),
  ],
  pitfalls: [
    b("Python list.pop(0) is O(n). Use collections.deque.", "list.pop(0) trong Python là O(n). Hãy dùng collections.deque."),
    b("In a circular buffer, “full” and “empty” both look like head == tail unless you track the size.", "Trong bộ đệm vòng, “đầy” và “rỗng” đều trông như head == tail nếu không theo dõi kích thước."),
  ],
  practice: [
    { name: "Implement Queue using Stacks (232)", url: "https://leetcode.com/problems/implement-queue-using-stacks/", level: "Easy" },
    { name: "Number of Recent Calls (933)", url: "https://leetcode.com/problems/number-of-recent-calls/", level: "Easy" },
    { name: "Design Circular Queue (622)", url: "https://leetcode.com/problems/design-circular-queue/", level: "Medium" },
    { name: "Sliding Window Maximum (239)", url: "https://leetcode.com/problems/sliding-window-maximum/", level: "Hard" },
  ],
  python: `from collections import deque

q = deque()
q.append("a")        # enqueue at back
q.append("b")
front = q[0]         # peek → "a"
q.popleft()          # dequeue → "a", O(1)`,
  quiz: [
    {
      q: b("Which Python call makes a list-based queue accidentally O(n²) overall?", "Lệnh Python nào khiến hàng đợi bằng list vô tình thành O(n²)?"),
      options: [b("list.append(x)", "list.append(x)"), b("list.pop(0)", "list.pop(0)"), b("len(list)", "len(list)")],
      answer: 1,
      why: b("pop(0) shifts every remaining element left.", "pop(0) dịch mọi phần tử còn lại sang trái."),
    },
  ],
  view: "list",
  initial: () => toItems([12, 7, 30, 18]),
  idle: (m) => ({ kind: "queue", items: m, marks: {} }),
  actions: [
    createList("queue", QUEUE_MAX),
    {
      id: "enqueue", label: b("Enqueue", "Thêm (enqueue)"), fields: [valueField()],
      code: ["if full: error", "A[tail] = value", "tail = (tail + 1) mod capacity"],
      run(m, v) {
        if (m.length >= QUEUE_MAX) return full(QUEUE_MAX);
        const val = Number(v.value);
        const t = new ListTrace("queue", m.slice());
        t.snap(0, b(`Enqueue ${val} at the back.`, `Thêm ${val} vào cuối.`), { ghost: { v: val, side: "in", at: m.length }, vars: { size: m.length } });
        t.items.push(...toItems([val]));
        t.snap([1, 2], b(`${val} joined the back of the line.`, `${val} đã vào cuối hàng.`), { marks: { [t.items.length - 1]: "found" }, vars: { size: t.items.length } });
        return { steps: t.steps, model: t.items };
      },
    },
    {
      id: "dequeue", label: b("Dequeue", "Lấy (dequeue)"),
      code: ["if empty: error", "value = A[head]", "head = (head + 1) mod capacity; return value"],
      run(m) {
        if (!m.length) return empty;
        const t = new ListTrace("queue", m.slice());
        t.snap([0, 1], b(`The front item ${t.items[0].v} has waited longest.`, `Phần tử đầu ${t.items[0].v} đã chờ lâu nhất.`), { marks: { 0: "compare" }, vars: { size: m.length } });
        const out = t.items.shift()!;
        t.snap(2, b(`Dequeued ${out.v}.`, `Đã lấy ${out.v}.`), { ghost: { v: out.v, side: "out", at: 0 }, vars: { size: t.items.length, returned: out.v } });
        return { steps: t.steps, model: t.items };
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Linked list                                                         */
/* ------------------------------------------------------------------ */

const LIST_MAX = 10;

const linkedList: LModule = {
  slug: "linked-list",
  title: b("Linked list", "Danh sách liên kết"),
  short: b("Nodes chained by pointers: O(1) splice, O(n) access.", "Các nút nối bằng con trỏ: chèn O(1), truy cập O(n)."),
  category: "linear",
  tags: ["pointers", "O(1) insert at head", "O(n) search"],
  intro: b(
    "A singly linked list stores each value in a node that points to the next node. You can splice a node in or out by rewiring a pointer — no shifting — but reaching the i-th element means walking i steps from the head.",
    "Danh sách liên kết đơn lưu mỗi giá trị trong một nút trỏ tới nút kế tiếp. Có thể chèn hoặc gỡ một nút bằng cách nối lại con trỏ — không cần dịch — nhưng muốn tới phần tử thứ i phải đi i bước từ đầu.",
  ),
  invariant: b("Following next from head visits every node exactly once and ends at null.", "Đi theo next từ head thăm mỗi nút đúng một lần và kết thúc tại null."),
  complexity: [
    { label: b("access i-th", "truy cập thứ i"), value: "O(n)" },
    { label: b("insert/remove at head", "chèn/xoá ở đầu"), value: "O(1)" },
    { label: b("insert after known node", "chèn sau nút đã biết"), value: "O(1)" },
    { label: b("search", "tìm kiếm"), value: "O(n)" },
  ],
  applications: [
    { title: b("LRU caches", "Bộ nhớ đệm LRU"), body: b("A hash map + doubly linked list moves a used entry to the front in O(1) — the design behind Redis/Memcached eviction and CPU caches.", "Bảng băm + danh sách liên kết đôi đưa mục vừa dùng lên đầu trong O(1) — thiết kế đằng sau cơ chế loại bỏ của Redis/Memcached.") },
    { title: b("Allocators & OS kernels", "Bộ cấp phát & nhân HĐH"), body: b("Free memory blocks and process lists in Linux are intrusive linked lists.", "Các khối bộ nhớ trống và danh sách tiến trình trong Linux là danh sách liên kết xâm nhập.") },
    { title: b("Hash table chaining", "Xâu chuỗi trong bảng băm"), body: b("Each bucket of a chained hash table is a small linked list.", "Mỗi ô của bảng băm xâu chuỗi là một danh sách liên kết nhỏ.") },
    { title: b("Playlists & history", "Danh sách phát & lịch sử"), body: b("Next/previous track navigation is a (circular) doubly linked list.", "Chuyển bài kế/trước là danh sách liên kết đôi (vòng).") },
  ],
  recognize: [
    b("Many insertions/deletions in the middle when you already hold a reference to the spot.", "Nhiều lần chèn/xoá ở giữa khi đã có tham chiếu tới vị trí."),
    b("Classic pointer puzzles: reverse, detect cycle (fast/slow), find middle, merge.", "Câu đố con trỏ kinh điển: đảo ngược, phát hiện chu trình (nhanh/chậm), tìm giữa, trộn."),
  ],
  pitfalls: [
    b("Losing the rest of the list by overwriting next before saving it.", "Mất phần còn lại của danh sách do ghi đè next trước khi lưu."),
    b("Special-casing the head everywhere — a dummy (sentinel) node removes those branches.", "Phải xử lý riêng head ở mọi nơi — nút giả (sentinel) loại bỏ các nhánh đó."),
    b("Poor cache locality: arrays are often faster in practice even for inserts.", "Tính cục bộ bộ nhớ kém: mảng thường nhanh hơn trong thực tế kể cả khi chèn."),
  ],
  practice: [
    { name: "Reverse Linked List (206)", url: "https://leetcode.com/problems/reverse-linked-list/", level: "Easy" },
    { name: "Linked List Cycle (141)", url: "https://leetcode.com/problems/linked-list-cycle/", level: "Easy" },
    { name: "Remove Nth Node From End (19)", url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/", level: "Medium" },
    { name: "LRU Cache (146)", url: "https://leetcode.com/problems/lru-cache/", level: "Medium" },
  ],
  python: `class Node:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def reverse(head):
    prev = None
    while head:
        head.next, prev, head = prev, head, head.next
    return prev

def insert_at(head, i, val):
    dummy = Node(0, head)
    cur = dummy
    for _ in range(i):
        cur = cur.next
    cur.next = Node(val, cur.next)
    return dummy.next`,
  quiz: [
    {
      q: b("Why is accessing the 1,000th node slow?", "Vì sao truy cập nút thứ 1.000 chậm?"),
      options: [b("Nodes are not contiguous; you must follow 999 pointers", "Các nút không liền kề; phải đi qua 999 con trỏ"), b("Hashing is slow", "Băm chậm"), b("It is not slow", "Không chậm")],
      answer: 0,
      why: b("There is no address arithmetic like A + i·size in a linked list.", "Danh sách liên kết không có phép tính địa chỉ như A + i·size."),
    },
  ],
  view: "list",
  initial: () => toItems([12, 7, 30, 18, 25]),
  idle: (m) => ({ kind: "list", items: m, marks: {}, pointers: m.length ? [{ i: 0, label: "head" }] : [] }),
  actions: [
    createList("list", LIST_MAX),
    {
      id: "search", label: b("Search", "Tìm"), fields: [valueField(30)],
      code: ["cur = head; i = 0", "while cur != null", "  if cur.val == value: return i", "  cur = cur.next; i++", "return -1"],
      run(m, v) {
        const val = Number(v.value);
        const t = new ListTrace("list", m.slice());
        t.snap(0, b(`Start at head and look for ${val}.`, `Bắt đầu từ head và tìm ${val}.`), { pointers: m.length ? [{ i: 0, label: "cur" }] : [], vars: { value: val, i: 0 } });
        for (let i = 0; i < m.length; i++) {
          const hit = m[i].v === val;
          t.snap([1, 2], hit ? b(`cur.val = ${val}. Found at index ${i}.`, `cur.val = ${val}. Tìm thấy tại chỉ số ${i}.`) : b(`cur.val = ${m[i].v} ≠ ${val}; follow next.`, `cur.val = ${m[i].v} ≠ ${val}; đi theo next.`), { marks: { [i]: hit ? "found" : "compare" }, pointers: [{ i, label: "cur" }], vars: { value: val, i } });
          if (hit) return { steps: t.steps, model: m };
        }
        t.snap(4, b("Reached null: not found.", "Tới null: không tìm thấy."), { vars: { value: val } });
        return { steps: t.steps, model: m };
      },
    },
    {
      id: "insert", label: b("Insert at", "Chèn tại"), fields: [indexField(2), valueField()],
      code: ["if i == 0: node.next = head; head = node; return", "cur = head", "repeat i-1 times: cur = cur.next", "node.next = cur.next", "cur.next = node"],
      run(m, v) {
        if (m.length >= LIST_MAX) return full(LIST_MAX);
        const i = Number(v.index), val = Number(v.value);
        if (!(i >= 0 && i <= m.length)) return { error: b(`Index must be 0..${m.length}.`, `Chỉ số phải trong 0..${m.length}.`) };
        const t = new ListTrace("list", m.slice());
        const [node] = toItems([val]);
        if (i === 0) {
          t.snap(0, b(`Insert ${val} at the head: new node points to the old head.`, `Chèn ${val} vào đầu: nút mới trỏ tới head cũ.`), { ghost: { v: val, side: "in", at: 0 }, pointers: m.length ? [{ i: 0, label: "head" }] : [] });
          t.items.unshift(node);
          t.snap(0, b(`head = new node. O(1).`, `head = nút mới. O(1).`), { marks: { 0: "found" }, pointers: [{ i: 0, label: "head" }] });
          return { steps: t.steps, model: t.items };
        }
        for (let k = 0; k < i; k++) t.snap(k === 0 ? 1 : 2, b(`Walk: cur at index ${k}.`, `Duyệt: cur ở chỉ số ${k}.`), { marks: { [k]: "compare" }, pointers: [{ i: k, label: "cur" }], vars: { k, i } });
        t.snap(3, b(`node.next = cur.next (${i < m.length ? m[i].v : "null"}).`, `node.next = cur.next (${i < m.length ? m[i].v : "null"}).`), { ghost: { v: val, side: "in", at: i }, pointers: [{ i: i - 1, label: "cur" }] });
        t.items.splice(i, 0, node);
        t.snap(4, b(`cur.next = node. Inserted ${val} at index ${i} without shifting anything.`, `cur.next = node. Đã chèn ${val} tại chỉ số ${i} mà không dịch gì.`), { marks: { [i]: "found" }, pointers: [{ i: 0, label: "head" }] });
        return { steps: t.steps, model: t.items };
      },
    },
    {
      id: "remove", label: b("Remove at", "Xoá tại"), fields: [indexField(1)],
      code: ["if i == 0: head = head.next; return", "cur = head", "repeat i-1 times: cur = cur.next", "cur.next = cur.next.next   // unlink"],
      run(m, v) {
        if (!m.length) return empty;
        const i = Number(v.index);
        if (!(i >= 0 && i < m.length)) return { error: b(`Index must be 0..${m.length - 1}.`, `Chỉ số phải trong 0..${m.length - 1}.`) };
        const t = new ListTrace("list", m.slice());
        if (i === 0) {
          t.snap(0, b(`Remove the head ${m[0].v}: head = head.next.`, `Xoá head ${m[0].v}: head = head.next.`), { marks: { 0: "reject" } });
        } else {
          for (let k = 0; k < i; k++) t.snap(k === 0 ? 1 : 2, b(`Walk: cur at index ${k}.`, `Duyệt: cur ở chỉ số ${k}.`), { marks: { [k]: "compare" }, pointers: [{ i: k, label: "cur" }] });
          t.snap(3, b(`Unlink ${m[i].v}: cur.next skips over it.`, `Gỡ ${m[i].v}: cur.next bỏ qua nó.`), { marks: { [i]: "reject" }, pointers: [{ i: i - 1, label: "cur" }] });
        }
        const out = t.items.splice(i, 1)[0];
        t.snap(3, b(`Removed ${out.v}.`, `Đã xoá ${out.v}.`), { ghost: { v: out.v, side: "out", at: i }, pointers: t.items.length ? [{ i: 0, label: "head" }] : [] });
        return { steps: t.steps, model: t.items };
      },
    },
    {
      id: "reverse", label: b("Reverse", "Đảo ngược"),
      code: ["prev = null; cur = head", "while cur != null", "  next = cur.next", "  cur.next = prev", "  prev = cur; cur = next", "head = prev"],
      run(m) {
        const t = new ListTrace("list", m.slice());
        const n = m.length;
        // Nodes stay put; only their next pointers flip.
        t.snap(0, b("prev = null, cur = head.", "prev = null, cur = head."), { pointers: n ? [{ i: 0, label: "cur" }] : [], vars: { reversed: 0 } });
        for (let k = 0; k < n; k++) {
          const done: Marks = {};
          for (let j = 0; j < k; j++) done[j] = "done";
          t.snap([1, 2, 3], b(`Save next, then point ${m[k].v}.next back to ${k ? m[k - 1].v : "null"}.`, `Lưu next, rồi cho ${m[k].v}.next trỏ ngược về ${k ? m[k - 1].v : "null"}.`), {
            marks: { ...done, [k]: "compare" }, pointers: [{ i: k, label: "cur" }, ...(k ? [{ i: k - 1, label: "prev" }] : [])], vars: { reversed: k }, flipped: k,
          });
          done[k] = "done";
          t.snap(4, b(`Advance: prev = ${m[k].v}, cur = ${k + 1 < n ? m[k + 1].v : "null"}.`, `Tiến lên: prev = ${m[k].v}, cur = ${k + 1 < n ? m[k + 1].v : "null"}.`), {
            marks: done, pointers: [{ i: k, label: "prev" }, ...(k + 1 < n ? [{ i: k + 1, label: "cur" }] : [])], vars: { reversed: k + 1 }, flipped: k + 1,
          });
        }
        t.items = m.slice().reverse();
        t.snap(5, b("head = prev. The list is reversed in O(n) time, O(1) space.", "head = prev. Danh sách đã đảo ngược trong O(n) thời gian, O(1) bộ nhớ."), { pointers: n ? [{ i: 0, label: "head" }] : [] });
        return { steps: t.steps, model: t.items };
      },
    },
  ],
};

export const linearModules = [stack, queue, linkedList];
