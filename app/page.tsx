"use client";

import { useMemo, useState } from "react";

type Language = "en" | "vi";
type Bilingual = { en: string; vi: string };

const tracks: Array<{
  number: string;
  title: Bilingual;
  description: Bilingual;
  topics: Bilingual[];
  tone: string;
}> = [
  {
    number: "01",
    title: { en: "Foundations", vi: "Nền tảng" },
    description: {
      en: "Learn to reason about programs before trying to make them fast.",
      vi: "Học cách suy luận về chương trình trước khi cố gắng làm nó chạy nhanh.",
    },
    topics: [
      { en: "Big O & growth rates", vi: "Big O & tốc độ tăng" },
      { en: "Recursion & invariants", vi: "Đệ quy & bất biến" },
      { en: "Discrete math", vi: "Toán rời rạc" },
      { en: "Probability basics", vi: "Xác suất cơ bản" },
    ],
    tone: "coral",
  },
  {
    number: "02",
    title: { en: "Data structures", vi: "Cấu trúc dữ liệu" },
    description: {
      en: "Choose how data lives so the operations you need become cheap.",
      vi: "Chọn cách lưu dữ liệu để các thao tác cần thiết trở nên hiệu quả.",
    },
    topics: [
      { en: "Arrays & linked lists", vi: "Mảng & danh sách liên kết" },
      { en: "Stacks, queues & heaps", vi: "Ngăn xếp, hàng đợi & heap" },
      { en: "Hash tables", vi: "Bảng băm" },
      { en: "Trees, tries & graphs", vi: "Cây, trie & đồ thị" },
    ],
    tone: "blue",
  },
  {
    number: "03",
    title: { en: "Core algorithms", vi: "Thuật toán cốt lõi" },
    description: {
      en: "Master the reusable patterns behind most interview and production problems.",
      vi: "Làm chủ các mẫu tư duy dùng lại trong phỏng vấn và sản phẩm thực tế.",
    },
    topics: [
      { en: "Search & sorting", vi: "Tìm kiếm & sắp xếp" },
      { en: "Two pointers & windows", vi: "Hai con trỏ & cửa sổ trượt" },
      { en: "Greedy & divide-conquer", vi: "Tham lam & chia để trị" },
      { en: "Dynamic programming", vi: "Quy hoạch động" },
    ],
    tone: "yellow",
  },
  {
    number: "04",
    title: { en: "Graph & systems", vi: "Đồ thị & hệ thống" },
    description: {
      en: "Connect algorithmic thinking to networks, databases, and operating systems.",
      vi: "Kết nối tư duy thuật toán với mạng, cơ sở dữ liệu và hệ điều hành.",
    },
    topics: [
      { en: "BFS, DFS & shortest paths", vi: "BFS, DFS & đường đi ngắn nhất" },
      { en: "MST & topological sort", vi: "Cây khung nhỏ nhất & sắp xếp topo" },
      { en: "Concurrency & scheduling", vi: "Đồng thời & lập lịch" },
      { en: "Indexes, caches & consensus", vi: "Chỉ mục, bộ nhớ đệm & đồng thuận" },
    ],
    tone: "green",
  },
  {
    number: "05",
    title: { en: "Classical ML", vi: "Học máy cổ điển" },
    description: {
      en: "Understand models from their objective functions—not as black boxes.",
      vi: "Hiểu mô hình từ hàm mục tiêu — không xem chúng như hộp đen.",
    },
    topics: [
      { en: "Linear & logistic regression", vi: "Hồi quy tuyến tính & logistic" },
      { en: "Trees, forests & boosting", vi: "Cây, rừng & boosting" },
      { en: "SVM, k-NN & Naive Bayes", vi: "SVM, k-NN & Naive Bayes" },
      { en: "Clustering & PCA", vi: "Phân cụm & PCA" },
    ],
    tone: "violet",
  },
  {
    number: "06",
    title: { en: "Deep learning & beyond", vi: "Học sâu & mở rộng" },
    description: {
      en: "Build the bridge from gradients to transformers, evaluation, and responsible AI.",
      vi: "Xây cầu nối từ gradient đến transformer, đánh giá và AI có trách nhiệm.",
    },
    topics: [
      { en: "Backpropagation & optimizers", vi: "Lan truyền ngược & bộ tối ưu" },
      { en: "CNNs, RNNs & attention", vi: "CNN, RNN & attention" },
      { en: "Transformers & embeddings", vi: "Transformer & embedding" },
      { en: "MLOps, safety & evaluation", vi: "MLOps, an toàn & đánh giá" },
    ],
    tone: "pink",
  },
];

