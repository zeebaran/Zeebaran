# Admin performance investigation — 11 November 2026

## Outcome and release status

The investigation reproduced excessive navigation work and removed it without changing the editorial design. The important causes were **serial network-dependent work, duplicated preview loading and speculative public-route fetching**, rather than a Firestore listener leak or a need for another state-management library.

The code improvements are verified below. **Production readiness remains conditional on deployed/real-account latency verification.** Cold Google Auth or Firestore requests can still take seconds on the developer's connection; this report does not claim that every uncached route is now instant or that local emulator timings predict production traffic.

## Root causes and fixes

| Cause / evidence                                                                                             | Change                                                                                                                                                                                     | Freshness and security                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The parent editor fetched a draft and up to 20 history records, then its iframe fetched the draft again      | Parent reads the draft once; history loads only on opening Revision history. The iframe starts with empty overrides and receives the parent's draft through the existing checked handshake | Canvas remains masked until synchronization; latest editor draft is the authority. Compatibility API responses remain available; bounded `?view=history` / `?view=record` avoid unrelated reads                                                                  |
| Each canvas repeated the Firebase Auth revocation network call even though it now renders only public markup | Canvas validates cookie signature, expiry and claims using cached certificates. It no longer fetches a private draft/history                                                               | **Every private admin page, draft API and mutation still verifies revocation.** The read-only canvas may render public markup for a revoked cookie; it cannot retrieve drafts or grant write access. A dedicated revoked-session regression proves this boundary |
| Preview links, including body CTAs and the logo, speculated into public routes on each mount                 | A shared `ContentLink` preserves normal visitor prefetching and disables it under the visual-editor context                                                                                | No change to public navigation, link labels or layout. Admin previews do not need to navigate to those public routes                                                                                                                                             |
| Page preview unmounted on each tab switch and created a new document when returning                          | Retain one preview per mounted workspace; hide it between tabs, pause native/embedded playback and CSS animations                                                                          | The frame still unmounts on leaving the workspace. No unbounded collection of hidden page frames is kept                                                                                                                                                         |
| Sidebar navigation had prefetch disabled, discarding the opportunity to warm likely destinations             | CMS links prefetch their full route on actual hover/focus/touch intent; mouse hover has a 120ms dwell and timer cleanup                                                                    | No eager prefetch of all 13 pages. Older snapshots revalidate through a protected request; focus/visibility and successful saves refresh routing data. Non-CMS private routes remain freshly loaded                                                              |
| A cached route snapshot could otherwise hide another editor's newer revision                                 | Timestamp snapshots; background-refresh older snapshots. Adopt newer clean records, preserve dirty edits and show a conflict warning                                                       | Server revision transactions remain authoritative. Stale or failed permission checks redirect to login; GET failures are not cached                                                                                                                              |
| Recreated context values propagated pointer-highlight updates through unrelated text/image consumers         | Stable memoized visual/content context values, stable edit callbacks and memoized VisualEditor; dirty serialization is recalculated only for actual content changes                        | No blanket memoization, custom comparator or change to page content semantics                                                                                                                                                                                    |
| Concurrent mounts could issue the same private GET more than once                                            | Coalesce only overlapping GET promises. Evict settled/rejected requests and clear sharing when sessions change                                                                             | No global cache of resolved private data; session changes clear sharing so different accounts cannot share an old in-flight result. Mutations are never coalesced                                                                                                |
| Live SDK reads showed substantial network/transport overhead                                                 | Reuse the existing Firebase app/client and initialize the supported REST transport for request/response operations; SDK transactions stay intact                                           | No credential/project/rule/index changes. `FIRESTORE_PREFER_REST=false` is an operational rollback. Changing this setting requires a server process restart                                                                                                      |

No `onSnapshot` listener was found in these admin paths. Existing request-scoped auth deduplication and singleton Firebase initialization were retained. No database-query/index defect explaining the navigation delay was reproduced. No dependency was installed or upgraded. No oversized-asset or initial-bundle bottleneck was demonstrated. The picker has a conditional import at one entry point, but shared imports remain; no bundle-byte reduction is claimed or counted as a measured improvement.

The canvas reuses the exact public page composition without running its leaf CMS loader. The inherited root layout may still honor an explicitly enabled shared-site draft-preview cookie; that path retains full revocation checks and can therefore add a network wait. No private root content is released to a revoked session.

## Measurements and interpretation

### Actual live backend samples

These were **bounded, read-only calls** to the configured `zeebaran085` project from this machine, not a simulated database or a logged-in live admin browser session.

