# Product and rootstock catalog

The catalog replaces the former runtime imports of `PRODUCTS` and `ROOTSTOCKS`. Public listings, profiles, counts, rootstock choices, comparison selectors and product sitemap URLs read Firestore. An unavailable database produces an unavailable state; there is no hardcoded or synthetic catalog fallback.

## Records and consistency

| Collection                           | Responsibility                                                                                                                                  |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `catalogEntries/{slug}`              | Private authored draft, revision, type, publication/deletion flags, normalized sort name and the union of draft/published rootstock references. |
| `catalogPublished/{slug}`            | The validated published projection. Contains no drafts or administration identity.                                                              |
| `catalogAssets/{sha256(sourcePath)}` | Trusted original site photographs registered by migration. Enables reuse without accepting arbitrary file paths.                                |
| `cmsMedia/{encodedPublicId}`         | Cloudinary resources verified against the provider; shared by page and catalog editors.                                                         |
| `catalogAudit/{uuid}`                | Actor UID, operation, revision and timestamp written atomically with the catalog mutation.                                                      |

A variety holds at most 24 rootstock IDs; rootstock data remains independent. Drafts never modify the public projection. Publish validates the entire record, verifies media and related rootstock documents, then atomically writes the draft, published projection and audit event. Unpublish removes the public projection. Revision comparisons inside the transaction prevent lost updates, including concurrent edits in different tabs.

A removed live projection is retained privately when unpublishing or deleting, alongside the current authored draft.

URLs are immutable after creation, unique across the collection and checked against reserved routes. Changing a name leaves existing links valid. Slugs cannot contain traversal, query syntax, markup or Unicode path separators.

Delete requires the exact current entry name and revision. It removes public content and retains a private recoverable draft. A rootstock cannot be deleted while referenced by any active variety's draft or published version. Keeping the reference union prevents an unpublished draft edit from silently removing protection for the still-live version. Relationship reads and deletion checks run in transactions; concurrent writes participate in Firestore's consistency checks. Restore returns a private draft, requiring a fresh publication decision. If a restored variety's rootstock has been removed meanwhile, restore is rejected until that relationship is repaired.

Shared images are never destroyed when a product is deleted. This preserves other products, CMS pages and recoverable drafts. Permanent media removal and destructive retention purges require a separate operator process that checks all references. The interface deliberately provides recoverable deletion rather than an irreversible bulk purge.

## Security

Firebase identity is verified on the server using revocation-checked HttpOnly sessions. The initial verified addresses in `ADMIN_EMAILS` are administrators. Additional users require a server-assigned `zeebaranRole` custom claim of `admin` or `editor` and verified email. Editors can prepare drafts; administrators can publish, unpublish and delete. Publication permissions also apply to the existing CMS publication API.

Use `node --env-file=.env.local scripts/set-catalog-role.mjs <verified-email> admin|editor|remove` from a trusted operator environment. It preserves unrelated custom claims and revokes existing sessions after a change. Removing a bootstrap owner also requires removing that email from `ADMIN_EMAILS`. No user-controlled role field is accepted by the catalog API.

Direct browser access to Firestore is denied, including reads of the published projection. This is intentional: bounded server endpoints enforce the application boundary and prevent direct collection enumeration. Firebase Admin SDK access bypasses Security Rules and therefore depends on least-privilege IAM and the application checks. Never weaken rules to resolve an Admin SDK IAM error.

Mutation endpoints enforce same-origin requests, CSRF tokens, bounded JSON, operation rate limits, strict schemas, immutable identity, numeric limits, relationship types and image registration. Text renders as escaped text. New Cloudinary resources must belong to the configured environment and be verified independently; local images must match a registered original asset. Privileged credentials remain server-only. Logs return correlation references rather than credentials or record bodies.

## Read and cache behavior

