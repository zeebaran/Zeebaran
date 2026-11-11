import { chromium } from "playwright";
import fs from "node:fs/promises";
const paths = [
  "/",
  "/platform",
  "/mission",
  "/products",
  "/zeebaran-hub",
  "/innovation",
  "/impact",
  "/partnerships",
  "/governance",
  "/about",
  "/contact",
  "/contact/simple",
  ...[
    "gala",
    "red-delicious",
    "fuji",
    "golden-delicious",
    "granny-smith",
    "honeycrisp",
    "pink-lady",
    "ambri",
  ].map((s) => "/products/" + s),
];
const b = await chromium.launch();
const productsOnly = process.argv.includes("--products-only");
const result = productsOnly
  ? JSON.parse(await fs.readFile("features/cms/catalog.generated.json", "utf8"))
  : {};
if (productsOnly) result.products = { fields: [], images: [] };
try {
  const page = await b.newPage({ viewport: { width: 1440, height: 960 }, reducedMotion: "reduce" });
  for (const path of productsOnly ? ["/products"] : paths) {
    const r = await page.goto("http://127.0.0.1:3370" + path, {
      waitUntil: "networkidle",
      timeout: 120000,
    });
    if (r.status() !== 200) throw Error(path + " " + r.status());
    const markers = await page.evaluate(() => {
      const group = (e) => {
        const section = e.closest("section");
        return (
          section?.querySelector("h2,h3")?.textContent?.trim().slice(0, 90) ||
          (e.closest("header") && "Navigation") ||
          (e.closest("footer") && "Footer") ||
          "Opening chapter"
        );
      };
      return {
        fields: [...document.querySelectorAll("[data-cms-field]")].map((e) => ({
          page: e.dataset.cmsPage,
          key: e.dataset.cmsField,
          value: e.dataset.cmsDefault,
          group: group(e),
          numeric: e.dataset.cmsNumeric === "true",
        })),
        images: [...document.querySelectorAll("[data-cms-image]")].map((e) => ({
          page: e.dataset.cmsPage,
          key: e.dataset.cmsImage,
          src: e.dataset.cmsSource,
          alt: e.dataset.cmsAlt,
          group: group(e),
        })),
      };
    });
    for (const field of markers.fields) {
      if (
        field.page === "catalog" ||
        !field.page ||
        !field.value?.trim() ||
        field.value.length > 12000
      )
        continue;
      const record = (result[field.page] ??= { fields: [], images: [] });
      if (!record.fields.some((x) => x.key === field.key)) {
        const item = { ...field };
        delete item.page;
        record.fields.push(item);
      }
    }
    for (const image of markers.images) {
      if (image.page === "catalog" || !image.page || !image.src) continue;
      const record = (result[image.page] ??= { fields: [], images: [] });
      const old = record.images.find((x) => x.key === image.key);
      if (!old) {
        const item = { ...image };
        delete item.page;
        record.images.push(item);
      } else if (!old.alt && image.alt) old.alt = image.alt;
    }
    console.log(path, markers.fields.length, markers.images.length);
  }
  await fs.writeFile("features/cms/catalog.generated.json", JSON.stringify(result, null, 2) + "\n");
  console.log("Catalog pages", Object.keys(result).length);
} finally {
  await b.close();
}
