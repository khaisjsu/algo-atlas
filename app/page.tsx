"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { HeroDemo } from "./components/HeroDemo";
import { ModuleThumb } from "./components/ModuleThumb";
import { useApp } from "./components/Providers";
import { categories, modules } from "./lib/registry";
import type { Bilingual, Category } from "./lib/types";
import { b } from "./lib/types";

const copy = {
  eyebrow: b("A bilingual field guide to computer science", "Cẩm nang song ngữ về khoa học máy tính"),
  titleA: b("Learn the ideas.", "Hiểu ý tưởng."),
  titleB: b("Watch them work.", "Xem chúng vận hành."),
  hero: b(
    "Step through sorting, searching, trees, graphs, dynamic programming and machine learning one decision at a time — with pseudocode, live variables, real-world uses and practice problems. In English and Vietnamese.",
    "Đi từng bước qua sắp xếp, tìm kiếm, cây, đồ thị, quy hoạch động và học máy — với mã giả, biến trực tiếp, ứng dụng thực tế và bài luyện tập. Bằng tiếng Anh và tiếng Việt.",
  ),
  start: b("Start visualizing", "Bắt đầu trực quan hoá"),
  github: b("View on GitHub", "Xem trên GitHub"),
  stats: [b("interactive visualisations", "mô phỏng tương tác"), b("learning tracks", "mảng kiến thức"), b("languages: EN · VI", "ngôn ngữ: EN · VI")],
  catalogKicker: b("Visualisation library", "Thư viện mô phỏng"),
  catalogTitle: b("Pick an algorithm. Press play. Then break it.", "Chọn thuật toán. Nhấn phát. Rồi thử phá nó."),
  catalogIntro: b("Every module lets you feed your own input, scrub through each step, and see exactly which line of pseudocode is running.", "Mỗi module cho phép nhập dữ liệu của bạn, tua từng bước và thấy chính xác dòng mã giả nào đang chạy."),
  filter: b("Filter by name, tag or complexity…", "Lọc theo tên, nhãn hoặc độ phức tạp…"),
  all: b("All", "Tất cả"),
  none: b("Nothing matches that filter yet.", "Chưa có gì khớp bộ lọc này."),
  loopKicker: b("How every lesson works", "Cách mỗi bài học vận hành"),
  loopTitle: b("Watch → Trace → Apply → Test", "Xem → Lần vết → Áp dụng → Kiểm tra"),
  loop: [
    { t: b("Watch", "Xem"), d: b("Run the animation on default data to build a picture of the idea.", "Chạy mô phỏng với dữ liệu mặc định để hình dung ý tưởng.") },
    { t: b("Trace", "Lần vết"), d: b("Pause. Step forward and back. Predict the next highlighted line before you see it.", "Tạm dừng. Tiến lùi từng bước. Đoán dòng sáng tiếp theo trước khi thấy.") },
    { t: b("Apply", "Áp dụng"), d: b("Read where it is used in real systems and how to recognise it in a problem statement.", "Đọc nơi nó được dùng trong hệ thống thật và cách nhận ra nó trong đề bài.") },
    { t: b("Test", "Kiểm tra"), d: b("Answer the quiz, try edge-case inputs, then solve the practice problems in order.", "Trả lời câu hỏi, thử đầu vào biên, rồi giải bài luyện tập theo thứ tự.") },
  ],
  roadmapKicker: b("A practical pace", "Nhịp học thực tế"),
  roadmapTitle: b("Twenty-four weeks. One durable foundation.", "Hai mươi bốn tuần. Một nền tảng bền vững."),
  roadmapBody: b(
    "Study 7–10 hours each week: learn the idea, implement it without a library, solve three problems, then explain it aloud in both languages.",
    "Học 7–10 giờ mỗi tuần: hiểu ý tưởng, tự cài đặt không dùng thư viện, giải ba bài tập, rồi tự giải thích bằng cả hai ngôn ngữ.",
  ),
  repoKicker: b("Learn in public", "Học công khai"),
  repoTitle: b("The website is the map. GitHub is the workshop.", "Website là bản đồ. GitHub là xưởng thực hành."),
  repoBody: b(
    "Every topic has Python source, tests and bilingual notes. Clone it, break it, fix it, and record what surprised you.",
    "Mỗi chủ đề có mã nguồn Python, kiểm thử và ghi chú song ngữ. Hãy clone, làm hỏng, sửa lại và ghi điều khiến bạn bất ngờ.",
  ),
  repoButton: b("Open the repository", "Mở kho mã nguồn"),
};

const roadmap: Array<{ weeks: string; title: Bilingual; slugs: string[] }> = [
  { weeks: "01—04", title: b("Python, Big O, searching patterns", "Python, Big O, các mẫu tìm kiếm"), slugs: ["linear-search", "binary-search", "two-pointers", "sliding-window"] },
  { weeks: "05—08", title: b("Data structures and sorting", "Cấu trúc dữ liệu và sắp xếp"), slugs: ["stack", "queue", "linked-list", "hash-table", "bubble-sort", "selection-sort", "insertion-sort", "merge-sort", "quick-sort", "counting-sort"] },
  { weeks: "09—12", title: b("Trees and graphs", "Cây và đồ thị"), slugs: ["binary-search-tree", "binary-heap", "union-find", "graph-traversal", "shortest-paths", "minimum-spanning-tree", "topological-sort"] },
  { weeks: "13—16", title: b("Dynamic programming and optimisation", "Quy hoạch động và tối ưu"), slugs: ["coin-change", "knapsack", "longest-common-subsequence", "edit-distance", "gradient-descent"] },
  { weeks: "17—20", title: b("Classical machine learning", "Học máy cổ điển"), slugs: ["linear-regression", "k-means"] },
  { weeks: "21—24", title: b("Deep learning and one capstone project", "Học sâu và một đồ án tổng kết"), slugs: [] },
];

