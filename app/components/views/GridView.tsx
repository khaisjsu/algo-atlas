import type { GridState } from "../../lib/views";
import { Panels } from "./Panels";

const arrowGlyph = (from: string, to: string) => {
  const [r1, c1] = from.split(",").map(Number);
  const [r2, c2] = to.split(",").map(Number);
  if (r2 < r1 && c2 < c1) return "↖";
  if (r2 < r1) return "↑";
  if (c2 < c1) return "←";
  return "";
};

export function GridView({ s }: { s: GridState }) {
  const glyphs = new Map<string, string>();
  s.arrows?.forEach(([from, to]) => glyphs.set(from, (glyphs.get(from) ?? "") + arrowGlyph(from, to)));
  return (
    <div className="grid-wrap">
      <div className="dp-scroll">
        <table className="dp-table">
          <thead>
            <tr>
              <th className="corner">{s.corner}</th>
              {s.colHead.map((h, j) => <th key={j}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {s.cells.map((row, i) => (
              <tr key={i}>
                <th>{s.rowHead[i]}</th>
                {row.map((v, j) => {
                  const key = `${i},${j}`;
                  return (
                    <td key={j} className={`m-${s.marks[key] ?? "none"}`}>
                      {v}
                      {glyphs.has(key) && <span className="dp-arrow">{glyphs.get(key)}</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Panels panels={s.panels} />
    </div>
  );
}
