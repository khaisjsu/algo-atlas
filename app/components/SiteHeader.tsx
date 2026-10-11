"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { categories, modules } from "../lib/registry";
import { b } from "../lib/types";
import { useApp } from "./Providers";

const ui = {
  visualize: b("Visualize", "Trực quan"),
  roadmap: b("Roadmap", "Lộ trình"),
  search: b("Search algorithms…", "Tìm thuật toán…"),
  noResults: b("No matches. Try “graph”, “sort” or “O(log n)”.", "Không có kết quả. Thử “graph”, “sort” hoặc “O(log n)”."),
  theme: b("Toggle dark mode", "Bật/tắt chế độ tối"),
};

const normalise = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");

export function SiteHeader() {
  const { lang, setLang, t, theme, toggleTheme } = useApp();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "/" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Algo Atlas home">
        <span className="brand-mark">A²</span>
        <span>Algo Atlas</span>
      </Link>
      <nav aria-label="Primary navigation">
        <Link href="/#catalog">{t(ui.visualize)}</Link>
        <Link href="/#roadmap">{t(ui.roadmap)}</Link>
        <a href="https://github.com/khaisjsu/algo-atlas" target="_blank" rel="noreferrer">GitHub ↗</a>
      </nav>
      <div className="header-tools">
        <button className="search-trigger" onClick={() => setOpen(true)} aria-label={t(ui.search)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.6-3.6" />
          </svg>
          <span className="search-label">{t(ui.search)}</span>
          <kbd>⌘K</kbd>
        </button>
        <div className="language-switch" role="group" aria-label="Language selector">
          <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")} aria-pressed={lang === "en"}>EN</button>
          <button className={lang === "vi" ? "active" : ""} onClick={() => setLang("vi")} aria-pressed={lang === "vi"}>VI</button>
        </div>
        <button className="icon-button" onClick={toggleTheme} aria-label={t(ui.theme)} title={t(ui.theme)}>
          {theme === "dark" ? "☀" : "☾"}
        </button>
      </div>
      {open && <CommandPalette onClose={() => setOpen(false)} />}
    </header>
  );
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const { t } = useApp();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    const needle = normalise(q.trim());
    if (!needle) return modules;
    return modules
      .map((m) => {
        const hay = normalise([m.title.en, m.title.vi, m.short.en, m.short.vi, m.tags.join(" "), m.category].join(" "));
        const title = normalise(m.title.en + " " + m.title.vi);
        const score = title.includes(needle) ? 2 : needle.split(/\s+/).every((w) => hay.includes(w)) ? 1 : 0;
        return { m, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, c) => c.score - a.score)
      .map((r) => r.m);
  }, [q]);

  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (slug: string) => {
    onClose();
    router.push(`/visualize/${slug}`);
  };

  return (
    <div className="palette-backdrop" onClick={onClose}>
      <div className="palette" role="dialog" aria-modal="true" aria-label={t(ui.search)} onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={q}
          placeholder={t(ui.search)}
          onChange={(e) => { setQ(e.target.value); setActive(0); }}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
            if (e.key === "Enter" && results[active]) go(results[active].slug);
          }}
          aria-label={t(ui.search)}
        />
        <ul ref={listRef}>
          {results.map((m, i) => (
            <li key={m.slug}>
              <Link href={`/visualize/${m.slug}`} data-index={i} className={i === active ? "active" : ""} onMouseEnter={() => setActive(i)} onClick={onClose}>
                <span className={`dot tone-${categories.find((c) => c.id === m.category)?.tone}`} />
                <span className="palette-title">{t(m.title)}</span>
                <span className="palette-cat">{t(categories.find((c) => c.id === m.category)!.title)}</span>
              </Link>
            </li>
          ))}
          {!results.length && <li className="palette-empty">{t(ui.noResults)}</li>}
        </ul>
        <footer><kbd>↑</kbd><kbd>↓</kbd> navigate · <kbd>↵</kbd> open · <kbd>esc</kbd> close</footer>
      </div>
    </div>
  );
}
