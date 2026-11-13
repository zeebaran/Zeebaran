# Partnership profiles and engineering recheck — 13 November 2026

The requested partnership experience is implemented and verified. Balson and Feno Nursery, Italy have been added to the existing live CMS list with their supplied logos in Cloudinary. The current application is professionally structured, but the evidence does **not** justify a bug-free, universally fast, or unconditional production-ready claim. Weighted engineering assessment: **8.3/10**; architecture **8.7/10**; production readiness **7.8/10**, subject to the operational limitations below.

## Delivered experience

- Existing institutional partner entries and every partner in the moving logo strip open one shared profile dialog. The cream/forest palette, typefaces, small strip logos, existing page layout, illustrations and animations are retained.
- Profiles show the logo/name, category, heading, description, focus areas, commitment/vision and closing statement. The complete supplied Balson and Feno material is retained, including five and six focus areas respectively. Their relationship claims are owner-supplied copy, not independently certified contracts.
- Existing partners use their already published category/focus information. Where detailed approved information was unavailable, the dialog uses a restrained contact-oriented description; it does not invent an exclusive relationship or deliverables.
- Existing **Partners** admin controls now include a collapsed **Partnership profile** editor for each managed strip entry: category, heading, paragraphs, focus areas, commitment and closing. Existing add/remove/reorder, fonts and logo selection continue to work. Draft preview and publish use the same CMS model.
- Native modal semantics, initial close-button focus, explicit Tab/Shift-Tab cycling, Escape, backdrop dismissal, restored opener focus and body-scroll restoration are implemented. Marquee duplicates remain outside keyboard/assistive-technology navigation; visible copies still open the same profile.
- The strip pauses while a profile is open. The dialog uses a short opacity/transform entrance. Reduced motion disables both. No animation package was added.
- Profile opening uses the page's loaded CMS snapshot: browser checks of every partner recorded **zero API/Firestore requests during profile opening/closing**. No per-partner listener or collection was introduced.

The earlier requested CTA work is also complete: the Home closing overlay is 93% white; public main buttons have a single subtle surface sweep, two-pixel lift, restrained press feedback and keyboard treatment. Touch and reduced-motion behavior were checked. Button wording, destinations and owner-selected colors were preserved.

## Live data and asset preservation

An additive, guarded import backed up the original Partnerships document before writing. Both draft and published lists independently retain their existing six entries and append the two new entries. A subsequent live read verified **all previous partners and all other content unchanged** in both snapshots. Each updated content snapshot is approximately **6.8 KB**, below the existing 240 KB content limit.

| Partner             | Cloudinary asset folder | Public ID                                     | Delivery/registration                      |
| ------------------- | ----------------------- | --------------------------------------------- | ------------------------------------------ |
| Balson              | `zeebaran/partners`     | `zeebaran/partners/balson-d980163b901c`       | HTTP 200; matching `cmsMedia` registration |
| Feno Nursery, Italy | `zeebaran/partners`     | `zeebaran/partners/feno-nursery-4c623957e271` | HTTP 200; matching `cmsMedia` registration |

Original attachments remain untouched. Deterministic content hashes, non-overwriting uploads and ID-based additive merging make re-running the import idempotent for the supplied entries. Existing manual entries are never replaced on a repeated import. Logo rendering uses the existing Cloudinary delivery/error utility, including responsive format/quality transformation and contained aspect ratios. Brand, favicon and OG assets remain in the project.

Backup: `.local/partner-profiles/before-1794526648283.json`. Verification: `.local/deep-review/partner-live-verification.json`. The import is an explicit owner-requested data update; application code has **not** been pushed or deployed.

## Verified issues and corrections

| Severity / priority | Finding and evidence                                                                                                        | Correction                                                                                                            | Regression risk / verification                                                                                                            |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Medium / P1         | Partner marks and institution entries previously offered no profile interaction                                             | Shared provider/dialog and clickable entries, preserving visual markup                                                | Scoped to Partnerships; every distinct displayed partner exercised in Chromium and WebKit                                                 |
| Medium / P1         | New native dialog keyboard sequence could leave focus on the document/browser surface; WebKit also skipped the enquiry link | Opt-in explicit keyboard cycling on the shared Dialog; existing dialog callers retain their previous default behavior | Cross-browser cycling, Escape, backdrop and focus restoration verified; both strategic dialogs have zero automated WCAG-tagged violations |
| Medium / P1         | New profile enquiry URL initially used `reason=partnership`, absent from the contact schema                                 | Route to the existing `collaboration` channel                                                                         | Browser test clicks through and verifies the contact select value                                                                         |
| Low / P2            | Requested Home overlay and CTA interaction treatment was incomplete                                                         | 93% overlay plus shared CSS motion                                                                                    | Five named actions, eight page CTA groups, responsive layouts, touch navigation, reduced motion and white labels verified in both engines |

