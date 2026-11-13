# About team management

The About page now contains the six owner-supplied profiles, in the supplied sequence: Aadil Sheikh, Hilal Sheikh, Auqib Nisar, Mudasir Wani, Arjumand Bhat and Suhail Bhat. Mr. Aadil Sheikh's supplied portrait is uploaded to the existing Cloudinary account and registered in Firestore's `cmsMedia`. The other five portraits use reusable code-native placeholders until uploaded.

Open **Admin → About → Team** to edit names, designations, company, short introduction, full biography, expertise/responsibilities, leadership philosophy, company vision and an optional phone number. No phone numbers were provided, so none were invented or displayed. Use **Choose or upload portrait** for the existing verified media library; uploads default to the **Team portraits** folder. Images retain the site's existing automatic format/quality selection, responsive sizing, lazy loading and error placeholders.

Members can be added, reordered, hidden, removed and restored with Undo. Removal or switching to a placeholder never deletes a Cloudinary file. **Save draft** stays private; the visual preview updates from the same draft. Clicking the team section in editing mode opens its team controls. **Publish** updates the public About page, where cards open full profiles in a keyboard-accessible dialog.

## Data and security

Team data lives in `cmsPages/about` under `draft.team` and `published.team`. Array order is the display order; stable member IDs survive reordering. Each portrait stores the original Cloudinary URL, public ID, image type, alt text and dimensions. Member details and portrait references reuse the existing About snapshot: no per-member Firestore query, real-time listener or profile-opening API request was introduced. Admin portrait validation uses one deduplicated batch lookup of referenced `cmsMedia` entries during save/publish.

The CMS enforces the same existing verified sessions, editor/admin permissions, CSRF protection, revision transactions, audit/history and cache invalidation. Team payloads are bounded and validated. Team data on other pages, unregistered portraits, mismatched media URLs/types, duplicate member IDs and invalid optional phone numbers are rejected. Only administrators may publish; editors can save drafts. Profiles render plain text, not submitted HTML. Hidden managed profiles are filtered on the server before public snapshots are serialized.

`features/team/members.json` is the initial authored content and fallback. Managed CMS lists take precedence, including an explicitly empty list. Existing About text/images are preserved independently. `scripts/import-team.mjs` imported the supplied portrait once using a content-based public ID without overwriting assets, backed up the original About record under ignored `.local/`, and attached the initial profiles without replacing other content. Re-running does not restore deliberately removed managed members or replace existing portraits. OG/brand/font files remain local.

## Verification

Unit coverage checks sequence, complete content, empty/hidden/ordered lists, page scoping, draft-preview validation, payload limits, phone numbers and portrait metadata. Public browser tests cover full biographies, responsive cards/dialogs, keyboard closing/focus restoration, placeholders and CDN sources. `scripts/check-team.mjs` is guarded to disposable Firebase project `demo-zeebaran-team`, Firestore `127.0.0.1:8395`, Auth `127.0.0.1:9098`, with a production-build test application at `http://127.0.0.1:3370`; it exercises real UI save/preview/publish/reorder/hide/add/portrait/remove/undo and permission/validation boundaries. It never targets the live project.

The supplied #8cc63f heading accent is preserved consistently with the existing owner-approved contrast limitation. Browser tests and an automated profile-dialog audit do not constitute complete WCAG certification or a guarantee of no bugs in all possible states.

Final verification: 182 unit tests passed across 24 files; six team browser tests passed in Chromium/WebKit. The isolated production-build CMS workflow passed draft save, visual editing, publish, full profiles, reorder/hide, add, verified portrait selection, placeholder/remove/undo, preserved media, stale-revision rejection, cross-page rejection and editor-publish denial. Lint, formatting, TypeScript and the production build passed. The live imported portrait was observed fully loaded from Cloudinary, and read-back checks confirmed the pre-existing About draft/public text and image maps were unchanged.
