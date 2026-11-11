# Zeebaran

A Next.js App Router website for Himalayan horticulture. The interface comes from the owner’s v2 project: its original typefaces, compositions, motion and apple-variety catalog. The main contact page includes regional hubs and proposals. The short form at `/contact/simple` has its own layout.

## Run locally

Use Node 22.13 or newer. The lockfile defines the dependency versions.

```sh
cd /Users/naveedbhat/Zeebaran
nvm use
npm ci
npm run dev
```

Open the local URL printed by Next.js. When Web3Forms and Firebase are both unconfigured, development enquiries and their PDFs are saved privately under `.local/enquiries.sqlite`. The confirmation identifies local delivery. To inspect that local inbox on this Mac, run this command.

```sh
sqlite3 .local/enquiries.sqlite 'select id, created from enquiries order by created desc;'
```

## Pages and implementation

| URL                | Contents                                                                           |
| ------------------ | ---------------------------------------------------------------------------------- |
| `/`                | Valley introduction, field photography, interactive value chain and impact figures |
| `/products`        | Apple planting material and seasonal variety catalog                               |
| `/products/[slug]` | Eight variety profiles with rootstock selection and enquiries                      |
| `/platform`        | Six operating capabilities and an orchard calendar                                 |
| `/zeebaran-hub`    | Grower visits, access, advice, adoption and field feedback                         |
| `/innovation`      | Biological laboratory, digital extension and capability status                     |
| `/impact`          | Outcomes, definitions, evidence and the independence test                          |
| `/partnerships`    | Research, capital and field partnerships                                           |
| `/governance`      | Oversight, metric ownership, principles and concerns                               |
| `/about`           | Purpose and a twelve-entry operating history                                       |
| `/contact`         | Enquiry channels, interactive regional map and PDF submissions                     |
| `/contact/simple`  | Short enquiry form                                                                 |

The App Router prerenders the public pages. Shared components own navigation, photography, capability stories, metrics, the calendar and the history timeline. The `lib` directory holds their typed content. `features/contact` contains the form, validation and server-side persistence. Three Node.js API handlers receive enquiries, prepare uploads and handle local PDF transfer.

The type system is the source project’s **Hanken Grotesk** for navigation, headings, body and controls, and **Newsreader** for the italic wordmark, quotes and editorial accents. All three original variable font files are self-hosted in `app/fonts`. The display scale, floating navigation, cream palette, responsive content widths and real homepage and variety photographs come from v2. Field photographs replace its generic placeholders on inner pages.

The masked headlines and staggered reveals use the reference timing. Stat counters and mobile menu transitions respect reduced motion. The site preserves browser zoom; the hero shows the full panorama on phones, inputs use 16 px text, and the orchard calendar shows dates inline at narrow widths. All six homepage stage controls support arrow keys and deep-link to their platform stories.

The optional `NEXT_PUBLIC_WHATSAPP_NUMBER` accepts a verified international nursery number at build time. Without one, variety and rootstock selections open the enquiry form with the message filled in.

## Contact email delivery

Set `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` before building to deliver both contact forms through Web3Forms Free. The access key identifies the receiving mailbox and is public by design. Configured submissions go directly from the browser to Web3Forms, with no Firebase enquiry reads/writes. The existing design and inline validation/success states are retained; PDFs are sent separately by email because attachments require a paid provider plan. See [Web3Forms setup and verification](docs/web3forms.md).

Without this key, the existing local/Firebase enquiry backend remains available. To run legacy local-inbox browser tests, explicitly build with `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=` so a configured live form cannot send test messages.

## Firebase and analytics

Copy `.env.example` to `.env.local` for local overrides. Set production variables in the deployment environment.

