# Zeebaran Cloudinary image management audit

**Updated asset policy:** The original OG artwork has been restored byte-for-byte to `app/opengraph-image.jpg`. OG/Twitter metadata now uses the local `/opengraph-image.jpg` route. Brand icons and favicons also remain local. The Cloudinary delivery manifest and migration script exclude OG/identity assets; the active photographic manifest contains 49 images. This follow-up passed 103 unit tests, lint and TypeScript. The earlier Cloudinary OG copy is retained unused, and the migration counts below record the original operation rather than the current local/remote split.

Completed locally on 10 November 2026. Scope: photographic image delivery, authored image migration, image editing compatibility, Cloudinary organization, missing/loading/error states, and verification. Existing typography, colors, layout, animation choreography, copy, public content revisions, and saved image overrides were preserved.

## Result

The website now uses one image delivery system. Public photographs, catalog images, partner logos, admin previews and galleries resolve through the configured Cloudinary account `jfiuaflr`. Page components refer to semantic asset slots; legacy local paths remain compatibility identifiers, not photographic file dependencies. Unknown or failed images render a reusable SVG icon. No new image SDK, dependency, account, or credential configuration was installed.

### Verified migration

- Inventoried **49 photographic/artwork files under `public/images`**, plus the existing **one social-sharing image** under `app`.
- Reused **28 byte-identical Cloudinary originals**, uploaded **22 missing originals**, and independently verified all 50 originals against their local SHA-256 checksums after downloading the untransformed provider asset.
- Imported the existing Mission YouTube thumbnail into Cloudinary; video playback itself remains with its existing provider.
- Organized 28 reused images, two existing admin uploads, and eight retained duplicate apple originals using Cloudinary's dynamic `asset_folder`. Existing public IDs and URLs were not renamed. Provider samples and remote duplicates were retained rather than deleted.
- Registered the migrated images in `cmsMedia`, preserving existing names, alternative text and ownership when a record already existed.
- Converted nine `catalogAssets` original-picker records from local URLs to their verified Cloudinary URLs/public IDs/dimensions. Product/variety/rootstock records already used Cloudinary; their authored data and publication state were not rewritten.
- Archived all 50 originals (**12,417,188 bytes**) outside public delivery and verified the archive hashes again. Removed only the verified public copies. No original was discarded.

## Architecture and files

| Responsibility             | Implementation                                                                                                                                                                                                                |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Verified authored manifest | `features/media/assets.generated.json`: semantic slot, legacy alias, canonical versioned URL, public ID, dimensions, category, checksum and original byte size                                                                |
| Delivery policy            | `features/media/delivery.ts`: account allowlist, slot/legacy resolution, bounded responsive widths, direct Cloudinary transformations                                                                                         |
| Public image component     | `features/media/AssetImage.tsx`: shared Next Image loader, loading icon, error icon, source-aware state and fixed image footprints                                                                                            |
| Reusable placeholder       | `features/media/ImagePlaceholder.tsx`: accessible code-native SVG, no static file or network dependency, responsive intrinsic ratio                                                                                           |
| Admin image previews       | `features/media/MediaThumbnail.tsx`: same loader and failure policy, existing admin frame CSS retained                                                                                                                        |
| CMS compatibility          | `features/cms/Content.tsx`, `model.ts`, `catalog.ts`, `server/store.ts`: original field hashes remain stable across semantic slot migration; overrides and draft/publish boundaries remain intact                             |
| Upload organization        | `features/media/categories.ts`, `features/admin/server/cloudinary.ts`, `/api/admin/media/sign`: signed category and sanitized name, unique ID, no overwrite, existing server verification and UID ownership checks            |
| Media pagination           | `/api/admin/media`, `MediaLibrary.tsx`: 48 visible items plus one lookahead per request; cursor paging and deduplication; search covers loaded items                                                                          |
| Catalog validation         | `features/catalog/server/store.ts`: legacy authored image aliases normalize to verified Cloudinary metadata; unregistered/arbitrary image sources are rejected                                                                |
| Video thumbnails           | `video-posters.ts`, `server-posters.ts`, `jpeg.ts`: fixed YouTube IDs and host, validated JPEG frame dimensions, signed import on admin save, shared in-flight work, graceful provider failure; no import on visitor requests |
| Social metadata            | `features/media/social.ts`, `app/layout.tsx`, `lib/seo.ts`: original share artwork served locally from `app/opengraph-image.jpg`                                                                                              |
| Old image URLs             | `next.config.ts`: permanent redirects from the 49 photographic local paths to canonical Cloudinary originals                                                                                                                  |
| Repeatable migration       | `scripts/sync-site-media.mjs`: dry-run default, explicit cloud/project gates for writes, checksum verification, exact-match reuse, backups, retained manifest entries; reads archived originals and new local files           |
| Repeatable public checks   | `scripts/check-media.mjs`: read-only Chromium/WebKit page, image source, error and overflow checks                                                                                                                            |

