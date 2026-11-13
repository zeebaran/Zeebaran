# Zeebaran orchard desk

Implemented 11 November 2026. A custom floating, retrieval-based website assistant, using the existing published Firestore catalog and website content. No paid inference API, language-model subscription, new package, Cloud Function or billing-plan change is introduced.

## Experience

A circular orchard mark appears on public pages, clear of the existing comparison dock. Its panel opens as a compact 400px-wide, 460px-tall card on roomy screens, then grows smoothly to a 460px-wide, 720px-tall conversation when the first question is submitted. Viewport and comparison-dock clearance cap both sizes. A separate rounded-square minimize control stays below the card; the closed launcher is a circular conversation-and-leaf mark. Minimizing preserves the conversation; reset returns to the compact view. Forest green, cream, the existing Hanken Grotesk/Newsreader fonts and leaf accents extend the website's existing identity. The refined UI uses smaller headings, icon-led suggestion tiles, a single composer focus treatment and scoped styles. Welcome copy and cards enter in a short stagger; the floating conversation-and-leaf mark draws on entry with two finite ring pulses, then rests. Reduced-motion preferences disable this choreography. Styles are scoped to the assistant. Existing page content, sketches and animations were preserved.

The interface includes responsive product previews, expandable specifications, evidence-backed shortlists, side-by-side comparison tables with highlighted differences, independent selection dropdowns, profile/comparison/contact links and contextual suggestions. Newly added collection entries are discovered from published data. Results display six cards at a time with additional entries available without another database request.

The composer has a rounded text field with separate circular microphone and send controls. Suggestion cards sit slightly lower and there is no visible composer divider. Browser speech recognition is started only by tapping the mic: interim transcription appears in the field, existing typed text is retained, and finalized speech is submitted once recognition ends. Tapping the active mic stops listening and sends the finalized question. Closing, minimizing, resetting or unmounting cancels recognition without submitting; queued callbacks are ignored. Errors and unavailable recognition fall back to typing and retain the draft. Questions exceeding 600 characters remain editable and are not silently truncated or automatically sent.

Voice input depends on browser support, microphone permission and a secure context (HTTPS or localhost). The browser may process audio through its own online recognition service; on-device recognition and offline support are not promised. Zeebaran does not upload audio to its own API, Cloudinary or Firestore. The permissions policy now allows microphone access only to the site's own origin (`microphone=(self)`); camera and geolocation remain disabled. See [MDN SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition). Automated voice tests simulate browser recognition events; physical microphone and recognition-service accuracy still require device testing.

Native dialog semantics provide focus containment, Escape dismissal and background isolation. Closing restores launcher focus. Reduced-motion settings suppress transition/typing animations. The layout responds to the visual viewport for mobile keyboard clearance; physical-device keyboards remain a verification limit. Conversation state survives closing/reopening and public client navigation, but is not saved to storage or transmitted for inference. Reset starts a new conversation. Private admin routes and editor canvases do not include the launcher.

## Architecture

| Module                                     | Responsibility                                                                                                  |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `features/assistant/AssistantLauncher.tsx` | Small public entry point; lazy-loads the panel on first use; observes comparison-dock clearance                 |
| `features/assistant/AssistantPanel.tsx`    | Conversation state, native dialog, cards, comparison controls, retrieval/progress/error states                  |
| `features/assistant/engine.ts`             | Pure deterministic intent/entity matching, contextual questions, evidence filtering and comparison              |
| `features/assistant/types.ts`              | Shared public snapshot, context, requirements and answer types                                                  |
| `features/assistant/client.ts`             | One-minute in-memory snapshot reuse, in-flight deduplication, timeout and retry; no transcript network requests |
| `features/assistant/server.ts`             | Explicit public field projection; existing bounded published catalog pages and published CMS services           |
| `features/assistant/limiter.ts`            | Bounded process-local request burst protection with no Firestore counter writes                                 |
| `app/api/assistant/route.ts`               | Fixed read-only GET endpoint, query/cross-site rejection, safe service failures and no admin operations         |
| `app/assistant.css`                        | Scoped styling, responsive dialog, focus indicators and motion preferences                                      |

The global integration changes are one import/render in `components/SiteFrame.tsx` and one CSS import in `app/layout.tsx`. There are no changes to Firebase configuration, rules, indexes, credentials, product documents, existing admin permission checks or image delivery policy.

## Sources, retrieval and freshness

Catalog records come exclusively from `catalogPublished` through the existing `publishedPage` service. The assistant does not import migration products or maintain a second hardcoded catalog. Returned fields are explicitly selected; draft content and administrative bookkeeping are not spread into the response. The first registered Cloudinary image uses the existing `AssetImage` loading/error/placeholder policy.

