import { adjacency, checkSource, GraphTrace, idleGraph, name, presetAction, presets, sourceField } from "../graph";
import type { GraphModel } from "../graph";
import type { Action, VizModule } from "../types";
import { b } from "../types";
import type { GraphState } from "../views";

type GModule = VizModule<GraphModel, GraphState>;
type GAction = Action<GraphModel, GraphState>;

const inf = (d: number) => (d === Infinity ? "∞" : String(d));

/* ------------------------------------------------------------------ */
/* BFS & DFS                                                           */
/* ------------------------------------------------------------------ */

const bfsCode = [
  "dist[s] = 0; queue = [s]",
  "while queue not empty",
  "  u = queue.popFront()",
  "  for each neighbour v of u",
  "    if v not visited",
  "      dist[v] = dist[u] + 1; parent[v] = u",
  "      queue.pushBack(v)",
];

const bfs: GAction = {
  id: "bfs",
  label: b("BFS", "BFS"),
  code: bfsCode,
  fields: [sourceField()],
  run(g, v) {
    const s = Number(v.source);
    const bad = checkSource(g, s);
    if (bad) return bad;
    const adj = adjacency(g);
    const t = new GraphTrace(g);
    const dist = g.nodes.map(() => Infinity);
    const q: number[] = [s];
    const order: string[] = [];
    dist[s] = 0;
    t.tags[s] = "d=0";
    t.nodeMarks[s] = "frontier";
    const panels = () => [{ label: "queue", items: q.map((x) => name(g, x)) }, { label: "visit order", items: order.slice() }];
    t.snap(0, b(`Start at ${name(g, s)}: distance 0, put it in the queue.`, `Bắt đầu tại ${name(g, s)}: khoảng cách 0, đưa vào hàng đợi.`), { panels: panels(), vars: { s } });
    while (q.length) {
      const u = q.shift()!;
      order.push(name(g, u));
      t.nodeMarks[u] = "active";
      t.snap([1, 2], b(`Dequeue ${name(g, u)} (distance ${dist[u]}).`, `Lấy ${name(g, u)} khỏi hàng đợi (khoảng cách ${dist[u]}).`), { panels: panels(), vars: { u: name(g, u), "dist[u]": dist[u] } });
      for (const { to, e } of adj[u]) {
        const fresh = dist[to] === Infinity;
        t.snap([3, 4], fresh
          ? b(`${name(g, to)} is unvisited → discover it.`, `${name(g, to)} chưa thăm → phát hiện.`)
          : b(`${name(g, to)} already discovered; skip.`, `${name(g, to)} đã được phát hiện; bỏ qua.`), {
          nodes: { [to]: "compare" }, edges: { [e]: "compare" }, panels: panels(), vars: { u: name(g, u), v: name(g, to) },
        });
        if (fresh) {
          dist[to] = dist[u] + 1;
          t.tags[to] = `d=${dist[to]}`;
          t.edgeMarks[e] = "path";
          t.nodeMarks[to] = "frontier";
          q.push(to);
          t.snap([5, 6], b(`dist[${name(g, to)}] = ${dist[to]}; enqueue it.`, `dist[${name(g, to)}] = ${dist[to]}; đưa vào hàng đợi.`), { panels: panels(), vars: { u: name(g, u), v: name(g, to), "dist[v]": dist[to] } });
        }
      }
      t.nodeMarks[u] = "visited";
    }
    t.snap(-1, b(`BFS done. Labels show the fewest edges from ${name(g, s)}; highlighted edges form the BFS tree.`, `BFS xong. Nhãn cho biết số cạnh ít nhất từ ${name(g, s)}; các cạnh tô sáng tạo thành cây BFS.`), { panels: panels() });
    return { steps: t.steps, model: g };
  },
};

const dfsCode = [
  "dfs(u):",
  "  mark u visited; discover[u] = time++",
  "  for each neighbour v of u",
  "    if v not visited",
  "      parent[v] = u; dfs(v)",
  "  finish[u] = time++   // backtrack",
];

const dfs: GAction = {
  id: "dfs",
  label: b("DFS", "DFS"),
  code: dfsCode,
  fields: [sourceField()],
  run(g, v) {
    const s = Number(v.source);
    const bad = checkSource(g, s);
    if (bad) return bad;
    const adj = adjacency(g);
    const t = new GraphTrace(g);
    const seen = new Set<number>();
    const stack: number[] = [];
    let time = 0;
    const panels = () => [{ label: "call stack", items: stack.map((x) => `dfs(${name(g, x)})`) }];
    const go = (u: number) => {
      seen.add(u);
      stack.push(u);
      t.tags[u] = `${time++}/`;
      t.nodeMarks[u] = "active";
      t.snap([0, 1], b(`Enter ${name(g, u)} — discovered at time ${time - 1}.`, `Vào ${name(g, u)} — phát hiện tại thời điểm ${time - 1}.`), { panels: panels(), vars: { u: name(g, u), time } });
      for (const { to, e } of adj[u]) {
        const fresh = !seen.has(to);
        t.snap([2, 3], fresh
          ? b(`${name(g, to)} unvisited → go deeper.`, `${name(g, to)} chưa thăm → đi sâu hơn.`)
          : b(`${name(g, to)} already visited.`, `${name(g, to)} đã thăm.`), { nodes: { [to]: "compare" }, edges: { [e]: "compare" }, panels: panels(), vars: { u: name(g, u), v: name(g, to) } });
        if (fresh) {
          t.edgeMarks[e] = "path";
          t.nodeMarks[u] = "frontier";
          t.snap(4, b(`Recurse into ${name(g, to)}.`, `Đệ quy vào ${name(g, to)}.`), { panels: panels(), vars: { u: name(g, u), v: name(g, to) } });
          go(to);
          t.nodeMarks[u] = "active";
          t.snap(2, b(`Back in ${name(g, u)}; continue with its next neighbour.`, `Quay lại ${name(g, u)}; tiếp tục với đỉnh kề kế tiếp.`), { panels: panels(), vars: { u: name(g, u) } });
        }
      }
      t.tags[u] += String(time++);
      t.nodeMarks[u] = "visited";
      stack.pop();
      t.snap(5, b(`All neighbours of ${name(g, u)} explored — finish at time ${time - 1} and backtrack.`, `Đã duyệt hết đỉnh kề của ${name(g, u)} — kết thúc tại thời điểm ${time - 1} và quay lui.`), { panels: panels(), vars: { u: name(g, u), time } });
    };
    go(s);
    t.snap(-1, b("DFS done. Tags show discover/finish times; highlighted edges form the DFS tree.", "DFS xong. Nhãn là thời điểm phát hiện/kết thúc; các cạnh tô sáng tạo thành cây DFS."), { panels: panels() });
    return { steps: t.steps, model: g };
  },
};

