// Read-only page inspection; merges source markers into the local registry, preserving historical keys.
import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const origin =
  process.argv.find((v) => v.startsWith("--origin="))?.slice(9) || "http://127.0.0.1:3388";
if (!/^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/.test(origin))
  throw Error("Use an explicit local server.");
const entries = [
    ["home", "/"],
    ["platform", "/platform"],
    ["mission", "/mission"],
    ["products", "/products"],
    ["zeebaran-hub", "/zeebaran-hub"],
    ["innovation", "/innovation"],
    ["impact", "/impact"],
    ["partnerships", "/partnerships"],
    ["governance", "/governance"],
    ["about", "/about"],
    ["contact", "/contact"],
    ["contact-simple", "/contact/simple"],
  ],
  catalog = JSON.parse(await fs.readFile("features/cms/catalog.generated.json", "utf8")),
  browser = await chromium.launch(),
  audit = {};
let added = 0;
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  for (const [id, path] of entries) {
    const response = await page.goto(origin + path, { waitUntil: "networkidle" });
    if (response.status() !== 200) throw Error("Page inspection HTTP " + response.status());
    const data = await page.evaluate(() => {
      const group = (node) => {
        const section = node.closest("section"),
          heading = section?.querySelector("h2,h3");
        return (
          heading?.getAttribute("data-cms-default")?.replace(/[{}]/g, "") ||
          heading?.textContent?.trim() ||
          (node.closest("header")
            ? "Navigation"
            : node.closest("footer")
              ? "Footer"
              : "Opening chapter")
        );
      };
      const fields = [...document.querySelectorAll("[data-cms-field]")].map((node) => ({
        page: node.dataset.cmsPage,
        key: node.dataset.cmsField,
        value: node.dataset.cmsDefault,
        numeric: node.dataset.cmsNumeric === "true",
        group: group(node),
      }));
      const images = [...document.querySelectorAll("[data-cms-image]")].map((node) => ({
        page: node.dataset.cmsPage,
        key: node.dataset.cmsImage,
        src: node.dataset.cmsSource,
        alt: node.dataset.cmsAlt || "",
        group: group(node),
      }));
      const unknown = [],
        walker = document.createTreeWalker(
          document.querySelector("main") || document.body,
          NodeFilter.SHOW_TEXT,
        );
      let node;
      while ((node = walker.nextNode())) {
        const text = node.textContent.trim(),
          parent = node.parentElement;
        if (
          text.length < 4 ||
          !/[a-z]/i.test(text) ||
          !parent ||
          parent.closest(
            '[data-cms-field],[data-video-card],[data-catalog-entry],script,style,noscript,[aria-hidden="true"],[hidden],.field-error',
          )
        )
          continue;
        if (parent.getClientRects().length === 0) continue;
        unknown.push(text.slice(0, 180));
      }
      return { fields, images, unknown: [...new Set(unknown)] };
    });
    for (const field of data.fields) {
      if (
        !field.page ||
        field.page === "catalog" ||
        !field.key ||
        !field.value?.trim() ||
        field.value.length > 12000
      )
        continue;
      const record = (catalog[field.page] ||= { fields: [], images: [] });
      if (!record.fields.some((item) => item.key === field.key)) {
        record.fields.push({
          key: field.key,
          value: field.value,
          numeric: field.numeric,
          group: field.group,
        });
        added++;
      }
    }
    for (const image of data.images) {
      if (!image.page || image.page === "catalog" || !image.key || !image.src) continue;
      const record = (catalog[image.page] ||= { fields: [], images: [] });
      if (!record.images.some((item) => item.key === image.key)) {
        record.images.push({ key: image.key, src: image.src, alt: image.alt, group: image.group });
        added++;
      }
    }
    audit[id] = data.unknown;
    console.log(id, { markers: data.fields.length, unmarked: data.unknown.length });
  }
  await fs.writeFile(
    "features/cms/catalog.generated.json",
    JSON.stringify(catalog, null, 2) + "\n",
  );
  await fs.mkdir(".local", { recursive: true });
  await fs.writeFile(".local/visual-unmarked-copy.json", JSON.stringify(audit, null, 2), {
    mode: 0o600,
  });
  console.log("New source markers registered:", added);
} finally {
  await browser.close();
}