Website information uses the same authored content catalog and `publishedContent` overrides as the public website. Enabled regional hub records use the existing resolver used by the real map. This is retrieval of existing page passages, not invented business knowledge. Authenticated draft-mode cookies do not change the assistant's sources. No private draft service, Firebase client listener or admin action is exposed.

The browser loads no assistant data before opening. The panel and matching engine are code-split. Overlapping snapshot requests share one promise. Recent snapshots are reused for 60 seconds; expired snapshots refresh on reopening or on the next question. The existing underlying catalog cache is 300 seconds and the CMS cache 60 seconds, with existing publication tag invalidation. Without publication invalidation, catalog age can therefore approach six minutes at the browser; CMS age can approach two minutes. Already rendered answers retain their own source snapshot and retrieval timestamp. There is no promise of instant live synchronization.

Catalog retrieval follows at most ten existing 24-entry pages per kind: up to 480 total entries. Larger catalogs explicitly set `partial` and direct visitors to browse the main catalog. This is suitable for the current portfolio, not a full-text architecture for tens of thousands of products. Pagination/indexed retrieval should replace a full snapshot before that scale. Website excerpts are bounded per page; original profiles remain available through direct links.

## Recommendation methodology

1. Normalize case, punctuation, accents and common code spacing. Recognize names, local names and codes dynamically. Conservative edit-distance matching handles longer name misspellings; short rootstock codes require an exact normalized match.
2. Identify discovery, detail, comparison, replacement, compatibility, pricing, recommendation or website-information requests. Context retains the chosen kind, selection pair and supplied requirements. Selection replacement can target either side without restarting.
3. Ask whether the visitor is selecting a variety or rootstock, then ask for altitude, soil/drainage and density when needed. Extract supported climate, vigour, harvest and storage terms where expressed. Explicit feet inputs are converted to metres; catalog numeric altitude matching requires a stated two-bound metre range.
4. Build a shortlist only from populated, relevant published specification fields. Origin and product names do not prove climate suitability. A known out-of-range altitude, an explicitly negated suitability statement or a conflicting recognized density requirement prevents shortlisting. Negative visitor preferences are not treated as positive keywords.
5. Rank by number of requirements with supporting fields; ties retain catalog ordering. Show the exact supporting field values, identify unconfirmed requirements and label the result a specification shortlist rather than a confirmed agricultural recommendation.
6. Use explicit `rootstockIds` relationships for compatibility. An unlisted pair means unconfirmed, not proven incompatibility. Comparisons show the actual field values and explicitly mark absent fields. Different does not imply better.

The engine does not generate agricultural facts, predict yields, guarantee outcomes or substitute for a site assessment. Published yield/quality claims are displayed as catalog statements, not independently validated agronomy. Missing data cannot be repaired by conversational phrasing. Prices/live availability are not recorded in the current schema, so those questions link to the team instead of generating amounts.

## Cost and infrastructure evaluation

**Inference usage cost: zero.** No OpenAI/Gemini/Claude call, embedding service, vector database, WebGPU model download or model server is used. Matching executes locally in the visitor's browser. Messages are not sent to the snapshot endpoint. No chat transcripts or rate counters are written to Firestore.

The existing hosting, Cloudinary delivery and Firestore read/egress quotas still apply. This feature does not make unlimited traffic free. Current source verification found 12 published catalog entries and 11 website-content scopes. A completely uncached assembly would read those catalog documents and CMS documents; cache hits reuse existing query results. No new listener or per-message read is introduced. Exact billable reads under deployed traffic and multi-instance caches were not measured.

