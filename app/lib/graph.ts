import type { Bilingual, Field, Mark, Step } from "./types";
import { b, randInt } from "./types";
import type { GraphEdge, GraphNode, GraphState, Marks } from "./views";

export type GraphModel = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed: boolean;
  weighted: boolean;
};

export type Preset = { id: string; label: Bilingual; build: () => GraphModel };

const N = (pts: Array<[number, number]>): GraphNode[] => pts.map(([x, y], id) => ({ id, x, y }));
const E = (list: Array<[number, number, number?]>): GraphEdge[] => list.map(([u, v, w]) => ({ u, v, w }));

export const presets = {
  city: {
    id: "city",
    label: b("City map (weighted)", "Bản đồ thành phố (có trọng số)"),
    build: () => ({
      directed: false,
      weighted: true,
      nodes: N([[80, 220], [220, 80], [220, 360], [380, 220], [540, 80], [540, 360], [700, 220], [380, 400]]),
      edges: E([[0, 1, 4], [0, 2, 3], [1, 3, 2], [2, 3, 5], [1, 4, 7], [3, 4, 3], [3, 5, 4], [2, 7, 6], [7, 5, 2], [4, 6, 5], [5, 6, 3], [3, 7, 8]]),
    }),
  },
  social: {
    id: "social",
    label: b("Friend network", "Mạng bạn bè"),
    build: () => ({
      directed: false,
      weighted: false,
      nodes: N([[400, 60], [230, 150], [570, 150], [120, 280], [300, 280], [500, 280], [680, 280], [210, 400], [400, 400], [600, 400]]),
      edges: E([[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [3, 7], [4, 7], [4, 8], [5, 8], [5, 9], [6, 9], [1, 2]]),
    }),
  },
  grid: {
    id: "grid",
    label: b("Grid / maze", "Lưới / mê cung"),
    build: () => {
      const pts: Array<[number, number]> = [];
      for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) pts.push([100 + c * 150, 80 + r * 140]);
      const edges: Array<[number, number, number?]> = [];
      const blocked = new Set(["1-6", "7-8", "3-8", "11-12"]);
      for (let r = 0; r < 3; r++)
        for (let c = 0; c < 5; c++) {
          const id = r * 5 + c;
          if (c < 4 && !blocked.has(`${id}-${id + 1}`)) edges.push([id, id + 1, randInt(1, 9)]);
          if (r < 2 && !blocked.has(`${id}-${id + 5}`)) edges.push([id, id + 5, randInt(1, 9)]);
        }
      return { directed: false, weighted: true, nodes: N(pts), edges: E(edges) };
    },
  },
  negative: {
    id: "negative",
    label: b("Directed, one negative edge", "Có hướng, một cạnh âm"),
    build: () => ({
      directed: true,
      weighted: true,
      nodes: N([[90, 220], [260, 90], [260, 350], [460, 90], [460, 350], [680, 220]]),
      edges: E([[0, 1, 6], [0, 2, 4], [1, 3, 5], [2, 1, -3], [2, 4, 7], [3, 5, 2], [4, 3, -1], [4, 5, 6], [1, 4, 4]]),
    }),
  },
  courses: {
    id: "courses",
    label: b("Course prerequisites (DAG)", "Môn tiên quyết (DAG)"),
    build: () => ({
      directed: true,
      weighted: false,
      nodes: [
        { id: 0, x: 90, y: 110, label: "Intro" },
        { id: 1, x: 90, y: 330, label: "Math" },
        { id: 2, x: 280, y: 60, label: "DS" },
        { id: 3, x: 280, y: 220, label: "Discrete" },
        { id: 4, x: 280, y: 380, label: "LinAlg" },
        { id: 5, x: 480, y: 140, label: "Algo" },
        { id: 6, x: 480, y: 330, label: "Prob" },
        { id: 7, x: 690, y: 140, label: "Compilers" },
        { id: 8, x: 690, y: 330, label: "ML" },
      ],
      edges: E([[0, 2], [0, 3], [1, 3], [1, 4], [2, 5], [3, 5], [3, 6], [4, 8], [5, 7], [5, 8], [6, 8]]),
    }),
  },
  build: {
    id: "build",
    label: b("Build pipeline (DAG)", "Quy trình build (DAG)"),
    build: () => ({
      directed: true,
      weighted: false,
      nodes: [
        { id: 0, x: 90, y: 220, label: "fetch" },
        { id: 1, x: 250, y: 100, label: "deps" },
        { id: 2, x: 250, y: 340, label: "lint" },
        { id: 3, x: 420, y: 100, label: "compile" },
        { id: 4, x: 420, y: 340, label: "assets" },
        { id: 5, x: 580, y: 220, label: "test" },
        { id: 6, x: 720, y: 220, label: "deploy" },
      ],
      edges: E([[0, 1], [0, 2], [1, 3], [1, 4], [3, 5], [2, 5], [4, 6], [5, 6]]),
    }),
  },
} satisfies Record<string, Preset>;