const algorithms = [
  {
    id: "binary",
    name: "Binary search",
    viName: "Tìm kiếm nhị phân",
    family: "Search",
    complexity: "O(log n)",
    en: "Repeatedly discard half of a sorted search space. The sorted-data precondition is the detail people most often forget.",
    vi: "Liên tục loại bỏ một nửa không gian tìm kiếm đã sắp xếp. Điều kiện dữ liệu đã sắp xếp là chi tiết dễ bị quên nhất.",
    code: `def binary_search(a, target):\n    lo, hi = 0, len(a) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if a[mid] == target: return mid\n        if a[mid] < target: lo = mid + 1\n        else: hi = mid - 1\n    return -1`,
  },
  {
    id: "merge",
    name: "Merge sort",
    viName: "Sắp xếp trộn",
    family: "Divide & conquer",
    complexity: "O(n log n)",
    en: "Split, solve each half, then merge two sorted results. It is stable and predictable, but needs extra memory.",
    vi: "Chia đôi, giải từng nửa, rồi trộn hai kết quả đã sắp xếp. Thuật toán ổn định và dễ dự đoán nhưng cần thêm bộ nhớ.",
    code: `def merge_sort(a):\n    if len(a) <= 1: return a\n    m = len(a) // 2\n    left = merge_sort(a[:m])\n    right = merge_sort(a[m:])\n    return merge(left, right)`,
  },
  {
    id: "bfs",
    name: "Breadth-first search",
    viName: "Tìm kiếm theo chiều rộng",
    family: "Graph",
    complexity: "O(V + E)",
    en: "Explore a graph layer by layer with a queue. In an unweighted graph, the first path found to a node is a shortest path.",
    vi: "Duyệt đồ thị theo từng lớp bằng hàng đợi. Trong đồ thị không trọng số, đường đầu tiên tới một đỉnh là đường ngắn nhất.",
    code: `from collections import deque\n\ndef bfs(graph, start):\n    seen, q = {start}, deque([start])\n    while q:\n        node = q.popleft()\n        yield node\n        for nxt in graph[node]:\n            if nxt not in seen:\n                seen.add(nxt); q.append(nxt)`,
  },
  {
    id: "gradient",
    name: "Gradient descent",
    viName: "Hạ gradient",
    family: "Optimization",
    complexity: "Iterative",
    en: "Move parameters opposite the loss gradient. Learning rate controls the step: too small is slow; too large may diverge.",
    vi: "Di chuyển tham số ngược hướng gradient của hàm mất mát. Learning rate quyết định bước đi: quá nhỏ thì chậm, quá lớn có thể phân kỳ.",
    code: `def gradient_descent(theta, grad, lr=0.01, steps=1000):\n    for _ in range(steps):\n        g = grad(theta)\n        theta = [t - lr * dt for t, dt in zip(theta, g)]\n    return theta`,
  },
];

const roadmap = [
  { weeks: "01—04", en: "Python, math, Big O, recursion", vi: "Python, toán, Big O, đệ quy" },
  { weeks: "05—08", en: "Data structures and sorting", vi: "Cấu trúc dữ liệu và sắp xếp" },
  { weeks: "09—12", en: "Graphs, greedy, dynamic programming", vi: "Đồ thị, tham lam, quy hoạch động" },
  { weeks: "13—16", en: "Probability, linear algebra, optimization", vi: "Xác suất, đại số tuyến tính, tối ưu" },
  { weeks: "17—20", en: "Classical machine learning", vi: "Học máy cổ điển" },
  { weeks: "21—24", en: "Deep learning and one capstone", vi: "Học sâu và một đồ án tổng kết" },
];

