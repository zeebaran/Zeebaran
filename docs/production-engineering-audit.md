# Zeebaran production engineering audit

Assessment: 10–11 November 2026. Repository: `/Users/naveedbhat/Zeebaran`.

## Verdict

The current application is a strong, custom marketing website and editorial/catalog system with credible engineering foundations. This assessment found and fixed reproducible consistency, comparison, caching, request-validation and performance defects. It is suitable for a controlled production release after the operational checks below, with an explicitly accepted accessibility exception. It is **not an evidenced 10/10 enterprise system, WCAG 2.2 AA conformant, or proven bug-free**.

The weighted engineering score is **8.24/10**. Scores are judgment informed by the evidence below, not a security certification or uptime guarantee. No confirmed Critical vulnerability was discovered within this assessment; that does not establish their absence.

## Scope, preservation and method

- Inventoried 269 source/configuration/documentation/archive files at the start, excluding dependencies, generated builds, private environment files and `.local` artifacts. Reviewed architecture, routes and cross-cutting behavior through source reads, dependency analysis, targeted reproductions, builds, live read-only queries and browser/emulator workflows. This is not a claim that every possible state or every line has a separate test.
- Captured the existing dirty working tree and source baseline before edits. Did not reset, stage, commit, merge, deploy, update dependencies or alter live provider configuration. Existing user changes remain in place.
- Preserved content, typography, colors, spacing, navigation, sketches, animations and page layouts. Formatting changes were verified against normalized compiled JS or parsed JSON; they repair the existing CI format gate without changing runtime behavior.
- Kept `#8cc63f` exactly, following the owner's explicit decision. Kept local OG, icons and fonts; did not reintroduce orchard contour lines or substitute new imagery.
- Live Firebase checks were read-only. Destructive/add/edit/publish tests used demo emulators and dedicated QA media, not real catalog entries or customer messages. Web3Forms responses were intercepted; no test email was sent.
- Separate audit dev/production ports were used. The user's port 3000 application and pre-existing Firebase emulators were left running.

## Architecture and data flow

Public App Router pages compose reusable sections and CMS content markers. Page content uses a published CMS document with authored defaults; draft mode requires a verified admin session. Public catalog pages resolve Firestore published projections, with React request deduplication and Next data caches. Client components handle comparison choices, maps, media playback and motion.

Admin routes run on the server, verify Firebase session cookies with revocation checking, enforce verified-email allowlisting or trusted custom claims, apply same-origin/CSRF checks, validate bounded JSON bodies and use Firestore transactions. `editor` can edit; `admin` is required for catalog publishing/deletion and CMS publishing. Signing in alone does not grant editing privileges.

Cloudinary stores photographic media and videos; Firestore stores references, dimensions and editorial metadata. Shared assets are not destroyed merely because a page/product reference is removed. Web3Forms Free is the active messages-only contact path; the retained local/server intake is a separate fallback implementation, not the active free-plan attachment feature.

### Firestore structure verified live

Project: `zeebaran085`; database: Native mode, `nam5`. Counts are a point-in-time audit snapshot, not live dashboard values.

| Collection         | Documents | Responsibility                                                                                      |
| ------------------ | --------: | --------------------------------------------------------------------------------------------------- |
| `catalogEntries`   |        12 | Private draft/published records, revision, deletion state and rootstock references                  |
| `catalogPublished` |        12 | Public projection: 8 varieties and 4 rootstocks; specifications, image references and relationships |
| `catalogAssets`    |         9 | Registered catalog media metadata                                                                   |
| `cmsPages`         |         3 | Edited page draft/published state and revisions; other pages use authored defaults                  |
| `cmsMedia`         |        52 | Cloudinary identity, type, URL, size, dimensions, category and provenance                           |
| `cmsAudit`         |         4 | Editorial action records                                                                            |
| `cmsRateLimits`    |         3 | Logical-expiry abuse counters                                                                       |
| `appMaintenance`   |         1 | Bounded cleanup lease and scheduling state                                                          |

Catalog transactions also write audit events when actions occur. Empty collections do not appear in the snapshot. Rootstocks and varieties share a typed model rather than separate duplicated CRUD implementations. `rootstockIds` are validated references; `rootstockRefs` protects both draft and published relationships during removal/unpublication.