const traversal: GModule = {
  slug: "graph-traversal",
  title: b("Graph traversal: BFS & DFS", "Duyệt đồ thị: BFS & DFS"),
  short: b("Explore a graph level by level, or as deep as possible first.", "Duyệt đồ thị theo từng lớp, hoặc đi sâu nhất có thể trước."),
  category: "graphs",
  tags: ["O(V + E)", "queue", "stack / recursion", "shortest hops"],
  intro: b(
    "Breadth-first search (BFS) explores with a queue, visiting all vertices at distance 1, then 2, and so on — so in an unweighted graph it finds shortest paths. Depth-first search (DFS) uses recursion (a stack) to dive as deep as possible before backtracking — perfect for detecting cycles, connected components and orderings.",
    "Tìm kiếm theo chiều rộng (BFS) dùng hàng đợi, thăm mọi đỉnh cách 1 cạnh, rồi 2 cạnh, v.v. — nên trong đồ thị không trọng số nó tìm được đường ngắn nhất. Tìm kiếm theo chiều sâu (DFS) dùng đệ quy (ngăn xếp) để đi sâu nhất có thể rồi mới quay lui — rất hợp để phát hiện chu trình, thành phần liên thông và thứ tự.",
  ),
  invariant: b(
    "BFS: the queue holds vertices in non-decreasing distance order, differing by at most 1. DFS: the call stack is always a path from the source.",
    "BFS: hàng đợi chứa các đỉnh theo khoảng cách không giảm, chênh nhau tối đa 1. DFS: ngăn xếp gọi luôn là một đường đi từ đỉnh nguồn.",
  ),
  complexity: [
    { label: b("Time", "Thời gian"), value: "O(V + E)" },
    { label: b("Space", "Bộ nhớ"), value: "O(V)" },
    { label: b("BFS gives", "BFS cho"), value: "fewest hops" },
  ],
  applications: [
    { title: b("Social networks", "Mạng xã hội"), body: b("“People you may know” = vertices at BFS distance 2. LinkedIn's 1st/2nd/3rd-degree connections are BFS layers.", "“Những người bạn có thể biết” = đỉnh ở khoảng cách BFS 2. Kết nối cấp 1/2/3 của LinkedIn chính là các lớp BFS.") },
    { title: b("Web crawlers", "Trình thu thập web"), body: b("Crawlers BFS outward from seed pages so nearby, important pages are fetched first.", "Trình thu thập duyệt BFS từ trang gốc để các trang gần, quan trọng được tải trước.") },
    { title: b("Mazes & grids", "Mê cung & lưới"), body: b("Each cell is a vertex; BFS finds the shortest route in games and robot navigation; flood fill (paint bucket) is DFS/BFS.", "Mỗi ô là một đỉnh; BFS tìm đường ngắn nhất trong game và robot; tô loang (paint bucket) là DFS/BFS.") },
    { title: b("Dependency & cycle checks", "Kiểm tra phụ thuộc & chu trình"), body: b("Package managers and spreadsheets use DFS to detect circular references.", "Trình quản lý gói và bảng tính dùng DFS để phát hiện tham chiếu vòng.") },
    { title: b("Garbage collection", "Thu gom rác"), body: b("Mark-and-sweep GCs traverse the object graph from roots; anything unreached is freed.", "Bộ thu gom mark-and-sweep duyệt đồ thị đối tượng từ gốc; cái gì không tới được sẽ bị giải phóng.") },
  ],
  recognize: [
    b("“Minimum number of moves/steps/hops” with equal-cost moves → BFS.", "“Số bước/lần di chuyển ít nhất” với chi phí bằng nhau → BFS."),
    b("“Count islands / regions / connected components” → DFS or BFS.", "“Đếm đảo / vùng / thành phần liên thông” → DFS hoặc BFS."),
    b("“Is there a cycle?”, “can all tasks finish?” → DFS colouring.", "“Có chu trình không?”, “mọi việc có hoàn thành được không?” → tô màu DFS."),
  ],
  pitfalls: [
    b("Mark vertices visited when you enqueue them, not when you dequeue, or they enter the queue many times.", "Đánh dấu đã thăm khi đưa vào hàng đợi, không phải khi lấy ra, nếu không đỉnh sẽ vào hàng đợi nhiều lần."),
    b("Recursive DFS on 10⁵+ vertices can overflow the call stack — use an explicit stack.", "DFS đệ quy trên 10⁵+ đỉnh có thể tràn ngăn xếp — hãy dùng ngăn xếp tường minh."),
    b("BFS distances are only shortest when all edges cost the same.", "Khoảng cách BFS chỉ ngắn nhất khi mọi cạnh có chi phí bằng nhau."),
  ],
  practice: [
    { name: "Number of Islands (200)", url: "https://leetcode.com/problems/number-of-islands/", level: "Medium" },
    { name: "Rotting Oranges (994)", url: "https://leetcode.com/problems/rotting-oranges/", level: "Medium" },
    { name: "Clone Graph (133)", url: "https://leetcode.com/problems/clone-graph/", level: "Medium" },
    { name: "Shortest Path in Binary Matrix (1091)", url: "https://leetcode.com/problems/shortest-path-in-binary-matrix/", level: "Medium" },
    { name: "Word Ladder (127)", url: "https://leetcode.com/problems/word-ladder/", level: "Hard" },
  ],
  python: `from collections import deque

def bfs(graph, s):
    dist = {s: 0}
    q = deque([s])
    while q:
        u = q.popleft()
        for v in graph[u]:
            if v not in dist:          # mark when enqueued
                dist[v] = dist[u] + 1
                q.append(v)
    return dist

def dfs(graph, u, seen=None):
    seen = seen or set()
    seen.add(u)
    for v in graph[u]:
        if v not in seen:
            dfs(graph, v, seen)
    return seen`,
  quiz: [
    {
      q: b("A knight on a chessboard: fewest moves from a1 to h8?", "Quân mã trên bàn cờ: số nước ít nhất từ a1 tới h8?"),
      options: [b("DFS", "DFS"), b("BFS", "BFS"), b("Binary search", "Tìm nhị phân")],
      answer: 1,
      why: b("Every move costs 1, so BFS layers are exactly the move counts.", "Mỗi nước tốn 1, nên các lớp BFS chính là số nước đi."),
    },
    {
      q: b("Which data structure turns BFS into DFS (iteratively)?", "Cấu trúc dữ liệu nào biến BFS thành DFS (dạng lặp)?"),
      options: [b("Replace the queue with a stack", "Thay hàng đợi bằng ngăn xếp"), b("Replace the queue with a heap", "Thay hàng đợi bằng heap"), b("Use a hash map", "Dùng bảng băm")],
      answer: 0,
      why: b("LIFO order dives into the newest vertex first.", "Thứ tự LIFO lao vào đỉnh mới nhất trước."),
    },
  ],
  view: "graph",
  initial: () => presets.social.build(),
  idle: (g) => idleGraph(g),
  actions: [presetAction([presets.social, presets.city, presets.grid], { directed: false, weighted: false }), bfs, dfs],
};

