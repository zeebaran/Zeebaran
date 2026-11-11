"use client";
const pendingReads = new Map<string, Promise<unknown>>();
export class AdminRequestError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
/** Coalesce concurrent GETs only. Resolved private data is not cached globally. */
export function adminRequest<T>(path: string, body?: unknown, method = "POST"): Promise<T> {
  if (body !== undefined || method === "DELETE") {
    if (path === "/api/admin/session") pendingReads.clear();
    return request<T>(path, body, method);
  }
  const existing = pendingReads.get(path);
  if (existing) return existing as Promise<T>;
  const pending = request<T>(path, body, method).finally(() => {
    if (pendingReads.get(path) === pending) pendingReads.delete(path);
  });
  pendingReads.set(path, pending);
  return pending;
}

async function request<T>(path: string, body?: unknown, method = "POST"): Promise<T> {
  let headers: Record<string, string> = {};
  if (body !== undefined || method === "DELETE") {
    const response = await fetch("/api/admin/csrf", { cache: "no-store" });
    if (!response.ok) throw new Error("Refresh the page before trying again.");
    const { token } = await response.json();
    headers = { "Content-Type": "application/json", "x-csrf-token": token };
  }
  const res = await fetch(path, {
    method: body === undefined && method !== "DELETE" ? "GET" : method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(45000),
    cache: "no-store",
  });
  const d = await res.json().catch(() => null);
  if (!res.ok)
    throw new AdminRequestError(
      res.status,
      d?.error || "The operation could not complete. Please retry.",
    );
  if (!d) throw new Error("The server returned an unreadable response.");
  return d as T;
}
export const firebasePublic = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};
export const authConfigured = Object.values(firebasePublic).every(Boolean);