All four declared composite indexes were **READY** in the live project: admin kind/deleted/name, reverse rootstock references, public kind/sort and public kind/name. Seven representative admin/public/search/reference queries executed successfully. All 12 published entries passed current schema, relationship and Cloudinary image checks.

### Read/write efficiency

- Published CMS cache: 60 seconds, tagged per page; catalog lists/items/batched selections: 300 seconds, with explicit publish invalidation. Sitemap cache: 3,600 seconds.
- Public catalog pages query a bounded page plus one cursor sentinel, normally 24 + 1; stable secondary document-ID ordering prevents ambiguous pagination. Search is normalized name-prefix search, not full-text search.
- Comparison resolves deduplicated IDs in a bounded batch (maximum 24). No application `onSnapshot` subscription was found. Admin edits save/publish deliberately rather than writing each keystroke.
- Rate-limit expiry is logical and does not depend on paid TTL deletion. Maintenance uses a lease, five-minute cooldown and at most 25 candidates per collection per cleanup batch; emulator concurrency checks passed.
- Many editable fields in one CMS document do **not** each cause a separate document read. Document size, cache misses, revisions, admin saves and traffic determine actual usage. Cache reuse is deployment/process dependent; free-tier capacity cannot be guaranteed from source inspection.
- No index, schema or live data migration was necessary for this audit's fixes.

## Confirmed defects and implemented fixes

| ID / severity | Affected files and evidence                                                                                                                                                                | Consequence and solution                                                                                                                                                                                                                                                                                                                                 | Priority / regression risk                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| F1 · High     | `features/catalog/server/store.ts:214`; before reproduction returned 200 when unpublishing a rootstock still referenced by a published variety                                             | Public rootstock disappeared while the variety retained its link. Unpublish now uses the existing indexed transactional reference guard, as deletion already did. After reproduction: 409; rootstock and linked variety remain consistent. Catalog regression added.                                                                                     | P1 completed; low/medium: intentionally blocks removal until references are resolved in drafts and publications |
| F2 · Medium   | `features/catalog/ComparisonProvider.tsx:114`, `features/catalog/Comparison.tsx`; clear left shared URL parameters in place; reload restored removed choices                               | Centralized URL synchronization now removes stale selections. Aborted/versioned restoration cannot overwrite a subsequent user choice. Failed restore does not persist an empty selection over saved choices. Clear/remove/reload regressions pass.                                                                                                      | P1 completed; medium: browser history, cross-tab storage and restoration are intertwined                        |
| F3 · Medium   | `features/catalog/Comparison.tsx:36`; delayed rootstock pagination appended M7 after the user switched to Varieties                                                                        | Request version guards, cancellation and ID deduplication reject obsolete responses and stale loading/errors. Same delayed-response reproduction now contains no rootstock in the varieties list.                                                                                                                                                        | P1 completed; low/medium: selector loading behavior; regression included                                        |
| F4 · Medium   | `app/api/admin/csrf/route.ts:5`; opening another admin tab rotated a valid shared cookie and made a prior tab's request fail 403                                                           | Reuse a valid cryptographically generated 64-hex token, renew cookie TTL, regenerate malformed values. Origin, timing-safe comparison, secure/HttpOnly/SameSite protections remain. Reproduced requests now reach expected authentication checks rather than false CSRF failures. Two new unit tests.                                                    | P1 completed; low: token lifetime unchanged; first bootstrap still generates a fresh token                      |
| F5 · Low      | `app/api/admin/content/[page]/route.ts:30`; a JSON `null` body produced a TypeError/503 before schema validation                                                                           | Optional access allows trusted validation to return 422. Publishing role checks remain intact. Verified 503 before, 422 after.                                                                                                                                                                                                                           | P2 completed; low                                                                                               |
| F6 · Medium   | `features/cms/server/public.tsx:11`; failure handler inside the cache returned defaults as a successful cache value                                                                        | A transient Firestore failure could temporarily replace manual published copy with cached authored defaults. Errors now remain errors inside the cache; fallback handling is outside. Fault injection verifies recovery reads published copy rather than retaining the failed default. Next's stale-cache handling can retain the last successful value. | P1 completed; low/medium: cold failures still show safe authored defaults and log the failure                   |
| F7 · Medium   | `components/pages/MissionTV.tsx:209`; mobile 358px image fetched a 1,440px / 262,970-byte resource, lazy-starting around 888ms                                                             | Added accurate responsive sizes and eager/high-priority loading for the existing LCP image. No visual changes. Throttled mobile median LCP improved from 4,472ms to 2,188ms in the recorded samples.                                                                                                                                                     | P2 completed; low: eager request is limited to this image                                                       |
| F8 · Medium   | `tests/e2e/site.spec.ts`, `gallery.spec.ts`, `audit.spec.ts`; existing tests omitted now-required phone/place, used a non-unique success selector and assumed unavailable backend fixtures | Updated realistic form fixtures, scoped success assertions and intercepted external submission. Dynamic catalog cases explicitly require configured data. Known brand-contrast exception is narrow and reported, not silently disabled globally.                                                                                                         | P2 completed; low: test infrastructure, no shipped product changes                                              |
| F9 · Medium   | 45 existing formatting violations prevented `npm run format:check` / CI from completing                                                                                                    | Applied formatting only after normalized JS/JSON equivalence guards. One CMS text literal was expressed as an equivalent JSX string so formatting would not alter its content-marker shape. Full formatting check now passes.                                                                                                                            | P2 completed; low: runtime-equivalence guarded, list below                                                      |

