# Harvest windows — implementation and verification

Implemented in the current working tree on 12 November 2026. Existing manual card styling, typography, colours, photographs and comparison behaviour are retained.

## Behaviour

- Early, Mid, Late and Very Late are functional, keyboard-accessible toggle filters. Selecting the active window clears it; **Show all** clears any selection.
- Selection is reflected in `?season=early|mid|late|very-late` and survives reload, sharing and browser Back/Forward. Changing a filter clears the variety pagination cursor while preserving search and rootstock navigation.
- Admin → Varieties & products → open a variety → **Harvest season** controls membership. **Save draft** stays private. **Publish** updates the published season and invalidates public caches. Publishing a variety without a recognised season is rejected by trusted server validation; incomplete drafts are still allowed.
- Rootstock listings and comparison selections are independent of the harvest filter.

## Database and performance

The existing `season` field is reused. No extra product collection, duplicate season document, per-click write, listener, dependency or migration was introduced. Common legacy spellings are normalised to the canonical value when passing through the catalog schema.

For a complete first page (up to 24 matching published varieties), server-rendered cards are filtered locally. Chromium and WebKit checks observed **zero fetch/XHR requests** while switching all four windows, clearing and using the keyboard. The existing shared five-minute catalog cache remains in place; publication invalidates it immediately. This does not make already-open public tabs realtime: they obtain new published content on navigation/reload, as before.

For larger collections, Firestore filters the entire published collection by `kind` and `season`, ordered by `sortOrder` (or `nameSort` for prefix search), using bounded 24-item pages plus one lookahead record. This avoids filtering only the first page, downloading the whole collection, or scanning nonmatching records. The shared first-page cache determines whether the no-request local path is safe. Filtered queries have distinct cache keys and existing publication invalidation tags.

Two additive `catalogPublished` indexes were created in **zeebaran085** from `firestore.indexes.json`: `kind/season/sortOrder` and `kind/season/nameSort`. Both were verified **READY**. One read-only query per season successfully returned one published record from the live database. No live product, draft, image, role or security rule was changed during testing. The application changes have not been deployed or pushed by this task.

Automated click-to-assert timing on the local production build was 47–135 ms across Chromium/WebKit; that includes browser automation overhead and is **not an INP/Core Web Vitals measurement**. Live SDK query samples were 446–1724 ms across the network and are not visitor filter timings.

## Verification

- Production build, full ESLint, TypeScript and diff whitespace checks passed.
- **217 unit tests / 31 files passed**, including canonical seasons, required publication classification, query bounds, cache separation, cursor ordering and URL state.
- **82 existing public browser regressions passed** across Chromium and WebKit, including all principal pages, 320–1920 px responsive checks, assistant, forms, navigation and motion preferences.
- **13 admin/filter browser tests passed**. Eleven WebKit admin tests were intentionally skipped by their existing Chromium-only fixture guards; both engines ran the new filter regression.
- **16 additional workflow checks passed** using disposable Firestore/Auth emulators and the actual production build: all seasons, keyboard, URL/reload/Back, no-request switching, admin draft/publication/cache refresh, invalid publication rejection, unauthorised write rejection, unpublish/empty state/republish, and large seasonal pagination.
- A 30-match seasonal emulator collection returned 24 + 6 records, with no missing or duplicate IDs. Switching seasons from page two reset the old cursor.
- Final mobile checks confirmed comparison selections survive filtering, rootstocks stay unchanged, and the filter section has no automated WCAG AA violations.
- Production dependency audit (`npm audit --omit=dev`) reported **0 known vulnerabilities** at assessment time.

These checks establish the tested workflows, not a guarantee that every possible project defect or performance issue is absent. Existing approved #8cc63f text contrast limitations remain unchanged. Human accessibility review, production traffic profiling and field Core Web Vitals remain separate from this scoped change.

## Main files

- `app/products/page.tsx`, `app/api/catalog/route.ts`: server integration and query/navigation state.
- `components/pages/products.tsx`: existing cards supplied as server-rendered slots; hero collage remains independent of filtering.
- `features/catalog/harvest.ts`, `HarvestFilters.tsx`, `harvest-filters.module.css`: shared classification, URL handling and filter controls.
- `features/catalog/admin/CatalogEditor.tsx`, `schema.ts`, `server/public.ts`: admin selection, trusted publication checks and cached indexed reads.
- `firestore.indexes.json`: additive season indexes.
- `tests/unit/harvest.test.ts`, `harvest-query.test.ts`, `tests/e2e/harvest.spec.ts`: regression coverage. The existing catalog unit expectation now includes the harvest-season publication requirement.
