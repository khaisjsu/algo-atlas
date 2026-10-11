import type { TreeState } from "../../lib/views";
import { Panels, useLabel } from "./Panels";

const W = 800;
const LEVEL = 72;
const R = 19;

type Pos = { x: number; depth: number };

/** Binary nodes are placed by in-order rank; n-ary forests by leaf order. */
function layout(s: TreeState) {
  const pos = new Map<number, Pos>();
  let col = 0;
  let maxDepth = 0;
  const visit = (id: number, depth: number) => {
    const n = s.nodes[id];
    if (!n) return;
    maxDepth = Math.max(maxDepth, depth);
    const binary = n.kids.length === 2;
    if (binary) {
      if (n.kids[0] != null) visit(n.kids[0], depth + 1);
      pos.set(id, { x: col++, depth });
      if (n.kids[1] != null) visit(n.kids[1], depth + 1);
    } else if (!n.kids.length) {
      pos.set(id, { x: col++, depth });
    } else {
      n.kids.forEach((k) => k != null && visit(k, depth + 1));
      const xs = n.kids.filter((k): k is number => k != null).map((k) => pos.get(k)!.x);
      pos.set(id, { x: (Math.min(...xs) + Math.max(...xs)) / 2, depth });
    }
  };
  s.roots.forEach((r, i) => {
    if (i > 0) col += 0.6;
    visit(r, 0);
  });
  return { pos, cols: Math.max(1, col), maxDepth };
}

export function TreeView({ s }: { s: TreeState }) {
  const label = useLabel();
  const { pos, cols, maxDepth } = layout(s);
  const unit = Math.min(64, (W - 60) / cols);
  const offset = (W - unit * (cols - 1)) / 2;
  const X = (p: Pos) => offset + p.x * unit;
  const Y = (p: Pos) => 40 + p.depth * LEVEL;
  const treeH = Math.max(150, 40 + maxDepth * LEVEL + 50);
  const stripH = s.strip ? 92 : 0;
  const H = treeH + stripH;
  const empty = !s.roots.length;

  return (
    <div className="tree-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="viz-svg" role="img" aria-label="Tree visualisation">
        {empty && <text x={W / 2} y={treeH / 2} textAnchor="middle" className="empty-label">∅</text>}
        {Object.entries(s.nodes).map(([k, n]) => {
          const p = pos.get(Number(k));
          if (!p) return null;
          return n.kids.map((c, i) => {
            if (c == null || !pos.has(c)) return null;
            const q = pos.get(c)!;
            const mark = s.marks[c] === "path" || s.marks[c] === "found" || s.marks[c] === "compare" ? s.marks[c] : "none";
            return <line key={`${k}-${i}`} className={`tree-edge m-${mark}`} x1={X(p)} y1={Y(p)} x2={X(q)} y2={Y(q)} />;
          });
        })}
        {Object.keys(s.nodes).map((k) => {
          const id = Number(k);
          const p = pos.get(id);
          if (!p) return null;
          const mark = s.marks[id] ?? "none";
          return (
            <g key={id} className={`node m-${mark}`} style={{ transform: `translate(${X(p)}px, ${Y(p)}px)` }}>
              <circle r={R} />
              <text textAnchor="middle" y={5} className="node-label">{s.nodes[id].label}</text>
              {s.tags?.[id] && <text textAnchor="middle" y={R + 13} className="node-index">{s.tags[id]}</text>}
            </g>
          );
        })}
        {s.strip && (
          <g className="strip" transform={`translate(0 ${treeH})`}>
            {(() => {
              const n = s.strip.cells.length;
              const cell = Math.min(50, (W - 120) / Math.max(1, n));
              const x0 = (W - cell * n) / 2 + 20;
              return (
                <>
                  <text x={x0 - 12} y={30} textAnchor="end" className="aux-label">{label(s.strip.label)}</text>
                  {s.strip.cells.map((v, i) => (
                    <g key={i} className={`aux-cell m-${s.strip!.marks?.[i] ?? "none"}`}>
                      <rect x={x0 + i * cell} y={8} width={cell - 4} height={36} rx={5} />
                      <text x={x0 + i * cell + (cell - 4) / 2} y={31} textAnchor="middle">{v}</text>
                      <text x={x0 + i * cell + (cell - 4) / 2} y={60} textAnchor="middle" className="index-label small">{s.strip!.caption?.[i] ?? i}</text>
                    </g>
                  ))}
                </>
              );
            })()}
          </g>
        )}
      </svg>
      <Panels panels={s.panels} />
    </div>
  );
}