Reproductions, raw results and baseline copies are in ignored `.local/production-audit/`. They are local evidence, not deployable application code or permanent monitoring.

## Security assessment

**Verified controls:** deny-all browser Firestore rules; anonymous live Firestore REST read returned 403; ten direct client read/write rejection checks passed in the rules emulator. Firebase Admin SDK bypasses these rules, so server authentication/roles and schema validation are the actual privileged boundary. Those boundaries were tested with unauthorized/editor/admin cases.

Sessions use HttpOnly cookies, verified identity and revocation checks. Mutations require same-origin requests and timing-safe CSRF comparison. Request size, identifiers, cursors, media ownership/type and schemas are validated server-side. Published projections prevent accidental draft disclosure; concurrency/revision conflicts return 409 rather than silently losing updates. Safe deletion and referenced-rootstock protection were exercised.

Cloudinary privileged signing stays on the server. Image URLs are allowlisted to the configured account; image and video poster delivery use bounded transformations. Raw HTML injection is not used for editable copy; structured JSON-LD escapes `<`. No exploitable XSS was reproduced. The PDF fallback has bounded parsing in an isolated worker; no claim is made that real antivirus/provider integration was exercised under the current Web3Forms Free mode.

**Credentials/dependencies:** scanned 82 production client JS/map files for the known configured privileged values and found none. `.env.local` is not tracked. Public Firebase configuration, Cloudinary cloud name and Web3Forms public form key are intentional public configuration. `npm audit` reported **0 known vulnerabilities** at assessment time; `npm ls` found no dependency-tree errors. This is not evidence against unknown vulnerabilities or inappropriate IAM roles beyond the tested operations.

**Residual defense-in-depth:** the production CSP permits inline scripts to support the current Next rendering configuration. A compatible nonce/hash policy would reduce XSS impact if an injection were introduced. No nonce refactor was attempted without deployment/cache compatibility testing. Production HTTP/TLS edge policy, credential rotation, broader organization IAM, account MFA enforcement and incident response were not independently proven.

## Media and visual preservation

The existing `AssetImage`, `ContentImage`, raw-image and reusable placeholder architecture remains. Missing/unapproved images use code-native placeholder icons, not local photographic fallback files. Cloudinary transformations request responsive widths, automatic quality/format and appropriate existing crop behavior. Dimensions/aspect ratios reserve layout space; loading/error states are covered by media tests and emulator/browser workflows.

The category registry is centralized in `features/media/categories.ts`: `banners/{home,varieties,mission}`, `apple-varieties`, `rootstocks`, `orchards`, `orchards/nurseries`, `laboratory`, `products/infrastructure`, `galleries/{home,field-work}`, `partners`, `videos`, `videos/posters`. Stable public IDs remain in the existing manifest and Firestore. No remote renames/reuploads or library reconfiguration were performed in this audit.

