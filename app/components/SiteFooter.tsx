"use client";

import Link from "next/link";
import { b } from "../lib/types";
import { useApp } from "./Providers";

const footer = b(
  "Built as an open, growing study guide—not a claim that learning ever ends.",
  "Một cẩm nang học tập mở và luôn phát triển—vì việc học không bao giờ kết thúc.",
);

export function SiteFooter() {
  const { t } = useApp();
  return (
    <footer className="site-footer">
      <Link className="brand" href="/"><span className="brand-mark">A²</span><span>Algo Atlas</span></Link>
      <p>{t(footer)}</p>
      <span>English · Tiếng Việt · 2026</span>
    </footer>
  );
}
