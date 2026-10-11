import { lossFunctions } from "../../lib/functions";
import type { PlotState } from "../../lib/views";

const W = 800, H = 420;
const L = 54, R = 24, T = 24, B = 44;
const PW = W - L - R, PH = H - T - B;

function Axes({ x0, x1, y0, y1, xLabel, yLabel }: { x0: number; x1: number; y0: number; y1: number; xLabel: string; yLabel: string }) {
  const ticks = (a: number, c: number) => {
    const step = niceStep((c - a) / 5);
    const out: number[] = [];
    for (let v = Math.ceil(a / step) * step; v <= c + 1e-9; v += step) out.push(Number(v.toFixed(6)));
    return out;
  };
  const sx = (x: number) => L + ((x - x0) / (x1 - x0)) * PW;
  const sy = (y: number) => T + PH - ((y - y0) / (y1 - y0)) * PH;
  return (
    <g className="axes">
      {ticks(x0, x1).map((v) => (
        <g key={`x${v}`}>
          <line x1={sx(v)} x2={sx(v)} y1={T} y2={T + PH} className="grid-line" />
          <text x={sx(v)} y={T + PH + 18} textAnchor="middle">{v}</text>
        </g>
      ))}
      {ticks(y0, y1).map((v) => (
        <g key={`y${v}`}>
          <line x1={L} x2={L + PW} y1={sy(v)} y2={sy(v)} className="grid-line" />
          <text x={L - 8} y={sy(v) + 4} textAnchor="end">{v}</text>
        </g>
      ))}
      <rect x={L} y={T} width={PW} height={PH} className="plot-frame" />
      <text x={L + PW / 2} y={H - 6} textAnchor="middle" className="axis-label">{xLabel}</text>
      <text x={14} y={T + PH / 2} textAnchor="middle" className="axis-label" transform={`rotate(-90 14 ${T + PH / 2})`}>{yLabel}</text>
    </g>
  );
}

function niceStep(raw: number) {
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / p;
  return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
}

/** Loss over time, drawn as a separate strip so it never covers the data. */
function LossStrip({ loss, label }: { loss: number[]; label: string }) {
  const finite = loss.filter(Number.isFinite);
  const w = 800, h = 64;
  if (finite.length < 2) return <div className="loss-strip empty"><span>{label}</span></div>;
  const max = Math.max(...finite), min = Math.min(...finite);
  const x = (i: number) => 120 + (i / (finite.length - 1)) * (w - 140);
  const y = (v: number) => 8 + (1 - (v - min) / (max - min || 1)) * (h - 16);
  const pts = finite.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  return (
    <div className="loss-strip">
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>
        <text x={0} y={26} className="loss-label">{label}</text>
        <text x={0} y={46} className="loss-value">{finite[finite.length - 1].toPrecision(4)}</text>
        <polyline points={`${x(0)},${h - 8} ${pts} ${x(finite.length - 1)},${h - 8}`} className="loss-area" />
        <polyline points={pts} className="loss-line" />
        <circle cx={x(finite.length - 1)} cy={y(finite[finite.length - 1])} r={4} className="loss-dot" />
      </svg>
    </div>
  );
}

export function PlotView({ s }: { s: PlotState }) {
  if (s.kind === "curve") {
    const F = lossFunctions[s.fn];
    const [x0, x1] = F.domain;
    const samples = Array.from({ length: 241 }, (_, i) => x0 + ((x1 - x0) * i) / 240);
    const ys = samples.map(F.f);
    const y0 = Math.min(...ys) - 0.5, y1 = Math.max(...ys) + 0.5;
    const sx = (x: number) => L + ((x - x0) / (x1 - x0)) * PW;
    const sy = (y: number) => T + PH - ((Math.max(y0, Math.min(y1, y)) - y0) / (y1 - y0)) * PH;
    const curve = samples.map((x, i) => `${i ? "L" : "M"}${sx(x)} ${sy(ys[i])}`).join(" ");
    const visible = s.path.filter((p) => p.x >= x0 && p.x <= x1);
    const cur = s.path[s.path.length - 1];
    const main = (
      <svg viewBox={`0 0 ${W} ${H}`} className="viz-svg" role="img" aria-label="Loss curve">
        <Axes x0={x0} x1={x1} y0={y0} y1={y1} xLabel="x (parameter)" yLabel={F.label} />
        <path d={curve} className="curve" />
        {visible.slice(1).map((p, i) => (
          <line key={i} x1={sx(visible[i].x)} y1={sy(visible[i].y)} x2={sx(p.x)} y2={sy(p.y)} className="gd-step" />
        ))}
        {visible.map((p, i) => (
          <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={i === visible.length - 1 ? 8 : 4} className={i === visible.length - 1 ? "gd-ball" : "gd-trail"} style={{ opacity: i === visible.length - 1 ? 1 : 0.25 + (0.6 * i) / visible.length }} />
        ))}
        {s.tangent && cur && cur.x >= x0 && cur.x <= x1 && (
          <line className="tangent" x1={sx(cur.x - 2)} y1={sy(cur.y - 2 * s.tangent.slope)} x2={sx(cur.x + 2)} y2={sy(cur.y + 2 * s.tangent.slope)} />
        )}
      </svg>
    );
    return (
      <div className="plot-wrap">
        {main}
        <LossStrip loss={s.loss} label="loss f(x)" />
      </div>
    );
  }

  const sx = (x: number) => L + (x / 10) * PW;
  const sy = (y: number) => T + PH - (y / 10) * PH;
  const main = (
    <svg viewBox={`0 0 ${W} ${H}`} className="viz-svg" role="img" aria-label="Scatter plot">
      <defs>
        <clipPath id="plot-clip"><rect x={L} y={T} width={PW} height={PH} /></clipPath>
      </defs>
      <Axes x0={0} x1={10} y0={0} y1={10} xLabel="x" yLabel="y" />
      {s.line && s.residuals && s.points.map((p, i) => (
        <line key={`r${i}`} x1={sx(p.x)} x2={sx(p.x)} y1={sy(p.y)} y2={sy(Math.max(0, Math.min(10, s.line!.m * p.x + s.line!.b)))} className="residual" />
      ))}
      {s.trails?.map((tr, i) => (
        <polyline key={`t${i}`} points={tr.map((p) => `${sx(p.x)},${sy(p.y)}`).join(" ")} className={`trail c${i}`} />
      ))}
      {s.points.map((p, i) => (
        <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={6} className={`pt ${p.c != null ? `c${p.c}` : ""}`} />
      ))}
      {s.line && (
        <g clipPath="url(#plot-clip)">
          <line className="fit-line" x1={sx(0)} y1={sy(s.line.b)} x2={sx(10)} y2={sy(s.line.m * 10 + s.line.b)} />
        </g>
      )}
      {s.centroids?.map((c, i) => (
        <g key={`c${i}`} className={`centroid c${i}`} style={{ transform: `translate(${sx(c.x)}px, ${sy(c.y)}px)` }}>
          <path d="M-11 0 L0 -11 L11 0 L0 11 Z" />
          <text y={4} textAnchor="middle">{i + 1}</text>
        </g>
      ))}
    </svg>
  );
  return (
    <div className="plot-wrap">
      {main}
      <LossStrip loss={s.loss} label={s.centroids ? "inertia" : "MSE"} />
    </div>
  );
}
