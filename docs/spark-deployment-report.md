# Spark deployment verification — 10 November 2026

**Result:** `firebase deploy --only firestore:indexes --project zeebaran085` completed successfully using the existing CLI account. All four original catalog composite indexes and the replacement ascending expiry-field index are now `READY`. Managed TTL is absent. Google Cloud Billing returned `billingEnabled: false` with no billing account attached, confirming the existing Spark/no-billing state. No billing or authentication setting was changed.

## Cause and changes

`cmsRateLimits.expiresAt` requested `ttl: true`, which invokes billing-dependent managed TTL deletion. The flag was removed, retaining an ordinary ascending field index for application cleanup. The four composite definitions were compared structurally with the pre-change snapshot and match exactly:

| Collection         | Fields, in order                          |
| ------------------ | ----------------------------------------- |
| `catalogEntries`   | `kind ASC`, `deleted ASC`, `nameSort ASC` |
| `catalogEntries`   | `deleted ASC`, `rootstockRefs CONTAINS`   |
| `catalogPublished` | `kind ASC`, `sortOrder ASC`               |
| `catalogPublished` | `kind ASC`, `nameSort ASC`                |

All retain `COLLECTION` query scope.

Changes for this repair:

- `firestore.indexes.json`: remove managed TTL; keep the bounded cleanup query indexed.
- `lib/server/rate-limits.ts`: shared transactional expiry checks and safe conditional deletion.
- `lib/server/rate-limit-maintenance.ts`: request-lifetime maintenance with project/database/emulator scope, five-minute cooldown and distributed lease.
- `features/admin/server/security.ts`, `features/contact/server/firebase.ts`, `features/contact/server/service.ts`: connect existing quotas to the shared implementation, preserving identity, windows, thresholds and authentication.
- `scripts/cleanup-rate-limits.mjs`: guarded, read-only-by-default operator maintenance; at most five explicitly requested bounded passes.
- `scripts/deploy-firestore.mjs`: reject managed TTL in the older optional deployment helper. Deployment for this repair used the Firebase CLI, not this helper.
- `tests/unit/rate-limits.test.ts`, `scripts/check-spark-rate-limits.mjs`: expiry and isolated emulator integration checks.
- `README.md`, `docs/admin-setup.md`, `docs/catalog-architecture.md`, `docs/spark-firestore.md`: correct Spark setup and document paid dependencies and maintenance limits.
- Private, ignored `.env.local`: remove one trailing comma outside the quoted private-key assignment. The credential's parsed value was verified unchanged; this resolves the different Node/Next environment-loader behavior that caused runtime signing errors. No credential is included in this report.

Cleanup treats expiration as authoritative during every quota transaction. Physical cleanup queries at most 25 expired documents per limiter collection and deletes at most 50 per pass using update-time preconditions, so a simultaneous refresh is preserved. A transaction-backed two-minute lease protects competing workers. Only the two top-level limiter collections in the same database instance are accepted. There are no scheduled Functions, Scheduler jobs, paid services, full scans or public cleanup endpoints.

## Verification evidence

| Check                                    | Result                                                                                                                                                                                             |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit tests                               | 45 passed across five files                                                                                                                                                                        |
| Isolated SDK/emulator integration        | 13 assertions passed: expiry, quota concurrency, window rollover, stale-snapshot deletion, active-counter preservation, collection/project isolation, competing leases and bounded backlog cleanup |
| Lint and TypeScript                      | Passed                                                                                                                                                                                             |
| Production build with live configuration | Passed; dynamic catalog prerender logged its handled fallback event, while actual runtime catalog/API checks passed                                                                                |
| Index-only CLI deployment                | Successful; four composite indexes and expiry-field index independently verified `READY`                                                                                                           |
| Live Admin SDK queries                   | Eight varieties and four rootstocks; admin filters, published ordering, name-prefix search and rootstock reference query succeeded                                                                 |
| Live cleanup queries / dry run           | Both bounded expiry queries succeeded; zero expired candidates at verification time; no live deletion needed                                                                                       |
| Production data preservation             | Canonical SHA-256 fingerprints and document IDs unchanged for 12 `catalogEntries`, 12 `catalogPublished` and nine `cmsMedia` records, including image references                                   |
| Cloudinary                               | All nine unique published image URLs returned successful HEAD responses; no uploads or image mutations                                                                                             |
| Authentication                           | Google provider and complete project auth configuration unchanged; Google remains enabled with `localhost` and `127.0.0.1` authorized                                                              |
| Access control                           | Live anonymous admin endpoints returned 401; live direct unauthenticated Firestore read returned 403; ten separate rules-emulator read/write attempts were denied                                  |
| Browser                                  | Catalog/rootstock sections rendered; M9/M26 comparison loaded, replacement with M7 succeeded and survived reload; 390px viewport had no page overflow or JavaScript errors                         |
| Secrets                                  | 33 generated client JS files scanned against private credential values; none exposed; `.env.local` remains ignored and mode 600                                                                    |
| Isolation                                | Live runtime has no emulator redirect; project/emulator-scoped CMS and catalog cache keys preserved; integration writes used only separate demo projects                                           |
| Billing / PITR                           | Billing disabled, no account attached; PITR disabled; no plan upgrade or paid infrastructure enabled                                                                                               |

Private detailed verification artifacts are ignored under `.local/`. Existing manually authored visual components and production product/rootstock data were not edited by this repair. The migration was not repeated. Rules were compiled by the CLI but were not deployed by the index-only command.

## Limits and release scope

Only Firestore indexes were deployed remotely; application code changes are local and require the normal application release. The production build was served locally against the real Firebase project for runtime verification. Interactive live Google consent/session issuance was not exercised; authentication configuration, unit guards and anonymous denial were verified without creating live users or sessions.

Cleanup needs application traffic or an explicit maintenance command. Idle projects retain expired documents until then, but retained documents cannot extend a quota. Spark quotas still constrain throughput; this is not unlimited free capacity. Existing optional enquiry PDF uploads depend on Firebase Storage and an external scanner and cannot be activated on Spark. Managed TTL, backups, restore, cloning and PITR require billing and were not enabled. A separately validated recovery procedure remains an operational requirement.

See [Spark maintenance](spark-firestore.md) for operator commands, safeguards and official pricing references.