The old `components/Scene.tsx` illustration is no longer used as a photographic placeholder. Authored sketches and animation assets remain code-native artwork. The original optional vintage-TV SVG is retained as an exported drawing, but it is no longer substituted for a failed photograph.

## Folder hierarchy

The manifest contains the following original-image placements. Existing admin uploads and video posters are additional records.

```text
zeebaran/
  apple-varieties/             8 originals
  rootstocks/                 reserved category; created when an image is uploaded
  orchards/                  14 originals
    nurseries/                1 original, shared by current rootstocks
  laboratory/                 3 originals
  banners/
    home/                     6 originals
    varieties/                1 original
    mission/                  1 original
  galleries/
    home/                     6 originals
    field-work/               7 originals
  products/
    infrastructure/           2 originals
  partners/                   existing uploaded partner logos
  videos/
    posters/                  imported video thumbnails
```

New admin uploads have public IDs of the form `zeebaran/{uid}/{category}/{sanitized-name}-{uuid}` and an asset folder of `zeebaran/{category}`. This keeps existing UID ownership verification while making the media-library folders independent from public IDs. New authored migrations use `{category}/{sanitized-name}-{checksum-prefix}` beneath `zeebaran`. Exact-match reused assets retain their existing IDs.

Moving an asset folder does not change its delivery URL in the account's dynamic folder mode. Existing IDs are deliberately preserved. [Cloudinary folder modes](https://cloudinary.com/documentation/folder_modes), [signed upload parameters](https://cloudinary.com/documentation/image_upload_api_reference).

## Delivery, performance and database behavior

- Browser `src` and `srcset` point directly at Cloudinary. Photographs no longer pass through Next's image proxy for a second optimization step.
- `f_auto,q_auto,c_limit,w_{width}` selects negotiated format/quality and width. Widths are bounded to 32–3840 pixels; default responsive candidates come from the existing Next image sizes. Video-derived stills use `so_auto` through the video delivery endpoint.
- Original image ratios are preserved. Existing CSS controls `cover`/`contain`, crops, card frames and gallery/hero composition. The separately authored mobile Home crop is retained, and a manually replaced Home image takes precedence over that default crop.
- Below-fold images use lazy loading; existing hero priorities remain. Placeholders reserve the authored frame or intrinsic aspect ratio. Failure states keep CMS editing markers so a missing image can still be replaced.
- Placeholder icons are decorative for empty alt text and expose the authored accessible label for meaningful alt text. They have no motion or external file dependency.
- The default manifest is local metadata, requiring no Firestore read or real-time listener per image. Existing cached page content and catalog reads continue to supply administrator replacements and dynamic catalog images.
- Admin media requests are bounded: up to 49 document reads for 48 visible items, plus one cursor-document read on subsequent pages. No automatic polling or real-time media listener was added.
- YouTube preview import occurs during a relevant admin save, with bounded in-process deduplication. Provider failures leave an icon and do not prevent saving text. Playback remains YouTube/Cloudinary as previously configured.

Three actual 960px CDN responses were sampled after migration. These are individual transfers, not a site performance score or field Core Web Vitals measurement.

| Image             | Original bytes | Delivered bytes | Negotiated response |
| ----------------- | -------------: | --------------: | ------------------- |
| Gala              |        145,466 |          84,523 | JPEG                |
| Home desktop hero |        351,932 |         137,176 | WebP                |
| Laboratory        |        123,970 |         112,446 | WebP                |

Cloudinary may choose different formats and byte sizes by browser and content. Lazy loading reduces immediate transfer; new transformations still consume the provider's existing plan allowances. No cost or quota guarantee is made. [Cloudinary transformations](https://cloudinary.com/documentation/image_transformations).

## Verification evidence

