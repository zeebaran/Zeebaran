# Verification and remaining activation work

Verified on 5 November 2026 against a local production build. No public deployment or production domain changes were made.

## Engineering checks

- Production build: passed. Nine public content pages, API route, metadata endpoints and error pages compile successfully.
- TypeScript strict checking and ESLint: passed.
- Automated contact tests: 14 passed. Covers validation, unknown fields, origin rejection, body limits, malformed JSON, honeypot, rate limiting, provider failures and accepted delivery behavior using injected services.
- HTTP smoke tests: nine pages and ten internal destinations passed; metadata, canonical tags, one h1 per page, headers, 404 responses, permanent legacy redirect and origin rejection checked.
- Browser checks: all nine pages at 320px, 768px and 1440px had one main heading and no horizontal document overflow. Additional 390px contact/menu checks passed.
- Interactions: menu disclosure and Escape, contact navigation, first-invalid-field focus, accessible inline errors, Gala enquiry prefill, and service FAQ disclosure verified.
- Observed browser console errors/warnings: none in the checked pages. This is not an exhaustive cross-browser certification.
- Dependency audit after compatible patches and a scoped minimatch override: zero reported vulnerabilities, including development dependencies.
- Git initialized locally. Source remains uncommitted for review; no remote or push.

## Lighthouse lab results

| Page / profile | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|
| Home / mobile | 93 | 100 | 100 | 100 | 3.2 s | 0 | 30 ms |
| Home / desktop | 100 | 100 | 100 | 100 | 0.7 s | 0 | 0 ms |
| Contact / mobile checks | Not measured | 100 | 100 | 100 | — | — | — |

The initial mobile result was 89 with LCP 3.7 s. Explicit hero fetch priority, accurate responsive sizing and image compression improved the measured result above. **The mobile LCP target of ≤2.5 s has not yet been reached.** Local lab results are not guarantees for Vercel, visitor devices or future integrations. INP requires field traffic; no field INP claim is made. Repeat Lighthouse and collect real-user Web Vitals on the authorized deployment. The full reports accompany this handoff.

A contact-page CSP warning was traced to Zod's dynamic-code capability probe. Shared validation now explicitly uses jitless mode, preserving the production CSP without allowing unsafe eval. Automated validation tests were rerun after this change.

## Configuration intentionally pending

`npm run check:production` fails clearly while required delivery values are absent. This is expected, not a failed application build.

- Resend sending key and domain-verified sender; confirmed recipient mailbox.
- Upstash Redis HTTPS REST URL and server token.
- Explicit production canonical origin.
- Optional GA4 measurement ID, Search Console verification value and verified Maps embed URL.
- Approved catalogue details, current planting photographs, image publication rights and business retention policy.
- Client-owned GitHub/Vercel accounts and explicit authorization before push/deployment/domain changes.

Until configured, the form opens an email draft and does not claim server delivery. Actual mail-provider receipt, Redis behavior on the client's account, analytics collection, Search Console ownership and the business map cannot be verified without owner credentials. No live messages were sent during tests.

## Reproduce

Run `npm ci`, `npm run check`, `npm run build`, then `npm start`. In another terminal run `npm run test:smoke`. Lighthouse 13 requires a compatible modern Node runtime (use Node 22.19+ or 24) and Chrome:

```sh
npx lighthouse http://127.0.0.1:3000 --chrome-flags='--headless' --output=html
npx lighthouse http://127.0.0.1:3000 --preset=desktop --chrome-flags='--headless' --output=html
```

Use the source README for secure configuration and release steps.
