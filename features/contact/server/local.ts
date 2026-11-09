import "server-only";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { EnquiryError } from "./errors";
import { validatePdf } from "./pdf";
import { type Submission } from "../schema";

let connection: DatabaseSync | undefined;
function db() {
  if (connection) return connection;
  const dir = process.env.ZEEBARAN_INBOX_DIR || path.join(process.cwd(), ".local");
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  const sqlite = new DatabaseSync(path.join(dir, "enquiries.sqlite"));
  sqlite.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
 CREATE TABLE IF NOT EXISTS enquiries (id TEXT PRIMARY KEY, fingerprint TEXT NOT NULL, body TEXT NOT NULL, created INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS uploads (ticket TEXT PRIMARY KEY, request_id TEXT NOT NULL, size INTEGER NOT NULL, expires INTEGER NOT NULL, data BLOB);
 CREATE TABLE IF NOT EXISTS limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);`);
  connection = sqlite;
  return sqlite;
}
export function limitLocal(key: string, until: number) {
  const sqlite = db();
  sqlite.prepare("DELETE FROM limits WHERE expires < ?").run(Date.now());
  const row = sqlite
    .prepare(
      "INSERT INTO limits VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count",
    )
    .get(key, until);
  if (Number(row?.count) > 12)
    throw new EnquiryError(429, "Too many requests. Please try again in 15 minutes.");
}
export function issueLocal(ticket: string, id: string, size: number) {
  const sqlite = db();
  sqlite.prepare("DELETE FROM uploads WHERE expires > 0 AND expires < ?").run(Date.now());
  sqlite
    .prepare("INSERT INTO uploads VALUES (?,?,?,?,NULL)")
    .run(ticket, id, size, Date.now() + 600000);
  return { ticket, url: "/api/enquiries/attachments/" + ticket, fields: null };
}
export function ticketSize(ticket: string) {
  const row = db()
    .prepare("SELECT size FROM uploads WHERE ticket=? AND expires>? AND data IS NULL")
    .get(ticket, Date.now());
  if (!row) throw new EnquiryError(409, "Upload expired or unavailable.");
  return Number(row.size);
}
export async function putLocal(ticket: string, data: Buffer) {
  await validatePdf(data);
  const result = db()
    .prepare("UPDATE uploads SET data=? WHERE ticket=? AND size=? AND expires>? AND data IS NULL")
    .run(data, ticket, data.length, Date.now());
  if (!result.changes)
    throw new EnquiryError(
      409,
      "This upload expired or the file size changed. Select the file again.",
    );
}
export function saveLocal(data: Submission, fingerprint: string) {
  const sqlite = db();
  sqlite.exec("BEGIN IMMEDIATE");
  try {
    const existing = sqlite
      .prepare("SELECT fingerprint FROM enquiries WHERE id=?")
      .get(data.requestId);
    if (existing && existing.fingerprint !== fingerprint)
      throw new EnquiryError(409, "This enquiry was already submitted with different details.");
    if (!existing) {
      if (data.attachment) {
        const result = sqlite
          .prepare(
            "UPDATE uploads SET expires=0 WHERE ticket=? AND request_id=? AND size=? AND expires>? AND data IS NOT NULL",
          )
          .run(data.attachment.ticket, data.requestId, data.attachment.size, Date.now());
        if (!result.changes)
          throw new EnquiryError(422, "The attachment could not be verified. Select it again.");
      }
      sqlite
        .prepare("INSERT INTO enquiries VALUES (?,?,?,?)")
        .run(data.requestId, fingerprint, JSON.stringify(data), Date.now());
    }
    sqlite.exec("COMMIT");
  } catch (error) {
    sqlite.exec("ROLLBACK");
    throw error;
  }
}