const copy = {
  en: {
    nav: ["Curriculum", "Algorithms", "Roadmap"],
    eyebrow: "A bilingual field guide to computer science",
    titleA: "Learn the ideas.",
    titleB: "Build the intuition.",
    hero: "From your first array to gradient descent and transformers—one connected path, explained in English and Vietnamese.",
    start: "Start the curriculum",
    github: "View on GitHub",
    stats: ["6 learning tracks", "24-week path", "Bilingual notes"],
    curriculumKicker: "The complete map",
    curriculumTitle: "Computer science is a system of connected ideas.",
    curriculumIntro: "Follow the tracks in order, or use them as a map when you need a specific concept.",
    coreKicker: "Core algorithm lab",
    coreTitle: "Read the invariant, then read the code.",
    coreIntro: "An algorithm is not a spell. Ask what stays true, what gets smaller, and what the machine pays for.",
    invariant: "Mental model",
    complexityTitle: "Complexity is a forecast, not a stopwatch.",
    complexityBody: "Big O describes how resource use grows as input grows. Constants still matter in practice, but growth rate tells you what survives scale.",
    roadmapKicker: "A practical pace",
    roadmapTitle: "Twenty-four weeks. One durable foundation.",
    roadmapBody: "Study 7–10 hours each week: learn the idea, implement it without a library, solve three problems, then explain it aloud in both languages.",
    ritual: "Weekly ritual",
    ritualItems: ["Learn one mental model", "Implement from scratch", "Test edge cases", "Explain EN ↔ VI"],
    repoKicker: "Learn in public",
    repoTitle: "The website is the map. GitHub is the workshop.",
    repoBody: "Every topic belongs with source code, tests, exercises, and bilingual notes. Clone it, break it, fix it, and record what surprised you.",
    repoButton: "Open the repository",
    footer: "Built as an open, growing study guide—not a claim that learning ever ends.",
  },
  vi: {
    nav: ["Chương trình", "Thuật toán", "Lộ trình"],
    eyebrow: "Cẩm nang song ngữ về khoa học máy tính",
    titleA: "Hiểu ý tưởng.",
    titleB: "Xây trực giác.",
    hero: "Từ mảng đầu tiên đến hạ gradient và transformer—một lộ trình kết nối, giải thích bằng tiếng Anh và tiếng Việt.",
    start: "Bắt đầu học",
    github: "Xem trên GitHub",
    stats: ["6 mảng kiến thức", "Lộ trình 24 tuần", "Ghi chú song ngữ"],
    curriculumKicker: "Bản đồ toàn diện",
    curriculumTitle: "Khoa học máy tính là một hệ thống các ý tưởng liên kết.",
    curriculumIntro: "Học theo thứ tự, hoặc dùng như bản đồ khi bạn cần một khái niệm cụ thể.",
    coreKicker: "Phòng lab thuật toán",
    coreTitle: "Đọc bất biến, rồi đọc mã nguồn.",
    coreIntro: "Thuật toán không phải câu thần chú. Hãy hỏi điều gì luôn đúng, điều gì nhỏ dần và máy tính phải trả giá gì.",
    invariant: "Mô hình tư duy",
    complexityTitle: "Độ phức tạp là dự báo, không phải đồng hồ bấm giờ.",
    complexityBody: "Big O mô tả mức tăng tài nguyên khi đầu vào tăng. Hằng số vẫn quan trọng, nhưng tốc độ tăng cho biết giải pháp nào chịu được quy mô lớn.",
    roadmapKicker: "Nhịp học thực tế",
    roadmapTitle: "Hai mươi bốn tuần. Một nền tảng bền vững.",
    roadmapBody: "Học 7–10 giờ mỗi tuần: hiểu ý tưởng, tự cài đặt không dùng thư viện, giải ba bài tập, rồi tự giải thích bằng cả hai ngôn ngữ.",
    ritual: "Thói quen hằng tuần",
    ritualItems: ["Học một mô hình tư duy", "Tự cài đặt", "Kiểm thử trường hợp biên", "Giải thích EN ↔ VI"],
    repoKicker: "Học công khai",
    repoTitle: "Website là bản đồ. GitHub là xưởng thực hành.",
    repoBody: "Mỗi chủ đề đi cùng mã nguồn, kiểm thử, bài tập và ghi chú song ngữ. Hãy clone, làm hỏng, sửa lại và ghi điều khiến bạn bất ngờ.",
    repoButton: "Mở kho mã nguồn",
    footer: "Một cẩm nang học tập mở và luôn phát triển—vì việc học không bao giờ kết thúc.",
  },
};

