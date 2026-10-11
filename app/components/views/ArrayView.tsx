import type { ArrayState } from "../../lib/views";

const W = 800;
const PAD = 20;
const BAR_TOP = 30;
const BAR_H = 230;

export function ArrayView({ s }: { s: ArrayState }) {
  const n = Math.max(1, s.items.length);
  const slot = (W - PAD * 2) / n;
  const barW = Math.min(64, slot * 0.78);
  const max = Math.max(1, ...s.items.map((x) => x.v), s.guide?.v ?? 0);
  const scale = (v: number) => Math.max(4, (v / max) * BAR_H);
  const base = BAR_TOP + BAR_H;
  const auxH = s.aux ? 86 : 0;
  const ptrRows = new Map<number, number>();
  const H = base + 64 + auxH;
  const fontSize = Math.max(10, Math.min(15, slot * 0.38));
  const inRange = (i: number) => !s.range || (i >= s.range[0] && i <= s.range[1]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="viz-svg" role="img" aria-label="Array visualisation">
      {s.range && (
        <rect
          className="range-band"
          x={PAD + s.range[0] * slot}
          y={BAR_TOP - 14}
          width={(s.range[1] - s.range[0] + 1) * slot}
          height={BAR_H + 34}
          rx={10}
        />
      )}
      {s.items.map((it, i) => {
        const h = scale(it.v);
        const mark = s.marks[i] ?? (inRange(i) ? "" : "dim");
        return (
          <g key={it.id} className={`bar m-${mark || "none"}`} style={{ transform: `translateX(${PAD + i * slot + (slot - barW) / 2}px)` }}>
            <rect y={base - h} width={barW} height={h} rx={Math.min(6, barW / 4)} />
            <text x={barW / 2} y={base - h - 7} textAnchor="middle" className="bar-value" style={{ fontSize }}>{it.v}</text>
          </g>
        );
      })}
      {s.items.map((_, i) => (
        <text key={i} x={PAD + i * slot + slot / 2} y={base + 18} textAnchor="middle" className="index-label">{i}</text>
      ))}
      {s.guide && (
        <g className="guide">
          <line x1={PAD - 6} x2={W - PAD + 6} y1={base - scale(s.guide.v)} y2={base - scale(s.guide.v)} />
          <text x={PAD} y={12} className="guide-label">— — {s.guide.label} = {s.guide.v}</text>
        </g>
      )}
      {s.pointers?.map((p) => {
        const row = ptrRows.get(p.i) ?? 0;
        ptrRows.set(p.i, row + 1);
        const x = PAD + p.i * slot + slot / 2;
        const y = base + 30 + row * 16;
        return (
          <g key={`${p.label}-${p.i}`} className={`pointer m-${p.tone ?? "active"}`} style={{ transform: `translate(${x}px, ${y}px)` }}>
            <path d="M0 -6 L5 2 L-5 2 Z" />
            <text y={14} textAnchor="middle">{p.label}</text>
          </g>
        );
      })}
      {s.aux && <AuxRow aux={s.aux} y={base + 72} />}
    </svg>
  );
}

function AuxRow({ aux, y }: { aux: NonNullable<ArrayState["aux"]>; y: number }) {
  const n = Math.max(1, aux.cells.length);
  const cell = Math.min(56, (W - PAD * 2 - 70) / n);
  const x0 = PAD + 70;
  return (
    <g className="aux-row">
      <text x={PAD} y={y + cell / 2 + 4} className="aux-label">{aux.label}</text>
      {aux.cells.map((v, i) => (
        <g key={i} className={`aux-cell m-${aux.marks?.[i] ?? "none"}`}>
          <rect x={x0 + i * cell} y={y} width={cell - 4} height={cell - 14} rx={5} />
          <text x={x0 + i * cell + (cell - 4) / 2} y={y + (cell - 14) / 2 + 5} textAnchor="middle">{v ?? ""}</text>
          {aux.index && <text x={x0 + i * cell + (cell - 4) / 2} y={y + cell - 1} textAnchor="middle" className="index-label small">{i}</text>}
        </g>
      ))}
    </g>
  );
}