/* ------------------------------------------------------------------ */
/* Shortest paths                                                      */
/* ------------------------------------------------------------------ */

const dijkstraCode = [
  "dist[*] = ∞; dist[s] = 0; pq = {(0, s)}",
  "while pq not empty",
  "  (d, u) = pq.extractMin()",
  "  if d > dist[u]: continue   // stale entry",
  "  for each edge (u, v, w)",
  "    if dist[u] + w < dist[v]   // relax",
  "      dist[v] = dist[u] + w; pq.insert((dist[v], v))",
];

const dijkstra: GAction = {
  id: "dijkstra",
  label: b("Dijkstra", "Dijkstra"),
  code: dijkstraCode,
  fields: [sourceField()],
  run(g, v) {
    const s = Number(v.source);
    const bad = checkSource(g, s);
    if (bad) return bad;
    if (g.edges.some((e) => (e.w ?? 1) < 0)) return { error: b("Dijkstra is wrong with negative edges — try Bellman–Ford on this graph.", "Dijkstra sai với cạnh âm — hãy thử Bellman–Ford trên đồ thị này.") };
    const adj = adjacency(g);
    const t = new GraphTrace(g);
    const dist = g.nodes.map(() => Infinity);
    const parentEdge = g.nodes.map(() => -1);
    dist[s] = 0;
    g.nodes.forEach((n) => (t.tags[n.id] = inf(dist[n.id])));
    let pq: Array<[number, number]> = [[0, s]];
    const panels = () => [{ label: "priority queue (dist, v)", items: pq.slice().sort((a, c) => a[0] - c[0]).map(([d, x]) => `(${d}, ${name(g, x)})`) }];
    t.nodeMarks[s] = "frontier";
    t.snap(0, b(`All distances start at ∞ except ${name(g, s)} = 0.`, `Mọi khoảng cách bắt đầu là ∞ trừ ${name(g, s)} = 0.`), { panels: panels() });
    while (pq.length) {
      pq.sort((a, c) => a[0] - c[0]);
      const [d, u] = pq.shift()!;
      if (d > dist[u]) {
        t.snap(3, b(`(${d}, ${name(g, u)}) is stale — we already found ${dist[u]}. Skip.`, `(${d}, ${name(g, u)}) đã cũ — ta đã có ${dist[u]}. Bỏ qua.`), { nodes: { [u]: "dim" }, panels: panels() });
        continue;
      }
      t.nodeMarks[u] = "active";
      t.snap([1, 2], b(`Extract ${name(g, u)} with the smallest tentative distance ${d}. It is now final.`, `Lấy ${name(g, u)} có khoảng cách tạm nhỏ nhất ${d}. Giá trị này đã chốt.`), { panels: panels(), vars: { u: name(g, u), d } });
      for (const { to, w, e } of adj[u]) {
        if (t.nodeMarks[to] === "visited") continue;
        const cand = dist[u] + w;
        const better = cand < dist[to];
        t.snap([4, 5], better
          ? b(`Relax ${name(g, u)}→${name(g, to)}: ${dist[u]} + ${w} = ${cand} < ${inf(dist[to])}. Improve!`, `Nới ${name(g, u)}→${name(g, to)}: ${dist[u]} + ${w} = ${cand} < ${inf(dist[to])}. Cải thiện!`)
          : b(`Relax ${name(g, u)}→${name(g, to)}: ${cand} ≥ ${inf(dist[to])}. No change.`, `Nới ${name(g, u)}→${name(g, to)}: ${cand} ≥ ${inf(dist[to])}. Không đổi.`), {
          nodes: { [to]: "compare" }, edges: { [e]: "compare" }, panels: panels(), vars: { u: name(g, u), v: name(g, to), w, "dist[u]+w": cand, "dist[v]": inf(dist[to]) },
        });
        if (better) {
          if (parentEdge[to] >= 0) delete t.edgeMarks[parentEdge[to]];
          parentEdge[to] = e;
          t.edgeMarks[e] = "path";
          dist[to] = cand;
          t.tags[to] = String(cand);
          t.nodeMarks[to] = "frontier";
          pq.push([cand, to]);
          t.snap(6, b(`dist[${name(g, to)}] = ${cand}; push (${cand}, ${name(g, to)}).`, `dist[${name(g, to)}] = ${cand}; thêm (${cand}, ${name(g, to)}).`), { panels: panels() });
        }
      }
      t.nodeMarks[u] = "visited";
    }
    pq = [];
    t.snap(-1, b("Done. Each label is the shortest distance from the source; highlighted edges form the shortest-path tree.", "Xong. Mỗi nhãn là khoảng cách ngắn nhất từ nguồn; các cạnh tô sáng tạo thành cây đường đi ngắn nhất."), { panels: panels() });
    return { steps: t.steps, model: g };
  },
};

const bellmanCode = [
  "dist[*] = ∞; dist[s] = 0",
  "repeat V - 1 times",
  "  for each edge (u, v, w)",
  "    if dist[u] + w < dist[v]: dist[v] = dist[u] + w",
  "for each edge (u, v, w)",
  "  if dist[u] + w < dist[v]: negative cycle!",
];

