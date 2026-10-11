"use client";

import type { ListState } from "../../lib/views";
import { b } from "../../lib/types";
import { useApp } from "../Providers";
import { Panels } from "./Panels";

const words = {
  top: b("top", "đỉnh"),
  bottom: b("bottom", "đáy"),
  front: b("front", "đầu"),
  back: b("back", "cuối"),
  empty: b("empty", "rỗng"),
};

export function ListView({ s }: { s: ListState }) {
  const { t } = useApp();
  const show = (v: number) => (s.chars ? String.fromCharCode(v) : String(v));
  const ptrs = (i: number) => s.pointers?.filter((p) => p.i === i) ?? [];

  if (s.kind === "stack") {
    return (
      <div className="list-wrap">
        <div className="stack-col">
          {s.ghost?.side === "in" && <div className="cell ghost ghost-in">{show(s.ghost.v)}</div>}
          {s.ghost?.side === "out" && <div className="cell ghost ghost-out">{show(s.ghost.v)}</div>}
          {s.items.slice().reverse().map((it, r) => {
            const i = s.items.length - 1 - r;
            return (
              <div key={it.id} className={`cell m-${s.marks[i] ?? "none"}`}>
                {show(it.v)}
                {i === s.items.length - 1 && <span className="cell-tag">← {t(words.top)}</span>}
              </div>
            );
          })}
          {!s.items.length && <div className="cell empty-cell">{t(words.empty)}</div>}
          <div className="stack-base">{t(words.bottom)}</div>
        </div>
        <Panels panels={s.panels} />
      </div>
    );
  }

  const isList = s.kind === "list";
  const flipped = s.flipped ?? 0;
  return (
    <div className="list-wrap">
      <div className={`row-list ${isList ? "linked" : "queue"}`}>
        {s.kind === "queue" && <span className="end-label">{t(words.front)} →</span>}
        {s.ghost?.side === "out" && s.ghost.at === 0 && <div className="cell ghost ghost-out">{show(s.ghost.v)}</div>}
        {isList && flipped > 0 && <span className="null-cap">null ←</span>}
        {s.items.map((it, i) => {
          const link = i < s.items.length - 1 ? (i + 1 < flipped ? "←" : i + 1 === flipped ? "" : "→") : "";
          return (
            <div className="list-item" key={it.id}>
              <div className={`cell m-${s.marks[i] ?? "none"}`}>
                {show(it.v)}
                <span className="cell-index">{i}</span>
              </div>
              {ptrs(i).length > 0 && (
                <div className="cell-pointers">
                  {ptrs(i).map((p) => <span key={p.label} className={`ptr m-${p.tone ?? "active"}`}>▲ {p.label}</span>)}
                </div>
              )}
              {isList && i < s.items.length - 1 && <span className={`link ${link === "" ? "cut" : ""}`}>{link || "⋯"}</span>}
            </div>
          );
        })}
        {s.ghost?.side === "in" && <div className="cell ghost ghost-in">{show(s.ghost.v)}</div>}
        {s.ghost?.side === "out" && s.ghost.at > 0 && <div className="cell ghost ghost-out">{show(s.ghost.v)}</div>}
        {!s.items.length && !s.ghost && <div className="cell empty-cell">{t(words.empty)}</div>}
        {isList && s.items.length > 0 && <span className="null-cap">{flipped >= s.items.length ? "" : "→ null"}</span>}
        {s.kind === "queue" && <span className="end-label">← {t(words.back)}</span>}
      </div>
      <Panels panels={s.panels} />
    </div>
  );
}
