import type { ViewKind } from "../lib/types";

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/** Small animated illustration for each kind of visualisation, varied per module. */
export function ModuleThumb({ view, seed }: { view: ViewKind; seed: string }) {
  const h = hash(seed);
  const pick = (n: number, salt: number) => (h >>> salt) % n;
  const heights = Array.from({ length: 7 }, (_, i) => [24, 30, 38, 46, 56, 62, 70][(i * 3 + pick(7, 3)) % 7]);
  const hiA = pick(6, 1), hiB = hiA + 1;
  const curves = ["M10 20 Q 50 95 80 70 T 150 25", "M10 75 L 150 18", "M10 30 Q 80 120 150 30"];
  return (
    <svg viewBox="0 0 160 90" className={`thumb thumb-${view}`} aria-hidden="true">
      {view === "array" && heights.map((bh, i) => (
        <rect key={i} x={14 + i * 19} y={80 - bh} width={13} height={bh} rx={3} className={i === hiA || i === hiB ? "t-hi" : "t-base"} style={{ animationDelay: `${i * 0.12}s` }} />
      ))}
      {view === "graph" && (
        <>
          {[[30, 25, 80, 18], [30, 25, 50, 68], [80, 18, 130, 40], [50, 68, 110, 72], [80, 18, 110, 72], [130, 40, 110, 72]].map(([a, c, d, e], i) => (
            <line key={i} x1={a} y1={c} x2={d} y2={e} className={(i + pick(6, 2)) % 6 < 3 ? "t-edge-hi" : "t-edge"} />
          ))}
          {[[30, 25], [80, 18], [50, 68], [130, 40], [110, 72]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={8} className={(i + pick(5, 4)) % 5 < 3 ? "t-hi" : "t-base"} style={{ animationDelay: `${i * 0.25}s` }} />
          ))}
        </>
      )}
      {view === "tree" && (
        <>
          {[[80, 14, 45, 44], [80, 14, 115, 44], [45, 44, 25, 74], [45, 44, 65, 74], [115, 44, 100, 74], [115, 44, 135, 74]].map(([a, c, d, e], i) => (
            <line key={i} x1={a} y1={c} x2={d} y2={e} className="t-edge" />
          ))}
          {[[80, 14], [45, 44], [115, 44], [25, 74], [65, 74], [100, 74], [135, 74]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={8} className={[[0, 1, 4], [0, 2, 6], [1, 3, 4], [0, 1, 2]][pick(4, 2)].includes(i) ? "t-hi" : "t-base"} style={{ animationDelay: `${i * 0.18}s` }} />
          ))}
        </>
      )}
      {view === "grid" && Array.from({ length: 4 }).flatMap((_, r) => Array.from({ length: 6 }).map((__, c) => (
        <rect key={`${r}${c}`} x={14 + c * 22} y={8 + r * 19} width={19} height={16} rx={3} className={[r === c || r === c - 1, r === 0 || c === 0 || (r + c) % 5 === pick(5, 3), c === 5 - r || r === 3, (r * 6 + c) % 4 === 0][pick(4, 1)] ? "t-hi" : "t-base"} style={{ animationDelay: `${(r * 6 + c) * 0.06}s` }} />
      )))}
      {view === "list" && [0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={10 + i * 38} y={32} width={26} height={26} rx={5} className={i === [3, 0, 2, 1][pick(4, 2)] ? "t-hi" : "t-base"} style={{ animationDelay: `${i * 0.2}s` }} />
          {i < 3 && <path d={`M${38 + i * 38} 45 l8 0`} className="t-edge" />}
        </g>
      ))}
      {view === "hash" && [0, 1, 2, 3].map((r) => (
        <g key={r}>
          <rect x={14} y={8 + r * 20} width={18} height={15} rx={3} className="t-base" />
          {Array.from({ length: [2, 0, 3, 1][r] }).map((_, c) => (
            <rect key={c} x={42 + c * 30} y={8 + r * 20} width={24} height={15} rx={3} className={r === 2 && c === 2 ? "t-hi" : "t-soft"} style={{ animationDelay: `${(r + c) * 0.2}s` }} />
          ))}
        </g>
      ))}
      {view === "plot" && (
        <>
          <path d={curves[pick(3, 1)]} className="t-curve" />
          <circle cx={80} cy={[70, 47, 75][pick(3, 1)]} r={6} className="t-hi t-ball" />
        </>
      )}
    </svg>
  );
}
