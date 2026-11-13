import type { Knowledge } from "./types";
let snapshot: { value: Knowledge; at: number } | undefined;
let pending: Promise<Knowledge> | undefined;
export const snapshotLifetime = 60_000;
export function loadKnowledge() {
  if (snapshot && Date.now() - snapshot.at < snapshotLifetime)
    return Promise.resolve(snapshot.value);
  if (!pending) {
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 15_000);
    pending = fetch("/api/assistant", {
      cache: "no-store",
      credentials: "omit",
      signal: abort.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw Error(data.error || "The collection could not be loaded.");
        if (!Array.isArray(data.items) || !Array.isArray(data.pages) || data.items.length > 480)
          throw Error("The collection response is incomplete. Please try again.");
        snapshot = { value: data, at: Date.now() };
        return data as Knowledge;
      })
      .catch((error) => {
        throw Error(
          error instanceof Error && error.name !== "AbortError"
            ? error.message
            : "The collection took too long to respond. Please try again.",
        );
      })
      .finally(() => {
        clearTimeout(timeout);
        pending = undefined;
      });
  }
  return pending;
}