const bellman: GAction = {
  id: "bellman",
  label: b("Bellman–Ford", "Bellman–Ford"),
  code: bellmanCode,
  fields: [sourceField()],
  run(g, v) {
    const s = Number(v.source);
    const bad = checkSource(g, s);
    if (bad) return bad;
    const t = new GraphTrace(g);
    const dist = g.nodes.map(() => Infinity);
    const parentEdge = g.nodes.map(() => -1);
    dist[s] = 0;
    g.nodes.forEach((n) => (t.tags[n.id] = inf(dist[n.id])));
    const arcs = g.edges.flatMap((ed, e) => {
      const w = ed.w ?? 1;
      return g.directed ? [{ u: ed.u, v: ed.v, w, e }] : [{ u: ed.u, v: ed.v, w, e }, { u: ed.v, v: ed.u, w, e }];
    });
    t.nodeMarks[s] = "frontier";
    t.snap(0, b(`Initialise: dist[${name(g, s)}] = 0, everything else ∞.`, `Khởi tạo: dist[${name(g, s)}] = 0, còn lại ∞.`));
    const V = g.nodes.length;
    for (let round = 1; round < V; round++) {
      let changed = false;
      t.snap(1, b(`Round ${round} of ${V - 1}: relax every edge.`, `Vòng ${round}/${V - 1}: nới mọi cạnh.`), { vars: { round } });
      for (const a of arcs) {
        if (dist[a.u] === Infinity) continue;
        const cand = dist[a.u] + a.w;
        const better = cand < dist[a.v];
        t.snap([2, 3], better
          ? b(`${name(g, a.u)}→${name(g, a.v)}: ${dist[a.u]} + ${a.w} = ${cand} < ${inf(dist[a.v])}. Update.`, `${name(g, a.u)}→${name(g, a.v)}: ${dist[a.u]} + ${a.w} = ${cand} < ${inf(dist[a.v])}. Cập nhật.`)
          : b(`${name(g, a.u)}→${name(g, a.v)}: ${cand} ≥ ${inf(dist[a.v])}.`, `${name(g, a.u)}→${name(g, a.v)}: ${cand} ≥ ${inf(dist[a.v])}.`), {
          nodes: { [a.u]: "active", [a.v]: "compare" }, edges: { [a.e]: "compare" }, vars: { round, u: name(g, a.u), v: name(g, a.v), w: a.w },
        });
        if (better) {
          changed = true;
          if (parentEdge[a.v] >= 0) delete t.edgeMarks[parentEdge[a.v]];
          parentEdge[a.v] = a.e;
          t.edgeMarks[a.e] = "path";
          dist[a.v] = cand;
          t.tags[a.v] = String(cand);
          t.nodeMarks[a.v] = "visited";
        }
      }
      if (!changed) {
        t.snap(1, b(`Nothing changed in round ${round}, so distances are final — stop early.`, `Vòng ${round} không thay đổi gì nên khoảng cách đã chốt — dừng sớm.`), { vars: { round } });
        break;
      }
    }
    for (const a of arcs) {
      if (dist[a.u] !== Infinity && dist[a.u] + a.w < dist[a.v]) {
        t.snap([4, 5], b(`Edge ${name(g, a.u)}→${name(g, a.v)} can still be relaxed: a negative cycle is reachable!`, `Cạnh ${name(g, a.u)}→${name(g, a.v)} vẫn nới được: có chu trình âm!`), { nodes: { [a.u]: "reject", [a.v]: "reject" }, edges: { [a.e]: "reject" } });
        return { steps: t.steps, model: g };
      }
    }
    t.snap([4, 5], b("Final check: no edge can be relaxed, so there is no negative cycle. Distances are shortest.", "Kiểm tra cuối: không cạnh nào nới được nên không có chu trình âm. Khoảng cách là ngắn nhất."));
    return { steps: t.steps, model: g };
  },
};

