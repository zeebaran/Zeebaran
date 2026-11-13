// Keep browser speech recognition optional; no audio enters Zeebaran's API.
export interface Recognition {
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  lang: string;
  onresult:
    | ((event: { results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void)
    | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
export type RecognitionConstructor = new () => Recognition;
export type VoiceSession = { stop(): void; cancel(): void };

export function startVoiceInput(options: {
  Recognition?: RecognitionConstructor;
  draft: string;
  language: string;
  onText(text: string): void;
  onFinish(question: string): void;
  onError(message: string): void;
  onEnd(): void;
}): VoiceSession | null {
  if (!options.Recognition) {
    options.onError("Voice input is unavailable in this browser. Please type your question.");
    return null;
  }
  let recognition: Recognition;
  try {
    recognition = new options.Recognition();
  } catch {
    options.onError("Voice input could not start. Please type your question.");
    return null;
  }
  let ended = false;
  let stopping = false;
  let finalText = "";
  const join = (speech: string) => [options.draft.trim(), speech.trim()].filter(Boolean).join(" ");
  const detach = () => {
    ended = true;
    recognition.onresult = recognition.onend = recognition.onerror = null;
  };
  const cancel = () => {
    if (ended) return;
    detach();
    try {
      recognition.abort();
    } catch {
      /* Already disconnected. */
    }
  };
  const fail = (message: string) => {
    cancel();
    options.onEnd();
    options.onError(message);
  };
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.lang = options.language;
  recognition.onresult = (event) => {
    if (ended) return;
    const results = Array.from(event.results);
    finalText = results
      .filter((r) => r.isFinal)
      .map((r) => r[0].transcript.trim())
      .join(" ");
    const text = join(results.map((r) => r[0].transcript.trim()).join(" "));
    if (text.length > 600) {
      // Preserve the draft rather than silently sending a truncated question.
      options.onText(text);
      fail("Your spoken question is too long. Please shorten it to 600 characters before sending.");
      return;
    }
    options.onText(text);
  };
  recognition.onerror = ({ error }) => {
    if (ended) return;
    const messages: Record<string, string> = {
      "not-allowed":
        "Microphone access was denied. Allow it in your browser settings or type your question.",
      "service-not-allowed": "Voice input is blocked by your browser. Please type your question.",
      "audio-capture": "No microphone is available. Connect one or type your question.",
      "no-speech": "No speech was detected. Tap the mic to try again.",
      network:
        "Voice input lost its connection. Your draft is kept; please try again or send it yourself.",
      aborted: "Voice input stopped. Your draft is kept.",
    };
    fail(messages[error] || "Voice input could not finish. Your draft is kept; please try again.");
  };
  recognition.onend = () => {
    if (ended) return;
    detach();
    options.onEnd();
    if (finalText.trim()) {
      const question = join(finalText);
      options.onText(question);
      options.onFinish(question);
    } else {
      options.onError(
        "No clear speech was detected. Please try again or send your draft yourself.",
      );
    }
  };
  try {
    recognition.start();
  } catch {
    fail("Voice input could not start. Check microphone access or type your question.");
    return null;
  }
  return {
    cancel,
    stop() {
      if (ended || stopping) return;
      stopping = true;
      try {
        recognition.stop();
      } catch {
        fail("Voice input stopped unexpectedly. Your draft is kept.");
      }
    },
  };
}
