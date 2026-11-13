# Bazm-e-Khayal — implementation and verification

13 November 2026

## Public experience

`/podcast` introduces Bazm-e-Khayal in the existing cream, forest-green and lime palette and existing sans/serif fonts. Typography is deliberately smaller than the larger marketing heroes. A custom vector microphone draws into view, with restrained sound-wave motion, a drawn title rule, and short episode/player transitions. Reduced-motion preferences disable these effects.

One large, responsive viewing card sits above the episode library. Selecting a small episode card changes the featured conversation and scrolls/focuses the viewing area. Playback starts only when the visitor presses Play. Switching episodes removes the old player, and only one YouTube player can be mounted. Search and topic filters use the already-loaded episode list; they do not query Firebase. Missing Cloudinary thumbnails use a reusable fallback, and failed playback offers the original YouTube link.

There are no invented starter episodes. Until the first video is added, the page shows a designed first-episode/empty-library state. The channel link defaults to `https://www.youtube.com/@Bazm-e-Khayal`, as requested. The channel has not yet been created or verified by the owner.

## Navigation

- Our Mission replaces Impact in the main navigation.
- Podcast replaces Governance.
- The Podcast disclosure contains Governance and Impact, available by hover, button and keyboard. Escape closes it; mobile navigation exposes both related links beneath Podcast.
- The footer and sitemap include the new Podcast page.

## Admin workflow

Open `/admin/pages/podcast`, then **Podcast episodes**. Administrators can add, reorder, edit, hide and remove episodes, and change the channel URL. Episode fields are YouTube link, title, optional guest/expertise, optional topic and optional summary. The existing draft, publishing, preview, revision-conflict and audit workflows are reused. Clicking the managed episode section in the visual preview also opens its editor.

Pasting a valid YouTube video link automatically imports its title. An explicit **Use YouTube title** action allows reimporting it. Manual wording remains editable, and an import that finishes after an administrator types a newer title does not overwrite that wording. Provider failures leave manual entry available. YouTube oEmbed supplies the title and channel name; it does not supply a trustworthy guest biography, topic classification or full episode summary. Those optional details remain editorial fields. Adding a video on YouTube alone does not publish it here; this is an admin-curated library.

## Storage, security and load

Episodes live in the existing `cmsPages/podcast` draft/published document, with existing history/audit records. There are no new collections, indexes, live listeners, packages or credentials. The list is bounded to 80 episodes and the existing 240KB page-content limit. Saving validates unique IDs/videos, field lengths, canonical HTTPS YouTube URLs and the allowed channel host/path. Disabled episodes are removed from public server output, not merely hidden with CSS.

Publishing invalidates the existing page cache; normal public reads reuse the 60-second CMS cache. Editing fields does not write to Firebase. Importing metadata uses the existing authenticated admin request, CSRF and rate-limit infrastructure; the rate-limit counter has its normal backend cost. Metadata provider results use a 24-hour server fetch cache. The import endpoint uses a fixed YouTube host, rejects redirects, enforces a seven-second timeout and a 16KB response limit, and ignores provider HTML. Only plain strings are stored/rendered.

Thumbnails reuse the existing Cloudinary poster preparation and responsive image delivery. Poster preparation runs after an explicit save/publish and does not block its transaction; visitors do not trigger imports. Video files remain on YouTube. Removing an episode removes its current CMS placement when saved/published; it does not delete the original YouTube video or purge revision history. Existing shared-media deletion behavior was not changed.

## Verification

- Normal production build and emulator-backed production build passed.
- Whole-project lint, TypeScript and formatting checks passed.
- **230 unit tests passed across 35 files**, including new validation, persistence, metadata parsing, SSRF boundary, CSRF and authorization checks.
- **6 public Podcast browser checks passed** in Chromium/WebKit: episode switching, one on-demand player, no per-selection API requests, search, topic filters, navigation, 320–2560px layouts, automated accessibility and reduced motion.
- **2 authenticated admin browser checks passed** against disposable Firebase emulators: import/edit/save/preview/publish/hide/remove, all-episodes-removed state, invalid URLs, stale revisions and slow-import draft preservation.
- The combined Podcast/assistant suite passed **32 browser checks**; the final Podcast-only run also passed after thumbnail recovery was refined.
- A real, authenticated YouTube metadata lookup returned HTTP 200 and the correct public title/channel in 526ms during one local test. An unsigned-in request returned HTTP 401. This is one observed response, not a latency guarantee.
- Desktop/mobile renders were inspected. Browser inspection recorded no page exceptions. Test episodes were restricted to the disposable emulator; no production content was published or modified.

YouTube playback events were tested with an isolated player fixture, not a real Bazm-e-Khayal episode, because none exists yet. Private, removed, region-restricted or embedding-disabled videos can still fail at the provider. Field Core Web Vitals, real-device battery use and production traffic were not measured. Existing unrelated working-tree edits and the user's local server were preserved; no commit or deployment was performed.
