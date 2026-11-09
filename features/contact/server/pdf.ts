import "server-only";
import { Worker } from "node:worker_threads";
import { EnquiryError } from "./errors";
import { hasPdfHeader, maxPdfBytes } from "../schema";

// Parse untrusted PDF structures outside the request event loop and bound parser resources.
export async function validatePdf(bytes: Buffer) {
  if (
    bytes.length > maxPdfBytes ||
    !hasPdfHeader(bytes) ||
    !/%%EOF\s*$/.test(bytes.subarray(-1024).toString("latin1"))
  )
    throw new EnquiryError(422, "Select a complete PDF document.");
  const ok = await new Promise<boolean>((resolve) => {
    const worker = new Worker(process.cwd() + "/scripts/validate-pdf.mjs", {
      workerData: { bytes },
      resourceLimits: { maxOldGenerationSizeMb: 96, stackSizeMb: 4 },
    });
    const finish = (valid: boolean) => {
      clearTimeout(timer);
      void worker.terminate();
      resolve(valid);
    };
    const timer = setTimeout(() => finish(false), 8000);
    worker.once("message", (v) => finish(v === true));
    worker.once("error", () => finish(false));
    worker.once("exit", () => finish(false));
  });
  if (!ok)
    throw new EnquiryError(
      422,
      "Choose a readable PDF without encryption, scripts or embedded files.",
    );
}
export function scannerUrl() {
  const value = process.env.PDF_SCAN_URL;
  if (!value || !value.startsWith("https://") || !process.env.PDF_SCAN_TOKEN)
    throw new EnquiryError(
      503,
      "Proposal scanning is unavailable. You can send your enquiry without a file.",
    );
  return value;
}
export async function scanCloudPdf(bytes: Buffer) {
  const res = await fetch(scannerUrl(), {
    method: "POST",
    redirect: "error",
    headers: {
      "Content-Type": "application/pdf",
      Authorization: "Bearer " + process.env.PDF_SCAN_TOKEN,
    },
    body: new Uint8Array(bytes),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new EnquiryError(503, "The proposal scan could not finish. Please retry.");
  const result = await res.json();
  if (result.verdict === "infected")
    throw new EnquiryError(422, "This attachment cannot be accepted.");
  if (result.verdict !== "clean")
    throw new EnquiryError(503, "The proposal scan could not finish. Please retry.");
}