| Check                                     | Result and scope                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Local originals vs Cloudinary originals   | All 50 exact SHA-256 matches verified during migration                                                                                                                                                                                                                                                                                                                                                                                                       |
| Archived originals                        | All 50 rehashed after removal from public delivery; 12,417,188 original bytes retained                                                                                                                                                                                                                                                                                                                                                                       |
| Public browser checks                     | **80 passed** across Chromium and WebKit at 390px and 1440px: 12 common routes, all eight variety details and four rootstock details on desktop, representative details on mobile, comparison route                                                                                                                                                                                                                                                          |
| Browser image policy                      | No local `/images/` requests, unexpected photographic failures, JavaScript page errors or horizontal overflow in those cases. Offscreen gallery images were explicitly loaded for verification; hidden marquee clones were excluded from visible-image assertions                                                                                                                                                                                            |
| Admin/emulator checks                     | Passed 48-item pagination, stable cursor/no duplicates, category signing/naming, invalid folder rejection, UID ownership rejection, original CMS image keys, draft isolation, visual preview, publish/public replacement, failed-image icon and layout preservation                                                                                                                                                                                          |
| Live page changes in tests                | None; isolated emulator fixtures/history were restored afterward                                                                                                                                                                                                                                                                                                                                                                                             |
| Unit tests                                | **102 passed in 14 files**, including delivery allowlisting/transformations, stable CMS aliases, URL-encoded old-path matching against Next’s redirect matcher, placeholder rendering, JPEG validation, deduplicated preview import and provider-failure handling                                                                                                                                                                                            |
| Lint / TypeScript                         | Passed for the changed media modules and affected integrations                                                                                                                                                                                                                                                                                                                                                                                               |
| Production build                          | An earlier `ZEEBARAN_BUILD_DIR=.next-admin npm run build -- --webpack` with live provider access passed. A restricted-network rebuild completed but logged CMS read failures. The final exact-source offline build (`FIREBASE_PROJECT_ID= ZEEBARAN_BUILD_DIR=.next-admin npm run build -- --webpack`) passed using authored CMS defaults, without changing `.env.local`; it verifies production compilation/static generation, not a fresh live-CMS snapshot |
| Additional production-server browser pass | **Not executed**: automatic approval review could not run because the account usage limit was reached. Populated comparisons, 320px/768px production runtime checks, and runtime redirect/metadata verification are not claimed as passed                                                                                                                                                                                                                    |
| Field performance / quotas                | LCP, INP, CLS and production traffic usage were not measured. No fabricated ratings or timing scores                                                                                                                                                                                                                                                                                                                                                         |

The final responsive-thumbnail, old-URL encoding and YouTube-thumbnail edge-case fixes passed unit tests, TypeScript, lint and the offline production build. The previously completed 80-case browser suite predates those final edge-case refinements; a browser rerun remains appropriate when execution approval is available.

Logs and results remain in `/private/tmp/zeebaran-media-{public,admin,unit,lint,types,build,final-build,offline-build}.log`; browser case details are in `/private/tmp/zeebaran-media-public-results.json`. These are local temporary artifacts, not durable deployment monitoring.

## Remaining static dependencies and exclusions

1. `app/opengraph-image.jpg` remains local for social sharing. `public/brand/`: five brand/application-icon PNGs remain. Favicons, app icons and structured-data logo identifiers keep their existing paths. These are identity/platform assets, not photographic placeholders.
2. Local WOFF2 fonts and all manually authored SVG/CSS sketches remain unchanged as intentional design assets.
3. OpenStreetMap tiles remain served by OpenStreetMap, with attribution preserved. They are map infrastructure rather than the website's photographic asset library.
4. Legacy local path strings remain in the centralized manifest, historical CMS catalog, compatibility redirects and authored migration fixtures. They no longer require local image bytes to render the website. `lib/products-content.ts` remains historical migration content; public products are fetched from Firestore.
5. Provider sample assets and retained duplicate originals were not deleted from Cloudinary, because they may have uses outside this site. Neither old revision history nor unrelated remote assets were purged.
6. `public/images` may retain empty directories or OS metadata; it contains no remaining website image files.

## Backups, daily use and recovery

- Readable original archive: `.local/media-originals/images/` and `.local/media-originals/opengraph-image.jpg`, with `.local/media-originals/manifest.json`.
- Independent migration backups: `.local/cloudinary-migration-2026-11-10T16-14-04-885Z/` and `.local/cloudinary-migration-2026-11-10T16-45-11-221Z/`.
- Private pre-change Firestore image metadata and remote inventory: `.local/cloudinary-audit/`. These backups are ignored by Git and contain unpublished content; store an additional private off-machine copy if required. Do not publish this directory.
- Use the existing page image editor, product/rootstock editor or partner manager to upload/select images. Choose a folder in the upload control; contextual defaults select rootstocks, varieties, Home, laboratory or partner media where available. Save/preview/publish behavior is unchanged.
- Replacements are verified Cloudinary resources with public IDs and dimensions. Shared media is not destroyed when a product or page reference is removed.
- Do not rename/delete public IDs directly in Cloudinary while documents or revision history reference them. Moving an asset folder is safe in this account's dynamic mode.
- Re-run `node scripts/check-media.mjs --origin=http://localhost:3000` with the installed Node 22/browser environment for the public checks. For provider migration, use the existing private `.env.local`; the script is dry-run by default and requires explicit matching `--apply --cloud=... --register --project=...` to write. Never print credentials.
- The `.next-admin` build is a local verification artifact. Rebuild with live Firebase access before deployment so the initial static output reflects the latest published CMS content. No deployment was performed.