Some initial QA failures were test setup issues: label locators included textarea contents, the existing publish-confirmation step was initially omitted, and concurrent Playwright invocations collided in their default trace directory. The affected tests were corrected/re-run in isolated output directories. Those failures are not counted as application defects or successful checks.

No destructive cleanup, dependency upgrade, authentication relaxation, database migration or broad refactor was performed. Existing working-tree changes were retained. The existing unit suite was preserved and new profile tests were added separately.

## Architecture and database review

The existing feature structure remains appropriate: public page compositions; shared CMS/media/settings contracts; server-only Firebase Admin access; protected admin APIs; separate private catalog drafts and public projections; transactional revision checks and media ownership validation. The new profile fields extend the existing bounded partner object, rather than adding a second data system.

Current live observations:

| Check                                   | Result                                                                                                                                        |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Firebase project/database               | `zeebaran085`, native Firestore, location `nam5`                                                                                              |
| Catalog                                 | 12 private entries / 12 public projections; no missing published rootstock references in the inspected set                                    |
| CMS / media                             | 5 CMS page documents / 61 media registrations at inspection time                                                                              |
| Catalog indexes                         | All 12 returned private/public composite indexes READY, including harvest-filter ordering shapes                                              |
| Administrator                           | Intended account exists, verified, enabled                                                                                                    |
| Direct unauthenticated database request | HTTP 403                                                                                                                                      |
| Deployed rules                          | Catch-all deny direct client reads/writes; text differs from local comments/redundant explicit deny blocks, effective examined posture agrees |
| Catalog image account                   | All inspected published images use the configured Cloudinary account                                                                          |
| Database deletion protection / PITR     | Both disabled; unchanged by this task                                                                                                         |

Privileged access remains enforced by server session/role checks and IAM: deny-all client rules do not restrict the Admin SDK. Profile content is plain React-rendered text, not injected HTML. Strict nested validation rejects unknown fields, oversized strings, invalid focus rows and excess rows. Logo provenance is checked through the existing registered-media transaction path; server content-size and revision limits remain in force. The isolated workflow verified invalid data returns 422 without changing the revision, and existing revocation/concurrency tests pass.

Public CMS reads remain cached for 60 seconds; catalog reads for 300 seconds. Publication invalidates the relevant cache tags. Typing and dialog interaction do not write anything. Explicit save/publish operations intentionally update content/history/audit and applicable rate counters. Media verification is per distinct registered asset in the transaction; batching documents does not make multiple billed reads into one. No Firestore realtime listener was found in the inspected application source. Paginated catalog/media routes, request coalescing, retained previews, bounded history summaries and entry-time freshness checks were retained.

Browser request counts are **not** a billed Firestore read/write-volume measurement. No production traffic dashboard or sustained workload was available, so monthly free-tier usage/capacity cannot be certified. Inspect actual deployment metrics before increasing catalog size or traffic substantially.

## Admin performance investigation

The production build was profiled against loopback Auth/Firestore emulators across all **18** sidebar destinations, twice. This isolates UI/router behavior from remote provider latency. Existing anti-waterfall work, pending-GET deduplication, intentional workspace prefetching, dirty-draft preservation and retained preview frames remain verified; no new multi-second local rendering bottleneck was reproduced.

| Local navigation pass                | Workspace render p50 / p95 | Preview-ready p50 / p95 |
| ------------------------------------ | -------------------------- | ----------------------- |
| Initial measured pass, immediate     | 57 / 112 ms                | 146 / 282 ms            |
| Initial measured pass, intent-warmed | 46 / 64 ms                 | 142 / 228 ms            |
| Final measured pass, immediate       | 56 / 95 ms                 | 145 / 314 ms            |
| Final measured pass, intent-warmed   | 45 / 62 ms                 | 140 / 226 ms            |

