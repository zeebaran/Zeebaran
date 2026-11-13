# Media deletion and form UI verification — 12 November 2026

Implemented in the existing checkout, preserving the pre-existing working tree, page layouts, fonts, colors, animations, brand assets and public content. No dependency installation, live-content deletion, Git commit, push or deployment was performed.

## Admin behavior

- **Media library → Delete** checks current page drafts, published pages, catalog drafts, retained published versions, and catalog Trash. Referenced files show their usage instead of allowing destructive deletion. Original source-managed fallback photos are protected.
- Unused images and videos require exact filename confirmation. The server calls Cloudinary's signed `destroy` endpoint with CDN invalidation, removes the file's registrations from `cmsMedia` and `catalogAssets`, and removes that file's references from saved page revisions. Revision text, card descriptions and other images remain intact.
- Provider/database failures leave a non-selectable **Deletion pending / Retry deletion** entry. Retrying accepts Cloudinary's `not found` response and finishes database cleanup. Registry metadata is removed last.
- Catalog Trash retains **Restore as draft** and now offers administrators **Delete permanently**. Permanent deletion removes the entry, public document, catalog audit events and nested subcollections. The optional checked cleanup removes unused photos through the same protected media endpoint. Shared/original files are kept; failed cleanup is explicitly reported for retry in Media library.
- Rootstocks required by varieties, including varieties in Trash, cannot be permanently removed.
- Removing a member, partner or image placement is distinct from deleting a shared media file. Publish the removal/replacement, then delete the now-unused file in Media library.

## Confirmed defects fixed

| Issue                                                             | Fix                                                                                                                                           |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Select focus outline overlapped its label                         | Added the missing label-to-select spacing and consistent two-pixel outline offset.                                                            |
| View-only media cards appeared disabled/faded                     | Cards are semantic articles; only picker interactions use buttons.                                                                            |
| Mobile Media library overflowed by 39 pixels                      | Prevented the hidden upload input from inheriting full-width input styling. Keyboard users use the visible Choose button.                     |
| Pagination depended on a potentially deleted final row            | Cursor contains timestamp and document ID; legacy cursors still work.                                                                         |
| Content could pass validation immediately before a media deletion | Unique registrations are read inside the actual content transaction; missing/deleting files cannot be attached, saved, published or restored. |
| Catalog deletion only moved records to Trash                      | Added explicit permanent deletion with child-document cleanup and exact-name confirmation.                                                    |

Catalog mutations also avoid the former redundant pre-transaction entry read. Save/publish transactions read sorted media registrations before the owning content document. The deliberately simultaneous save/delete test still exercised Firestore’s automatic conflict retry (4.2 seconds end to end in the emulator, including provider work); this is recorded rather than claimed as zero-latency concurrency. Media registration checks are deduplicated into one batch per content transaction. No new listeners, polling, schema migration, query indexes or background visitor requests were introduced.

## Verification

- Production build, TypeScript check, ESLint and whitespace checks passed.
- 206 unit tests passed, including signed provider requests, idempotency, media reference handling, provider failure, database cleanup failure and retry behavior.
- 10 new end-to-end media workflows passed against isolated Firebase Auth/Firestore emulators and newly created disposable Cloudinary images/videos.
- 11 existing admin catalog/editor/navigation regression tests passed.
- 57 views at 390, 768 and 1440 pixels were inspected for horizontal overflow and overlapping form focus outlines: no remaining failures in those checks (3,387 control inspections).
- Real provider upload, registration and deletion were exercised. Attempts to re-register destroyed image/video originals failed provider verification. A separate read-only Cloudinary inventory check found no remaining QA assets.
- Tests covered administrator/editor/anonymous permissions, CSRF, active-content protection, historical media cleanup while preserving copy, pending-file attachment rejection, concurrent attachment/deletion, physical Firestore child/audit cleanup, rootstock relationships in Trash, page save/publish and pagination after deletion.

Evidence is retained locally under `.local/deep-review/media-*` (ignored, not intended for Git).

## Cost, scope and limits

Usage audits run only when inspecting/deleting a file, not during ordinary media listing or page navigation. They currently read bounded snapshots of the three content collections (maximum 1,000 documents per collection); deletion fails closed above that limit. This avoids a new reference-index migration for the present small catalog. At substantially larger scale, backfill an indexed media-reference projection before increasing the limit. History cleanup reads revisions in batches of 100 only during permanent file deletion; those reads/writes count toward Firebase usage.

Provider operations and Firestore are separate systems: they cannot be one distributed transaction. The retained deleting state, transactional attachment checks, idempotent provider deletion and retry controls handle partial completion. Very large histories or nested subcollections can require another retry after a host/request deadline; restore/edit stays blocked during a catalog purge.

No existing live Firebase document was deleted for QA. Firebase integration behavior was verified with the real Admin SDK against disposable emulators; this does not claim a new live IAM/deletion test or a deployment. Existing live photos were preserved. The library manages registered media; it does not indiscriminately discover/delete unregistered provider assets, automated YouTube poster imports or backups.

Cloudinary CDN invalidation propagates asynchronously, and any separately enabled Cloudinary backup retention is outside this deletion flow. See [Cloudinary destroy documentation](https://cloudinary.com/documentation/image_upload_api_reference#destroy_method). Firestore subcollections need explicit cleanup, which the catalog purge performs; see [Firestore deletion documentation](https://firebase.google.com/docs/firestore/manage-data/delete-data).

These results verify the specified workflows and checks; they are not a guarantee that the entire application has no defects.

## Implementation locations

- Admin controls: `features/admin/MediaLibrary.tsx`, `MediaUpload.tsx`, `DeleteMediaDialog.tsx`, `app/admin/admin.css`, and the Media/Catalog admin route pages.
- Media API and provider boundary: `app/api/admin/media/route.ts`, `app/api/admin/media/delete/route.ts`, `features/admin/server/cloudinary.ts`.
- Reference safety and cleanup: `features/media/references.ts`, `features/media/server/registration.ts`, `features/media/server/deletion.ts`.
- Content/catalog consistency: `features/cms/server/store.ts`, `features/catalog/server/store.ts`, `features/catalog/server/purge.ts`, `app/api/admin/catalog/[id]/route.ts`.
- Catalog controls: `features/catalog/admin/CatalogIndex.tsx`, `PurgeEntryDialog.tsx`.
- Regression coverage: `tests/e2e/media-management.spec.ts`, `tests/unit/media-deletion.test.ts`, `tests/unit/media-deletion-store.test.ts`, `tests/unit/cms-media-validation.test.ts`.
