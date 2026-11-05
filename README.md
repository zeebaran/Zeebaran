# Zeebaran

Original Zeebaran website built from scratch in Next.js App Router, TypeScript, React, Tailwind CSS, Framer Motion, Lucide and Zod.

> **Branch:** `ui/zeebaran_v1` — active development branch.

## Run locally

Requires Node 20.9+ and npm. From this folder:

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. For a production preview, run `npm run build` then `npm start`. Public metadata defaults to https://zeebaran.com; set `NEXT_PUBLIC_SITE_URL` before a build when changing the canonical domain. Avoid using a temporary preview URL as the production canonical.

## Checks

```sh
npm run check        # ESLint, strict TypeScript, contact tests
npm run test:smoke   # Checks running production preview routes and metadata
npm run build        # Production compilation and static generation
npm run check:production # Checks delivery configuration; intentionally fails when absent
npm audit --omit=dev
```

Tests use injected services or mocked HTTP, never real mail delivery. GitHub Actions runs checks/build on pushes and pull requests after you create a remote repository. GitHub connection and deployment are not configured automatically.

## Enquiry delivery

Without provider credentials, the form validates the enquiry and opens a populated email draft. It clearly says **Open email draft**. The visitor must review and send in their mail application. This mode requires a configured mail handler; direct email, telephone and WhatsApp links are also provided. Long drafts may encounter application-specific mailto length limits.

Direct server delivery activates only when all five delivery values are set:

| Variable | Owner action |
|---|---|
| `RESEND_API_KEY` | Create a sending key in a client-owned Resend account |
| `CONTACT_FROM` | Set a sender on a domain verified in that Resend account |
| `CONTACT_TO` | Set the business recipient; example uses contact@zeebaran.com |
| `UPSTASH_REDIS_REST_URL` | Create a client-owned Redis database and use its HTTPS REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Add its server-only REST token |

Keep secrets in `.env.local` locally and Vercel environment settings when authorized to deploy. Never commit secrets or paste them in public chat. Set preview and production values deliberately. No paid services or accounts have been created.

Direct delivery uses server-side Zod validation, a bounded 16KB request body, exact-origin checks, a honeypot, atomic Redis rate limiting (five valid attempts per 15 minutes per network identifier), short provider timeouts, and Resend idempotency keys. Rate-limit failures fail closed. Provider acceptance is reported as acceptance for delivery, not proof that an email reached an inbox. A retry retains its identifier until form values change. Successful delivery clears the form. No enquiries are stored in an application database or printed to logs.

The trusted IP header adapter is specific to Vercel. Outside Vercel, requests use a shared `local` bucket until you implement your host's trusted proxy adapter. Never blindly trust arbitrary `X-Forwarded-For` headers.

Before launch, send a real test using the client's provider, verify arrival and reply-to, test the 429/error flows, and check spam placement. This has not been possible without credentials.

## Optional integrations

- `NEXT_PUBLIC_GA_ID`: valid GA4 measurement ID. Analytics loads only after consent. Events: `page_view`, `contact_click` (phone/email/WhatsApp), `email_draft_opened`, `generate_lead` (server acceptance only). Query strings and form contents are excluded. Turn **off automatic history-based page views** in the GA4 stream's enhanced measurement settings, since the app emits route page views. Verify events once in DebugView before release.
- `GOOGLE_SITE_VERIFICATION`: Search Console HTML verification value. Ownership verification and sitemap submission require the owner's Google account.
- `GOOGLE_MAPS_EMBED_URL`: verified Google Maps embed URL (`https://www.google.com/maps/embed...`). Map remains absent until supplied, and loads only after a visitor clicks. The app does not invent a business pin.

## Content editing

- `src/lib/site.ts`: business identity, canonical origin, contact channels, navigation.
- `src/content/plants.ts`: approved named apple selections and installation steps.
- `src/app/*/page.tsx`: page narrative and composition.
- `src/app/globals.css`: tokens, grids, responsive rules and component styles.
- `public/images`: locally served original-site photography.

Current contact channels follow the existing website: phone **+91 7889796733**, WhatsApp **+91 7889385964**, email **contact@zeebaran.com**. User requested use of published channels. The two numbers are intentionally distinct.

Only Gala and Red Delicious names are included. No stock, rootstock, prices, years in business, client counts, yield promises, certifications, reviews or purchase checkout are invented. Get approved specifications and current photographs before expanding the catalogue. Product detail images are explicitly illustrative orchard photography.

## Release handoff

1. Review copy, catalogue, legal business name, contact channels and rights to reused photographs.
2. Establish the business mailbox retention policy and review the privacy notice against actual operations.
3. Supply client-owned provider credentials; verify real delivery.
4. Optionally supply GA4, Search Console and verified Maps configuration; test each.
5. Create the GitHub repository and connect Vercel only when authorized. Use the Next.js preset, Node 20+, `npm ci`, `npm run build`; no static-export setting.
6. Preview-test navigation, validation, delivery, mobile layouts, metadata and analytics. Keep production data out of preview tests.
7. Obtain authorization to publish and attach the domain. Keep the old deployment available for rollback.
8. After launch, verify HTTPS, canonical URLs, email, sitemap, redirects and field performance. Roll back to the previous Vercel deployment if a release fails; env changes require separate rollback.

See `docs/ARCHITECTURE.md` for structure/design decisions and `docs/VERIFICATION.md` for measured results and limitations.

Development tooling pins a scoped `minimatch@11.0.1` override for `@typescript-eslint/typescript-estree` to address GHSA-g3hv-75wg-m249. Lint/type checks validate compatibility; remove the override when the upstream dependency adopts the patch.