These are samples, not a statistically established speedup. Final-pass browser script work was at most 53 ms and layout work at most 16 ms per sampled navigation. Thirty-six navigations made 15 private API requests with observed response times of 10–33 ms; RSC server work is additional. No page exceptions were recorded. Local QA processes also ran during the final pass, so these are diagnostic measurements rather than an isolated benchmark SLO.

After garbage collection, the navigation sample changed heap from 3.71 MB to 3.95 MB, DOM nodes from 511 to 514 and event listeners from 365 to 353 after returning to Overview. This does not show an accumulating listener/tree leak in the sampled pass; a short run cannot prove the absence of all memory leaks or measure exact React render counts. No profiling React build or deployed React trace was available, so speculative memoization was avoided.

Three **live, read-only** provider samples from this machine:

| Sample                              | Firestore document read | Auth lookup |
| ----------------------------------- | ----------------------- | ----------- |
| Cold credentials/transport included | 2,062 ms                | 925 ms      |
| Shared clients, next sample         | 407 ms                  | 413 ms      |
| Shared clients, next sample         | 1,064 ms                | 372 ms      |

Remote provider round trips remain a verified contributor to cold admin latency. These are not full deployed navigation measurements. Keep immediate revocation checks; measure the deployed application near the existing database before choosing a hosting/location change. No database move was attempted, and no stale private-data cache or weakened auth was introduced merely to hide latency.

## Public performance and accessibility

Ten synthetic samples covered Home, Products, About, Contact and Partnerships at 390 and 1440 px. Unthrottled local production measurements recorded LCP observer values of **100–508 ms**, CLS **0** and no observed long tasks in the sample windows. Reused contexts allow browser caching/prefetching; these results do not represent a cold mobile network, real-user Core Web Vitals or a capacity/load test. Recorded assistant interaction events were 48 ms; this is **not field INP**. New profile opening itself does not fetch data.

Both strategic dialogs had zero violations in the automated WCAG 2/2.1/2.2 A/AA-tagged checks. The wider public-page accessibility check passed with the previously approved `#8cc63f` text exception explicitly retained. Full WCAG AA conformance is therefore not claimed; the owner's contrast preferences and earlier documented white/orange contrast limitation remain. Automated checks do not replace assistive-technology and physical-device evaluation.

## Verification record

- Optimized production build and TypeScript: passed. Build used an isolated directory and demo emulator configuration; no deployed build was replaced.
- ESLint: passed with generated verification output excluded. Scoped formatting and `git diff --check`: passed.
- Unit suite: **220 tests / 32 files passed**, including preserved legacy partner tests plus three new profile tests.
- Broad public regression suite: **100 successful checks** across Chromium/WebKit after re-running three trace-artifact collisions. Two harvest checks in that suite were intentionally gated; both were subsequently enabled and passed.
- Partner/admin/harvest suite: **9 passed**, one intentional WebKit skip for the emulator admin publishing test. Covers all partner dialogs, 360/390/768/1440 layouts, actual logo loading, focus restoration/cycling, backdrop dismissal, zero dialog data requests, enquiry routing, draft save/preview/publish and trusted validation.
- Admin navigation/catalog regressions: **11 passed**, including revoked sessions, history restoration, freshness races, retained frames, duplicate-save guards and media pagination.
- Public automated accessibility: passed with the approved brand exception. Both new profile dialogs: zero automated violations.
- Separate motion checks: requested CTA behavior and new strip/dialog motion passed in Chromium/WebKit, including reduced motion.
- Production dependency advisory check: **zero reported vulnerabilities** from `npm audit --omit=dev`; no packages were changed. This is not proof that all vulnerabilities are absent.

Evidence is retained under ignored `.local/deep-review/`: `partner-build-final.log`, `partner-lint-verified.log`, `partner-types-verified.log`, `partner-format-verified.log`, `partner-unit-verified.log`, `partner-public-regressions.log`, `partner-public-retry.log`, `partner-complete-browser.log`, `partner-admin-regressions-final.log`, `partner-a11y.log`, `partner-profile-axe.json`, `partner-motion.log`, `action-motion-browser-final.log`, `partner-admin-latency*.json`, `partner-public-metrics.json`, `partner-live.json`, `partner-live-latency.json`, `partner-live-verification.json`, `partner-dependency-audit.json` and the partner screenshots.

## Remaining risks and priority roadmap