- Twelve page + bounded history query pairs: approximately **1.86–4.58 seconds**. Payloads were small (2–2,009 serialized bytes for sampled page records), so oversized document payloads do not explain these delays.
- Three Auth user lookups: **2.33–7.71 seconds**. This measures the remote Auth user lookup used by revocation checking, not full end-to-end browser login.
- Interleaved document transport comparison, three samples each: gRPC **1,619 / 690 / 1,336ms**; REST **2,353 / 574 / 569ms**. REST had steadier, faster warm reads in this sample and a slower initial read. These six samples do not establish universal superiority or production p95.

The database is still in `nam5`. Hosting near the database and measuring the deployed Auth/network path are still important. This investigation did not migrate the database, change billing, grant roles or deploy infrastructure.

### Production-build local browser measurements

The preserved pre-change production build and optimized production build were profiled with the same demo Auth/Firestore data using Chromium at 1440 × 1000 with reduced motion. Each of 17 main routes was visited twice. Measurements include click-to-shell, click-to-preview-ready, browser task/script time, request inventory and heap samples. The demo backend is local, so these values intentionally separate UI work from real Google latency.

| Metric                                                    |            Before |          After |
| --------------------------------------------------------- | ----------------: | -------------: |
| Median click-to-ready, first traversal                    |             170ms |          166ms |
| Median click-to-ready, repeat traversal                   |             164ms |          164ms |
| Three return-to-preview tab switches                      | 144 / 148 / 147ms | 47 / 44 / 44ms |
| Preview document reloads during those three switches      |                 3 |              0 |
| Speculative public RSC requests during 26 CMS navigations |               108 |              0 |

Fast-emulator cold navigation is already short and is not used to claim a dramatic cold-navigation speedup. The important changes eliminate provider round trips and repeated work; this becomes material when the backend is slow.

The final request trace reduced SDK query/document read invocations from **92 to 28** over 26 CMS navigations. The repeat traversal reduced them from **39 to 13**. Document/getAll wrappers were not double-counted. These are observed SDK read operations with this fixture, **not an invoice or an exact universal billed-read count**; real history sizes/cache misses change billing.

### Controlled latency experiment

To isolate causation, the preserved and completed builds were also tested with identical **500ms delays for revocation lookups and 250ms delays for Firestore operations**, injected only by a private benchmark preload. Each destination received exactly **1 second of hover intent** before clicking. These delays are not in application code, and the experiment is separate from the actual live measurements above.

| Route sequence       | Before click-to-ready | After click-to-ready |
| -------------------- | --------------------: | -------------------: |
| /admin/pages/mission |                2133ms |                163ms |
| /admin/pages/contact |                2088ms |                221ms |
| /admin/pages/about   |                2114ms |                145ms |
| /admin/pages/mission |                2105ms |                142ms |

Before median: **2109.5ms**; after median: **154.0ms**. These are click latencies after the stated hover lead, not total request durations, and not a promise about arbitrary real-network conditions. Warming work happens before the click; certificate-only public-canvas verification removes the second remote Auth wait.

### Rendering and memory

CDP task/script timing and long tasks were captured. Exact React component `actualDuration` was not measured with a profiling React build, and no fabricated render-duration claim is made. Context-value churn was identified in source and corrected at the narrow provider boundaries.

Heap samples include objects awaiting garbage collection. They do not prove a memory leak or a leak-free application. The repeated-tab regression verifies one retained document, zero reloads and paused hidden media; source cleanup for message listeners, observers, animation frames and navigation guards was reviewed. A sustained production soak/physical-device profile remains outside this evidence.

### Per-route repeat traversal (fast local backend)

| Route                         | Before ready | After ready |
| ----------------------------- | -----------: | ----------: |
| /admin                        |         41ms |        40ms |
| /admin/pages/home             |        168ms |       122ms |
| /admin/pages/platform         |        179ms |       173ms |
| /admin/pages/mission          |        180ms |       190ms |
| /admin/pages/products         |        166ms |       175ms |
| /admin/pages/zeebaran-hub     |        162ms |       173ms |
| /admin/pages/innovation       |        164ms |       159ms |
| /admin/pages/impact           |        163ms |       163ms |
| /admin/pages/partnerships     |        167ms |       168ms |
| /admin/pages/governance       |        160ms |       166ms |
| /admin/pages/about            |        173ms |       164ms |
| /admin/pages/contact          |        171ms |       171ms |
| /admin/pages/site             |        183ms |       184ms |
| /admin/pages/contact-simple   |        158ms |       159ms |
| /admin/catalog?kind=variety   |         65ms |        47ms |
| /admin/catalog?kind=rootstock |         41ms |        27ms |
| /admin/media                  |         66ms |        57ms |

