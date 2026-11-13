# Zeebaran production recheck — 12 November 2026

The application has a sound engineering foundation, and the exercised workflows pass. This review fixed six confirmed problems, including a save-delay cause, redundant image-registration reads and an incorrect assistant destination. **Overall engineering assessment: 8.3/10; architecture: 8.7/10; production readiness: 7.8/10, conditional.** These are evidence-informed judgments, not certifications or a claim of zero bugs.

The remaining release gaps are database deletion protection, a proven backup/restore strategy, deployed latency/load/monitoring evidence and the deliberately preserved text-contrast failures. The service account could read database configuration but could not enable deletion protection: Google returned `403 PERMISSION_DENIED`. No application records or billing settings were changed in the live project during this review.

## Preservation and method

The existing dirty Git tree was inspected first. Existing manually edited content, team portraits, layouts, typography, colors, hero sketches, animations and functionality were retained. Intentionally local OG/brand/favicon/font assets remain local. No dependency update, package installation, Git reset, staging, commit, push or deployment was performed.

Verification combined current-source inspection, regression reproductions before fixes, production builds, unit tests, Chromium/WebKit browser tests, disposable Auth/Firestore workflows, live read-only provider checks, dependency advisory lookup, internal-link traversal and actual timing samples. A compatible Firestore emulator binary was restored outside the project dependencies. Public published catalog records were read and copied into a guarded demo project to supply realistic test references; private live drafts were not copied.

Most source and functional checks are automated or targeted review. This is not a line-by-line security certification of every dependency, every possible UI state or every infrastructure setting.

## Confirmed fixes

| ID  | Severity / priority | Affected files                                | Evidence and consequence                                                                                                                                                                                              | Implemented fix                                                                                                                                                                                                                                                   | Verification / regression risk                                                                                                                                                                                                                                                                                                                |
| --- | ------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Medium / P1         | `features/catalog/admin/CatalogEditor.tsx:62` | Two synchronous Save clicks produced two catalog POSTs before React disabled the button. Revision transactions prevented overwrites, but duplicate work could yield a misleading conflict and consume mutation quota. | Immediate ref guard shared by save, publish, unpublish and delete; released in `finally`.                                                                                                                                                                         | Before: two requests. After: one request, editable data retained after injected failure, real emulator retry succeeds. Low risk; server revision checks unchanged.                                                                                                                                                                            |
| D2  | Medium / P1         | `features/cms/server/store.ts:169`            | Reusing one registered image in two About image fields and a team profile caused three registration document reads, including serial round trips.                                                                     | One request-scoped, deduplicated `getAll` across page images, team portraits and partner logos; conflicting sources for the same public ID are rejected.                                                                                                          | Fixture now reads the shared registration once. Missing registrations and conflicting URLs fail before mutation. Low-to-medium risk around validation; Team and CMS persistence workflows pass.                                                                                                                                               |
| D3  | Medium / P1         | `features/admin/client.ts:26`                 | The mutation fetch had a deadline, but the preceding CSRF fetch had no abort signal. A stalled handshake could keep the operation pending indefinitely.                                                               | One 45-second abort signal covers both CSRF and the operation.                                                                                                                                                                                                    | Regression checks that both requests share the same signal. Existing authorization, private GET deduplication and retry tests pass. Low risk.                                                                                                                                                                                                 |
| D4  | Medium / P1         | `features/assistant/server.ts:59`             | Assistant assembly ignored the structured published team and current shared contact settings. It could not retrieve a newly published leader and omitted the current contact email.                                   | Reuse the page records already fetched; add enabled team summaries and current contacts/addresses/desks to the public knowledge projection.                                                                                                                       | Before/after fixture verifies published leader and changed email, excludes hidden leader and reads the site page once. No new per-message database operations. Low risk.                                                                                                                                                                      |
| D5  | Medium / P1         | `features/cms/server/store.ts:386`            | Fault injection held YouTube poster preparation unresolved. Mission mutation completion waited on the optional image provider. Distinct films were processed serially during validation.                              | Validate video URLs synchronously; commit the revision first; schedule optional poster work with Next `after`, deduplicated and limited to three concurrent preparations. Unchanged draft sources schedule no work; publishing retries failed poster preparation. | Saved revision completes while poster delivery is held pending. A repeated film prepares once; unchanged drafts and stale revisions schedule no work. Final Mission UI/API workflow passes. Medium risk: first-use posters can appear after saving and remain best-effort within hosting duration limits; placeholders protect playback/copy. |
| D6  | Low / P2            | `features/assistant/engine.ts:586`            | The rootstock browse response linked to `/products#rootstocks`; the actual section ID is `rootstock-selection`. The destination fragment did not exist.                                                               | Correct the response link to `/products#rootstock-selection`.                                                                                                                                                                                                     | Unit reproduction failed before the fix. Browser regression clicks the response link and checks the actual section enters the viewport. Low risk.                                                                                                                                                                                             |

