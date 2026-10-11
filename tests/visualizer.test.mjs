import assert from "node:assert/strict";
import test from "node:test";

async function get(path) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("viz", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("home page lists every visualisation", async () => {
  const html = await (await get("/")).text();
  const slugs = [...new Set([...html.matchAll(/href="\/visualize\/([a-z0-9-]+)"/g)].map((m) => m[1]))];
  assert.ok(slugs.length >= 28, `expected at least 28 modules, found ${slugs.length}`);
  for (const slug of ["bubble-sort", "binary-search", "hash-table", "binary-heap", "shortest-paths", "knapsack", "k-means"]) {
    assert.ok(slugs.includes(slug), `missing ${slug}`);
  }
});

test("every visualisation page server-renders its lesson", async () => {
  const home = await (await get("/")).text();
  const slugs = [...new Set([...home.matchAll(/href="\/visualize\/([a-z0-9-]+)"/g)].map((m) => m[1]))];
  for (const slug of slugs) {
    const res = await get(`/visualize/${slug}`);
    assert.equal(res.status, 200, slug);
    const html = await res.text();
    assert.match(html, /class="viz-stage"/, `${slug} has the player`);
    assert.match(html, /Apply it in the real world/, `${slug} has applications`);
    assert.match(html, /Check yourself/, `${slug} has a quiz`);
    assert.match(html, /aria-label="Language selector"/, `${slug} has the language switch`);
  }
});

test("unknown visualisations return 404", async () => {
  const res = await get("/visualize/not-a-real-algorithm");
  assert.equal(res.status, 404);
});

test("API serves the same 28 modules as the website", async () => {
  const res = await get("/api/modules");
  assert.equal(res.status, 200);
  const { modules } = await res.json();
  assert.equal(modules.length, 28);
  for (const slug of ["hash-table", "knapsack", "k-means"]) {
    assert.ok(modules.some((m) => m.slug === slug), `API missing ${slug}`);
  }
});
