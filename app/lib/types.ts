export type Language = "en" | "vi";
export type Bilingual = { en: string; vi: string };

/** Shorthand for a bilingual string. */
export const b = (en: string, vi: string): Bilingual => ({ en, vi });

/** Visual roles shared by every renderer, mapped to colours in CSS. */
export type Mark =
  | "compare"
  | "swap"
  | "active"
  | "pivot"
  | "done"
  | "found"
  | "visited"
  | "frontier"
  | "dim"
  | "path"
  | "reject";

export type Step<S> = {
  state: S;
  /** Pseudocode line(s) to highlight, 0-based. */
  line: number | number[];
  note: Bilingual;
  /** Variable watch: name → value at this step. */
  vars?: Record<string, string | number>;
};

type FieldBase = { key: string; label: Bilingual; /** Only show when another field has this value. */ when?: [string, string] };

export type Field = FieldBase &
  (
    | { kind: "number"; default: number; min?: number; max?: number }
    | { kind: "list"; default: string; placeholder?: string }
    | { kind: "select"; default: string; options: Array<{ value: string; label: Bilingual }> }
  );

export type FieldValues = Record<string, string>;

export type ActionResult<M, S> = { steps: Step<S>[]; model: M } | { error: Bilingual };

export type Action<M, S> = {
  id: string;
  label: Bilingual;
  fields?: Field[];
  /** Pseudocode shown while this action's steps are playing. */
  code?: string[];
  run(model: M, values: FieldValues): ActionResult<M, S>;
};

export type ViewKind = "array" | "graph" | "tree" | "grid" | "list" | "hash" | "plot";

export type Category = "sorting" | "searching" | "linear" | "trees" | "graphs" | "dp" | "ml";

export type Complexity = { label: Bilingual; value: string }[];

export type QuizItem = { q: Bilingual; options: Bilingual[]; answer: number; why: Bilingual };

export type ModuleContent = {
  slug: string;
  title: Bilingual;
  short: Bilingual;
  category: Category;
  tags: string[];
  intro: Bilingual;
  /** Plain-language mental model / invariant. */
  invariant: Bilingual;
  complexity: Complexity;
  /** Where this shows up in real systems and problems. */
  applications: Array<{ title: Bilingual; body: Bilingual }>;
  /** Signals in a problem statement that hint at this technique. */
  recognize: Bilingual[];
  pitfalls: Bilingual[];
  practice: Array<{ name: string; url: string; level: "Easy" | "Medium" | "Hard" }>;
  python: string;
  quiz: QuizItem[];
};

export type VizModule<M = unknown, S = unknown> = ModuleContent & {
  view: ViewKind;
  initial(): M;
  /** Render a resting frame for the current model (before/after an action). */
  idle(model: M): S;
  actions: Action<M, S>[];
};

export const parseList = (raw: string): number[] | null => {
  const parts = raw.split(/[\s,;]+/).filter(Boolean);
  if (!parts.length) return [];
  const nums = parts.map(Number);
  return nums.every((n) => Number.isFinite(n) && Number.isInteger(n)) ? nums : null;
};

export const randInt = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
export const randomList = (n: number, lo = 3, hi = 60) => Array.from({ length: n }, () => randInt(lo, hi));
