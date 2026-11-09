import { Worker } from "node:worker_threads";
import path from "node:path";
import { PDFDocument, PDFName, PDFString } from "pdf-lib";
import { expect, it } from "vitest";
function accepted(bytes: Uint8Array) {
  return new Promise<boolean>((resolve, reject) => {
    const w = new Worker(path.resolve("scripts/validate-pdf.mjs"), { workerData: { bytes } });
    w.once("message", resolve);
    w.once("error", reject);
  });
}
it("accepts a static document and rejects malformed bytes and an OpenAction", async () => {
  const pdf = await PDFDocument.create();
  pdf.addPage();
  expect(await accepted(await pdf.save())).toBe(true);
  expect(await accepted(Buffer.from("%PDF-not-a-document\n%%EOF"))).toBe(false);
  pdf.catalog.set(
    PDFName.of("OpenAction"),
    pdf.context.obj({ S: "JavaScript", JS: PDFString.of("example") }),
  );
  expect(await accepted(await pdf.save())).toBe(false);
});
