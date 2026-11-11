# Regional hubs

Manage the Contact page's **Regional hubs** tab, or click the map/cards in its visual preview.

- **Add hub** creates a card and its first map location. Enter the name and coordinates; optionally add area, description, key detail, and service status.
- A hub may have multiple locations. The original Baramulla/Achabal card retains both pins.
- **Disable** keeps the record for later but removes its card and all locations from both public maps after publishing. **Enable** restores it.
- **Remove** edits the draft and offers Undo. Saved revisions remain available in Revision history.
- Save draft to retain private edits. Publish updates cards, pins, labels, map details, and counts together. No live-data migration is needed for existing pages.

The collection lives in the existing `cmsPages/contact` draft/published value under `regionalHubs`. Public rendering reuses the page cache and publish invalidation; it adds no Firestore listeners or per-hub reads. Coordinates and payload sizes are validated on the server, with the existing verified admin session, CSRF checks, publish role, revision conflict protection, and audit history.

Limits: 24 hub groups, eight locations per group, and 60 total locations. An enabled hub requires at least one named location with latitude −90…90 and longitude −180…180. Disabled hubs can retain unfinished coordinates. The public map safely handles removed selections and a completely empty network. The corridor illustration is schematic; the OpenStreetMap view uses the saved coordinates. Both retain lazy loading and reduced-motion behavior.

## Verification

`npm test` covers schema bounds, grouped pins, disabled states, legacy copy, preview drafts, and page ownership. `scripts/check-regional-hubs.mjs` exercises authentication, draft isolation, editing without writes, in-place map updates, coordinates, publishing, disable/re-enable, remove/undo, and empty states. It requires disposable Firebase emulators and restores fixture data afterward:

```sh
FIREBASE_PROJECT_ID=demo-zeebaran-admin \
FIRESTORE_EMULATOR_HOST=127.0.0.1:8395 \
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9098 \
node scripts/check-regional-hubs.mjs
```

The script expects the existing demo admin account and isolated application server at `http://127.0.0.1:3388`. Tile requests are intercepted; no contact messages, external uploads, or live Firestore changes occur.
