import assert from "node:assert/strict";
async function main() {
  const base = process.env.SMOKE_URL || "http://127.0.0.1:3000";
  const routes = [
    "/",
    "/products",
    "/apple-trees",
    "/apple-trees/gala",
    "/apple-trees/red-delicious",
    "/orchard-installation",
    "/about",
    "/contact",
    "/privacy",
  ];
  const links = new Set<string>();
  for (const path of routes) {
    const r = await fetch(base + path);
    assert.equal(r.status, 200, path);
    const html = await r.text();
    assert.equal(
      (html.match(/<h1[ >]/g) || []).length,
      1,
      path + " needs one h1",
    );
    assert.match(html, /<link rel="canonical"/);
    assert.match(html, /<meta name="description"/);
    assert.equal(r.headers.get("X-Content-Type-Options"), "nosniff");
    for (const m of html.matchAll(/href="(\/[^"#?]*)/g))
      if (!m[1].startsWith("/_next")) links.add(m[1]);
    console.log("PASS", path);
  }
  for (const path of links) {
    const r = await fetch(base + path);
    assert.ok(r.ok, `Broken link ${path}: ${r.status}`);
  }
  for (const path of ["/not-a-real-page", "/apple-trees/not-a-selection"]) {
    const r = await fetch(base + path);
    assert.equal(r.status, 404, path);
  }
  const redirect = await fetch(base + "/categories", { redirect: "manual" });
  assert.equal(redirect.status, 308);
  assert.ok(redirect.headers.get("location")?.endsWith("/products"));
  for (const path of [
    "/robots.txt",
    "/sitemap.xml",
    "/opengraph-image",
    "/icon.svg",
  ]) {
    assert.equal((await fetch(base + path)).status, 200, path);
  }
  const rejected = await fetch(base + "/api/contact", {
    method: "POST",
    headers: {
      Origin: "https://untrusted.example",
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  assert.equal(rejected.status, 403);
  console.log(
    `PASS: ${routes.length} pages, ${links.size} internal destinations, 404s, redirect, metadata assets and API origin rejection.`,
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