/** Random connected graph laid out on a jittered grid so edges rarely cross. */
export function randomGraph(n: number, opts: { directed: boolean; weighted: boolean; dag?: boolean }): GraphModel {
  const cols = Math.ceil(Math.sqrt(n * 1.8));
  const rows = Math.ceil(n / cols);
  const nodes: GraphNode[] = [];
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / cols), c = i % cols;
    nodes.push({ id: i, x: 70 + (c * 660) / Math.max(1, cols - 1) + randInt(-22, 22), y: 70 + (r * 300) / Math.max(1, rows - 1) + randInt(-22, 22) });
  }
  const key = (u: number, v: number) => (u < v ? `${u}-${v}` : `${v}-${u}`);
  const seen = new Set<string>();
  const edges: GraphEdge[] = [];
  const dist = (u: number, v: number) => Math.hypot(nodes[u].x - nodes[v].x, nodes[u].y - nodes[v].y);
  const add = (u: number, v: number) => {
    if (u === v || seen.has(key(u, v))) return;
    seen.add(key(u, v));
    const [a, c] = opts.dag && u > v ? [v, u] : [u, v];
    edges.push({ u: a, v: c, w: opts.weighted ? randInt(1, 9) : undefined });
  };
  // Spanning tree: connect each node to its nearest earlier node.
  for (let i = 1; i < n; i++) {
    let best = 0;
    for (let j = 1; j < i; j++) if (dist(i, j) < dist(i, best)) best = j;
    add(best, i);
  }
  // Extra short edges for cycles.
  const extra = Math.round(n * 0.5);
  for (let k = 0, tries = 0; k < extra && tries < 200; tries++) {
    const u = randInt(0, n - 1);
    const near = nodes.map((_, v) => v).filter((v) => v !== u).sort((a, c) => dist(u, a) - dist(u, c));
    const v = near[randInt(0, Math.min(2, near.length - 1))];
    if (!seen.has(key(u, v))) { add(u, v); k++; }
  }
  return { nodes, edges, directed: opts.directed || !!opts.dag, weighted: opts.weighted };
}

export type Adj = Array<Array<{ to: number; w: number; e: number }>>;

export function adjacency(g: GraphModel): Adj {
  const adj: Adj = g.nodes.map(() => []);
  g.edges.forEach((ed, e) => {
    adj[ed.u].push({ to: ed.v, w: ed.w ?? 1, e });
    if (!g.directed) adj[ed.v].push({ to: ed.u, w: ed.w ?? 1, e });
  });
  adj.forEach((list) => list.sort((a, c) => a.to - c.to));
  return adj;
}

export const name = (g: GraphModel, id: number) => g.nodes[id]?.label ?? String(id);

/** Records graph snapshots; persistent marks stay until overwritten. */
export class GraphTrace {
  steps: Step<GraphState>[] = [];
  nodeMarks: Marks = {};
  edgeMarks: Marks = {};
  tags: Record<number, string> = {};
  constructor(public g: GraphModel) {}

  snap(
    line: number | number[],
    note: Bilingual,
    extra: { nodes?: Marks; edges?: Marks; panels?: GraphState["panels"]; vars?: Record<string, string | number> } = {},
  ) {
    this.steps.push({
      state: {
        nodes: this.g.nodes,
        edges: this.g.edges,
        directed: this.g.directed,
        weighted: this.g.weighted,
        nodeMarks: { ...this.nodeMarks, ...extra.nodes },
        edgeMarks: { ...this.edgeMarks, ...extra.edges },
        tags: { ...this.tags },
        panels: extra.panels,
      },
      line,
      note,
      vars: extra.vars,
    });
  }
}

export const idleGraph = (g: GraphModel, tags?: Record<number, string>): GraphState => ({
  nodes: g.nodes,
  edges: g.edges,
  directed: g.directed,
  weighted: g.weighted,
  nodeMarks: {},
  edgeMarks: {},
  tags,
});

export const sourceField = (def = 0): Field => ({ key: "source", label: b("Source vertex", "Đỉnh nguồn"), kind: "number", default: def, min: 0, max: 30 });

export function presetAction(list: Preset[], randomOpts: { directed: boolean; weighted: boolean; dag?: boolean }) {
  return {
    id: "graph",
    label: b("Graph", "Đồ thị"),
    fields: [
      {
        key: "preset",
        label: b("Example", "Ví dụ"),
        kind: "select" as const,
        default: list[0].id,
        options: [...list.map((p) => ({ value: p.id, label: p.label })), { value: "random", label: b("Random graph", "Đồ thị ngẫu nhiên") }],
      },
      { key: "n", label: b("Vertices", "Số đỉnh"), kind: "number" as const, default: 9, min: 3, max: 14, when: ["preset", "random"] as [string, string] },
    ],
    run(_m: GraphModel, v: Record<string, string>) {
      const preset = list.find((p) => p.id === v.preset);
      const g = preset ? preset.build() : randomGraph(Math.max(3, Math.min(14, Number(v.n) || 9)), randomOpts);
      return {
        model: g,
        steps: [{ state: idleGraph(g), line: -1, note: b(`Loaded a graph with ${g.nodes.length} vertices and ${g.edges.length} edges.`, `Đã tải đồ thị ${g.nodes.length} đỉnh và ${g.edges.length} cạnh.`) }],
      };
    },
  };
}

export const checkSource = (g: GraphModel, s: number) =>
  Number.isInteger(s) && s >= 0 && s < g.nodes.length ? null : { error: b(`Pick a vertex between 0 and ${g.nodes.length - 1}.`, `Chọn đỉnh từ 0 đến ${g.nodes.length - 1}.`) };

export type { Mark };
