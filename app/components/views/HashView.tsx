import type { HashState } from "../../lib/views";

export function HashView({ s }: { s: HashState }) {
  return (
    <div className="hash-wrap">
      <div className="hash-formula">{s.formula ? <>h(k) = {s.formula}</> : <>h(k) = k mod {s.size}</>}</div>
      {s.mode === "chain" ? (
        <div className="hash-chains">
          {s.chains.map((chain, i) => (
            <div key={i} className={`bucket m-${s.bucketMarks[i] ?? "none"}`}>
              <span className="bucket-index">{i}</span>
              <div className="chain">
                {chain.length ? (
                  chain.map((it, j) => (
                    <span key={it.id} className="chain-item-wrap">
                      {j > 0 && <span className="link">→</span>}
                      <span className={`cell small m-${s.itemMarks[it.id] ?? "none"}`}>{it.v}</span>
                    </span>
                  ))
                ) : (
                  <span className="null-cap">∅</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="hash-slots">
          {s.slots.map((slot, i) => (
            <div key={i} className={`slot m-${s.bucketMarks[i] ?? "none"}`}>
              <span className={`cell ${slot && slot !== "del" ? `m-${s.itemMarks[slot.id] ?? "none"}` : "empty-cell"}`}>{slot === "del" ? "DEL" : slot ? slot.v : ""}</span>
              <span className="bucket-index">{i}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