Test maintenance also corrected assumptions that could mislabel valid CMS changes as defects: the portrait test now accepts an uploaded Hilal Sheikh photograph; the page-save regression uses a unique value so repeating the suite does not accidentally click an already-disabled Save button. Separate browser runs use separate artifact directories. Accumulated demo login quotas were reset only in the emulator; production rate limits were not weakened.

## Architecture and database assessment

The Next App Router separates public server rendering and cached data from interactive client features. Feature modules own catalog, CMS, contact settings, media, team and assistant behavior. Route handlers apply session/role checks, input validation and CSRF protection before persistence. Large editor components remain understandable but warrant selective extraction when a real feature requires it; no broad rewrite was justified.

Firebase initialization is shared. Protected requests check session revocation, and request-scoped memoization avoids duplicate authorization within a render. Private resolved data is not stored in a global cross-user cache. Intent prefetching is limited to CMS workspaces; private freshness checks preserve unsaved changes and server revisions remain authoritative. Preview tabs retain their canvas and pause hidden media rather than rebuilding it.

Live observations of `zeebaran085` during this review:

| Item                | Observed result                                                                                                                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Database            | Firestore Native, `nam5`                                                                                                                                                               |
| Catalog             | 12 private catalog entries and 12 published projections                                                                                                                                |
| CMS                 | 5 page documents; 58 media-registration documents at the time sampled                                                                                                                  |
| Relationships       | No missing rootstock references in the 12 published entries checked                                                                                                                    |
| Images              | All sampled published catalog image URLs belong to the configured Cloudinary account                                                                                                   |
| Composite indexes   | Required catalog index shapes were present and READY in live API results; bounded/search/reference workflows were exercised                                                            |
| Authentication      | Google provider enabled; intended administrator exists, is verified and is enabled; application/local domains configured                                                               |
| Direct access       | Anonymous live Firestore request returned 403                                                                                                                                          |
| Rules               | Deployed catch-all denies direct reads/writes. It differs textually from local rules by comments and redundant explicit deny blocks; the examined effective access posture is the same |
| Recovery protection | Database deletion protection disabled; PITR disabled                                                                                                                                   |

The catalog uses separate private entries and public projections, cursor pagination and indexed reverse references. Publish/update/delete workflows enforce revisions and rootstock relationships transactionally. Concurrent deletion and relationship creation cannot both commit in the tested race. CMS revisions/history and contact-settings revisions prevent conflicting overwrites. New team cards remain in the existing About document rather than creating one query per member.

## Firebase efficiency

Editable fields do not each incur a document read. CMS page content is read as a document; team records ride in that same snapshot. Client typing, visibility toggles, assistant questions and local comparison state do not write to Firestore. Explicit saves/publishes, media registration, audit history and mutation rate counters perform the intended writes.

