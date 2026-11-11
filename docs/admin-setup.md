# Zeebaran editorial desk

The desk is at `/admin`. It uses the site's existing Hanken Grotesk and Newsreader fonts, cream, forest and orange palette. Twelve website pages and shared navigation/footer settings have dedicated workspaces. Each opens an editable version of its actual website layout; see [Visual editing](visual-editor.md). Originals stay in source; publishing stores overrides without rewriting components or their motion. Product and rootstock records have separate catalog editors.

## Live configuration

1. In Firebase project `zeebaran085`, register a Web app. Copy its `apiKey`, `authDomain`, `projectId` and `appId` into the corresponding `NEXT_PUBLIC_FIREBASE_*` variables in `.env.example`. Set them before building. These identify the app; they do not grant administration access.
2. Enable Google sign-in in Firebase Authentication. Add the production domain and the actual local hostname to Authorized domains. Set a project support email. For email/password sign-in, enable that provider and provision the account privately; the desk has no public registration. Its email must be verified. Google sign-in does not require a separate password.
3. Set `ADMIN_EMAILS=zeebaran00@gmail.com` on the server. Both an approved email and Firebase's verified-email claim are required. Access is checked on the server and a signed, revocation-checked, eight-hour HttpOnly session is used. Adding a new Firebase user alone grants no editing rights.
4. Provide server credentials for the same project through Application Default Credentials or `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY`. Never prefix credentials with `NEXT_PUBLIC_`. The server identity needs Firestore data access and Firebase Authentication user/session access. Use a dedicated service identity and keep credentials outside Git.
5. Create the default Firestore database if it does not exist. Apply the existing deny-all direct-client rules in `firestore.rules`; the authenticated server uses the Admin SDK. Keep managed TTL disabled on Spark. Rate limits expire logically and the server removes expired records in bounded, leased batches; see [Spark maintenance](spark-firestore.md). Managed backups require billing and are not part of this Spark setup.
6. Set `CLOUDINARY_CLOUD_NAME=jfiuaflr`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` from the intended Cloudinary environment. No unsigned upload preset is required. The server signs uploads and checks the uploaded resource with Cloudinary before accepting it into the library. A signature uses SHA-256. The private secret never reaches the browser.
7. Rebuild and restart the app. Public Firebase variables and the Cloudinary image allowlist are read at build time. Deploy over HTTPS. Remove all emulator environment variables from the production environment.

Live credentials belong only in the private environment or deployment secret store. The visual-editor workflow checks use isolated emulators and do not establish live Google sign-in or Cloudinary transfer availability.

## Editorial workflow

Open a page workspace, edit its text or image placements, then save a draft. Preview opens the actual public route in authenticated draft mode. Anonymous visitors continue to receive published content. Publish requires confirmation, writes an audit/history entry atomically, and invalidates the page's published-content cache. Revision checks reject stale updates from another tab. Restore loads an earlier revision as a draft; it does not publish it automatically.

Images require alternative text when replaced. Image uploads accept JPEG, PNG, WebP or AVIF up to 10 MB. Films accept MP4, WebM or MOV up to 100 MB, subject to Cloudinary account limits. YouTube links are normalized to the privacy-enhanced embed host. Mission → Video upload opens the card manager directly, organized into Orchard Installations, Installation Process, and Demonstrations & Proof. Words & story contains only the page text fields. Each section starts with two cards. Use Add video to create another card in the selected section, and edit its title, description and source. Remove card removes that draft placement while keeping the uploaded asset in the library; each section retains at least one card. Other page text is kept in a separate collapsed area. Changes use the existing save/preview/publish and revision workflow. A single card fills its row, two share the width evenly, and additional cards wrap to fill each row. Up to 24 cards per section are accepted within the existing page-size limit. Previously configured extra cards and manual text are preserved when opening older content; untouched surplus placeholders are omitted. New section arrays are authoritative after saving, so removed cards cannot reappear. There is no generic Film & video tab or page-bottom video. A preview image comes directly from the provider CDN. A player is created only after a visitor presses Watch; Cloudinary video uses `preload="none"`. The lower control pauses/resumes playback and follows native player state; YouTube’s official control API is loaded only after Watch. Video placements share the existing cached Mission page document, with no separate per-card Firestore reads. The media library lists the latest 100 verified uploads; each page shows the latest 20 revisions. Media deletion and bulk library management are intentionally not provided.

Existing source layouts and image framing are retained. One replacement applies to every use of that source image on the selected page. Repeated identical text on a page shares an editorial field. Motion headline accents retain their `{braces}` syntax. Form validation messages, route targets, metadata, security controls and structured datasets remain in code rather than accepting arbitrary editor markup.

Editable defaults are recorded in `features/cms/catalog.generated.json`. When source copy or placements change, use the preserving merge workflow in [Visual editing](visual-editor.md), inspect the catalog diff, and rebuild. Field identifiers derive from the original text or image path. Changing a source default creates a new field, so review existing overrides when doing so. Transient content revealed only after an interaction may need an explicit catalog entry. This is a structured page editor, not an arbitrary page builder.

## Local verification

Use a disposable Firebase project named `demo-zeebaran-admin`, an Authentication emulator at `127.0.0.1:9098` and a Firestore emulator at `127.0.0.1:8395`. The fixture seeder refuses other Authentication emulator addresses. It provisions two synthetic emulator accounts, including an unauthorized account; their fixture password is never a live account credential.

```sh
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9098 node scripts/seed-admin-emulator.mjs

# Start the disposable local app with these variables, not live credentials.
ZEEBARAN_BUILD_DIR=.next-admin \
FIREBASE_PROJECT_ID=demo-zeebaran-admin \
FIRESTORE_EMULATOR_HOST=127.0.0.1:8395 \
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9098 \
NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9098 \
NEXT_PUBLIC_FIREBASE_API_KEY=fake-api-key \
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=localhost \
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-zeebaran-admin \
NEXT_PUBLIC_FIREBASE_APP_ID=demo-app \
npm run dev -- --hostname 127.0.0.1 --port 3370

# In another terminal, while those disposable services run:
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9098 node scripts/check-admin.mjs
```

The browser checks authenticate through Firebase, verify draft/public separation, publication and rollback, conflicting revisions, CSRF enforcement, denied accounts, editor rendering and narrow-screen fit. Run `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` as well. Before release, use a staging project to verify Google popup sign-in, real signed image/video transfer, image optimization, HTTPS preview cookies, session expiry/revocation, database backup restoration and alerts on service failures. Never run emulator fixtures against live services.

Mission’s Words & story view keeps only Hero heading and Introduction in its general copy editor. Page preview additionally lets editors click meaningful section headings and descriptions in place. Step numbers, gallery counters, playback labels and card references remain controlled interface text; video card titles/descriptions remain editable within their own section. References are read-only inside each card. Other page editors omit structural counters, symbols, playback controls and duplicate visible text, while retaining meaningful copy and statistics. Hidden historical overrides are preserved; ordinary saves cannot change locked copy, and restoring an authenticated revision retains the existing history workflow. These edits share the existing cached page document, not one Firestore read per field.