Intentional local assets remain: `app/opengraph-image.jpg`, brand/favicon/application icons, WOFF2 fonts and SVG/CSS sketches. OpenStreetMap tiles and YouTube previews are provider infrastructure. Legacy local-path strings remain as migration identifiers and redirects, not photographic file dependencies. Original image backups were retained. This report supersedes the earlier media report's outstanding production-runtime testing limitation; it does not rewrite that historical evidence.

## Verification results

| Check                                 | Result / limits                                                                                                                                                                                                                                                |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Production build                      | Passed on Node 22.23.4, Next 16.4.5, webpack; 29 static generation units; live Firebase access, no CMS-read-failure log in final build                                                                                                                         |
| Typecheck / lint / format             | All passed                                                                                                                                                                                                                                                     |
| Unit tests                            | **106 passed in 16 files**                                                                                                                                                                                                                                     |
| Production Chromium/WebKit Playwright | **67 passed, 3 intentionally skipped** in the final sequential run. WebKit skips the Chromium-only Axe run; both skip live inbox mutation checks against the externally supplied production origin.                                                            |
| Broad public browser matrix           | **52 engine/route cases, 364 viewport cases**: 26 routes in both Chromium and WebKit at 320/390/768/1024/1440/1920/2560px; all HTTP 200, no horizontal overflow or uncaught page errors in these cases                                                         |
| Catalog admin/emulator                | Add, edit, upload, draft/public isolation, publish, unpublish, restore, safe deletion, roles, reference conflicts, concurrent linking/deletion, pagination and persisted comparison passed; specific unpublish regression independently returned 409 after fix |
| Mission video workflow                | Section-based two defaults, add/remove, text, YouTube/Cloudinary selection, pause/error states, one-card full-row layout, draft/preview/publish and responsive checks passed                                                                                   |
| Partners workflow                     | Add/name/font/logo, reorder, remove/undo, draft/preview/publish, empty state, looping/reduced motion, invalid media and CSRF checks passed                                                                                                                     |
| Regional hubs workflow                | Add/edit/disable/re-enable/remove/undo, coordinate validation, map pin synchronization without recreation, publish, all-disabled/empty state and responsive checks passed                                                                                      |
| Web3Forms workflow                    | Both forms, phone/place validation, success animation, provider rejection, 429, network/timeout, no-JS fallback and no Firebase enquiry request under Free mode passed with intercepted responses; real inbox delivery untested                                |
| Firestore rules                       | Ten direct client denials passed in isolated rules emulator; live anonymous REST read denied                                                                                                                                                                   |
| Abuse/cleanup                         | Logical expiry, concurrent quota enforcement, window rollover, conditional deletion, cross-project guards, lease/bounds/cooldown passed in demo emulator                                                                                                       |
| Live connection                       | Verified Auth admin account exists/verified/enabled, Google provider enabled, 4 READY indexes, 7 indexed queries and all 12 published catalog entries                                                                                                          |
| Accessibility                         | Axe found only the documented leaf-text contrast category in the broad scan; keyboard/reduced-motion coverage exists. Automated passing with an exception is **not AA conformance**                                                                            |
| Firefox                               | Installed Playwright Firefox failed before page navigation: “Could not find profile folder,” including a launch-only retry with a plain temporary path. Firefox application behavior remains unverified in this assessment                                     |

Testing used no new packages. Early runs encountered ENOSPC and a later trace-file collision from concurrent runners sharing output. Only this audit's generated build caches and duplicate backup ZIP copies were removed to recover space; original project ZIPs and source/image backups were preserved. Final Chromium/WebKit results are from a sequential rerun. These infrastructure failures are not counted as successful application tests.

### Measured performance

Production build served locally. Three runs per route/profile. Mobile: 390 × 844, 4× CPU slowdown, 100ms latency, 1.6Mbps down / 750kbps up. Desktop: 1440 × 1000 without synthetic slowdown. Browser contexts were cold; origin/provider caches and concurrent host workload introduce variability. Values below are medians. They are lab observations, **not field p75 Core Web Vitals or certified INP**.