const shortest: GModule = {
  slug: "shortest-paths",
  title: b("Shortest paths: Dijkstra & Bellman–Ford", "Đường đi ngắn nhất: Dijkstra & Bellman–Ford"),
  short: b("Cheapest route from one source to every vertex.", "Đường rẻ nhất từ một nguồn tới mọi đỉnh."),
  category: "graphs",
  tags: ["weighted", "greedy", "priority queue", "relaxation"],
  intro: b(
    "Single-source shortest path (SSSP) on weighted graphs. Dijkstra greedily finalises the closest unfinished vertex using a priority queue — fast, but only for non-negative weights. Bellman–Ford relaxes every edge V−1 times — slower, but it handles negative weights and detects negative cycles.",
    "Đường đi ngắn nhất một nguồn (SSSP) trên đồ thị có trọng số. Dijkstra tham lam chốt đỉnh gần nhất chưa xong bằng hàng đợi ưu tiên — nhanh nhưng chỉ đúng với trọng số không âm. Bellman–Ford nới mọi cạnh V−1 lần — chậm hơn nhưng xử lý được trọng số âm và phát hiện chu trình âm.",
  ),
  invariant: b(
    "Relaxation never makes dist[v] smaller than the true distance. Dijkstra: when u is extracted, dist[u] is final because every other route passes through a vertex that is already at least as far.",
    "Phép nới không bao giờ làm dist[v] nhỏ hơn khoảng cách thật. Dijkstra: khi lấy u ra, dist[u] đã chốt vì mọi đường khác đi qua một đỉnh ít nhất xa bằng.",
  ),
  complexity: [
    { label: b("Dijkstra", "Dijkstra"), value: "O((V+E) log V)" },
    { label: b("Bellman–Ford", "Bellman–Ford"), value: "O(V·E)" },
    { label: b("Space", "Bộ nhớ"), value: "O(V)" },
  ],
  applications: [
    { title: b("Maps & navigation", "Bản đồ & dẫn đường"), body: b("Google Maps runs Dijkstra-family algorithms (A*, contraction hierarchies) over road graphs weighted by travel time.", "Google Maps chạy các thuật toán họ Dijkstra (A*, contraction hierarchies) trên đồ thị đường với trọng số là thời gian di chuyển.") },
    { title: b("Internet routing", "Định tuyến Internet"), body: b("OSPF routers run Dijkstra on link costs; RIP and BGP are distance-vector, a distributed Bellman–Ford.", "Router OSPF chạy Dijkstra trên chi phí liên kết; RIP và BGP là distance-vector, một dạng Bellman–Ford phân tán.") },
    { title: b("Currency arbitrage", "Kinh doanh chênh lệch tiền tệ"), body: b("Weight each exchange by −log(rate); a negative cycle found by Bellman–Ford is a profitable loop.", "Gán trọng số −log(tỷ giá) cho mỗi lần đổi; chu trình âm Bellman–Ford tìm được là vòng lặp có lời.") },
    { title: b("Games & robotics", "Game & robot"), body: b("Path-finding for units on terrain with different movement costs.", "Tìm đường cho nhân vật trên địa hình có chi phí di chuyển khác nhau.") },
  ],
  recognize: [
    b("“Minimum cost / time / effort to reach …” with different edge costs.", "“Chi phí / thời gian / công sức tối thiểu để tới …” với chi phí cạnh khác nhau."),
    b("Negative costs or “at most k stops” → Bellman–Ford style rounds.", "Chi phí âm hoặc “tối đa k điểm dừng” → các vòng kiểu Bellman–Ford."),
    b("Edge weights only 0 or 1 → 0-1 BFS with a deque.", "Trọng số chỉ 0 hoặc 1 → BFS 0-1 với deque."),
  ],
  pitfalls: [
    b("Dijkstra with a negative edge can finalise a vertex too early and return a wrong answer.", "Dijkstra với cạnh âm có thể chốt đỉnh quá sớm và trả về kết quả sai."),
    b("Without the stale-entry check, lazy Dijkstra re-processes vertices and slows down.", "Thiếu kiểm tra mục cũ, Dijkstra kiểu lười xử lý lại đỉnh và chậm đi."),
    b("Shortest distance is undefined if a negative cycle is reachable.", "Khoảng cách ngắn nhất không xác định nếu có thể tới một chu trình âm."),
  ],
  practice: [
    { name: "Network Delay Time (743)", url: "https://leetcode.com/problems/network-delay-time/", level: "Medium" },
    { name: "Path With Minimum Effort (1631)", url: "https://leetcode.com/problems/path-with-minimum-effort/", level: "Medium" },
    { name: "Cheapest Flights Within K Stops (787)", url: "https://leetcode.com/problems/cheapest-flights-within-k-stops/", level: "Medium" },
    { name: "Swim in Rising Water (778)", url: "https://leetcode.com/problems/swim-in-rising-water/", level: "Hard" },
  ],
  python: `import heapq

def dijkstra(graph, s):              # graph[u] = [(v, w), ...]
    dist = {u: float("inf") for u in graph}
    dist[s] = 0
    pq = [(0, s)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue                 # stale entry
        for v, w in graph[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                heapq.heappush(pq, (dist[v], v))
    return dist

def bellman_ford(n, edges, s):       # edges = [(u, v, w), ...]
    dist = [float("inf")] * n
    dist[s] = 0
    for _ in range(n - 1):
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    if any(dist[u] + w < dist[v] for u, v, w in edges):
        raise ValueError("negative cycle")
    return dist`,
  quiz: [
    {
      q: b("Why does Bellman–Ford repeat V−1 rounds?", "Vì sao Bellman–Ford lặp V−1 vòng?"),
      options: [b("A shortest path has at most V−1 edges", "Đường ngắn nhất có tối đa V−1 cạnh"), b("To sort the edges", "Để sắp xếp các cạnh"), b("It is arbitrary", "Chọn tuỳ ý")],
      answer: 0,
      why: b("Round k fixes all shortest paths that use at most k edges.", "Vòng k sửa đúng mọi đường ngắn nhất dùng tối đa k cạnh."),
    },
    {
      q: b("Every edge has weight 1. What is the simplest correct algorithm?", "Mọi cạnh có trọng số 1. Thuật toán đúng đơn giản nhất là gì?"),
      options: [b("Bellman–Ford", "Bellman–Ford"), b("BFS", "BFS"), b("Floyd–Warshall", "Floyd–Warshall")],
      answer: 1,
      why: b("BFS is Dijkstra when all weights are equal, without the heap.", "BFS chính là Dijkstra khi mọi trọng số bằng nhau, không cần heap."),
    },
  ],
  view: "graph",
  initial: () => presets.city.build(),
  idle: (g) => idleGraph(g),
  actions: [presetAction([presets.city, presets.grid, presets.negative], { directed: false, weighted: true }), dijkstra, bellman],
};

/* ------------------------------------------------------------------ */
/* Minimum spanning tree                                               */
/* ------------------------------------------------------------------ */

const kruskalCode = [
  "sort edges by weight",
  "for each edge (u, v, w) in order",
  "  if find(u) != find(v)      // different components",
  "    add edge to MST; union(u, v)",
  "  else: skip (would form a cycle)",
];

const kruskal: GAction = {
  id: "kruskal",
  label: b("Kruskal", "Kruskal"),
  code: kruskalCode,
  run(g) {
    const t = new GraphTrace(g);
    const parent = g.nodes.map((n) => n.id);
    const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    const order = g.edges.map((_, e) => e).sort((a, c) => (g.edges[a].w ?? 1) - (g.edges[c].w ?? 1));
    let total = 0, taken = 0;
    const comps = () => {
      const groups = new Map<number, string[]>();
      g.nodes.forEach((n) => { const r = find(n.id); groups.set(r, [...(groups.get(r) ?? []), name(g, n.id)]); });
      return [...groups.values()].map((m) => `{${m.join(",")}}`);
    };
    const panels = (k: number) => [
      { label: "sorted edges", items: order.slice(k).map((e) => `${name(g, g.edges[e].u)}-${name(g, g.edges[e].v)}:${g.edges[e].w ?? 1}`) },
      { label: "components", items: comps() },
    ];
    t.snap(0, b(`Sort the ${g.edges.length} edges by weight. Each vertex starts in its own component.`, `Sắp ${g.edges.length} cạnh theo trọng số. Mỗi đỉnh bắt đầu là một thành phần riêng.`), { panels: panels(0) });
    for (let k = 0; k < order.length; k++) {
      const e = order[k];
      const { u, v } = g.edges[e];
      const w = g.edges[e].w ?? 1;
      const ok = find(u) !== find(v);
      t.snap([1, 2], ok
        ? b(`Edge ${name(g, u)}–${name(g, v)} (w=${w}) joins two different components.`, `Cạnh ${name(g, u)}–${name(g, v)} (w=${w}) nối hai thành phần khác nhau.`)
        : b(`Edge ${name(g, u)}–${name(g, v)} (w=${w}): both ends already connected.`, `Cạnh ${name(g, u)}–${name(g, v)} (w=${w}): hai đầu đã liên thông.`), {
        nodes: { [u]: "compare", [v]: "compare" }, edges: { [e]: "compare" }, panels: panels(k), vars: { w, total },
      });
      if (ok) {
        parent[find(u)] = find(v);
        t.edgeMarks[e] = "path";
        t.nodeMarks[u] = t.nodeMarks[v] = "visited";
        total += w;
        taken++;
        t.snap(3, b(`Take it. MST weight so far: ${total}.`, `Chọn cạnh này. Tổng trọng số cây khung: ${total}.`), { panels: panels(k + 1), vars: { w, total, edges: taken } });
        if (taken === g.nodes.length - 1) break;
      } else {
        t.edgeMarks[e] = "reject";
        t.snap(4, b("Skip it — it would close a cycle.", "Bỏ qua — nó sẽ tạo chu trình."), { panels: panels(k + 1), vars: { total } });
      }
    }
    t.snap(-1, b(`Minimum spanning tree complete: ${taken} edges, total weight ${total}.`, `Cây khung nhỏ nhất hoàn tất: ${taken} cạnh, tổng trọng số ${total}.`), { vars: { total } });
    return { steps: t.steps, model: g };
  },
};