Values include Playwright actionability and frame readiness; small differences are normal run-to-run variation. Main-browser task medians were 86/77ms before and 73/69ms after on the earlier final trace, with scripts around 23–25ms. Those are browser task measurements, not React component durations.

## Verification

- Final build: passed, with live provider access; no CMS read failures in the build log.
- TypeScript, lint, formatting and unit tests: passed; **110 unit tests in 17 files**.
- Dedicated admin regressions: **3 passed** on the final canvas implementation, including with draft-preview cookies enabled. They cover retained frames, hidden playback pause, zero public prefetches, lazy history, cached snapshot refresh, a deliberately delayed response preserving dirty edits, anonymous rejection, and revoked-session read/write denial with no private draft in canvas HTML.
- Mission video, Regional hubs and Partners workflows: passed add/edit/remove, draft/preview/publish, responsive and validation/error cases with restored demo fixtures. These checks also exercised REST-backed server writes/transactions.
- Full catalog workflow: passed: real signed QA Cloudinary upload, CRUD/publish/unpublish/restore, relationship validation, deletion conflicts, concurrent link/delete, cursor pagination, comparisons, responsive layouts and role checks; dedicated QA assets cleaned up.
- Public Chromium/WebKit regression suite: **67 passed, 9 intentionally skipped** in Chromium/WebKit; skips include guarded demo-only admin tests, WebKit duplicate Axe work and live inbox writes. This suite covers the unchanged public source; the final subsequent edit was scoped to canvas composition and was separately checked across every admin workspace..
- Final benchmark: all 17 main admin destinations tested twice; no page exceptions. Catalog new/detail/error paths and unauthorized access are covered by the catalog/admin workflows. Real Google OAuth sign-in, Firefox and real-user production latency were not claimed as verified here.

The existing app on port 3000 was restarted in the same Next development mode to apply the singleton transport change, and returned ready successfully. Separate audit servers were used. Real published content was not changed; mutations used explicit demo emulators and dedicated QA assets. Temporary fixture data was restored and audit-created media registrations were removed after testing.

A repeated Mission test initially failed because direct SDK fixture restoration left Next cache entries from an earlier fixture run. Explicit fixture cache invalidation through the guarded publish path made the complete workflow pass; no cache bypass or production validation was weakened.

## Files and design preservation

Core changes: `features/admin/{AdminLink,AdminShell,PageEditor,VisualEditor,VisualCanvas,client}.tsx` (client is `.ts`), `features/admin/server/require-admin.ts`, `features/admin/visual-canvas.css`, `features/cms/{Content.tsx,model.ts,server/store.ts}`, `lib/firebase-admin.ts`, the admin CMS page/canvas routes and `/api/admin/content/[page]`.

Admin overview/catalog links now use the intent-aware wrapper. Public component import substitutions use the shared preview-aware link; styles, typography, imagery, text and animations are otherwise retained. Public link substitutions are listed in `.local/admin-performance/preview-links.json`. The `.next-perf` build directory is ignored by Git, formatter and ESLint; Next generated its corresponding type include. No change was made to the leaf color accessibility decision or local OG/brand assets.

New permanent regression coverage: `tests/unit/admin-client.test.ts` and `tests/e2e/admin-performance.spec.ts`. The latter requires explicit loopback demo-emulator configuration and skips rather than touching real production data.

Local raw evidence and original-source copies: `.local/admin-performance/`. Logs: `/private/tmp/zeebaran-admin-*`. Keep any required long-term copy privately; these directories are not production monitoring.

## Remaining operational work

1. The development server was restarted on port 3000 in the same mode to apply the transport change. Development route compilation can still delay first visits; production-build measurements are the appropriate release reference.
2. Measure a deployed, authorized real-account session near the database. Test an immediate click with no hover, a warmed click, expired/revoked sessions, first provider cold starts and actual p95. Local Google networking remains a separate source of delay.
3. Add authenticated route/API timing observability and alerts in the deployment environment; do not log tokens, cookies, draft content or customer details. No production profiler was installed in this task.
4. The previous audit's accepted contrast limitation and backup/recovery/monitoring gaps still apply. This performance investigation does not override those release conditions.

References: [Firebase session verification and additional revocation network request](https://firebase.google.com/docs/auth/admin/manage-cookies), [Firestore supported REST setting](https://firebase.google.com/docs/reference/admin/node/firebase-admin.firestore.firestoresettings), and the installed Next 16 documentation for full intent prefetching, cache invalidation and lazy client loading.