| Variable                                        | Purpose                                                                                                                                                           |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                          | Production origin for canonical URLs, organization metadata and the sitemap                                                                                       |
| `NEXT_PUBLIC_GA_ID`                             | Optional GA4 measurement ID, set before building                                                                                                                  |
| `FIREBASE_PROJECT_ID`                           | Firebase project containing the production Firestore database                                                                                                     |
| `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Server-side service-account credentials. Application Default Credentials also work in a suitable environment. Use escaped newlines for a single-line private key. |
| `FIREBASE_STORAGE_BUCKET`                       | Private Firebase Storage bucket name for PDF proposals                                                                                                            |
| `FIRESTORE_EMULATOR_HOST`                       | Optional local Firestore emulator address, for example `127.0.0.1:8080`                                                                                           |

Create the Firestore database and Storage bucket in a dedicated Firebase project. Apply the included Firestore and Storage rules to that project. They limit direct client access. The server identity needs Firestore write access, object read/write access to the bucket, and the ability to sign upload policies.

Set the bucket CORS policy to allow the site origin to POST. The browser uploads PDFs directly under `pending/` using a ten-minute signed policy restricted to the object name, MIME type and declared byte count. The server checks the PDF signature and copies the exact object generation into `received/` before recording it. This optional PDF workflow depends on Cloud Storage, which requires Blaze; it is not a Spark deployment prerequisite. Do not enable it on the Spark project. Firestore rate limits use logical expiry and bounded application cleanup, with managed TTL disabled; see [Spark maintenance](docs/spark-firestore.md). [Cloud Storage CORS](https://cloud.google.com/storage/docs/cross-origin)

Enquiries are stored in the `enquiries` collection with reason, preferred reply channel, creation time and attachment details. Staff can review them in Firestore and retrieve the private object from Storage. Retrying the same submission reuses its ID. An unavailable service leaves the visitor’s form intact and provides an email-draft link.

## Test and deploy

```sh
npm run lint
npm run typecheck
npm run format:check
npm test
npm run build
npx playwright install chromium firefox webkit
npm run test:e2e
```

The browser tests start a production server on port 3274 with an isolated temporary inbox. They cover all nineteen public page URLs at fourteen widths from 320 to 1920 px, keyboard navigation, form focus, PDF rejection and acceptance, retries, nursery enquiries and an automated WCAG A/AA audit. An existing test server can be selected with `E2E_BASE_URL`. Optional `E2E_CHROME=1`, `E2E_EDGE_EXECUTABLE` and `E2E_FIREFOX_EXECUTABLE` enable branded or custom test installations.

For a local preview of a production build, run `ZEEBARAN_LOCAL_INBOX=1 npm start`. On Vercel, select the Next.js preset, Node 22, and the project root. Set the production variables above and deploy the repository. Keep the Firebase credentials server-side. Verify a test enquiry, PDF and analytics event on the deployed origin.

## Operating the enquiry desk

Assign a staff owner to review the inbox on each business day. Run `node scripts/desk.mjs inbox` with an authorized Firebase Admin identity to list recent receipt IDs, status, reason and time without printing private message bodies. Read correspondence in the restricted Firestore console. Acknowledgement means stored, not emailed.

On non-Vercel hosts set `TRUSTED_CLIENT_IP_HEADER` only when the ingress overwrites that header with the verified client IP and direct access to the application is blocked. Vercel uses its platform-provided header. Missing identity fails closed. A rate-limited request returns Retry-After.

Live proposals require a private HTTPS malware scanner configured with `PDF_SCAN_URL` and `PDF_SCAN_TOKEN`. The app sends PDF bytes as application/pdf with bearer authentication. The service must return a successful JSON response with verdict "clean" or "infected". Restrict its ingress, avoid logging document bodies, maintain signatures and set concurrency limits. Missing scanner or bucket prevents live proposal intake; text enquiries still work. Local previews perform structural checks only. Pending uploads expire via the bucket lifecycle. Received files may be opened only by authorized staff after the matching enquiry is marked received.

Cloud receipts reserve the request ID before copying a scanned file. Retrying the same request can complete a receiving record. Alert on receiving records older than 15 minutes and on delivery failures or elevated 429s. For an interrupted copy with an existing received object, run `node scripts/desk.mjs recover <UUID>` to verify and rescan it before promotion. If the object does not exist, investigate pending storage and retry the original submission. Keep correlation references, never name, email, proposal contents or tokens in application logs.

Before public intake, verify canonical origin, ingress identity, staff IAM, scanner, signed upload, CORS and retrieval in staging. Exercise concurrent retries, a rejected file, scanner outage, and recipient access. Managed Firestore backups and Cloud Storage recovery depend on billing; do not enable them on Spark. For a future owner-approved paid deployment, restore a test record and attachment to an isolated project and verify checksums. Set an owner-approved retention period covering records, received objects, backups and scanner logs; remove both record and file at expiry. Have the content owner verify published audit, certification and performance claims against their actual records.

## Editorial administration

The protected `/admin` desk provides per-page text, image and film editing, authenticated draft previews, confirmed publication, revision history and a shared Cloudinary media library. It uses verified Firebase sign-in and server-side email authorization. See [admin setup](docs/admin-setup.md) for live configuration, security boundaries and disposable emulator checks. Live provider connections require the credentials described there; passing local checks does not establish live connectivity.