const primCode = [
  "inTree = {s}; pq = edges leaving s",
  "while pq not empty",
  "  (w, u, v) = pq.extractMin()",
  "  if v in inTree: continue",
  "  add (u, v) to MST; inTree.add(v)",
  "  push all edges from v to vertices not in tree",
];

const prim: GAction = {
  id: "prim",
  label: b("Prim", "Prim"),
  code: primCode,
  fields: [sourceField()],
  run(g, v) {
    const s = Number(v.source);
    const bad = checkSource(g, s);
    if (bad) return bad;
    const adj = adjacency(g);
    const t = new GraphTrace(g);
    const inTree = new Set([s]);
    let pq = adj[s].map((a) => ({ w: a.w, u: s, v: a.to, e: a.e }));
    let total = 0;
    const panels = () => [{ label: "priority queue (w, edge)", items: pq.slice().sort((a, c) => a.w - c.w).map((x) => `(${x.w}, ${name(g, x.u)}-${name(g, x.v)})`) }];
    t.nodeMarks[s] = "visited";
    pq.forEach((x) => (t.edgeMarks[x.e] = "frontier"));
    t.snap(0, b(`Grow the tree from ${name(g, s)}. Its edges go into the priority queue.`, `Phát triển cây từ ${name(g, s)}. Các cạnh của nó vào hàng đợi ưu tiên.`), { panels: panels() });
    while (pq.length && inTree.size < g.nodes.length) {
      pq.sort((a, c) => a.w - c.w);
      const x = pq.shift()!;
      if (inTree.has(x.v)) {
        t.edgeMarks[x.e] = "reject";
        t.snap(3, b(`${name(g, x.u)}–${name(g, x.v)} leads back into the tree; discard.`, `${name(g, x.u)}–${name(g, x.v)} dẫn ngược vào cây; bỏ.`), { panels: panels() });
        continue;
      }
      t.snap(2, b(`Cheapest edge leaving the tree: ${name(g, x.u)}–${name(g, x.v)} (w=${x.w}).`, `Cạnh rẻ nhất rời khỏi cây: ${name(g, x.u)}–${name(g, x.v)} (w=${x.w}).`), { nodes: { [x.v]: "compare" }, edges: { [x.e]: "compare" }, panels: panels(), vars: { w: x.w, total } });
      inTree.add(x.v);
      total += x.w;
      t.edgeMarks[x.e] = "path";
      t.nodeMarks[x.v] = "visited";
      for (const a of adj[x.v]) if (!inTree.has(a.to)) { pq.push({ w: a.w, u: x.v, v: a.to, e: a.e }); if (t.edgeMarks[a.e] !== "path") t.edgeMarks[a.e] = "frontier"; }
      t.snap([4, 5], b(`Add ${name(g, x.v)}. Tree weight ${total}. Push its edges to outside vertices.`, `Thêm ${name(g, x.v)}. Tổng trọng số ${total}. Đẩy các cạnh của nó tới đỉnh bên ngoài.`), { panels: panels(), vars: { total, inTree: inTree.size } });
    }
    pq = [];
    g.edges.forEach((_, e) => { if (t.edgeMarks[e] === "frontier") delete t.edgeMarks[e]; });
    t.snap(-1, b(`Done: spanning tree of weight ${total}.`, `Xong: cây khung có trọng số ${total}.`), { panels: panels(), vars: { total } });
    return { steps: t.steps, model: g };
  },
};

