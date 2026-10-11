"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { findModule } from "../lib/registry";
import type { Step } from "../lib/types";
import type { ArrayState, Item } from "../lib/views";
import { useApp } from "./Providers";
import { ArrayView } from "./views/ArrayView";

/** Autoplaying quick sort shown on the home page. */
export function HeroDemo() {
  const { t } = useApp();
  const [steps, setSteps] = useState<Step<ArrayState>[]>([]);
  const [i, setI] = useState(0);
  const [round, setRound] = useState(0);

  useEffect(() => {
    const mod = findModule("quick-sort")!;
    const created = mod.actions[0].run([] as Item[], { shape: "random", n: "14", list: "" });
    if ("error" in created) return;
    const sorted = mod.actions[1].run(created.model, {});
    if ("error" in sorted) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSteps(sorted.steps as Step<ArrayState>[]);
    setI(0);
  }, [round]);

  useEffect(() => {
    if (!steps.length) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const atEnd = i >= steps.length - 1;
    const id = window.setTimeout(() => (atEnd ? setRound((r) => r + 1) : setI(i + 1)), atEnd ? 2200 : 380);
    return () => window.clearTimeout(id);
  }, [i, steps]);

  const step = steps[i];
  return (
    <Link href="/visualize/quick-sort" className="hero-demo" aria-label="Open the quick sort visualisation" style={{ "--dur": "240ms" } as React.CSSProperties}>
      <div className="code-bar"><span /><span /><span /><small>quick_sort.live</small></div>
      <div className="hero-demo-canvas">{step && <ArrayView s={step.state} />}</div>
      <p className="hero-demo-note">{step ? t(step.note) : "…"}</p>
    </Link>
  );
}
