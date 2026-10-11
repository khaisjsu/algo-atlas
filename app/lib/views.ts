import type { Mark } from "./types";

export type Item = { id: number; v: number };
export type Marks = Record<number, Mark>;
export type Pointer = { i: number; label: string; tone?: Mark };

export type ArrayState = {
  items: Item[];
  marks: Marks;
  pointers?: Pointer[];
  /** Inclusive [lo, hi] window; everything outside is dimmed. */
  range?: [number, number] | null;
  /** Secondary row, e.g. merge buffer or counting array. */
  aux?: { label: string; cells: Array<number | null>; marks?: Marks; index?: boolean };
  /** Horizontal guide line drawn at this value (e.g. a target). */
  guide?: { v: number; label: string } | null;
};

export type GraphNode = { id: number; x: number; y: number; label?: string };
export type GraphEdge = { u: number; v: number; w?: number };

export type GraphState = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed: boolean;
  weighted: boolean;
  nodeMarks: Marks;
  /** Keyed by edge index. */
  edgeMarks: Marks;
  /** Small label under each node (distance, discovery order…). */
  tags?: Record<number, string>;
  panels?: Array<{ label: string; items: string[] }>;
};

export type TreeNode = { label: string; kids: Array<number | null> };

export type TreeState = {
  nodes: Record<number, TreeNode>;
  roots: number[];
  marks: Marks;
  tags?: Record<number, string>;
  /** Optional array strip under the tree (heap, union-find parent array). */
  strip?: { label: string; cells: string[]; marks?: Marks; caption?: string[] };
  panels?: Array<{ label: string; items: string[] }>;
};

export type GridState = {
  rowHead: string[];
  colHead: string[];
  cells: string[][];
  /** Keyed "r,c". */
  marks: Record<string, Mark>;
  corner?: string;
  /** Optional "r,c" → "r,c" arrow showing where a value came from. */
  arrows?: Array<[string, string]>;
  panels?: Array<{ label: string; items: string[] }>;
};

export type ListState = {
  kind: "stack" | "queue" | "list";
  items: Item[];
  marks: Marks;
  pointers?: Pointer[];
  /** A value floating in/out of the structure. */
  ghost?: { v: number; side: "in" | "out"; at: number } | null;
  panels?: Array<{ label: string; items: string[] }>;
  /** Render values as characters (bracket demo). */
  chars?: boolean;
  /** Linked-list reversal: links among the first `flipped` nodes point left. */
  flipped?: number;
};

export type HashState = {
  mode: "chain" | "probe";
  size: number;
  chains: Item[][];
  slots: Array<Item | null | "del">;
  bucketMarks: Marks;
  itemMarks: Marks;
  formula?: string;
};

export type Point = { x: number; y: number; c?: number };

export type PlotState =
  | {
      kind: "curve";
      fn: string;
      path: Array<{ x: number; y: number }>;
      tangent?: { x: number; slope: number } | null;
      loss: number[];
    }
  | {
      kind: "scatter";
      points: Point[];
      centroids?: Point[];
      trails?: Point[][];
      line?: { m: number; b: number } | null;
      residuals?: boolean;
      loss: number[];
    };
