# Assistant motion and focused review — 13 November 2026

## Delivered

- Existing circular launcher floats upward by at most 3px over a six-second cycle. Pointer hover and keyboard focus hold it steady.
- The existing mark makes one full turn in each 16-second cycle, resting for most of that cycle. Hover or keyboard focus triggers a separate eased 1.4-second turn; overlapping triggers are ignored.
- Reduced-motion preferences disable the CSS motion and cancel an active interactive turn. Hidden documents cancel interactive turns and pause launcher CSS animations; an open panel pauses the hidden launcher's CSS animation.
- No animation library, polling interval, per-frame React state, or additional backend request was introduced. Existing colors, illustration, shape, panel layout, and content styling remain intact.

## Verified issues fixed

| Issue                                                   | Evidence                                                                                                                               | Correction                                                                                                                    |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Next draft erased by a slow snapshot refresh            | Browser regression failed before the correction: a second question typed while the first request was pending became empty              | Clear only the draft matching the submitted question                                                                          |
| Published managed partner profiles missing from answers | Source regression failed before the correction; existing partnership data was read but structured profiles were omitted                | Include bounded profile excerpts from the same already-loaded published page; no extra query or private draft data            |
| Short CEO/CIV questions missed published content        | Unit regressions failed before the correction; live verification subsequently exposed generic governance copy outranking the named CEO | Retain useful short acronyms and expand CEO matching to its full role; verified Mr. Aadil Sheikh from published About content |
| Repeated normalization slowed larger-content matching   | Identical 990-passage fixture, 1,458 characters per passage, 12 calls per version                                                      | Normalize each passage once per answer and use sets for exact/singular matches                                                |
| Keyboard traversal left the dialog controls             | Chromium reached the document body at the boundary; WebKit skipped controls in its native traversal                                    | Explicit Tab/Shift+Tab traversal of visible enabled controls; verified wraparound and Escape focus restoration                |
| Independent server retrieval stages ran sequentially    | Source inspection confirmed catalog retrieval completed before published page retrieval began                                          | Start both stages together, retaining existing pagination, caches, projections, and read counts                               |

## Performance and backend impact

The repeated-matching stress fixture improved from **184.19ms median / 187.78ms p95** to **18.25ms median / 20.91ms p95** on this machine. These are synthetic Node matching measurements, not production INP or a whole-site speed score.

A read-only live snapshot returned HTTP 200, 12 catalog entries, 11 public page records, and `partial: false`. The initial measured API call took 4,096ms; the immediately following warm call took 7ms. This illustrates the remaining cold Firebase/network cost; it is not a guaranteed latency bound. Independent retrieval stages now overlap, but no controlled cold-cache before/after comparison was established for that change.

Browser checks verified zero assistant snapshot requests before opening, one request shared by multiple messages and reopening within the cache lifetime, and no per-message API writes. The existing 60-second client snapshot lifetime, published catalog/CMS caches, and concurrent-request deduplication remain. The partner addition uses existing page reads, with no new collection or listener. Client/server caching means recently published content is not necessarily visible immediately in an already-open conversation.

Live published CEO, Balson, and Feno answers were checked in the browser using one retrieved public snapshot. No Firebase documents, Cloudinary assets, credentials, permissions, or security rules were changed by this review.

## Verification

- Production build: passed (`ZEEBARAN_BUILD_DIR=.next-perf npm run build`).
- Type generation and TypeScript: passed.
- Whole-project ESLint: passed.
- Whole unit suite: **222 passed across 32 files**.
- Assistant browser suite: **26 passed**, 13 workflows each in Chromium and WebKit.
- Viewports covered by the assistant suite: 320, 390, 768, 1440, and 2560px. Settled 390px layouts were also visually inspected in both engines; no horizontal overflow.
- Automated dialog WCAG checks passed in the tested state. Motion preferences, exact periodic rotation phases, float bounds, interactive turn cancellation, comparison dock clearance, retained conversation, request counts, markup escaping, recovery, and draft preservation were checked.
- Voice recognition tests use a deterministic browser API fixture, covering exactly-once transcription/send, permission errors, and unsupported browsers. Physical microphone accuracy and the browser's external speech service were not tested.
- Final browser visual check recorded no page errors. Scoped Prettier checks and `git diff --check` passed.

## Files changed for this task

- `features/assistant/AssistantLauncher.tsx`
- `app/assistant.css`
- `features/assistant/AssistantPanel.tsx`
- `features/assistant/engine.ts`
- `features/assistant/server.ts`
- `tests/e2e/assistant.spec.ts`
- `tests/unit/assistant.test.ts`
- `tests/unit/assistant-source.test.ts`

Existing unrelated working-tree changes were preserved. Verification used isolated production previews, leaving the user's development server untouched. No commit, push, or deployment was performed.

## Limits

This is a focused assistant review, not a new whole-project certification. The assistant remains a deterministic published-content guide: unrecorded specifications and unsupported questions require a team enquiry. It does not invent agronomy answers or become a generative model through these changes. Real-device battery use, production traffic, field Core Web Vitals, physical voice input, and exhaustive natural-language understanding have not been established. Passing these checks does not prove that every possible bug is absent.
