import type { GraphState } from "../../lib/views";
import { Panels } from "./Panels";

const R = 21;

export function GraphView({ s }: { s: GraphState }) {
  const byId = new Map(s.nodes.map((n) => [n.id, n]));
  // Antiparallel directed edges are bent so both are visible.
  const pairs = new Set(s.edges.map((e) => `${e.u}-${e.v}`));

  return (
    <div className="graph-wrap">
      <svg viewBox="0 0 800 450" className="viz-svg" role="img" aria-label="Graph visualisation">
        <defs>
          {["none", "compare", "path", "reject", "frontier", "dim"].map((m) => (
            <marker key={m} id={`arrow-${m}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse" className={`arrowhead m-${m}`}>
              <path d="M0 0 L10 5 L0 10 z" />
            </marker>
          ))}
        </defs>
        {s.edges.map((e, i) => {
          const a = byId.get(e.u)!, c = byId.get(e.v)!;
          const dx = c.x - a.x, dy = c.y - a.y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len, uy = dy / len;
          const bend = s.directed && pairs.has(`${e.v}-${e.u}`) ? 26 : 0;
          const x1 = a.x + ux * R, y1 = a.y + uy * R;
          const x2 = c.x - ux * (R + (s.directed ? 3 : 0)), y2 = c.y - uy * (R + (s.directed ? 3 : 0));
          const mx = (a.x + c.x) / 2 - uy * bend, my = (a.y + c.y) / 2 + ux * bend;
          const mark = s.edgeMarks[i] ?? "none";
          const markerMark = ["compare", "path", "reject", "frontier", "dim"].includes(mark) ? mark : "none";
          return (
            <g key={i} className={`edge m-${mark}`}>
              <path d={bend ? `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}` : `M${x1} ${y1} L${x2} ${y2}`} markerEnd={s.directed ? `url(#arrow-${markerMark})` : undefined} />
              {s.weighted && e.w != null && (
                <g className="edge-weight" transform={`translate(${bend ? mx : mx - uy * 2} ${bend ? my : my + ux * 2})`}>
                  <rect x={-12} y={-10} width={24} height={20} rx={6} />
                  <text textAnchor="middle" y={4}>{e.w}</text>
                </g>
              )}
            </g>
          );
        })}
        {s.nodes.map((n) => {
          const mark = s.nodeMarks[n.id] ?? "none";
          const label = n.label ?? String(n.id);
          const wide = label.length > 2;
          return (
            <g key={n.id} className={`node m-${mark}`} transform={`translate(${n.x} ${n.y})`}>
              {wide ? <rect x={-38} y={-17} width={76} height={34} rx={17} /> : <circle r={R} />}
              <text textAnchor="middle" y={5} className="node-label">{label}</text>
              {wide && <text textAnchor="middle" y={-22} className="node-id">{n.id}</text>}
              {s.tags?.[n.id] && (
                <g className="node-tag" transform={`translate(0 ${wide ? 33 : 37})`}>
                  <rect x={-Math.max(16, s.tags[n.id].length * 4.2)} y={-10} width={Math.max(32, s.tags[n.id].length * 8.4)} height={19} rx={9} />
                  <text textAnchor="middle" y={4}>{s.tags[n.id]}</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <Panels panels={s.panels} />
    </div>
  );
}
