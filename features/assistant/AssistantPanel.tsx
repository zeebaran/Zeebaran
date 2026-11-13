"use client";
import { useEffect, useRef, useState, useCallback, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowUp,
  ArrowUpRight,
  ArrowLeftRight,
  Leaf,
  RotateCcw,
  X,
  Check,
  RefreshCw,
  ChevronDown,
  Compass,
  Sprout,
  Mic,
  Square,
} from "lucide-react";
import { AssetImage } from "@/features/media/AssetImage";
import { CompareButton } from "@/features/catalog/ComparisonProvider";
import { catalogHref } from "@/features/catalog/model";
import { answerQuestion } from "./engine";
import { loadKnowledge } from "./client";
import { freshContext, type Answer, type Knowledge } from "./types";
import { startVoiceInput, type VoiceSession, type RecognitionConstructor } from "./speech";
import { AssistantBackdrop } from "./AssistantBackdrop";
type Turn = { id: number; question: string; answer: Answer; knowledge: Knowledge };

export default function AssistantPanel({
  opened,
  clearance,
  onClose,
}: {
  opened: boolean;
  clearance: number;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    inputRef = useRef<HTMLTextAreaElement>(null),
    log = useRef<HTMLDivElement>(null);
  const closeCallback = useRef(onClose);
  useEffect(() => {
    closeCallback.current = onClose;
  }, [onClose]);
  // ─── FEATURE FLAG ─── set NEXT_PUBLIC_ASSISTANT_INTERACTIVE=true in .env.local to enable
  const interactive = process.env.NEXT_PUBLIC_ASSISTANT_INTERACTIVE === "true";
  const [closing, setClosing] = useState(false),
    [expanded, setExpanded] = useState(false),
    [input, setInput] = useState(""),
    [turns, setTurns] = useState<Turn[]>([]),
    [knowledge, setKnowledge] = useState<Knowledge | null>(null),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [listening, setListening] = useState(false),
    [error, setError] = useState(""),
    [resultLimits, setResultLimits] = useState<Record<number, number>>({});
  const context = useRef(freshContext()),
    lock = useRef(false),
    active = useRef(true),
    sent = useRef<number[]>([]),
    closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voice = useRef<VoiceSession | null>(null);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      voice.current?.cancel();
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);
  useEffect(() => {
    if (!opened) return;
    const d = dialog.current;
    if (!d) return;
    d.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const viewport = window.visualViewport;
    const resize = () =>
      d.style.setProperty(
        "--assistant-available-height",
        `${viewport?.height || window.innerHeight}px`,
      );
    resize();
    viewport?.addEventListener("resize", resize);
    let alive = true;
    loadKnowledge()
      .then((data) => {
        if (alive) {
          setKnowledge(data);
          setError("");
        }
      })
      .catch((e) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
      voice.current?.cancel();
      voice.current = null;
      d.close();
      document.body.style.overflow = overflow;
      viewport?.removeEventListener("resize", resize);
    };
  }, [opened]);
  useEffect(() => {
    if (log.current) log.current.scrollTop = turns.length || busy ? log.current.scrollHeight : 0;
  }, [turns.length, busy, error, loading]);
  function close() {
    if (closing) return;
    voice.current?.cancel();
    voice.current = null;
    setListening(false);
    setClosing(true);
    closeTimer.current = setTimeout(
      () => {
        dialog.current?.close();
        closeCallback.current();
        setClosing(false);
      },
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 180,
    );
  }
  function reset() {
    if (lock.current) return;
    voice.current?.cancel();
    voice.current = null;
    setListening(false);
    context.current = freshContext();
    setTurns([]);
    setExpanded(false);
    setResultLimits({});
    setInput("");
    setError("");
    inputRef.current?.focus();
  }
  const send = useCallback(
    async (question: string) => {
      if (lock.current || !question.trim()) return;
      voice.current?.cancel();
      voice.current = null;
      setListening(false);
      if (question.length > 600) {
        setError("Please keep your question under 600 characters.");
        return;
      }
      if (turns.length >= 40) {
        setError(
          "Start a new conversation to continue. Your current conversation stays here until you reset it.",
        );
        return;
      }
      const now = performance.now();
      sent.current = sent.current.filter((t) => now - t < 60_000);
      if (sent.current.length >= 20) {
        setError("A brief pause. Please wait a minute before sending more questions.");
        return;
      }
      setExpanded(true);
      lock.current = true;
      setBusy(true);
      setError("");
      try {
        const data = await loadKnowledge();
        // Yield one frame so real retrieval/matching progress can paint without an artificial typing delay.
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        const answer = answerQuestion(question, data, context.current);
        if (!active.current) return;
        setKnowledge(data);
        context.current = answer.context;
        sent.current.push(now);
        setTurns((old) => [...old, { id: now, question, answer, knowledge: data }]);
        // A refresh can finish after the visitor has started drafting their next question.
        setInput((current) => (current.trim() === question.trim() ? "" : current));
      } catch (e) {
        if (active.current)
          setError(
            e instanceof Error
              ? e.message
              : "The collection could not be loaded. Please try again.",
          );
      } finally {
        lock.current = false;
        if (active.current) {
          setBusy(false);
          inputRef.current?.focus();
        }
      }
    },
    [turns.length],
  );
  function submit(e: FormEvent) {
    e.preventDefault();
    if (listening) return;
    void send(input);
  }
  function toggleVoice() {
    if (voice.current) {
      voice.current.stop();
      return;
    }
    if (busy || loading || closing) return;
    const browser = window as Window & {
      SpeechRecognition?: RecognitionConstructor;
      webkitSpeechRecognition?: RecognitionConstructor;
    };
    setError("");
    setListening(true);
    const session = startVoiceInput({
      Recognition: browser.SpeechRecognition || browser.webkitSpeechRecognition,
      draft: input,
      language: navigator.language || "en-IN",
      onText: setInput,
      onFinish: (question) => void send(question),
      onError: setError,
      onEnd: () => {
        voice.current = null;
        setListening(false);
      },
    });
    voice.current = session;
    if (!session) setListening(false);
  }
  const latest = turns.at(-1)?.answer;
  const roots = knowledge?.items.filter((i) => i.kind === "rootstock") || [];
  const starters = [
    "Explore apple varieties",
    roots.length >= 2
      ? "Compare " + (roots[0].code || roots[0].name) + " vs " + (roots[1].code || roots[1].name)
      : "Compare two rootstocks",
    "Help me choose a rootstock",
  ];
  return (
    <dialog
      id="orchard-assistant"
      ref={dialog}
      className="orchard-panel"
      data-closing={closing}
      data-expanded={expanded}
      style={{ "--assistant-clearance": `${clearance}px` } as React.CSSProperties}
      aria-labelledby="orchard-title"
      aria-busy={loading || busy}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]',
          ),
        ).filter((node) => node.getClientRects().length && node.tabIndex >= 0);
        if (!controls.length) return;
        event.preventDefault();
        const index = controls.indexOf(document.activeElement as HTMLElement);
        controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
      }}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            close();
        }
      }}
    >
      <div className="orchard-window">
        <AssistantBackdrop />
        <header className="orchard-header">
          <AssistantBackdrop header />
          <div className="orchard-header-mark">
            <Leaf size={21} strokeWidth={1.5} />
          </div>
          <div>
            <p className="orchard-eyebrow">THE ORCHARD DESK</p>
            <h2 id="orchard-title">
              Ask Zeebaran<span>.</span>
            </h2>
          </div>
          <div className="orchard-header-actions">
            <button
              type="button"
              aria-label="Start a new conversation"
              title="Start a new conversation"
              disabled={busy || (!turns.length && !listening)}
              onClick={reset}
            >
              <RotateCcw size={17} />
            </button>
            <button type="button" aria-label="Close Zeebaran assistant" onClick={close}>
              <X size={21} />
            </button>
          </div>
        </header>
        <div className="orchard-conversation" ref={log} aria-label="Conversation">
          {!turns.length && (
            <section className="orchard-welcome">
              <div className="orchard-welcome-art" aria-hidden="true">
                <svg viewBox="0 0 180 90" fill="none">
                  <path
                    d="M12 76c24-20 43-22 65-11 26 13 52 7 89-18M12 84c28-14 54-12 78-3M95 73V35m0 18c-18 0-24-11-24-24 17 0 24 10 24 24Zm0-11c0-19 10-28 27-28 0 17-10 28-27 28Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="m20 43 24-20 21 22M116 62c16-10 33-10 49-4"
                    stroke="currentColor"
                    opacity=".3"
                    strokeWidth="1.2"
                  />
                </svg>
              </div>
              <h3>
                A little clarity.
                <br />
                <em>A better starting point.</em>
              </h3>
              <p>Find a clearer starting point for your orchard.</p>
              <div className="orchard-starters">
                {starters.map((s, i) => (
                  <button
                    key={s}
                    type="button"
                    disabled={busy || loading || listening || !interactive}
                    onClick={() => void send(s)}
                  >
                    <span className="orchard-starter-symbol" aria-hidden="true">
                      {i === 0 ? (
                        <Sprout size={14} strokeWidth={1.5} />
                      ) : i === 1 ? (
                        <ArrowLeftRight size={14} strokeWidth={1.5} />
                      ) : (
                        <Compass size={14} strokeWidth={1.5} />
                      )}
                    </span>
                    <span className="orchard-starter-copy">{s}</span>
                    <span className="orchard-starter-arrow" aria-hidden="true">
                      <ArrowUpRight size={13} strokeWidth={1.6} />
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}
          {turns.map((turn) => {
            const knowledge = turn.knowledge;
            return (
              <section className="orchard-turn" key={turn.id}>
                <div className="orchard-question">{turn.question}</div>
                <article className="orchard-answer">
                  <span className="orchard-answer-byline">
                    <Leaf size={12} /> ZEEBARAN DESK
                  </span>
                  {turn.answer.title && <h3>{turn.answer.title}</h3>}
                  <p>{turn.answer.text}</p>
                  {!!turn.answer.context.requirements.length && turn.answer.evidence && (
                    <div className="orchard-requirements">
                      {turn.answer.context.requirements.map((r) => (
                        <span key={r.label}>
                          {r.label}: {r.value}
                        </span>
                      ))}
                    </div>
                  )}
                  {turn.answer.comparison && knowledge && (
                    <div className="orchard-comparison">
                      <div className="orchard-comparison-selectors">
                        {turn.answer.items.map((id, index) => (
                          <label key={index}>
                            <span>{index === 0 ? "First selection" : "Second selection"}</span>
                            <select
                              aria-label={
                                index === 0
                                  ? "First comparison selection"
                                  : "Second comparison selection"
                              }
                              value={id}
                              disabled={busy}
                              onChange={(e) => {
                                const pair = [...turn.answer.items];
                                pair[index] = e.target.value;
                                void send(
                                  "Compare " +
                                    pair
                                      .map((p) => knowledge.items.find((i) => i.id === p)!.name)
                                      .join(" vs "),
                                );
                              }}
                            >
                              {knowledge.items
                                .filter((i) => !turn.answer.items.includes(i.id) || i.id === id)
                                .map((i) => (
                                  <option key={i.id} value={i.id}>
                                    {i.name} · {i.kind}
                                  </option>
                                ))}
                            </select>
                          </label>
                        ))}
                      </div>
                      <div
                        className="orchard-comparison-table"
                        tabIndex={0}
                        role="region"
                        aria-label="Published specification comparison"
                      >
                        <table>
                          <caption className="sr-only">
                            {turn.answer.title}. Highlighted rows have different recorded values.
                          </caption>
                          <thead>
                            <tr>
                              <th scope="col">Specification</th>
                              {turn.answer.items.map((id) => (
                                <th scope="col" key={id}>
                                  {knowledge.items.find((i) => i.id === id)?.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {turn.answer.comparison.map((row, i) => (
                              <tr key={row.label + ":" + i} data-different={row.different}>
                                <th scope="row">
                                  {row.label}
                                  {row.different && <span className="sr-only"> (different)</span>}
                                </th>
                                {row.values.map((v, j) => (
                                  <td key={j}>{v}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="orchard-source">
                        Shaded rows differ. Unrecorded values are shown explicitly.
                      </p>
                    </div>
                  )}
                  {!!turn.answer.items.length && knowledge && (
                    <div className="orchard-results">
                      {turn.answer.items.slice(0, resultLimits[turn.id] || 6).map((id) => {
                        const item = knowledge.items.find((i) => i.id === id);
                        if (!item) return null;
                        const assessment = turn.answer.evidence?.find((e) => e.id === id);
                        const evidence = assessment?.facts;
                        const rows = turn.answer.facts?.find((f) => f.id === id)?.rows;
                        return (
                          <div className="orchard-product" key={id}>
                            <div className="orchard-product-top">
                              <div className="orchard-product-photo">
                                <AssetImage
                                  src={item.images[0]?.src || ""}
                                  alt={item.images[0]?.alt || ""}
                                  fill
                                  sizes="56px"
                                />
                              </div>
                              <div>
                                <span>
                                  {item.kind === "variety" ? "APPLE VARIETY" : "ROOTSTOCK"}
                                </span>
                                <h4>{item.name}</h4>
                              </div>
                              <Link
                                href={catalogHref(item)}
                                prefetch={false}
                                aria-label={"View " + item.name + " profile"}
                                onClick={close}
                              >
                                <ArrowUpRight size={19} />
                              </Link>
                            </div>
                            {!turn.answer.comparison && (
                              <>
                                <p>
                                  {item.intro.length > 180
                                    ? item.intro.slice(0, 177) + "…"
                                    : item.intro}
                                </p>
                                {evidence && (
                                  <div className="orchard-evidence">
                                    <span>
                                      <Check size={12} /> MATCHING PUBLISHED FIELDS
                                    </span>
                                    {evidence.map((f) => (
                                      <p key={f.label}>
                                        <strong>{f.label}:</strong> {f.value}
                                      </p>
                                    ))}
                                  </div>
                                )}
                                {!!assessment?.unconfirmed.length && (
                                  <p className="orchard-unconfirmed">
                                    Not confirmed in the published specifications:{" "}
                                    {assessment.unconfirmed.join(", ")}.
                                  </p>
                                )}
                                {rows && (
                                  <details
                                    className="orchard-specs"
                                    open={turn.answer.items.length === 1}
                                  >
                                    <summary>Recorded specifications ({rows.length})</summary>
                                    {rows.length ? (
                                      <dl>
                                        {rows.map((f, i) => (
                                          <div key={f.label + i}>
                                            <dt>{f.label}</dt>
                                            <dd>{f.value}</dd>
                                          </div>
                                        ))}
                                      </dl>
                                    ) : (
                                      <p>No populated specifications are recorded.</p>
                                    )}
                                  </details>
                                )}
                                <div className="orchard-product-actions">
                                  <Link href={catalogHref(item)} prefetch={false} onClick={close}>
                                    Full profile <ArrowUpRight size={13} />
                                  </Link>
                                  <CompareButton item={item} />
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {turn.answer.items.length > (resultLimits[turn.id] || 6) && (
                    <button
                      type="button"
                      className="orchard-more"
                      onClick={() =>
                        setResultLimits((old) => ({ ...old, [turn.id]: (old[turn.id] || 6) + 6 }))
                      }
                    >
                      Show next{" "}
                      {Math.min(6, turn.answer.items.length - (resultLimits[turn.id] || 6))} entries{" "}
                      <ArrowUpRight size={13} />
                    </button>
                  )}
                  {turn.answer.links.length > 0 && (
                    <div className="orchard-answer-links">
                      {turn.answer.links.map((link) => (
                        <Link key={link.href} href={link.href} prefetch={false} onClick={close}>
                          {link.href.includes("compare") ? (
                            <ArrowLeftRight size={15} />
                          ) : (
                            <ArrowUpRight size={15} />
                          )}{" "}
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                  <p className="orchard-source">
                    Source: {turn.answer.items.length ? "published catalog" : "Zeebaran website"}
                    {knowledge && (
                      <>
                        {" "}
                        · retrieved{" "}
                        {new Date(knowledge.retrievedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </>
                    )}
                  </p>
                </article>
              </section>
            );
          })}
          {(busy || loading) && (
            <div className="orchard-thinking" role="status">
              <span />
              <span />
              <span />
              <p>{loading ? "Opening the collection" : "Checking the published information"}</p>
            </div>
          )}
        </div>
        <div className="orchard-compose-area">
          {latest && !busy && (
            <div className="orchard-followups" aria-label="Suggested follow-up questions">
              {latest.suggestions.map((s) => (
                <button type="button" key={s} disabled={listening} onClick={() => void send(s)}>
                  {s}
                  <ArrowUpRight size={12} />
                </button>
              ))}
            </div>
          )}
          {error && (
            <div className="orchard-error" role="alert">
              <p>{error}</p>
              {!knowledge && (
                <button
                  type="button"
                  disabled={busy || loading}
                  onClick={() => {
                    setLoading(true);
                    loadKnowledge()
                      .then((d) => {
                        setKnowledge(d);
                        setError("");
                      })
                      .catch((e) => setError(e.message))
                      .finally(() => setLoading(false));
                  }}
                >
                  <RefreshCw size={13} /> Retry collection
                </button>
              )}
            </div>
          )}
          <form className="orchard-compose" onSubmit={submit}>
            <div className="orchard-input-wrap" data-listening={listening}>
              <textarea
                ref={inputRef}
                id="orchard-question"
                aria-label="Message"
                placeholder={
                  !interactive
                    ? "Coming soon…"
                    : listening
                      ? "Listening…"
                      : "Ask about your orchard…"
                }
                value={input}
                readOnly={listening || !interactive}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                maxLength={600}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !e.nativeEvent.isComposing &&
                    !listening
                  ) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
              />
            </div>
            <button
              type="button"
              className="orchard-mic"
              aria-label={listening ? "Stop voice input and send" : "Start voice input"}
              aria-pressed={listening}
              title={
                listening
                  ? "Stop listening and send"
                  : "Speak your question; it sends when you finish"
              }
              disabled={busy || loading || !interactive}
              onClick={toggleVoice}
            >
              {listening ? <Square size={14} fill="currentColor" /> : <Mic size={17} />}
            </button>
            <button
              type="submit"
              aria-label="Send question"
              disabled={busy || loading || listening || !input.trim()}
            >
              <ArrowUp size={20} />
            </button>
          </form>
          {listening && (
            <p className="orchard-voice-status" role="status">
              Listening… sends when you finish.
            </p>
          )}
          <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {busy
              ? "Checking published information"
              : latest
                ? [latest.title, latest.text].filter(Boolean).join(". ")
                : ""}
          </span>
        </div>
      </div>
      <button
        type="button"
        className="orchard-panel-toggle"
        aria-label="Minimize Zeebaran assistant"
        aria-expanded="true"
        aria-controls="orchard-assistant"
        onClick={close}
      >
        <ChevronDown size={24} strokeWidth={1.7} />
      </button>
    </dialog>
  );
}
