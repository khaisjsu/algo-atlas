"use client";

import type { Bilingual } from "../../lib/types";
import { b } from "../../lib/types";
import { useApp } from "../Providers";

/** Labels used by algorithm traces, translated at render time. */
const labels: Record<string, Bilingual> = {
  queue: b("queue", "hàng đợi"),
  "visit order": b("visit order", "thứ tự thăm"),
  "call stack": b("call stack", "ngăn xếp gọi"),
  "priority queue (dist, v)": b("priority queue (dist, v)", "hàng đợi ưu tiên (dist, v)"),
  "priority queue (w, edge)": b("priority queue (w, edge)", "hàng đợi ưu tiên (w, cạnh)"),
  "sorted edges": b("sorted edges", "cạnh đã sắp xếp"),
  components: b("components", "thành phần"),
  order: b("order", "thứ tự"),
  output: b("output", "kết quả"),
  input: b("input", "đầu vào"),
  coins: b("coins", "mệnh giá"),
  solution: b("solution", "lời giải"),
  edits: b("edits", "thao tác"),
  buffer: b("buffer", "bộ đệm"),
  count: b("count", "đếm"),
  out: b("out", "kết quả"),
  parent: b("parent", "cha"),
};

export const useLabel = () => {
  const { t } = useApp();
  return (s: string) => (labels[s] ? t(labels[s]) : s);
};

export function Panels({ panels }: { panels?: Array<{ label: string; items: string[] }> }) {
  const label = useLabel();
  if (!panels?.length) return null;
  return (
    <div className="panels">
      {panels.map((p) => (
        <div className="panel" key={p.label}>
          <span className="panel-label">{label(p.label)}</span>
          <div className="chips">
            {p.items.length ? p.items.map((x, i) => <span className="chip" key={`${x}-${i}`}>{x}</span>) : <span className="chip empty">∅</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