const growth = [
  ["O(1)", "Hash lookup", "Tra cứu bảng băm"],
  ["O(log n)", "Binary search", "Tìm kiếm nhị phân"],
  ["O(n)", "Linear scan", "Duyệt tuyến tính"],
  ["O(n log n)", "Efficient sorting", "Sắp xếp hiệu quả"],
  ["O(n²)", "Compare every pair", "So sánh mọi cặp"],
  ["O(2ⁿ)", "Subset search", "Duyệt tập con"],
];

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [activeAlgorithm, setActiveAlgorithm] = useState(algorithms[0].id);
  const t = copy[language];
  const selected = useMemo(
    () => algorithms.find((algorithm) => algorithm.id === activeAlgorithm) ?? algorithms[0],
    [activeAlgorithm],
  );

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Algo Atlas home">
          <span className="brand-mark">A²</span>
          <span>Algo Atlas</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#curriculum">{t.nav[0]}</a>
          <a href="#algorithms">{t.nav[1]}</a>
          <a href="#roadmap">{t.nav[2]}</a>
        </nav>
        <div className="language-switch" aria-label="Language selector">
          <button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")} aria-pressed={language === "en"}>EN</button>
          <span>/</span>
          <button className={language === "vi" ? "active" : ""} onClick={() => setLanguage("vi")} aria-pressed={language === "vi"}>VI</button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-orbit orbit-one" aria-hidden="true" />
        <div className="hero-orbit orbit-two" aria-hidden="true" />
        <div className="hero-copy">
          <p className="kicker">{t.eyebrow}</p>
          <h1>{t.titleA}<br /><em>{t.titleB}</em></h1>
          <p className="hero-intro">{t.hero}</p>
          <div className="hero-actions">
            <a className="button primary" href="#curriculum">{t.start} <span>↓</span></a>
            <a className="button text-button" href="https://github.com/khaisjsu/algo-atlas" target="_blank" rel="noreferrer">{t.github} <span>↗</span></a>
          </div>
        </div>
        <div className="hero-code" aria-label="Algorithm pseudocode decoration">
          <div className="code-bar"><span /><span /><span /></div>
          <pre><code><b>while</b> learning:{"\n"}  question() {"\n"}  implement() {"\n"}  explain(<i>EN</i>, <i>VI</i>)</code></pre>
        </div>
        <div className="hero-stats">
          {t.stats.map((stat, index) => <span key={stat}><b>0{index + 1}</b>{stat}</span>)}
        </div>
      </section>

      <section className="curriculum section" id="curriculum">
        <div className="section-heading">
          <div><p className="kicker">{t.curriculumKicker}</p><h2>{t.curriculumTitle}</h2></div>
          <p>{t.curriculumIntro}</p>
        </div>
        <div className="track-grid">
          {tracks.map((track) => (
            <article className={`track-card ${track.tone}`} key={track.number}>
              <div className="track-top"><span>{track.number}</span><span className="track-arrow">↗</span></div>
              <h3>{track.title[language]}</h3>
              <p>{track.description[language]}</p>
              <ul>{track.topics.map((topic) => <li key={topic.en}>{topic[language]}</li>)}</ul>
            </article>
          ))}
        </div>
      </section>

      <section className="algorithm-lab section" id="algorithms">
        <div className="section-heading inverse">
          <div><p className="kicker">{t.coreKicker}</p><h2>{t.coreTitle}</h2></div>
          <p>{t.coreIntro}</p>
        </div>
        <div className="lab-shell">
          <div className="algorithm-tabs" role="tablist" aria-label="Algorithm examples">
            {algorithms.map((algorithm, index) => (
              <button
                key={algorithm.id}
                role="tab"
                aria-selected={activeAlgorithm === algorithm.id}
                onClick={() => setActiveAlgorithm(algorithm.id)}
                className={activeAlgorithm === algorithm.id ? "active" : ""}
              >
                <span>0{index + 1}</span>{language === "en" ? algorithm.name : algorithm.viName}
              </button>
            ))}
          </div>
          <div className="algorithm-explainer" role="tabpanel">
            <div className="algorithm-meta"><span>{selected.family}</span><strong>{selected.complexity}</strong></div>
            <h3>{language === "en" ? selected.name : selected.viName}</h3>
            <p><span>{t.invariant}</span>{selected[language]}</p>
          </div>
          <div className="code-window">
            <div className="code-bar"><span /><span /><span /><small>example.py</small></div>
            <pre><code>{selected.code}</code></pre>
          </div>
        </div>
      </section>

      <section className="complexity section">
        <div className="complexity-copy">
          <span className="big-o">O(n)</span>
          <h2>{t.complexityTitle}</h2>
          <p>{t.complexityBody}</p>
        </div>
        <div className="growth-table">
          {growth.map(([notation, en, vi], index) => (
            <div key={notation} style={{ "--row": index } as React.CSSProperties}>
              <strong>{notation}</strong><span>{language === "en" ? en : vi}</span><i />
            </div>
          ))}
        </div>
      </section>

      <section className="roadmap section" id="roadmap">
        <div className="roadmap-intro">
          <p className="kicker">{t.roadmapKicker}</p>
          <h2>{t.roadmapTitle}</h2>
          <p>{t.roadmapBody}</p>
        </div>
        <div className="roadmap-list">
          {roadmap.map((phase, index) => (
            <article key={phase.weeks}><span>{phase.weeks}</span><b>0{index + 1}</b><h3>{phase[language]}</h3></article>
          ))}
        </div>
        <aside className="ritual-card">
          <p>{t.ritual}</p>
          <ol>{t.ritualItems.map((item, index) => <li key={item}><span>{index + 1}</span>{item}</li>)}</ol>
        </aside>
      </section>

      <section className="repo-cta">
        <div>
          <p className="kicker">{t.repoKicker}</p>
          <h2>{t.repoTitle}</h2>
        </div>
        <div>
          <p>{t.repoBody}</p>
          <a className="button light" href="https://github.com/khaisjsu/algo-atlas" target="_blank" rel="noreferrer">{t.repoButton} <span>↗</span></a>
        </div>
      </section>

      <footer>
        <a className="brand" href="#top"><span className="brand-mark">A²</span><span>Algo Atlas</span></a>
        <p>{t.footer}</p>
        <span>English · Tiếng Việt · 2026</span>
      </footer>
    </main>
  );
}