- Public lists return at most 24 entries; administration lists return at most 25. Both use ordered cursors and an extra sentinel document, never offsets.
- Name searches use normalized prefixes and the included indexes. They are not an unbounded collection scan or a full-text search engine.
- Administration lists project just the identity and status fields required by the list, rather than loading every full draft into the browser.
- Published documents, pages and selected comparison batches use Next's shared data cache for five minutes. Cache keys include the Firebase project and emulator/cloud identity to prevent cross-environment reuse. React request caching deduplicates metadata/page reads. Selected relationships are fetched in bounded `getAll` batches. There are no Firestore realtime listeners.
- Draft saves do not invalidate public caches. Publish/unpublish/delete invalidate affected item/type caches, shared comparison/count caches and relevant routes immediately. Direct external Firestore writes require revalidation or waiting for the cache interval; use the application API for normal editing.
- Comparison dropdown queries begin when opened, debounce search and support cursor loading. Only two chosen profiles are retrieved for comparison. Stored browser state contains IDs, is validated on restoration, and does not authorize database access.
- Counts use cached aggregation queries. The sitemap projects only URL metadata and uses document cursors, caching for one hour. Before approaching the sitemap protocol's 50,000 URL limit, partition it into multiple sitemaps; the implementation explicitly rejects an oversized single sitemap.
- `firestore.indexes.json` declares the query indexes and exempts large content/array fields from indexing. Deploy it to the real project; an emulator does not establish that production indexes are ready.

The published projection duplicates the authored content deliberately to keep a complete, stable live version independent of incomplete drafts. Rootstock records themselves are not copied into each variety. At most one private record and one public projection are maintained per entry.

## Existing content and images

`lib/products-content.ts` and `scripts/migrations/legacy-rootstock-guide.json` retain the existing authored portfolio solely for a one-time migration. They are never a public runtime data source. The migration includes the existing eight varieties and four rootstocks and applies previously published CMS text/image overrides. Existing catalog records are skipped, so rerunning it cannot overwrite subsequent manual edits.

```sh
# Review without writing anything.
node --experimental-strip-types scripts/migrate-catalog.mjs

# Upload the actual existing images and independently verify Cloudinary resources.
node --env-file=.env.local --experimental-strip-types scripts/sync-catalog-media.mjs --upload

# After Firestore is enabled, initialized and access has been verified:
node --env-file=.env.local --experimental-strip-types scripts/migrate-catalog.mjs \
  --apply --project=zeebaran085 --media-map=.local/catalog-media-map.json
```

The media manifest contains public resource identifiers and dimensions, never the secret. Media synchronization is content-addressed and does not overwrite existing resources. Original file paths remain registered for reuse, and the migrated product images use verified Cloudinary URLs when a manifest is supplied. Rebuild/revalidate the application after an operator migration.

## Live activation

Create the default Firestore database in Production mode in the project-owner console. Choose the data region before creation; it cannot be treated as an incidental later change. Initialize Firebase Authentication and enable Google sign-in. Add the actual website origin and local development hosts to the authorized domains. Email/password sign-in is optional and requires separately provisioned, verified accounts.

Deploy `firestore.rules` and `firestore.indexes.json` to project `zeebaran085` with an authorized operator identity. The application service account needs Firestore data access and Firebase Authentication session/user access; granting it general project-owner access is unnecessary. API activation requires `serviceusage.services.enable`, which the supplied application identity did not initially have. Cloudinary authentication and the existing image transfer were verified separately.

Confirm index creation has completed before accepting editing traffic. Keep managed TTL, backups and PITR disabled on Spark; those managed features require billing. Rate limits use logical expiration and bounded application cleanup, described in [Spark maintenance](spark-firestore.md). Set an owner-approved retention policy and failure monitoring. A tested recovery process remains an operational requirement; do not enable paid backup features without separate authorization. No billing plan is upgraded by the application.

## Verification scope

`scripts/check-catalog.mjs` guards against use outside the disposable Firebase Authentication/Firestore emulator hosts. It exercises the actual production application, private roles, CRUD operations, publication separation, relationship protection, comparison replacement/persistence, responsive layouts and automated accessibility. Its Cloudinary transfer uses an actual authored photograph and cleans up only that QA upload. These fixtures are not a production catalog fallback.

`scripts/check-catalog-rules.mjs` checks direct-client rejection against a separate rules emulator on port 8396 with the actual rules file loaded. `tests/unit/catalog.test.ts` validates data and comparison-schema boundaries. Emulator results do not establish production index deployment, live Google OAuth consent completion, backup restoration or measured field Core Web Vitals.

For multiple self-hosted application instances, configure a shared Next data cache and coordinated tag invalidation. A per-instance filesystem cache alone cannot provide immediate cross-instance publication consistency. The live application does not depend on emulator fixtures or the historical migration arrays.