const mst: GModule = {
  slug: "minimum-spanning-tree",
  title: b("Minimum spanning tree: Kruskal & Prim", "Cây khung nhỏ nhất: Kruskal & Prim"),
  short: b("Connect every vertex with the least total edge weight.", "Nối mọi đỉnh với tổng trọng số cạnh nhỏ nhất."),
  category: "graphs",
  tags: ["greedy", "union-find", "priority queue", "cut property"],
  intro: b(
    "A spanning tree connects all V vertices with exactly V−1 edges and no cycles. The minimum one has the smallest total weight. Kruskal scans edges from cheapest to most expensive and keeps any edge that joins two separate components (using union-find). Prim grows one tree outward, always adding the cheapest edge that leaves it.",
    "Cây khung nối mọi V đỉnh với đúng V−1 cạnh và không có chu trình. Cây khung nhỏ nhất có tổng trọng số nhỏ nhất. Kruskal duyệt cạnh từ rẻ đến đắt và giữ cạnh nào nối hai thành phần khác nhau (dùng union-find). Prim phát triển một cây ra ngoài, luôn thêm cạnh rẻ nhất rời khỏi cây.",
  ),
  invariant: b(
    "Cut property: for any split of the vertices into two groups, the cheapest edge crossing the split belongs to some MST. Both algorithms only ever add such edges.",
    "Tính chất lát cắt: với mọi cách chia đỉnh thành hai nhóm, cạnh rẻ nhất băng qua lát cắt thuộc về một cây khung nhỏ nhất. Cả hai thuật toán chỉ thêm những cạnh như vậy.",
  ),
  complexity: [
    { label: b("Kruskal", "Kruskal"), value: "O(E log E)" },
    { label: b("Prim (heap)", "Prim (heap)"), value: "O(E log V)" },
    { label: b("Edges in MST", "Số cạnh cây"), value: "V − 1" },
  ],
  applications: [
    { title: b("Network design", "Thiết kế mạng"), body: b("Lay the least cable, pipe, or road to connect every building, city or data centre.", "Đặt ít cáp, ống hay đường nhất để nối mọi toà nhà, thành phố hay trung tâm dữ liệu.") },
    { title: b("Clustering", "Phân cụm"), body: b("Build the MST, then delete the k−1 heaviest edges: you get k clusters (single-linkage clustering).", "Xây cây khung nhỏ nhất rồi xoá k−1 cạnh nặng nhất: ta có k cụm (phân cụm single-linkage).") },
    { title: b("Approximation", "Xấp xỉ"), body: b("A walk around the MST gives a travelling-salesman route at most 2× optimal.", "Đi vòng quanh cây khung cho lộ trình người bán hàng tối đa gấp 2 lần tối ưu.") },
    { title: b("Image segmentation", "Phân đoạn ảnh"), body: b("Pixels are vertices and colour differences are weights; MST-based methods split images into regions.", "Điểm ảnh là đỉnh, chênh lệch màu là trọng số; phương pháp dựa trên cây khung tách ảnh thành vùng.") },
  ],
  recognize: [
    b("“Connect all points with minimum total cost”.", "“Nối mọi điểm với tổng chi phí nhỏ nhất”."),
    b("“Minimise the maximum edge on a path” (the MST is also a minimum bottleneck tree).", "“Cực tiểu hoá cạnh lớn nhất trên đường đi” (cây khung nhỏ nhất cũng là cây cổ chai nhỏ nhất)."),
  ],
  pitfalls: [
    b("An MST is not a shortest-path tree — the path between two vertices in the MST may be long.", "Cây khung nhỏ nhất không phải cây đường đi ngắn nhất — đường giữa hai đỉnh trong cây có thể dài."),
    b("If the graph is disconnected you get a spanning forest, not a tree.", "Nếu đồ thị không liên thông, ta được rừng khung, không phải cây."),
  ],
  practice: [
    { name: "Min Cost to Connect All Points (1584)", url: "https://leetcode.com/problems/min-cost-to-connect-all-points/", level: "Medium" },
    { name: "Connecting Cities With Minimum Cost (1135)", url: "https://leetcode.com/problems/connecting-cities-with-minimum-cost/", level: "Medium" },
    { name: "Find Critical and Pseudo-Critical Edges (1489)", url: "https://leetcode.com/problems/find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree/", level: "Hard" },
  ],
  python: `def kruskal(n, edges):                 # edges = [(w, u, v), ...]
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]  # path halving
            x = parent[x]
        return x
    total, mst = 0, []
    for w, u, v in sorted(edges):
        ru, rv = find(u), find(v)
        if ru != rv:
            parent[ru] = rv
            total += w
            mst.append((u, v, w))
    return total, mst`,
  quiz: [
    {
      q: b("How many edges does the MST of a connected graph with 50 vertices have?", "Cây khung nhỏ nhất của đồ thị liên thông 50 đỉnh có bao nhiêu cạnh?"),
      options: [b("49", "49"), b("50", "50"), b("Depends on the weights", "Phụ thuộc trọng số")],
      answer: 0,
      why: b("Any tree on V vertices has V−1 edges.", "Mọi cây có V đỉnh đều có V−1 cạnh."),
    },
    {
      q: b("What does Kruskal need to test “would this edge form a cycle?” quickly?", "Kruskal cần gì để kiểm tra nhanh “cạnh này có tạo chu trình không?”"),
      options: [b("A stack", "Ngăn xếp"), b("Union-find", "Union-find"), b("A BST", "Cây BST")],
      answer: 1,
      why: b("Two endpoints with the same root are already connected.", "Hai đầu có cùng gốc thì đã liên thông."),
    },
  ],
  view: "graph",
  initial: () => presets.city.build(),
  idle: (g) => idleGraph(g),
  actions: [presetAction([presets.city, presets.grid], { directed: false, weighted: true }), kruskal, prim],
};

/* ------------------------------------------------------------------ */
/* Topological sort                                                    */
/* ------------------------------------------------------------------ */

const kahnCode = [
  "indeg[v] = number of incoming edges",
  "queue = all v with indeg[v] == 0",
  "while queue not empty",
  "  u = queue.popFront(); order.append(u)",
  "  for each edge u → v",
  "    indeg[v] -= 1; if indeg[v] == 0: queue.push(v)",
  "if len(order) < V: graph has a cycle",
];

const kahn: GAction = {
  id: "kahn",
  label: b("Kahn's algorithm", "Thuật toán Kahn"),
  code: kahnCode,
  run(g) {
    if (!g.directed) return { error: b("Topological order needs a directed graph.", "Thứ tự topo cần đồ thị có hướng.") };
    const adj = adjacency(g);
    const t = new GraphTrace(g);
    const indeg = g.nodes.map(() => 0);
    g.edges.forEach((e) => indeg[e.v]++);
    g.nodes.forEach((n) => (t.tags[n.id] = `in=${indeg[n.id]}`));
    const order: string[] = [];
    t.snap(0, b("Count incoming edges (in-degree) for every vertex.", "Đếm số cạnh đi vào (bậc vào) của mọi đỉnh."));
    const q = g.nodes.filter((n) => indeg[n.id] === 0).map((n) => n.id);
    q.forEach((x) => (t.nodeMarks[x] = "frontier"));
    const panels = () => [{ label: "queue", items: q.map((x) => name(g, x)) }, { label: "order", items: order.slice() }];
    t.snap(1, b(`Vertices with no prerequisites can go first: ${q.map((x) => name(g, x)).join(", ")}.`, `Các đỉnh không có điều kiện tiên quyết có thể đi trước: ${q.map((x) => name(g, x)).join(", ")}.`), { panels: panels() });
    while (q.length) {
      const u = q.shift()!;
      order.push(name(g, u));
      t.nodeMarks[u] = "active";
      t.snap([2, 3], b(`Take ${name(g, u)} → position ${order.length} in the order.`, `Lấy ${name(g, u)} → vị trí ${order.length} trong thứ tự.`), { panels: panels(), vars: { u: name(g, u) } });
      for (const { to, e } of adj[u]) {
        indeg[to]--;
        t.tags[to] = `in=${indeg[to]}`;
        t.edgeMarks[e] = "dim";
        if (indeg[to] === 0) { q.push(to); t.nodeMarks[to] = "frontier"; }
        t.snap([4, 5], indeg[to] === 0
          ? b(`Remove ${name(g, u)}→${name(g, to)}. ${name(g, to)} has no remaining prerequisites → enqueue.`, `Bỏ ${name(g, u)}→${name(g, to)}. ${name(g, to)} không còn điều kiện tiên quyết → vào hàng đợi.`)
          : b(`Remove ${name(g, u)}→${name(g, to)}. ${name(g, to)} still waits on ${indeg[to]}.`, `Bỏ ${name(g, u)}→${name(g, to)}. ${name(g, to)} còn chờ ${indeg[to]}.`), {
          nodes: { [to]: "compare" }, edges: { [e]: "compare" }, panels: panels(), vars: { u: name(g, u), v: name(g, to), "indeg[v]": indeg[to] },
        });
      }
      t.nodeMarks[u] = "visited";
    }
    if (order.length < g.nodes.length) {
      g.nodes.forEach((n) => { if (indeg[n.id] > 0) t.nodeMarks[n.id] = "reject"; });
      t.snap(6, b("Some vertices never reached in-degree 0: the graph has a cycle, so no valid order exists.", "Một số đỉnh không bao giờ có bậc vào 0: đồ thị có chu trình nên không có thứ tự hợp lệ."), { panels: panels() });
    } else {
      t.snap(6, b(`Valid order: ${order.join(" → ")}.`, `Thứ tự hợp lệ: ${order.join(" → ")}.`), { panels: panels() });
    }
    return { steps: t.steps, model: g };
  },
};