| Route    | Desktop LCP before | Mobile LCP before | Mobile CLS before | Sampled mobile interaction latency before |
| -------- | -----------------: | ----------------: | ----------------: | ----------------------------------------: |
| Home     |            1,260ms |           1,568ms |           0.00079 |                                      64ms |
| Products |              288ms |           1,608ms |                 0 |                                      64ms |
| Compare  |              316ms |             808ms |          0.000006 |                                      48ms |
| Mission  |              884ms |           4,472ms |           0.03724 |                                      56ms |
| Contact  |               64ms |           1,576ms |           0.00661 |                                      48ms |

After the Mission image fix: desktop LCP median **444ms**; mobile **2,188ms**, from runs 2,188 / 1,688 / 2,428ms. Mobile CLS remained **0.03724**. After-run sampled interaction latency was 96–104ms and total blocking time 99–111ms under concurrent host activity; this is not evidence of an interaction improvement. Baseline mobile transferred JS was approximately 266–324KB across these routes, as recorded by the measurement script; these bytes are observed resources rather than a universal bundle-size guarantee.

No physical-device study, real-user monitoring, sustained memory/soak test, production concurrency capacity test, actual monthly Firebase billing measurement or external uptime probe was performed. LCP/CLS samples are useful evidence; field INP, p75 and real traffic capacity remain unknown.

### Accessibility exception retained by instruction

The owner explicitly chose to retain `#8cc63f`. Measured contrast is approximately **1.87:1 on cream**, below even the **3:1 large-text** minimum (normal text requires 4.5:1). The broad scan recorded 183 affected nodes across 10 routes. This is a **verified High accessibility defect, accepted rather than fixed**. It can make headings difficult to read for people with low vision.

