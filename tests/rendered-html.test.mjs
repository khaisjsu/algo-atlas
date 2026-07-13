import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the bilingual learning guide", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Algo Atlas \| Algorithms, CS &amp; Machine Learning<\/title>/i);
  assert.match(html, /Learn the ideas/);
  assert.match(html, /Data structures/);
  assert.match(html, /Gradient descent/);
  assert.match(html, /English · Tiếng Việt/);
  assert.match(html, /og\.png/);
});

test("includes accessible navigation and language controls", async () => {
  const html = await (await render()).text();
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(html, /aria-label="Primary navigation"/);
  assert.match(html, /aria-label="Language selector"/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(css, /prefers-reduced-motion/);
});