Verified official Firestore Standard free quotas are 1 GiB stored data, 50,000 document reads/day, 20,000 writes/day, 20,000 deletes/day and 10 GiB outbound transfer/month for one free database. These are shared project allowances, not a new allocation for this feature. See [Firestore quotas](https://firebase.google.com/docs/firestore/quotas). [Firebase pricing plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans) distinguishes Spark from pay-as-you-go Blaze. No upgrade was made, and an account later switched to Blaze can incur existing infrastructure charges beyond allowances.

A small open model was considered: [Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B) has an open license and local-runtime options. Browser inference through [WebLLM](https://github.com/mlc-ai/web-llm) uses WebGPU. Model weights, tokenization/runtime, GPU/browser compatibility, inference memory, initial download/compile time and evaluation/maintenance would add requirements that do not exist for the chosen retrieval engine. Hosting a local model for public visitors also requires an available inference server; a model license does not supply free production compute. No model was installed or hardware benchmark fabricated. The deterministic architecture better satisfies the requested low-latency, lightweight, no-inference-charge constraint for this catalog.

## Validation and abuse boundaries

The assistant accepts at most 600 characters per question, 20 completed questions per minute and 40 conversation turns before reset. These client limits prevent accidental local workload growth; they are not security enforcement against a modified browser. The server only accepts a fixed GET without query parameters, rejects browser cross-site fetches, allows at most 60 requests per identity/minute and 600/process/minute, and bounds its identity map to 512 entries. Identities are hashed and not persisted. The endpoint accepts no instruction text, arbitrary Firestore path, user-selected query, write or tool-execution operation.

Process-local limits reset on restart and are not a distributed DDoS boundary. Forwarded IP headers are a best-effort signal unless the deployment sanitizes them; the independent global process limit also applies. Production edge limits should be configured with the existing host if needed, without assuming a free paid service. The browser aborts a slow snapshot after 15 seconds and retains a readable retry/contact path.

User and database strings render as React text; no Markdown HTML parser or `dangerouslySetInnerHTML` is used. Prompt-injection-like copy cannot make this rule engine invoke admin APIs or execute tools. Existing role/session/rules protections remain unchanged.

## Verification

- Production build, lint, TypeScript and formatting checks completed; 143 unit tests across 20 files pass, including new engine, source/cache, API-boundary and burst-limit cases.
- Chromium and WebKit public regression suite: 77 passed, with 19 explicit environment/duplicate-coverage skips. This includes ten assistant browser cases for lazy retrieval, reuse/no message requests, comparisons/replacement, missing information, responsive bounds, keyboard focus, Escape, error/retry, text escaping, admin exclusion, additional entries and comparison-dock clearance.
- Subsequent UI refinement: 14 focused Chromium/WebKit assistant checks passed, including compact-to-expanded geometry, shaped minimize control, line-drawing/stagger choreography, reduced-motion suppression and a single composer focus treatment. Four conversation/motion checks were repeated successfully after correcting the initial welcome scroll position.
- Voice/composer update: 154 unit tests across 21 files pass. All 18 focused assistant browser checks passed across Chromium/WebKit (16 on the first run; the two permission-fallback cases passed after correcting their test alert selector). Coverage includes interim/final transcription, exactly-once submission, manual stop, late callbacks after cancellation, overlength speech, denied permissions, missing browser support, external circular controls and 320–2560px responsive bounds. Desktop/mobile screenshots show no divider or overlapping controls; no page errors or framework overlays were observed. ESLint, TypeScript, formatting, whitespace checks and a separate production build passed. Speech input was simulated; no actual microphone recording or transcription-provider accuracy was tested.
- Assistant Axe scan against WCAG A/AA tags passed in the exercised dialog state. This does not certify the complete website or every screen-reader/device scenario; the owner's pre-existing leaf-text contrast exception remains unchanged elsewhere.
- Real published data was exercised with M9 vs M26, switching to M7, a multi-factor orchard question and missing altitude data. An isolated `demo-zeebaran-assistant` project confirmed a newly added public entry and published CMS text are returned while both private draft markers are excluded. Demo fixtures are removed after the checks; live records were not mutated.
- Screenshots inspected at 1440 × 1000 and 390 × 844. Assistant viewport tests cover 320, 390, 768, 1440 and 2560 pixels. Browser checks verify the launcher across representative public routes and its absence under administration.
- Final local production observation: first opening including lazy code/data took 886 ms. Five follow-up responses took 56–63 ms; there was exactly one snapshot GET, no non-GET requests and no browser exceptions. The panel/engine chunk measured 29,940 bytes raw / 10,321 bytes gzip and was not requested before opening. The current snapshot measured 60,721 bytes raw / 17,562 bytes gzip (sizes measured with gzip, not a claim about the deployed server's wire encoding).
- The launcher was verified on 15 representative public routes. An 85-file production client JS/map scan found none of the configured privileged credential values. The snapshot contained no draft/admin markers. Evidence is saved in ignored `.local/assistant-baseline/final-verification.json`. These samples are local observations, not field Core Web Vitals, global latency promises or a concurrency benchmark.

The existing dev process was restarted during verification. `http://localhost:3000` opens the assistant. The separate `127.0.0.1:3000` development check was blocked by the existing Next.js `allowedDevOrigins` policy, which allows the configured LAN host and default localhost. This is distinct from production behavior. No broad development-origin wildcard or security-policy relaxation was added.

## Known limits

- English intent/keyword retrieval is intentionally bounded. This is not an unrestricted language model, multi-language translator or general agricultural expert. Ambiguous words and complex prose can require rephrasing or a focused follow-up.
- Climate, soil and altitude fields are incomplete in the current published catalog. Numeric suitability inference only handles explicit metre ranges; irregular formats, single-sided bounds and unstructured prose are not treated as validated agronomic rules.
- Website passage matching is lexical and returns published excerpts, with source-page links. It is not unrestricted semantic reasoning over all PDF/video/image contents.
- No live inventory/pricing integration, external weather/soil service or agronomy verification was added.
- No physical-device keyboard, long-running multi-instance capacity, field p75 INP or Firefox result is claimed. Existing browser-infrastructure limitations remain.
- This work is local and uncommitted; it was not automatically pushed to GitHub or deployed.