const topo: GModule = {
  slug: "topological-sort",
  title: b("Topological sort", "Sắp xếp tô-pô"),
  short: b("Order tasks so every prerequisite comes first.", "Sắp thứ tự công việc sao cho điều kiện tiên quyết luôn đi trước."),
  category: "graphs",
  tags: ["DAG", "O(V + E)", "scheduling", "in-degree"],
  intro: b(
    "In a directed acyclic graph (DAG), an edge u → v means “u must happen before v”. A topological order lists all vertices so every edge points forward. Kahn's algorithm repeatedly takes a vertex with no remaining incoming edges; if it gets stuck, there is a cycle.",
    "Trong đồ thị có hướng không chu trình (DAG), cạnh u → v nghĩa là “u phải xảy ra trước v”. Thứ tự tô-pô liệt kê mọi đỉnh sao cho mọi cạnh đều hướng về phía trước. Thuật toán Kahn liên tục lấy đỉnh không còn cạnh vào; nếu bị kẹt thì có chu trình.",
  ),
  invariant: b(
    "Every vertex in the output has all its predecessors earlier in the output; in-degree counts only the predecessors not yet output.",
    "Mọi đỉnh trong kết quả đều có mọi đỉnh đi trước nằm sớm hơn; bậc vào chỉ đếm các đỉnh đi trước chưa được xuất.",
  ),
  complexity: [
    { label: b("Time", "Thời gian"), value: "O(V + E)" },
    { label: b("Space", "Bộ nhớ"), value: "O(V)" },
    { label: b("Exists iff", "Tồn tại khi"), value: "no cycle" },
  ],
  applications: [
    { title: b("Build systems", "Hệ thống build"), body: b("Make, Bazel and webpack compile modules in dependency order; CI pipelines run jobs as a DAG.", "Make, Bazel và webpack biên dịch module theo thứ tự phụ thuộc; CI chạy các job dưới dạng DAG.") },
    { title: b("Package managers", "Trình quản lý gói"), body: b("npm, pip and apt install dependencies before the packages that need them.", "npm, pip và apt cài phụ thuộc trước các gói cần chúng.") },
    { title: b("Course planning", "Lập kế hoạch học"), body: b("Choose a semester order that respects all prerequisites.", "Chọn thứ tự học kỳ đáp ứng mọi môn tiên quyết.") },
    { title: b("Spreadsheets & data pipelines", "Bảng tính & đường ống dữ liệu"), body: b("Excel recalculates cells in topological order; Airflow schedules tasks from a DAG.", "Excel tính lại ô theo thứ tự tô-pô; Airflow lập lịch tác vụ từ DAG.") },
  ],
  recognize: [
    b("“Prerequisites”, “dependencies”, “must happen before”.", "“Điều kiện tiên quyết”, “phụ thuộc”, “phải xảy ra trước”."),
    b("“Is it possible to finish all tasks?” = “is the graph acyclic?”.", "“Có hoàn thành mọi việc được không?” = “đồ thị có phi chu trình không?”."),
    b("Longest/shortest path in a DAG: DP in topological order.", "Đường dài/ngắn nhất trong DAG: quy hoạch động theo thứ tự tô-pô."),
  ],
  pitfalls: [
    b("Topological orders are rarely unique — tests that expect one exact order need a tie-break rule.", "Thứ tự tô-pô hiếm khi duy nhất — đề yêu cầu một thứ tự cụ thể cần quy tắc phá hoà."),
    b("Edge direction matters: “a requires b” is the edge b → a.", "Hướng cạnh quan trọng: “a cần b” là cạnh b → a."),
  ],
  practice: [
    { name: "Course Schedule (207)", url: "https://leetcode.com/problems/course-schedule/", level: "Medium" },
    { name: "Course Schedule II (210)", url: "https://leetcode.com/problems/course-schedule-ii/", level: "Medium" },
    { name: "Parallel Courses (1136)", url: "https://leetcode.com/problems/parallel-courses/", level: "Medium" },
    { name: "Alien Dictionary (269)", url: "https://leetcode.com/problems/alien-dictionary/", level: "Hard" },
  ],
  python: `from collections import deque

def topo_sort(n, edges):                 # edges = [(u, v)] means u before v
    graph = [[] for _ in range(n)]
    indeg = [0] * n
    for u, v in edges:
        graph[u].append(v)
        indeg[v] += 1
    q = deque(v for v in range(n) if indeg[v] == 0)
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        for v in graph[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return order if len(order) == n else None   # None → cycle`,
  quiz: [
    {
      q: b("Kahn's algorithm outputs only 6 of 9 vertices. What does that mean?", "Thuật toán Kahn chỉ xuất 6 trên 9 đỉnh. Điều đó nghĩa là gì?"),
      options: [b("The graph has a cycle", "Đồ thị có chu trình"), b("The graph is disconnected", "Đồ thị không liên thông"), b("A bug", "Có lỗi")],
      answer: 0,
      why: b("Vertices on a cycle always keep in-degree ≥ 1.", "Các đỉnh trên chu trình luôn có bậc vào ≥ 1."),
    },
  ],
  view: "graph",
  initial: () => presets.courses.build(),
  idle: (g) => idleGraph(g),
  actions: [presetAction([presets.courses, presets.build], { directed: true, weighted: false, dag: true }), kahn],
};

export const graphModules = [traversal, shortest, mst, topo];
