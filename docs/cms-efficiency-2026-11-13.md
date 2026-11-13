# CMS saves and revision retention

Changes apply to the page workspaces under `/admin/pages/*`. Existing visual design, draft preview, authentication, CSRF checks, media validation, revision conflict detection and publication cache invalidation are preserved.

## Reads and saves

- Page mutation responses contain `{ record }`; they no longer query or return history. A normal save avoids fetching up to 20 history summaries.
- The existing history endpoint remains authenticated. The editor fetches its summaries only when Revision history is opened and reuses them until the page revision changes. A revision-specific request key prevents an older pending history response being reused after a mutation.
- Unchanged drafts and already-published content disable their respective actions. A saved draft that differs from the live content remains publishable. The synchronous pending-request guard prevents double clicks and resets after errors.
- Server-side content equality ignores object-key order while preserving ordered arrays and explicit image removals. Unchanged submissions create no page update, revision snapshot or CMS audit entry. Authentication, rate limiting and media verification still run; a direct redundant API request is not entirely free of Firestore operations.
- First publication is allowed even with empty overrides. Stale revision numbers still return 409 before the no-op check.

## Retention

After a successful mutation above revision 20, a Next.js `after` task performs one transaction scoped to that page's history. It keeps the latest 20 sequential revisions plus the current and previous publication snapshots when outside that window (normally at most 22 snapshots). Keeping the previous live publication protects rollback after many draft edits.

The query uses the existing single-field revision index, no offsets and no collection-wide scan. It reads at most 26 candidate summaries and deletes at most 25 old snapshots per task. A large pre-existing backlog is reduced gradually on subsequent successful mutations, rather than deleted in one large operation. Reading the page inside the cleanup transaction protects a concurrent publication from being pruned using stale metadata.

New publications store their history ID and the previous publication timestamp. Legacy publication snapshots are identified by the exact timestamp shared with their page document. Missing legacy timestamp metadata fails closed by retaining publication snapshots. Revision history includes pinned publications even if older than the latest 20 entries.

Cleanup never deletes the current draft, live content, media-library registrations, Cloudinary assets, catalog records or CMS audit metadata. Full old draft snapshots outside the retention window are permanently removed when cleanup runs; retained revisions remain restorable. Cleanup failures are logged as `cms.history_cleanup_failed` and do not turn a successfully saved revision into a failed response. A subsequent successful mutation tries again. No scheduled job, TTL billing feature or dependency was added.

No live Firebase migration or bulk cleanup was performed during implementation. The new policy takes effect on future qualifying saves/publications.

## Verification

Unit tests cover content equality, unchanged writes, first publication, authenticated history access, CSRF rejection, metadata-only mutation responses, bounded cleanup and protection of publication snapshots. The guarded `tests/e2e/cms-efficiency.spec.ts` requires project `demo-zeebaran-admin`, Auth `127.0.0.1:9098`, Firestore `127.0.0.1:8395` and an explicit local test origin. It verifies real UI double clicks, saved-draft publication, lazy history, backend no-ops, a 61-revision legacy backlog, protected rollback, concurrent conflicts, republishing and unrelated data preservation. It never targets the live project.

Verified on 13 November 2026: all 242 unit tests passed; the two new emulator workflows passed in both Chromium and WebKit (4 browser checks). Three existing admin performance regression checks also passed in Chromium. ESLint, TypeScript and `git diff --check` passed. An isolated production build using `next build --webpack` passed. No live Firebase data or user development server was changed during these checks.
