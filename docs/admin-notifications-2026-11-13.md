# Admin completion notifications — 13 November 2026

Added one shared, lightweight snackbar to the authenticated editorial desk. Existing page layouts, typography, content, authorization and database workflows are preserved.

## Coverage

- Every page workspace: draft saved, published, revision restored; validation and operation failures.
- Varieties and rootstocks: save/create, publish, unpublish, move to deleted items, restore, permanent deletion and media cleanup results.
- Media library and embedded upload pickers: image/video upload completion after server verification, file deletion, validation and upload failures.
- Contact & social settings: save, manual reload and errors.
- Admin loading/sign-out failures use the same visible feedback. Local draft edits are not labelled as saved until persistence succeeds.

## Behaviour and implementation

`features/admin/notifications.ts` provides a client-only event and stable feedback hook. `features/admin/AdminSnackbar.tsx` is mounted once in `AdminShell`; updates do not propagate through a context to the page editor tree. New completed actions replace stale feedback immediately. Duplicate reports within 500 ms are suppressed.

The compact cream/forest-green card appears at the bottom right on desktop, with safe margins on mobile. It has a 44 px dismiss control, a restrained entrance animation and reduced-motion support. Success notices dismiss after six seconds; errors after ten seconds. Hover or keyboard focus pauses dismissal. Contextual errors remain in the relevant form.

A browser top-layer popover keeps notifications visible. When a modal is active, the snackbar portals into that dialog so it is not made inert. A temporary observer watches only the dialog and its ancestor chain, then disconnects when the notification changes or disappears. Lifecycle guards prevent calls on detached elements when a dialog closes. No focus is stolen.

The notification system makes no network requests, Firebase reads/writes, persistent storage writes or new subscriptions to external services. No package was added.

## Verification

- Production build and TypeScript checks passed.
- Targeted ESLint passed without warnings; formatting and diff whitespace checks passed.
- Entire unit suite: 230 passed across 35 files.
- Browser suite: 15 passed; seven existing Chromium-only regression tests intentionally skipped in WebKit. All eight new notification checks ran across Chromium and WebKit.
- Verified real CMS draft save/publish and settings save/reload against disposable Firestore/Auth emulators; existing catalog and Podcast regression workflows also passed.
- Verified simulated upload/registration/deletion completion and failures using intercepted provider/API responses. These tests did not upload or delete live Cloudinary files.
- Verified mobile snackbar and dismiss control fit a 320 px viewport, duplicate suppression, automatic expiry, hover pause, route persistence, and errors above native modal dialogs. Desktop/mobile screenshots were inspected.

Browser testing caught modal pointer blocking and a detached-popover lifecycle error; both were fixed and the full selected suite rerun successfully. Repeated test sign-ins reached the existing emulator login limit; only disposable emulator counters were reset. Production rate limits and security settings were not changed.

## Files changed for this request

New: `features/admin/notifications.ts`, `features/admin/AdminSnackbar.tsx`, `features/admin/admin-snackbar.module.css`, `tests/e2e/admin-notifications.spec.ts`, this report.

Integrated: `features/admin/AdminShell.tsx`, `PageEditor.tsx`, `MediaUpload.tsx`, `MediaLibrary.tsx`, `DeleteMediaDialog.tsx`, `ContactSettings.tsx`; `features/catalog/admin/CatalogEditor.tsx`, `CatalogIndex.tsx`, `PurgeEntryDialog.tsx`.

No live content was published, removed or altered during this request's automated tests. This is verification of the notification feature and selected regressions, not a claim that every unrelated project workflow has been retested.
