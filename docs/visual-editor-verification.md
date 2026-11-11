# Visual editor verification — 10 November 2026

Scope: edit the existing website directly inside every website page workspace, preserving the public design and the existing authenticated draft/publish workflow.

The built production app was also started locally and checked in Chromium: Home, Mission and Varieties returned HTTP 200, the live Firestore catalog rendered 12 cards, the canvas redirected anonymous requests to sign-in, and no browser exceptions occurred. These were read-only checks.

| Check                     | Result                                                | Evidence                                                                                                                               |
| ------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Unit suite                | 58 passing tests across 8 files                       | `npm test`; includes protocol guards and editable/locked field boundaries                                                              |
| Visual editor integration | 33 passing checks                                     | `scripts/check-visual-editor.mjs`; real local browser → protected API → disposable Firestore/Auth emulators                            |
| Mission regression        | 48 passing checks                                     | `scripts/check-mission-videos.mjs`; section add/remove/publish, responsive cards, source selection, playback state and delivery errors |
| Lint                      | Pass, no warnings                                     | `npm run lint`                                                                                                                         |
| Type checking             | Pass                                                  | `npm run typecheck` and production build TypeScript phase                                                                              |
| Production build          | Pass                                                  | `ZEEBARAN_BUILD_DIR=.next-admin npm run build`                                                                                         |
| Inspector accessibility   | No automated violations in the new text dialog        | axe-core WCAG 2/2.1/2.2 AA tags, Chromium; Escape closes dialog                                                                        |
| Responsive editor         | Pass                                                  | Actual 390px/820px canvas widths, responsive navigation, no outer admin overflow at 390px                                              |
| Existing user server      | Home and Mission HTTP 200, expected original headings | Read-only inspection on `localhost:3000`; no browser exceptions                                                                        |

The integration checks verify that typing updates the real page without changing its Firestore draft, Save retains canvas position, private drafts remain absent from public pages, Publish updates public content, original-image descriptions save correctly, and a selected registered media fixture updates the canvas and passes server validation. They also cover Mission card access, shared navigation/email destinations, editable form placeholders, intercepted form submissions and rejected selection messages from unrelated windows.

Production compilation exposed a pre-existing catalog error handler catching Next.js’s request-time `searchParams` interrupt. Reading the request parameters before the catalog catch preserves framework routing and keeps actual service failures in the existing fallback.

No production content was written, migrated or published during these checks. Emulator fixtures were restored. Synthetic library pixels and a simulated YouTube control API exercise integration behavior; these do not establish real Cloudinary upload or YouTube streaming availability. Browser coverage is Chromium. The scoped accessibility scan is not a complete website WCAG certification, and no field Core Web Vitals or performance scores are claimed.