const normalise = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");

export default function Home() {
  const { t } = useApp();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");

  const filtered = useMemo(() => {
    const words = normalise(query.trim()).split(/\s+/).filter(Boolean);
    return modules.filter((m) => {
      if (cat !== "all" && m.category !== cat) return false;
      if (!words.length) return true;
      const hay = normalise([m.title.en, m.title.vi, m.short.en, m.short.vi, m.tags.join(" ")].join(" "));
      return words.every((w) => hay.includes(w));
    });
  }, [query, cat]);

  return (
    <>
      <section className="hero" id="top">
        <div className="hero-orbit orbit-one" aria-hidden="true" />
        <div className="hero-orbit orbit-two" aria-hidden="true" />
        <div className="hero-copy">
          <p className="kicker">{t(copy.eyebrow)}</p>
          <h1>{t(copy.titleA)}<br /><em>{t(copy.titleB)}</em></h1>
          <p className="hero-intro">{t(copy.hero)}</p>
          <div className="hero-actions">
            <a className="button primary" href="#catalog">{t(copy.start)} <span>↓</span></a>
            <a className="button text-button" href="https://github.com/khaisjsu/algo-atlas" target="_blank" rel="noreferrer">{t(copy.github)} <span>↗</span></a>
          </div>
        </div>
        <HeroDemo />
        <div className="hero-stats">
          <span><b>{modules.length}</b>{t(copy.stats[0])}</span>
          <span><b>{String(categories.length).padStart(2, "0")}</b>{t(copy.stats[1])}</span>
          <span><b>02</b>{t(copy.stats[2])}</span>
        </div>
      </section>

      <section className="catalog section" id="catalog">
        <div className="section-heading">
          <div><p className="kicker">{t(copy.catalogKicker)}</p><h2>{t(copy.catalogTitle)}</h2></div>
          <p>{t(copy.catalogIntro)}</p>
        </div>

        <div className="catalog-tools">
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t(copy.filter)} aria-label={t(copy.filter)} />
          <div className="chip-row" role="group" aria-label="Categories">
            <button className={cat === "all" ? "active" : ""} aria-pressed={cat === "all"} onClick={() => setCat("all")}>{t(copy.all)} <small>{modules.length}</small></button>
            {categories.map((c) => (
              <button key={c.id} className={`tone-${c.tone} ${cat === c.id ? "active" : ""}`} aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>
                {t(c.title)} <small>{modules.filter((m) => m.category === c.id).length}</small>
              </button>
            ))}
          </div>
        </div>

        {categories.map((c) => {
          const items = filtered.filter((m) => m.category === c.id);
          if (!items.length) return null;
          return (
            <div className="catalog-group" key={c.id} id={`cat-${c.id}`}>
              <div className="group-head">
                <h3><span className={`dot tone-${c.tone}`} />{t(c.title)}</h3>
                <p>{t(c.blurb)}</p>
              </div>
              <div className="card-grid">
                {items.map((m) => (
                  <Link key={m.slug} href={`/visualize/${m.slug}`} className={`module-card tone-${c.tone}`}>
                    <div className="module-thumb"><ModuleThumb view={m.view} seed={m.slug} /></div>
                    <div className="module-body">
                      <h4>{t(m.title)}</h4>
                      <p>{t(m.short)}</p>
                      <div className="tag-row">{m.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
        {!filtered.length && <p className="catalog-empty">{t(copy.none)}</p>}
      </section>

      <section className="loop section">
        <div className="section-heading inverse">
          <div><p className="kicker">{t(copy.loopKicker)}</p><h2>{t(copy.loopTitle)}</h2></div>
        </div>
        <ol className="loop-grid">
          {copy.loop.map((s, i) => (
            <li key={s.t.en}>
              <span>0{i + 1}</span>
              <h3>{t(s.t)}</h3>
              <p>{t(s.d)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="roadmap section" id="roadmap">
        <div className="roadmap-intro">
          <p className="kicker">{t(copy.roadmapKicker)}</p>
          <h2>{t(copy.roadmapTitle)}</h2>
          <p>{t(copy.roadmapBody)}</p>
        </div>
        <div className="roadmap-list">
          {roadmap.map((phase, i) => (
            <article key={phase.weeks}>
              <span>{phase.weeks}</span>
              <b>0{i + 1}</b>
              <div>
                <h3>{t(phase.title)}</h3>
                {phase.slugs.length > 0 && (
                  <div className="roadmap-links">
                    {phase.slugs.map((s) => {
                      const m = modules.find((x) => x.slug === s)!;
                      return <Link key={s} href={`/visualize/${s}`}>{t(m.title)}</Link>;
                    })}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="repo-cta">
        <div>
          <p className="kicker">{t(copy.repoKicker)}</p>
          <h2>{t(copy.repoTitle)}</h2>
        </div>
        <div>
          <p>{t(copy.repoBody)}</p>
          <a className="button light" href="https://github.com/khaisjsu/algo-atlas" target="_blank" rel="noreferrer">{t(copy.repoButton)} <span>↗</span></a>
        </div>
      </section>
    </>
  );
}
