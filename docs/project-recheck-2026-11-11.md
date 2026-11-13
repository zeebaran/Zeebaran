# Project recheck — 11 November 2026

## Result

Two additional admin defects were reproduced and fixed. The tested public workflows passed. This is a targeted regression review of the current working tree, not a guarantee that every possible state is bug-free or a fresh certification of all deployed infrastructure.

Existing manual changes, colors, typography, sketches, animations, page content and layouts were preserved. No dependencies were installed or updated, no deployment or Git push was performed, and no live catalog/CMS fixtures were written. Admin mutations used guarded disposable Firebase emulators; public tests read the actual local website and intercepted form delivery, so no real email was sent.

## Verified defects and fixes

| Finding                                              | Severity | Reproduction                                                                                                                                                                                                                                     | Fix                                                                                                                                                                                                 | Regression evidence                                                                                                                                                                     |
| ---------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repeated page-save clicks send overlapping mutations | Medium   | Two synchronous clicks on Save draft produced two POST requests before the disabled state rendered. The server transaction protects stored revisions, but the duplicate request adds work and can return a conflict alongside a successful save. | `features/admin/PageEditor.tsx`: an immediate ref guard covers save, publish and restore. It releases in `finally` after success or failure. Validation and revision transactions remain unchanged. | Rapid clicks now send one request; an injected failure preserves draft text, unlocks retry and a subsequent real emulator save succeeds. The existing history-restore test also passes. |
| Catalog sidebar loses active-section indication      | Low      | Both `/admin/catalog?kind=variety` and `?kind=rootstock` rendered zero sidebar links with `aria-current="page"`. `usePathname()` excludes query parameters, but the old code compared it against the full query-bearing href.                    | `features/admin/AdminShell.tsx`: compare the pathname and catalog kind separately using `useSearchParams()`. The fallback matches the catalog page's default variety selection.                     | Actual route navigation now marks exactly the selected sidebar link; tests cover default varieties, switching to rootstocks and switching back.                                         |

Regression risk is low: the changes affect duplicate-request prevention and sidebar selection, with no schema, permissions, database-query or visual-layout changes.

## Checks executed

- **176 unit tests in 23 files passed.** Covers CMS/catalog validation, media delivery/error states, contact submission, assistant behavior, settings validation and API boundaries, shared cache behavior, private request deduplication, CSRF, rate limits and regional hubs.
- **85 public browser tests passed in Chromium/WebKit; 3 intentionally skipped.** Covers responsive pages at 14 widths from 320–1920 px, menu/keyboard behavior, galleries, comparison persistence and selection races, contact validation and intercepted success/error responses, no-JavaScript privacy, fonts/motion, assistant lazy loading, conversation state, speech mocks and error recovery. Skips were the local-only real inbox-write tests and duplicate WebKit accessibility scan.
- **10 admin browser tests passed against the production build with disposable Auth/Firestore.** Covers private pagination races, original-image deduplication, media empty states, retained preview state, no public-route prefetch, stale workspace refresh, preservation of unsaved edits, revocation, history projection/restore and the two new regressions.
- **10 direct Firestore reads/writes were denied** by the actual rules in a separate rules emulator, covering catalogEntries, catalogPublished, catalogAudit, catalogAssets and cmsMedia.
- **Production build, TypeScript, lint, formatting and Git whitespace checks passed.** The first new regression test required an explicit HTMLButtonElement cast; that test typing was corrected before the successful build.
- **Production dependency advisory audit: zero known advisories reported.** This is an advisory lookup, not proof that dependencies have no undiscovered vulnerabilities.
- A narrow built-client scan found no PEM private-key blocks or service-account private_key_id material. Only `.env.example` is tracked among environment files; this scan is not a comprehensive secret-detection guarantee.

The admin freshness test waits for production prefetch, which Next.js does not perform in the same way in development. An initial development-mode attempt was stopped at that wait; the complete suite was then rerun successfully against the production build. No interrupted run is counted as passing.

## Evidence

Local command output is retained under `/private/tmp/`:

- `zeebaran-recheck-browser.log`
- `zeebaran-recheck-admin-tests-final.log`
- `zeebaran-recheck-rules.log`
- `zeebaran-recheck-unit-final.log`
- `zeebaran-recheck-build.log`
- `zeebaran-recheck-lint-final.log`
- `zeebaran-recheck-format.log`
- `zeebaran-recheck-dependencies.json`

## Remaining limitations

- The explicitly preserved `#8cc63f` text remains a known contrast exception. Automated accessibility results do not imply complete WCAG 2.2 AA compliance or replace screen-reader/manual testing.
- Firefox, physical devices, real microphone recognition, actual outbound email, live media uploads and deployed infrastructure/load behavior were not freshly tested in this pass.
- No new production Core Web Vitals or load measurements were collected. Local browser/build success is not proof of production latency, recovery, capacity or unlimited free-tier usage.
- Earlier operational findings about recovery protection, backups and monitoring in `fresh-production-readiness-review.md` were not reconfigured or independently revalidated here.

No additional confirmed failures remain in the workflows exercised by this recheck. Further bugs outside those tested states remain possible.
