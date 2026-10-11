"use client";

import { useState } from "react";
import { b } from "../lib/types";
import { useApp } from "./Providers";

const ui = { copy: b("Copy", "Sao chép"), copied: b("Copied!", "Đã chép!") };

export function CopyButton({ text }: { text: string }) {
  const { t } = useApp();
  const [done, setDone] = useState(false);
  return (
    <button
      className="copy-button"
      onClick={() => {
        navigator.clipboard
          ?.writeText(text)
          .then(() => {
            setDone(true);
            window.setTimeout(() => setDone(false), 1400);
          })
          .catch(() => {});
      }}
    >
      {done ? t(ui.copied) : t(ui.copy)}
    </button>
  );
}