The regression test accepts only `color-contrast` nodes identified as the existing `accent-leaf` text with foreground `#8cc63f`, attaches the evidence and fails all other violations. It does not disable contrast testing site-wide. Any future color exception requires separate evaluation. [WCAG contrast minimum](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum), [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

## Ratings and weighting

| Dimension            | Score / 10 | Weight | Evidence / practical limitation                                                                                                                       |
| -------------------- | ---------: | -----: | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Architecture         |        8.3 |     9% | Clear App Router, feature, server and validation boundaries; large visual editor remains a maintenance concentration.                                 |
| Code quality         |        8.3 |     5% | Types, schemas and central utilities; lint passes. Some dense legacy modules still require careful review.                                            |
| Maintainability      |        8.0 |     5% | Reusable media/catalog/CMS primitives and setup documentation; several bespoke scripts are not automated in CI.                                       |
| Frontend             |        8.6 |     7% | Server-rendered public content and isolated interactive components; comparison races now covered by regressions.                                      |
| Backend              |        8.2 |     7% | Trusted validation, transactional updates, bounded requests and structured failures; provider outage operations remain unproven.                      |
| Database design      |        8.4 |     8% | Private editorial records, published projections, stable references and bounded indexed queries. Disaster recovery needs work.                        |
| Firebase integration |        8.4 |     5% | Live Authentication, Firestore and all four required indexes verified; Google login through the deployed domain was not exercised.                    |
| Security             |        8.2 |    10% | Server role checks, revoked-session verification, CSRF and deny-all client rules; CSP inline scripts remain an area for hardening.                    |
| Functionality        |        8.8 |     8% | Catalog, comparison, CMS, partners, mission videos, hubs and form workflows exercised; external email delivery was mocked.                            |
| UI/UX                |        8.7 |     5% | Distinctive existing design and motion retained; no unrelated redesign. This is an engineering assessment, not a user study.                          |
| Responsive design    |        9.0 |     5% | 364 route/viewport cases passed in Chromium/WebKit, plus dedicated mobile workflows; physical devices remain untested.                                |
| Performance          |        8.3 |     7% | Cached bounded reads and Cloudinary delivery; measured Mission mobile LCP improved. No field p75 data or sustained-load proof.                        |
| Accessibility        |        6.5 |     6% | Keyboard/reduced-motion checks and Axe coverage; owner-preserved leaf text fails minimum contrast, preventing AA conformance.                         |
| SEO                  |        8.3 |     3% | Metadata, canonical/social data, local OG/brand assets, robots and dynamic sitemap present; search indexing outcomes are unmeasured.                  |
| Scalability          |        7.8 |     4% | Pagination, cache invalidation, batched lookups and bounded maintenance fit this application; concurrent production traffic has not been load-tested. |
| Testing              |        8.2 |     3% | 106 unit tests and Chromium/WebKit suites plus emulator workflows; Firefox launch blocked locally and emulator scripts need CI orchestration.         |
| Production readiness |        7.6 |     3% | Production build and live reads pass; recovery, alerting, deployed OAuth and real-device/field verification remain release work.                      |

## Remaining findings and prioritized roadmap

These are deliberately separated from fixed defects. They do not imply that a vulnerability or outage has been observed where it has not.

| Priority / severity / status                                  | Evidence and consequence                                                                                             | Recommendation / regression risk                                                                                                                                                                                                                                |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1 · High · verified, owner accepted                          | `app/globals.css` accent-leaf color and Axe results: leaf text fails contrast on light backgrounds                   | Preserve exact shade as requested; document exception in release acceptance. A future compliant text shade needs owner authorization. Visual regression risk high if changed globally                                                                           |
| P1 · High · verified configuration, recovery unproven         | Live database reports deletion protection and point-in-time recovery disabled; no restore drill was demonstrated     | Owner should approve a backup/recovery policy and any paid capability, enable appropriate safeguards, retain a private off-machine backup and rehearse restoration. No paid feature or project change made here; cost/operational risk requires a concrete plan |
| P1 · Medium · unverified production operations                | No demonstrated deployed alerts, on-call route, provider outage response or real-domain OAuth run in this assessment | Run a staging/deployed smoke checklist with a real authorized Google account and one deliberate Web3Forms inbox delivery; configure error alerts and ownership. Avoid sending test mail to real users                                                           |
| P2 · Medium · verified policy weakness, no exploit reproduced | `next.config.ts` production CSP permits inline scripts                                                               | Evaluate compatible nonce/hash CSP with RSC/cache/provider flows and staging tests; medium regression risk to auth, hydration and embedded videos                                                                                                               |
| P2 · Medium · verified location, potential latency risk       | Firestore is `nam5`; audience is primarily Kashmir/India                                                             | Co-locate application compute deliberately, retain caching and measure deployed cross-region latency. Do not migrate the database region without a separately tested export/import/cutover plan; high migration risk                                            |
| P2 · Medium · coverage gap                                    | Firefox cannot launch locally; CI does not currently provision the full admin emulator fixtures                      | Run the existing three-engine CI on its supported host and wire guarded emulator workflows into CI with isolated projects/data. Medium test-infrastructure risk; do not weaken tests to obtain green                                                            |
| P2 · Medium · unmeasured capacity                             | No field p75 INP/LCP, sustained concurrency, quota exhaustion or recovery load test                                  | Add consent-appropriate real-user diagnostics and a bounded staging load/soak test with explicit read/write and Cloudinary budgets. Low code risk, meaningful cost risk if unbounded                                                                            |
| P3 · Low · maintainability risk                               | Large bespoke editor and historical migration utilities coexist with production code                                 | Document ownership and script prerequisites; only split modules when a concrete feature/test requires it. No cosmetic refactor warranted now                                                                                                                    |
| P3 · Low · future scale boundary                              | Prefix-only name search and 50,000-URL sitemap guard are explicit implementation limits                              | Keep these while adequate; partition sitemap or adopt search infrastructure only when real catalog size/use requires it. No immediate cost/complexity justified                                                                                                 |

### Release checklist

1. Rebuild the exact deployment source with the intended public environment and live Firebase access. Deploy only after reviewing this diff and operational decisions; no deployment was performed here.
2. Confirm deployed-domain Google sign-in, authorized admin vs ordinary user, draft privacy, actual one-message contact delivery, Cloudinary upload and publish invalidation on the deployed host.
3. Accept/document the contrast limitation, or separately authorize a compliant text treatment.
4. Approve backup/recovery and alerting ownership, verify deployment secrets/IAM and run a restore drill. Keep private audit evidence/backups off public hosting.
5. Run three-browser CI on a supported host and physical mobile smoke checks. Collect field performance before making p75/INP or traffic-capacity claims.

## Files changed in this assessment

Behavioral fixes:

- `features/catalog/server/store.ts`
- `features/catalog/ComparisonProvider.tsx`
- `features/catalog/Comparison.tsx`
- `features/cms/server/public.tsx`
- `app/api/admin/csrf/route.ts`
- `app/api/admin/content/[page]/route.ts`
- `components/pages/MissionTV.tsx`

Verification changes/new regression coverage:

- `tests/e2e/comparison.spec.ts` (new)
- `tests/unit/cms-cache.test.ts` (new)
- `tests/unit/csrf-token.test.ts` (new)
- `tests/e2e/audit.spec.ts`, `tests/e2e/site.spec.ts`, `tests/e2e/gallery.spec.ts`
- `scripts/check-catalog.mjs`, `scripts/check-regional-hubs.mjs`, `scripts/check-mission-videos.mjs`
- `.gitignore`, `.prettierignore`, `eslint.config.mjs`, `tsconfig.json`: isolated audit build-directory handling; `next-env.d.ts` is generated by Next type generation
- `docs/production-engineering-audit.md` (this report)

Formatting-only changes (runtime-equivalence guarded):

- `app/about/page.tsx`
- `app/admin/(desk)/page.tsx`
- `app/admin/login/page.tsx`
- `app/field-motion.css`
- `app/globals.css`
- `app/governance/page.tsx`
- `app/impact/page.tsx`
- `app/innovation/page.tsx`
- `app/layout.tsx`
- `app/mission/page.tsx`
- `app/page.tsx`
- `app/partnerships/page.tsx`
- `app/platform/page.tsx`
- `app/robots.ts`
- `app/zeebaran-hub/page.tsx`
- `components/CapabilityExplorer.tsx`
- `components/home/Hero.tsx`
- `components/home/Sections.tsx`
- `components/Logo.tsx`
- `components/Motion.tsx`
- `components/pages/about.tsx`
- `components/pages/governance.tsx`
- `components/pages/HistoryTimeline.tsx`
- `components/pages/impact.tsx`
- `components/pages/mission.tsx`
- `components/pages/NurseryEnquiry.tsx`
- `components/pages/OrchardGallery.tsx`
- `components/pages/partnerships.tsx`
- `components/pages/platform.tsx`
- `components/pages/products.tsx`
- `components/sections.tsx`
- `components/Timeline.tsx`
- `docs/cloudinary-media-audit.md`
- `eslint.config.mjs`
- `features/admin/PageEditor.tsx`
- `features/admin/server/cloudinary.ts`
- `features/catalog/admin/CatalogEditor.tsx`
- `features/catalog/PublicSections.tsx`
- `features/cms/Content.tsx`
- `scripts/instrument-content.mjs`
- `scripts/sync-catalog-media.mjs`
- `scripts/wire-pages.mjs`
- `tests/unit/mission-videos.test.ts`
- `tsconfig.json`
- `components/pages/hub.tsx`

`features/admin/MissionVideoFields.tsx` and the root ZIP archives were changed concurrently by the user during this audit. They were preserved and are **not claimed as this audit's fixes**. The baseline Git tree already contained extensive work from earlier tasks; a raw Git diff is therefore wider than this change list.

## Reproducibility and evidence

Local ignored evidence: `.local/production-audit/inventory-before.json`, `formatting.json`, `live.json`, `public-browser.json`, `performance.json`, `performance-after.json`, `reproductions*.json`, `database-reproductions.json`, `picker-race-{before,after}.json` and baseline source snapshots. Temporary logs under `/private/tmp/zeebaran-audit-*` cover build, lint, types, units, browser suites, catalog, Web3Forms, hubs, mission, partners, rules, rate limits and live checks. Logs are local evidence and may be purged by the OS; preserve them privately if long-term audit traceability is required.

Standard checks: `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `ZEEBARAN_BUILD_DIR=.next-admin npm run build -- --webpack`. Browser verification: `E2E_BASE_URL=http://127.0.0.1:3389 playwright test --project=chromium --project=webkit --workers=1`, against the separate production build. Demo-only scripts require their documented loopback emulator/project guards. Do not aim mutation checks at live production.

The installed Next documentation/source was consulted for caching and cookie behavior. Failure handling outside the cached callback follows the requirement that failed refreshes remain failures rather than successful fallback cache entries. [Next caching documentation](https://nextjs.org/docs/app/guides/caching-without-cache-components).

The practical next step is operational proof and coverage of the remaining risks, not another visual redesign or an unsupported 10/10 claim.