- Public CMS snapshots revalidate after 60 seconds; catalog data after 300 seconds; catalog sitemap data after 3,600 seconds. Publication invalidates the relevant cache tags/paths.
- No Firestore `onSnapshot` listener was found in the inspected application code.
- Public catalog pages are bounded, private indexes are projected/paginated, and original-image/media pickers load bounded pages.
- Concurrent private GETs are coalesced while pending. Settled private data is evicted; session changes clear pending-read sharing.
- Team/profile opening and assistant messages reuse loaded public data. The assistant client snapshot has a 60-second lifetime and catalog assembly is bounded to 480 entries, with an explicit partial-collection state.
- Image validation now performs one read per distinct registered image within a CMS mutation. **Batching multiple distinct documents does not turn them into one billed read.** The measured duplicate fixture changed three reads of one shared registration into one; no site-wide percentage saving is claimed. See [Firestore billing](https://firebase.google.com/docs/firestore/pricing).

No measured production read/write-volume dashboard or traffic-derived monthly cost was available. Exact quota usage depends on traffic, unique queries, cache misses/instances, publication frequency, transaction retries and operational activity. Warm local tests cannot establish unlimited free-tier capacity.

## Performance evidence

The isolated production-build navigation sample covered all 18 admin sidebar destinations twice: immediate clicks and intent-warmed clicks. Separate fields record rendered workspace time and canvas-ready time, plus browser script/layout duration and private API request timing. It used loopback Auth/Firestore emulators and no simulated provider delay. The full data-flow tests were completed separately, so these timings do not measure real provider latency. Final measurements are retained in `.local/deep-review/admin-latency.json`.

The final completed run during this audit measured:

| Navigation               | Render p50 / p95 | Preview-ready p50 / p95 |
| ------------------------ | ---------------- | ----------------------- |
| Immediate, 18 routes     | 50 / 100 ms      | 121 / 203 ms            |
| Intent-warmed, 18 routes | 42 / 86 ms       | 124 / 183 ms            |

No page exceptions occurred. A 36-navigation pass made 15 private API GETs, comprising two bounded media reads and 13 workspace-freshness checks; RSC server work is additional. These counts are browser requests, not a Firestore billing measurement. No claim of a broad before/after navigation speedup is made: the confirmed reductions concern overlapping saves, duplicate media verification and provider work blocking saves.

Three live read-only provider samples from this developer machine measured:

| Sample                                                     | Firestore document read | Auth lookup |
| ---------------------------------------------------------- | ----------------------- | ----------- |
| First, including cold Firestore credential/transport setup | 1,877 ms                | 1,028 ms    |
| Second                                                     | 399 ms                  | 382 ms      |
| Third                                                      | 896 ms                  | 377 ms      |

These round trips are a verified contributor to cold admin latency, though they are not timings of a deployed user's complete navigation. Database/application placement and real deployment cold starts remain material. Preserve immediate revocation checks; evaluate hosting near the current database and measure deployed p95 before deciding on any database migration. No migration or security relaxation was performed.

Eight unthrottled public samples covered Home, Products, About and Contact at 1440 px and 390 px. Observed LCP ranged from 56–748 ms, CLS was 0 in each observation and no long-task entries were recorded in those short windows. Only assistant interactions generated measured event-timing interactions, with a largest duration of 40 ms. These are limited local samples with shared/warm resources, **not field Core Web Vitals or a production INP result**. Physical devices, slow networks, sustained sessions and representative traffic were not measured.

## Security, accessibility and reliability

Session cookies are HttpOnly and secure outside loopback development, with SameSite protection, recent-auth sign-in requirements and revocation checks. Mutation endpoints validate origin/CSRF and role permissions. Editor accounts cannot publish/delete catalog entries or update global settings. Uploads use signed constraints, account/ownership checks and verified Cloudinary registrations. Database revision conflicts retain local edits rather than silently overwriting them.

Direct client access to catalogEntries, catalogPublished, catalogAudit, catalogAssets and cmsMedia was denied for both read and write in the actual rules emulator: ten denial checks. The production dependency advisory audit reported zero known advisories at the time queried. A narrow source/built-client scan found no PEM private-key blocks or service-account private-key-ID values; only `.env.example` is tracked among environment files. Neither check proves the absence of undiscovered vulnerabilities or every possible secret exposure.

Two confirmed contrast limitations remain because of the user's explicit color/design requirements:

- `#8cc63f` text on `#f7f5ea`: approximately **1.87:1**.
- White navigation text on computed `#fe6901`, 12 px / weight 600: approximately **2.90:1**.

The second issue was found through computed-style/manual contrast checking despite the automated scan passing its checked rules. Both are below relevant AA thresholds; do not describe this site as fully WCAG AA compliant. Preserve the requested appearance unless the owner authorizes a color treatment change. [WCAG contrast requirements](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

Optional YouTube thumbnails run after the response and are not a durable job queue. Provider failure can leave a placeholder; re-publishing retries failed preparation. That is acceptable for optional artwork, but it is not a guarantee of immediate thumbnail availability or recovery after every hosting interruption. The core revision and video URL are saved independently.

## Checks completed and limits

- **190 unit tests passed across 25 files.** Includes CMS/media validation, role/CSRF boundaries, cache behavior, request deduplication, catalog/comparison/assistant behavior, voice mocks and all new regressions.
- **91 public browser tests passed in Chromium/WebKit**, with 25 explicitly skipped cases: guarded emulator tests, local-only inbox writes and a duplicate accessibility scan. **All 20 final assistant browser tests passed** after the last link correction, including two new checks; this gives 93 unique public browser checks across the completed runs.
- **11 admin browser tests passed against the final admin production build.** Rapid-save guards, error retry, stale data/pagination races, retained previews, lazy history, revocation, restore and sidebar selection are covered.
- **55 full catalog integration assertions passed**, including an actual temporary signed Cloudinary upload, image selection, draft/private state, publish invalidation, arbitrary specifications, comparison/dropdown persistence, unpublish/delete/restore, editor restrictions, concurrency and bounded pagination. Small QA uploads were cleaned up by the test; original assets were retained.
- Mission card editing, preview/publication, YouTube/native playback controls, missing/error states and one/two-card layouts passed the final isolated workflow.
- Regional hub add/edit/disable/re-enable/delete/Undo and both map/card synchronization workflows passed, including invalid coordinates and empty states.
- Team draft/preview/publish, complete biography dialog, reorder/hide/add/remove/Undo and verified portrait selection passed. Invalid portraits, cross-page payloads, stale revisions and editor publishing are rejected.
- Contact/social settings passed persistence, stale revisions, double-submit prevention, no per-keystroke requests, visibility toggles, per-office/platform hiding, safe URLs, metadata/WhatsApp consistency, no extra client settings fetch and editor restrictions. No real email was sent; delivery responses were intercepted.
- Internal-link traversal checked **44 discovered public links across 29 destinations**, with no missing destination or fragment. The separately discovered assistant-only fragment defect was fixed and has its own click regression.
- Final public/admin production builds, lint, TypeScript and formatting passed during verification; Git whitespace checks passed. Final command logs are listed below.

Real Google OAuth popup login, a real microphone, real inbox delivery, Firefox/physical devices, long-duration memory behavior, deployed load/availability and disaster recovery were not freshly proven. No claim of complete bug freedom, complete security, zero lag or universal browser compatibility is supported.

## Ratings and release roadmap

Weights total 100%. Scores reflect the current code and the practical limits above; weighted result is approximately **8.3/10**.

| Dimension           | Score | Weight | Reason                                                                                                                              |
| ------------------- | ----- | ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Architecture        | 8.7   | 10%    | Clear feature/server boundaries, transactional publishing, intentional public/private projections                                   |
| Code quality        | 8.6   | 7%     | Strict validation, typed models and passing checks; large editor modules remain                                                     |
| Maintainability     | 8.5   | 5%     | Shared media/settings and explicit contracts; integration fixtures need disciplined isolation                                       |
| Functionality       | 8.7   | 10%    | Broad exercised workflows; external/device-only paths remain unverified                                                             |
| UI/UX               | 8.8   | 5%     | Consistent preserved brand, accessible dialogs and useful draft states                                                              |
| Responsiveness      | 8.8   | 5%     | Multiple widths and browser engines pass; physical-device evidence remains limited                                                  |
| Performance         | 8.4   | 10%    | Fast local rendering, bounded/cached reads, confirmed save bottlenecks addressed; real provider latency remains                     |
| Security            | 8.2   | 12%    | Server authorization, CSRF, revocation, upload validation and adversarial workflow checks; no independent penetration certification |
| Firebase/database   | 8.5   | 10%    | Live connection/indexes/relations verified, bounded queries and revision transactions; recovery configuration incomplete            |
| Accessibility       | 7.2   | 6%     | Keyboard/dialog/automated checks, with two retained contrast failures                                                               |
| SEO                 | 8.5   | 5%     | Metadata, structured-data escaping, sitemap/cache and link checks; indexing/search-console outcomes unverified                      |
| Testing             | 8.7   | 8%     | Substantial unit, cross-browser, isolated integration and race coverage; test fixtures improved                                     |
| Operations/recovery | 6.5   | 7%     | No proven backup restoration, deployed SLO monitoring or load/recovery drill                                                        |

Supplementary judgments: frontend 8.8; backend 8.5; database design 8.5; Firebase integration 8.5; assistant 8.4; scalability 8.2; production readiness 7.8. Capacity beyond the bounded current workload needs deployment evidence rather than a higher score inferred from code.

| Priority | Status / severity                         | Next action                                                                                                                    | Risk / verification                                                                                                                                                                                                                                                   |
| -------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1       | Open, High, verified                      | Project owner enables database deletion protection. The service account's attempted update returned 403.                       | Prevents accidental database deletion; verify the resulting metadata flag. Use the owner account rather than broadening the application's IAM unnecessarily. [Database management permissions](https://docs.cloud.google.com/firestore/native/docs/manage-databases). |
| P1       | Open, High operational gap                | Agree on a backup/recovery method and retention budget, then execute a restore drill. PITR is currently disabled.              | Existing local source/media copies are not proof of complete database recoverability. Billing-dependent services were not enabled. [Firestore billing](https://firebase.google.com/docs/firestore/pricing).                                                           |
| P1       | Open, Medium, measured latency            | Verify deployment placement, provider cold starts and real admin p95, with error/latency monitoring.                           | A database move is a separate migration; protect data and URLs. Do not trade revocation/freshness for speed. [Firebase session verification](https://firebase.google.com/docs/auth/admin/manage-cookies).                                                             |
| P2       | Open, Medium, verified design constraints | Resolve white/orange and leaf/cream contrast if the owner later authorizes appearance changes.                                 | Preserve current manual preferences until then; cannot claim full AA.                                                                                                                                                                                                 |
| P2       | Unverified, not a confirmed failure       | Verify real OAuth/microphone/email flows, physical devices, representative sustained traffic and a deployed recovery scenario. | Collect evidence before claiming enterprise availability, capacity or no lag.                                                                                                                                                                                         |

## Changed files and evidence

Production changes are confined to:

- `features/catalog/admin/CatalogEditor.tsx`
- `features/admin/client.ts`
- `features/cms/server/store.ts`
- `features/assistant/server.ts`
- `features/assistant/engine.ts`

Regression/test maintenance: `tests/unit/cms-media-validation.test.ts`, `tests/unit/admin-client.test.ts`, `tests/unit/assistant-source.test.ts`, `tests/unit/assistant.test.ts`, `tests/e2e/admin-catalog.spec.ts`, `tests/e2e/admin-performance.spec.ts`, `tests/e2e/assistant.spec.ts`, `tests/e2e/team.spec.ts`. Pre-existing changes in these or other files were preserved.

Local evidence is retained in ignored `.local/deep-review/`: `unit-final.log`, `browser-final.log`, `assistant-final.log`, `admin-tests-final.log`, `catalog-flow-final.log`, `catalog-assertions.json`, `mission-final.log`, `hubs-final.log`, `team-final.log`, `settings-final.log`, `public-build-final.log`, `admin-build-final.log`, `lint-final.log`, `types-final.log`, `format-final.log`, `rules.log`, `live.json`, `protection.json`, `live-latency.json`, `admin-latency.json`, `public-metrics.json`, `link-check.json`, `dependency-audit.json` and desktop/mobile assistant screenshots. Delayed-provider and duplicate-read/save reproductions are retained in the corresponding `*-before.log` files. Initial fixture/diagnostic failures are not counted as successful application tests.
