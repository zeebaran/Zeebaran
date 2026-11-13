# Contact and social settings

Administrators can open **Contact & social** at `/admin/settings` to update the main email, phone, WhatsApp number, institutional desk emails, social profile links and office addresses. Empty social URLs hide their icons. An empty WhatsApp number hides its footer icon and sends nursery enquiries to the existing contact form instead. The initial Facebook/Instagram handle is `zeebaran`; YouTube uses `@zeebaran`, as requested. Profile ownership has not been independently verified.

Footer visibility switches independently hide email, phone, all addresses, each office, all social media or each platform. Hidden details remain saved and continue working on the Contact page, structured data and nursery enquiries. Re-enabling restores the saved values. Existing records default to visible without losing custom details. Empty contact groups and social navigation are omitted.

The footer uses canonical [Simple Icons brand glyphs](https://github.com/simple-icons/simple-icons) in Facebook blue, Instagram gradient, YouTube red and WhatsApp green, with a restrained hover lift. Keyboard focus remains visible; reduced-motion preferences disable movement. No image downloads, animation library or social-platform SDK was added.

## Data and request costs

All settings live in the existing `cmsPages/site` document, independently of page drafts:

- `publicSettings`: validated public contact configuration, including `footer` visibility booleans and `addresses[].showInFooter`. Missing visibility fields on older records default to true; incorrect types and unknown keys are rejected.
- `settingsRevision`: optimistic concurrency version.
- `settingsUpdatedAt`, `settingsUpdatedBy`: save metadata.

A save transaction checks one document, updates only those fields, and creates one `cmsAudit` event. Existing authentication/CSRF and abuse-protection operations still apply. The page's `draft`, `published`, content revision and history are untouched. Stale settings revisions receive HTTP 409.

Public settings reuse the site document already read by the CMS layout; there is no additional public Firestore query, settings API request, polling or real-time listener. The snapshot has the existing 60-second cache policy. React request memoization deduplicates the layout and organization-metadata consumers, and contact data is serialized through one shared provider. A successful save immediately expires `cms:site`; the next page load receives the new details. Existing open tabs need a reload; no background cross-tab synchronization was introduced.

The admin page reads one document on entry after configuration. Initial setup reads the existing Contact publication once as well, to retain its old published email/address overrides. Editing fields issues no requests. Saving is explicit and duplicate submissions are locked. Reload fetches a fresh private snapshot; conflicts preserve entries for review.

## Coverage and boundaries

The shared values drive footer contacts/social links, Contact page offices and email desks, both forms' email fallback, variety cards, product/rootstock enquiry links and organization structured data. Old contact text fields are hidden from page editors so there is one editing location; their stored overrides are retained for compatibility. Regional hub/map coordinates remain managed in Contact → Regional hubs.

Changing the displayed email does not change the recipient associated with the verified Web3Forms access key. That recipient must be managed with Web3Forms; the settings page explains the distinction. Credentials and form-service keys are never stored in these public settings.

## Security and validation

The page and `/api/admin/settings` require the existing administrator role. Editors cannot read or update this configuration through the settings endpoint. Writes enforce same-origin CSRF, the existing admin rate limit, strict validation and transactional revision checking. Social URLs must use HTTPS and the selected platform's exact allowed hostname; credentials, custom ports and misleading look-alike domains are rejected. Email, phone and bounded office fields are validated on the server. Firestore's existing deny-all browser rules remain unchanged.

## Verification

Unit tests cover validation, legacy compatibility, cache reuse, public/private separation, write scope, stale revisions, API permissions and CSRF. `scripts/check-site-settings.mjs` verifies real browser → API → Firestore → public-page behavior using disposable Authentication and Firestore emulators only. It refuses production project IDs/hosts. It tests add/remove offices, changed email/phone/social/WhatsApp links, disabled links, contact-form fallback, product/rootstock enquiries, metadata, draft preservation, responsive layout, automated accessibility and editor restrictions. Form delivery is intercepted, so no real email is sent.

The integration runner expects project `demo-zeebaran-settings`, Auth at `127.0.0.1:9098`, Firestore at `127.0.0.1:8395`, and a separately started application at `http://localhost:3370` with matching emulator variables, synthetic Firebase web-app settings and `ADMIN_EMAILS=zeebaran00@gmail.com`. The older local Firestore emulator requires `FIRESTORE_PREFER_REST=false`; this does not change production transport.