| Severity / priority | Verified fact or limitation                                                                                                                  | Action                                                                                     | Change/regression considerations                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| High / P1           | Live deletion protection and PITR disabled; recovery drill not proven                                                                        | Owner approves/configures appropriate protection, backup retention and a restore drill     | Recovery/billing/IAM decision; source backups do not establish database recovery                  |
| Medium / P1         | Measured live provider latency and no deployed navigation p95                                                                                | Confirm hosting placement, collect deployed auth/database/RSC timings and error monitoring | Do not trade revocation, privacy or consistency for a faster-looking screen                       |
| Medium / P2         | Owner-preserved contrast failures                                                                                                            | Revisit only if appearance changes are authorized                                          | Current exact colors intentionally preserved                                                      |
| Medium / P2         | Real OAuth browser sign-in, physical-device voice permissions, delivered mail, sustained traffic and real-user INP not certified by this run | Exercise live external/device flows and establish monitoring/load evidence                 | Emulator/mocked provider regressions verify application logic, not every external service outcome |
| Low / P2            | Legacy partner details are limited to existing published category/focus                                                                      | Administrator supplies any further approved profile copy                                   | Avoid unsupported affiliation or contractual claims                                               |
| Low / P3            | Large editor modules and duplicated authored institutional presentation remain maintainability debt, not reproduced runtime failures         | Split only when feature work/profiling justifies it                                        | No speculative deletion/refactor during this review                                               |

## Honest engineering assessment

| Dimension           | Score | Weight | Evidence / practical limit                                                                                         |
| ------------------- | ----- | ------ | ------------------------------------------------------------------------------------------------------------------ |
| Architecture        | 8.7   | 10%    | Shared feature contracts, server boundaries, draft/public projections                                              |
| Code quality        | 8.6   | 7%     | Typed bounded models and passing checks; editor complexity remains                                                 |
| Maintainability     | 8.5   | 5%     | Reusable media/settings/dialog/profile paths; operational discipline still needed                                  |
| Functionality       | 8.8   | 10%    | Exercised public/admin workflows; external/device limits remain                                                    |
| UI/UX               | 8.9   | 5%     | Preserved brand, usable profiles and responsive interaction states                                                 |
| Responsive design   | 8.8   | 5%     | Broad viewport/browser checks; physical-device coverage limited                                                    |
| Performance         | 8.4   | 10%    | Fast sampled local navigation, bounded reads; live latency remains                                                 |
| Security            | 8.2   | 12%    | Server authorization/CSRF/revocation/validation and denied direct access; no independent penetration certification |
| Firebase/database   | 8.5   | 10%    | Live indexes/references/media verified; recovery incomplete                                                        |
| Accessibility       | 7.2   | 6%     | Passing exercised semantics/dialogs, known preserved contrast failures                                             |
| SEO                 | 8.5   | 5%     | Existing metadata/sitemap/semantic implementation retained; search outcomes unverified                             |
| Testing             | 8.7   | 8%     | Broad unit/cross-browser/emulator workflows; no exhaustive production traffic coverage                             |
| Operations/recovery | 6.5   | 7%     | No proven restore drill, deployed SLO monitoring or sustained load evidence                                        |

Weights total 100%; weighted result rounds to **8.3/10**. Supplementary assessments: frontend 8.8, backend 8.5, scalability 8.2, Firebase integration 8.5, production readiness 7.8. The implementation is substantially verified and maintainable. Unconditional enterprise reliability, full accessibility conformance, unlimited free-tier capacity and the absence of every possible bug/lag remain unproven.

## Source changes for this request

Partnership implementation: `app/partnerships/page.tsx`, `components/pages/partnerships.tsx`, `components/partners/{PartnerProfiles.tsx,PartnerMark.tsx,PartnerStrip.tsx,partner-profile.module.css,partner-strip.module.css}`, `features/cms/{partners.ts,partner-profiles.ts,strategic-partners.json}`, `features/admin/{Dialog.tsx,PartnerFields.tsx,partner-fields.module.css}`, scoped research-button rules in `app/globals.css`, and `scripts/import-strategic-partners.mjs`. Tests: `tests/unit/partner-profiles.test.ts`, `tests/e2e/{partners.spec.ts,partner-admin.spec.ts}`.

Continued CTA work: `app/action-motion.css`, its `app/layout.tsx` import, shared public Button/Nav/enquiry links and action classes in Home/public page CTA components; Home overlay opacity in `components/home/Sections.tsx`. Other pre-existing changes in the dirty working tree were preserved and are not all attributed to this review.
