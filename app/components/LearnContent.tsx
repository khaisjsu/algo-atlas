"use client";

import { useState } from "react";
import type { AnyModule } from "../lib/registry";
import type { QuizItem } from "../lib/types";
import { b } from "../lib/types";
import { useApp } from "./Providers";
import { CopyButton } from "./CopyButton";

const ui = {
  idea: b("The idea", "Ý tưởng"),
  invariant: b("Invariant — what stays true", "Bất biến — điều luôn đúng"),
  complexity: b("Cost", "Chi phí"),
  apply: b("Apply it in the real world", "Ứng dụng thực tế"),
  applyLead: b("Algorithms are tools. Here is where this one does real work.", "Thuật toán là công cụ. Đây là nơi công cụ này thực sự làm việc."),
  recognize: b("Spot it in a problem", "Nhận diện trong đề bài"),
  pitfalls: b("Common pitfalls", "Lỗi thường gặp"),
  practice: b("Practice — in this order", "Luyện tập — theo thứ tự này"),
  quiz: b("Check yourself", "Tự kiểm tra"),
  python: b("Reference implementation (Python)", "Cài đặt tham khảo (Python)"),
  correct: b("Correct!", "Chính xác!"),
  wrong: b("Not quite.", "Chưa đúng."),
  retry: b("Try again", "Thử lại"),
  score: b("Score", "Điểm"),
};

export function LearnContent({ mod }: { mod: AnyModule }) {
  const { t } = useApp();
  return (
    <div className="learn">
      <section className="learn-intro">
        <div>
          <p className="kicker">{t(ui.idea)}</p>
          <p className="lead">{t(mod.intro)}</p>
        </div>
        <aside className="invariant-card">
          <p className="kicker">{t(ui.invariant)}</p>
          <p>{t(mod.invariant)}</p>
          <dl className="complexity-grid" aria-label={t(ui.complexity)}>
            {mod.complexity.map((c) => (
              <div key={c.label.en}>
                <dt>{t(c.label)}</dt>
                <dd>{c.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>

      <section className="learn-block">
        <div className="learn-heading">
          <h2>{t(ui.apply)}</h2>
          <p>{t(ui.applyLead)}</p>
        </div>
        <div className="apply-grid">
          {mod.applications.map((a, i) => (
            <article key={a.title.en} className="apply-card">
              <span className="apply-num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{t(a.title)}</h3>
              <p>{t(a.body)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="learn-block two-col">
        <div>
          <h2>{t(ui.recognize)}</h2>
          <ul className="signal-list">
            {mod.recognize.map((r) => <li key={r.en}>{t(r)}</li>)}
          </ul>
        </div>
        <div>
          <h2>{t(ui.pitfalls)}</h2>
          <ul className="pitfall-list">
            {mod.pitfalls.map((p) => <li key={p.en}>{t(p)}</li>)}
          </ul>
        </div>
      </section>

      <section className="learn-block two-col">
        <div>
          <h2>{t(ui.practice)}</h2>
          <ol className="practice-list">
            {mod.practice.map((p) => (
              <li key={p.url}>
                <a href={p.url} target="_blank" rel="noreferrer">{p.name} <span aria-hidden="true">↗</span></a>
                <span className={`level level-${p.level.toLowerCase()}`}>{p.level}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h2>{t(ui.quiz)}</h2>
          <Quiz items={mod.quiz} key={mod.slug} />
        </div>
      </section>

      <section className="learn-block">
        <div className="learn-heading">
          <h2>{t(ui.python)}</h2>
        </div>
        <div className="code-window">
          <div className="code-bar"><span /><span /><span /><small>{mod.slug.replace(/-/g, "_")}.py</small><CopyButton text={mod.python} /></div>
          <pre><code>{mod.python}</code></pre>
        </div>
      </section>
    </div>
  );
}

function Quiz({ items }: { items: QuizItem[] }) {
  const { t } = useApp();
  const [picked, setPicked] = useState<Record<number, number>>({});
  const answered = Object.keys(picked).length;
  const score = items.reduce((s, q, i) => s + (picked[i] === q.answer ? 1 : 0), 0);
  return (
    <div className="quiz">
      {items.map((q, i) => {
        const choice = picked[i];
        const done = choice != null;
        return (
          <div key={q.q.en} className="quiz-item">
            <p className="quiz-q">{t(q.q)}</p>
            <div className="quiz-options">
              {q.options.map((o, j) => (
                <button
                  key={o.en}
                  disabled={done}
                  onClick={() => setPicked((p) => ({ ...p, [i]: j }))}
                  className={done ? (j === q.answer ? "right" : j === choice ? "wrong" : "") : ""}
                >
                  {t(o)}
                </button>
              ))}
            </div>
            {done && (
              <p className={`quiz-why ${choice === q.answer ? "ok" : "no"}`}>
                <strong>{choice === q.answer ? t(ui.correct) : t(ui.wrong)}</strong> {t(q.why)}
              </p>
            )}
          </div>
        );
      })}
      {answered === items.length && (
        <div className="quiz-score">
          {t(ui.score)}: {score}/{items.length}
          <button onClick={() => setPicked({})}>{t(ui.retry)}</button>
        </div>
      )}
    </div>
  );
}
