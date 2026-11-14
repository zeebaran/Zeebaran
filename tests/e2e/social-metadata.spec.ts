import { expect, test } from "@playwright/test";

test("social crawlers receive complete metadata and valid local sharing assets", async ({
  request,
}) => {
  const origin = process.env.E2E_EXPECT_SITE_ORIGIN || "https://zeebaran.vercel.app";
  for (const userAgent of ["WhatsApp/2.24.1", "facebookexternalhit/1.1"]) {
    const response = await request.get("/", { headers: { "User-Agent": userAgent } });
    expect(response.ok()).toBe(true);
    const html = await response.text();
    const head = html.split("</head>")[0];
    expect(head).toContain(`property="og:image" content="${origin}/images/og-share.jpg"`);
    expect(head).toContain('property="og:image:type" content="image/jpeg"');
    expect(head).toContain('property="og:image:width" content="1200"');
    expect(head).toContain('property="og:image:height" content="630"');
    expect(head).toContain('name="twitter:site" content="@zeebaran"');
    expect(head).toContain('type="image/png" sizes="32x32"');
    expect(head).toContain('type="image/svg+xml" sizes="any"');
    expect(head).toContain('rel="manifest" href="/manifest.webmanifest"');
    expect(head).toContain(`rel="canonical" href="${origin}"`);
    const title = head.match(/property="og:title" content="([^"]+)"/)?.[1];
    expect(title).toBe("Himalayan Horticulture &amp; Orchard Infrastructure | Zeebaran");
  }
  for (const [path, mime, signature] of [
    ["/images/og-share.jpg", "image/jpeg", "ffd8ff"],
    ["/brand/favicon-32.png", "image/png", "89504e47"],
    ["/brand/icon.svg", "image/svg+xml", "3c737667"],
  ]) {
    const asset = await request.get(path);
    expect(asset.ok(), path).toBe(true);
    expect(asset.headers()["content-type"]).toContain(mime);
    expect((await asset.body()).toString("hex").startsWith(signature), path).toBe(true);
  }
  const response = await request.get("/manifest.webmanifest");
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("manifest+json");
  const manifest = await response.json();
  expect(manifest.name).toBe("Zeebaran");
  for (const icon of manifest.icons) {
    const response = await request.get(icon.src);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain(icon.type);
  }
});
