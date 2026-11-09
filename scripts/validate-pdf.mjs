import { workerData, parentPort } from "node:worker_threads";
import { PDFDocument, PDFDict, PDFName, PDFArray, PDFRawStream } from "pdf-lib";
(async () => {
  const doc = await PDFDocument.load(workerData.bytes, {
    throwOnInvalidObject: true,
    updateMetadata: false,
  });
  const pages = doc.getPages();
  if (!pages.length || pages.length > 2000) throw Error();
  const banned = new Set([
    "JS",
    "JavaScript",
    "Launch",
    "EmbeddedFiles",
    "EmbeddedFile",
    "OpenAction",
    "AA",
    "RichMedia",
    "XFA",
    "SubmitForm",
    "ImportData",
    "GoToR",
  ]);
  const seen = new Set();
  function inspect(item, depth = 0) {
    if (depth > 100) throw Error();
    if (!item || seen.has(item)) return;
    seen.add(item);
    if (item instanceof PDFName && banned.has(item.decodeText())) throw Error();
    if (item instanceof PDFRawStream) inspect(item.dict, depth + 1);
    if (item instanceof PDFDict)
      for (const [key, value] of item.entries()) {
        inspect(key, depth + 1);
        inspect(value, depth + 1);
      }
    if (item instanceof PDFArray) for (const value of item.asArray()) inspect(value, depth + 1);
  }
  for (const [, item] of doc.context.enumerateIndirectObjects()) inspect(item);
  parentPort.postMessage(true);
})().catch(() => parentPort.postMessage(false));
