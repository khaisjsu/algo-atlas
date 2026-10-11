"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { categories, findModule, neighbours } from "../lib/registry";
import type { Action, Bilingual, Field, FieldValues, Mark, Step } from "../lib/types";
import { b } from "../lib/types";
import { CopyButton } from "./CopyButton";
import { LearnContent } from "./LearnContent";
import { useApp } from "./Providers";
import { ArrayView } from "./views/ArrayView";
import { GraphView } from "./views/GraphView";
import { GridView } from "./views/GridView";
import { HashView } from "./views/HashView";
import { ListView } from "./views/ListView";
import { PlotView } from "./views/PlotView";
import { TreeView } from "./views/TreeView";

const ui = {
  operations: b("Operations", "Thao tác"),
  go: b("Go", "Chạy"),
  status: b("What's happening", "Đang diễn ra"),
  pseudocode: b("Pseudocode", "Mã giả"),
  python: b("Python", "Python"),
  variables: b("Variables", "Biến"),
  step: b("Step", "Bước"),
  speed: b("Speed", "Tốc độ"),
  play: b("Play", "Phát"),
  pause: b("Pause", "Tạm dừng"),
  first: b("First step", "Bước đầu"),
  last: b("Last step", "Bước cuối"),
  prev: b("Previous step", "Bước trước"),
  next: b("Next step", "Bước sau"),
  fullscreen: b("Full screen", "Toàn màn hình"),
  shortcuts: b("Space play/pause · ← → step · Home/End jump · F full screen", "Space phát/dừng · ← → từng bước · Home/End nhảy · F toàn màn hình"),
  idle: b("Pick an operation and press Go. Then pause, scrub and step through every decision.", "Chọn một thao tác và nhấn Chạy. Sau đó tạm dừng, tua và đi từng bước qua mọi quyết định."),
  loading: b("Preparing the visualisation…", "Đang chuẩn bị mô phỏng…"),
  prevModule: b("Previous", "Trước"),
  nextModule: b("Next", "Tiếp"),
  allModules: b("All visualisations", "Tất cả mô phỏng"),
};

const markLabels: Record<Mark, Bilingual> = {
  compare: b("Comparing", "Đang so sánh"),
  swap: b("Swapping / moving", "Đổi chỗ / di chuyển"),
  active: b("Current", "Hiện tại"),
  pivot: b("Pivot / key", "Chốt / khoá"),
  done: b("Final", "Đã xong"),
  found: b("Found / chosen", "Tìm thấy / được chọn"),
  visited: b("Visited", "Đã thăm"),
  frontier: b("Frontier", "Biên (chờ xử lý)"),
  path: b("Path / tree", "Đường đi / cây"),
  reject: b("Discarded", "Đã loại"),
  dim: b("Inactive / skipped", "Không xét / bỏ qua"),
};

const SPEEDS = [0.25, 0.5, 1, 1.5, 2, 4];
const BASE_DELAY = 950;

const defaults = (fields?: Field[]): FieldValues => Object.fromEntries((fields ?? []).map((f) => [f.key, String(f.default)]));

const visible = (f: Field, values: FieldValues) => {
  if (!f.when) return true;
  const [key, want] = f.when;
  return want.startsWith("!") ? values[key] !== want.slice(1) : values[key] === want;
};

