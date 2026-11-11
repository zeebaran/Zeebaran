# Editing on the website layout

Every website workspace in `/admin/pages` opens **Page preview** by default. Its protected canvas renders the same page components, fonts, colors, navigation, images and interactions as the public website. There is no second copy of the website layout to maintain.

## Working on a page

- **Edit page:** click wording, an image or a Mission video card. The focused dialog edits the underlying content and updates the canvas. Headline highlights retain their existing accent treatment.
- **Find content:** search the current page’s text or image descriptions and open a field with the keyboard. For content in an interactive panel, open that panel in Interact mode first.
- **Interact:** try navigation menus, capability panels, galleries and video playback. Links cannot navigate away from the canvas, and form submissions are intercepted before they reach the enquiry service.
- **Full width / Tablet / Mobile:** change the actual iframe viewport, rather than scaling or zooming a desktop screenshot. The outer canvas can scroll horizontally on a small admin device.
- **Save draft:** save the page without publishing or resetting the canvas’s scroll position. **Publish** uses the existing confirmation, authorization, revision checks and history. Unsaved changes retain the existing navigation warning.

Mission cards open the relevant Orchard Installations, Installation Process or Demonstrations & Proof section, including Add video and source selection. Shared navigation/footer content opens Site settings. Product and rootstock cards open their existing catalog editor so listings and comparisons continue using the same Firestore records. Structural counters, generated references, route targets and security controls remain controlled by the application. Existing Words & story, Images and Revision history views remain available.

## Data access and safety

`/admin/canvas/[page]` authenticates on the server before reading a draft or rendering the page. The parent and iframe accept messages only from each other at the same origin, for the expected page and protocol. Selection keys are checked against the server’s page definition; updates still pass through the existing trusted server validation, role checks and CSRF protection.

Typing sends a debounced local `postMessage`, with **no Firestore write or API request per keystroke**. A workspace and its canvas each read the page draft when opened; published shared/page content retains its existing caching. Explicit Save and Publish retain the existing page-document/history/audit workflow. Images and video previews are served by their providers; this feature introduces no per-field documents, snapshot listeners or autosave polling.

The canvas-only editing stylesheet and listeners load under the authenticated admin route. On public pages, content bindings resolve published overrides as before. No motion, section layout, image framing or typography is redesigned by the editor.

## Maintaining content bindings

Source text and image paths retain stable keys in `features/cms/catalog.generated.json`. Keep bindings around new meaningful source content, then merge newly exposed markers from a local server:

```sh
node scripts/sync-editor-catalog.mjs --origin=http://127.0.0.1:3388
```

This inspects local pages and updates the local registry; it does not modify Firestore. It preserves historical keys to avoid breaking existing overrides. Review the registry diff and `.local/visual-unmarked-copy.json`. Conditional capability panels and map captions are additionally registered from their source datasets in `features/cms/catalog.ts`.

## Verification

`scripts/check-visual-editor.mjs` refuses to run without the explicit disposable `demo-zeebaran-admin` Firestore/Auth emulators. It exercises authenticated canvases for all 13 workspaces, inline text/image descriptions, responsive navigation, local typing, draft/public separation, Save/Publish, Mission section access, form interception, shared navigation and email destinations. It restores its original page fixtures. Run it serially with other scripts that modify those emulator documents.

YouTube playback and actual Cloudinary upload availability depend on the provider and account configuration. The visual editor reuses the existing media library and playback components; isolated workflow checks do not assert live provider transfers.
