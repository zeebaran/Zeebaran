/** Bounded per-process burst protection; no Firestore counters or per-message writes. */
export function createBurstLimiter(max = 60, windowMs = 60_000, capacity = 512) {
  const windows = new Map<string, { until: number; count: number }>();
  let total = { until: 0, count: 0 };
  return (key: string, now = Date.now()) => {
    if (total.until <= now) total = { until: now + windowMs, count: 0 };
    if (total.count >= 600) return false;
    total.count++;
    for (const [id, value] of windows) if (value.until <= now) windows.delete(id);
    let bucket = windows.get(key);
    if (!bucket) {
      if (windows.size >= capacity) return false;
      bucket = { until: now + windowMs, count: 0 };
      windows.set(key, bucket);
    }
    if (bucket.count >= max) return false;
    bucket.count++;
    return true;
  };
}