/** Gather the visual roles present in a frame: values of any `*marks` map plus pointer tones. */
function collectMarks(state: unknown): Mark[] {
  const found = new Set<string>();
  const walk = (v: unknown, key = "") => {
    if (!v || typeof v !== "object") return;
    if (/marks$/i.test(key)) Object.values(v).forEach((m) => typeof m === "string" && found.add(m));
    else if (key === "pointers" && Array.isArray(v)) v.forEach((p) => p?.tone && found.add(p.tone));
    else for (const [k, child] of Object.entries(v)) if (typeof child === "object") walk(child, k);
  };
  walk(state);
  return (Object.keys(markLabels) as Mark[]).filter((m) => found.has(m));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyStep = Step<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAction = Action<any, any>;

export function Visualizer({ slug }: { slug: string }) {
  const mod = findModule(slug)!;
  const { t } = useApp();
  const category = categories.find((c) => c.id === mod.category)!;
  const { prev, next } = neighbours(slug);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [model, setModel] = useState<any>(null);
  const [steps, setSteps] = useState<AnyStep[]>([]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [openAction, setOpenAction] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, FieldValues>>(() => Object.fromEntries(mod.actions.map((a) => [a.id, defaults(a.fields)])));
  const [error, setError] = useState<Bilingual | null>(null);
  const [code, setCode] = useState<string[] | undefined>(undefined);
  const [codeTab, setCodeTab] = useState<"pseudo" | "python">("pseudo");
  const stageRef = useRef<HTMLDivElement>(null);

  // Models can be random, so build them on the client only to avoid hydration mismatches.
  useEffect(() => {
    const m = mod.initial();
    /* eslint-disable react-hooks/set-state-in-effect */
    setModel(m);
    setSteps([{ state: mod.idle(m), line: -1, note: ui.idle }]);
    setIdx(0);
    setPlaying(false);
    setError(null);
    const firstWithCode = mod.actions.find((a) => a.code);
    setCode(firstWithCode?.code);
    setOpenAction(firstWithCode?.id ?? mod.actions[0]?.id ?? null);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [mod]);

  const run = (action: AnyAction) => {
    if (model == null) return;
    const result = action.run(model, values[action.id] ?? {});
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setError(null);
    setModel(result.model);
    setSteps(result.steps);
    setIdx(0);
    if (action.code) setCode(action.code);
    setPlaying(result.steps.length > 1);
  };

  const last = Math.max(0, steps.length - 1);
  const delay = BASE_DELAY / speed;

  useEffect(() => {
    if (!playing) return;
    if (idx >= last) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setIdx((i) => Math.min(last, i + 1)), delay);
    return () => window.clearTimeout(id);
  }, [playing, idx, last, delay]);

  const toggleFullscreen = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === " " || e.key === "k") {
        if (tag === "BUTTON" && e.key === " ") return;
        e.preventDefault();
        setPlaying((p) => {
          if (!p && idx >= last) setIdx(0);
          return !p;
        });
      } else if (e.key === "ArrowRight" || e.key === "l") {
        e.preventDefault();
        setPlaying(false);
        setIdx((i) => Math.min(last, i + 1));
      } else if (e.key === "ArrowLeft" || e.key === "j") {
        e.preventDefault();
        setPlaying(false);
        setIdx((i) => Math.max(0, i - 1));
      } else if (e.key === "Home") {
        setPlaying(false);
        setIdx(0);
      } else if (e.key === "End") {
        setPlaying(false);
        setIdx(last);
      } else if (e.key === "f") {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, last, toggleFullscreen]);

  const step = steps[Math.min(idx, last)];
  const lines = step ? (Array.isArray(step.line) ? step.line : [step.line]) : [];
  const usedMarks = useMemo(() => (step ? collectMarks(step.state) : []), [step]);

  const playToggle = () => {
    if (!playing && idx >= last) setIdx(0);
    setPlaying((p) => !p);
  };

  return (
    <div className="viz-page">
      <div className="viz-topbar">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/#catalog">{t(ui.allModules)}</Link>
          <span>/</span>
          <Link href={`/#cat-${category.id}`} className={`tone-text-${category.tone}`}>{t(category.title)}</Link>
        </nav>
        <h1>{t(mod.title)}</h1>
        <div className="topbar-nav">
          {prev && <Link href={`/visualize/${prev.slug}`} className="pill-link">← {t(prev.title)}</Link>}
          {next && <Link href={`/visualize/${next.slug}`} className="pill-link">{t(next.title)} →</Link>}
        </div>
      </div>

      <div className="viz-stage" ref={stageRef} style={{ "--dur": `${Math.min(420, delay * 0.55)}ms` } as React.CSSProperties}>
        <aside className="action-panel" aria-label={t(ui.operations)}>
          <h2 className="panel-heading">{t(ui.operations)}</h2>
          {mod.actions.map((a) => {
            const open = openAction === a.id;
            const vals = values[a.id] ?? {};
            return (
              <div key={a.id} className={`action ${open ? "open" : ""}`}>
                <button className="action-head" onClick={() => (a.fields?.length ? setOpenAction(open ? null : a.id) : run(a))} aria-expanded={a.fields?.length ? open : undefined}>
                  <span>{t(a.label)}</span>
                  <span className="action-caret" aria-hidden="true">{a.fields?.length ? (open ? "−" : "+") : "▶"}</span>
                </button>
                {open && !!a.fields?.length && (
                  <form
                    className="action-body"
                    onSubmit={(e) => {
                      e.preventDefault();
                      run(a);
                    }}
                  >
                    {a.fields.filter((f) => visible(f, vals)).map((f) => (
                      <label key={f.key} className="field">
                        <span>{t(f.label)}</span>
                        {f.kind === "select" ? (
                          <select value={vals[f.key]} onChange={(e) => setValues((v) => ({ ...v, [a.id]: { ...v[a.id], [f.key]: e.target.value } }))}>
                            {f.options.map((o) => <option key={o.value} value={o.value}>{t(o.label)}</option>)}
                          </select>
                        ) : (
                          <input
                            type={f.kind === "number" ? "number" : "text"}
                            inputMode={f.kind === "number" ? "numeric" : undefined}
                            min={f.kind === "number" ? f.min : undefined}
                            max={f.kind === "number" ? f.max : undefined}
                            placeholder={f.kind === "list" ? f.placeholder : undefined}
                            value={vals[f.key] ?? ""}
                            onChange={(e) => setValues((v) => ({ ...v, [a.id]: { ...v[a.id], [f.key]: e.target.value } }))}
                          />
                        )}
                      </label>
                    ))}
                    <button type="submit" className="go-button">{t(ui.go)} →</button>
                  </form>
                )}
              </div>
            );
          })}
          {error && <p className="action-error" role="alert">{t(error)}</p>}
        </aside>

        <section className="canvas" aria-live="off">
          <div className="legend" aria-label="Legend">
            {usedMarks.map((m) => (
              <span key={m} className={`legend-item m-${m}`}><i />{t(markLabels[m])}</span>
            ))}
          </div>
          <div className={`canvas-inner view-${mod.view}`}>
            {step ? <Renderer view={mod.view} state={step.state} /> : <p className="canvas-loading">{t(ui.loading)}</p>}
          </div>
          <button className="icon-button fullscreen-button" type="button" onClick={toggleFullscreen} aria-label={t(ui.fullscreen)} title={t(ui.fullscreen)}>⤢</button>
        </section>

        <aside className="side-panel">
          <div className="status" aria-live="polite">
            <h2 className="panel-heading">{t(ui.status)}</h2>
            <p>{step ? t(step.note) : t(ui.loading)}</p>
          </div>
          {step?.vars && Object.keys(step.vars).length > 0 && (
            <div className="vars">
              <h2 className="panel-heading">{t(ui.variables)}</h2>
              <dl>
                {Object.entries(step.vars).map(([k, v]) => (
                  <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                ))}
              </dl>
            </div>
          )}
          <div className="code-panel">
            <div className="code-tabs" role="tablist">
              <button role="tab" aria-selected={codeTab === "pseudo"} className={codeTab === "pseudo" ? "active" : ""} onClick={() => setCodeTab("pseudo")}>{t(ui.pseudocode)}</button>
              <button role="tab" aria-selected={codeTab === "python"} className={codeTab === "python" ? "active" : ""} onClick={() => setCodeTab("python")}>{t(ui.python)}</button>
              {codeTab === "python" && <CopyButton text={mod.python} />}
            </div>
            {codeTab === "pseudo" ? (
              <ol className="pseudocode">
                {(code ?? []).map((line, i) => (
                  <li key={i} className={lines.includes(i) ? "hl" : ""}>
                    <code>{line}</code>
                  </li>
                ))}
              </ol>
            ) : (
              <pre className="python-code"><code>{mod.python}</code></pre>
            )}
          </div>
        </aside>

        <div className="media-bar">
          <div className="media-buttons">
            <button onClick={() => { setPlaying(false); setIdx(0); }} aria-label={t(ui.first)} title={t(ui.first)} disabled={idx === 0}>⏮</button>
            <button onClick={() => { setPlaying(false); setIdx((i) => Math.max(0, i - 1)); }} aria-label={t(ui.prev)} title={t(ui.prev)} disabled={idx === 0}>◀</button>
            <button className="play" onClick={playToggle} aria-label={playing ? t(ui.pause) : t(ui.play)} title={playing ? t(ui.pause) : t(ui.play)} disabled={last === 0}>{playing ? "❚❚" : "▶"}</button>
            <button onClick={() => { setPlaying(false); setIdx((i) => Math.min(last, i + 1)); }} aria-label={t(ui.next)} title={t(ui.next)} disabled={idx >= last}>▶</button>
            <button onClick={() => { setPlaying(false); setIdx(last); }} aria-label={t(ui.last)} title={t(ui.last)} disabled={idx >= last}>⏭</button>
          </div>
          <input
            className="scrubber"
            type="range"
            min={0}
            max={last}
            value={Math.min(idx, last)}
            onChange={(e) => { setPlaying(false); setIdx(Number(e.target.value)); }}
            aria-label={t(ui.step)}
            style={{ "--progress": `${last ? (idx / last) * 100 : 0}%` } as React.CSSProperties}
          />
          <span className="step-count">{t(ui.step)} {Math.min(idx, last) + 1} / {last + 1}</span>
          <label className="speed">
            <span>{t(ui.speed)}</span>
            <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
              {SPEEDS.map((s) => <option key={s} value={s}>{s}×</option>)}
            </select>
          </label>
          <span className="shortcuts">{t(ui.shortcuts)}</span>
        </div>
      </div>

      <LearnContent mod={mod} />

      <div className="module-pager">
        {prev ? <Link href={`/visualize/${prev.slug}`}><small>← {t(ui.prevModule)}</small>{t(prev.title)}</Link> : <span />}
        {next ? <Link href={`/visualize/${next.slug}`} className="next"><small>{t(ui.nextModule)} →</small>{t(next.title)}</Link> : <span />}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Renderer({ view, state }: { view: string; state: any }) {
  switch (view) {
    case "array": return <ArrayView s={state} />;
    case "graph": return <GraphView s={state} />;
    case "tree": return <TreeView s={state} />;
    case "grid": return <GridView s={state} />;
    case "list": return <ListView s={state} />;
    case "hash": return <HashView s={state} />;
    case "plot": return <PlotView s={state} />;
    default: return null;
  }
}
