import { describe, it, expect, vi } from "vitest";
import { startVoiceInput, type Recognition } from "@/features/assistant/speech";

class MockRecognition implements Recognition {
  static latest: MockRecognition;
  continuous = true;
  interimResults = false;
  maxAlternatives = 0;
  lang = "";
  onresult: Recognition["onresult"] = null;
  onend: Recognition["onend"] = null;
  onerror: Recognition["onerror"] = null;
  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();
  constructor() {
    MockRecognition.latest = this;
  }
  result(text: string, final: boolean) {
    this.onresult?.({ results: [{ isFinal: final, 0: { transcript: text } }] });
  }
}
function setup(draft = "") {
  const callbacks = { onText: vi.fn(), onFinish: vi.fn(), onError: vi.fn(), onEnd: vi.fn() };
  const session = startVoiceInput({
    Recognition: MockRecognition,
    draft,
    language: "en-IN",
    ...callbacks,
  })!;
  return { ...callbacks, session, recognition: MockRecognition.latest };
}
describe("assistant voice lifecycle", () => {
  it("transcribes interim text and sends the final question exactly once", () => {
    const s = setup("Compare");
    expect(s.recognition.lang).toBe("en-IN");
    expect(s.recognition.continuous).toBe(false);
    expect(s.recognition.interimResults).toBe(true);
    s.recognition.result("M9", false);
    expect(s.onText).toHaveBeenLastCalledWith("Compare M9");
    expect(s.onFinish).not.toHaveBeenCalled();
    s.recognition.result("M9 versus M26", true);
    const staleEnd = s.recognition.onend!;
    staleEnd();
    staleEnd();
    expect(s.onFinish).toHaveBeenCalledExactlyOnceWith("Compare M9 versus M26");
    expect(s.onEnd).toHaveBeenCalledTimes(1);
  });
  it("does not duplicate results as interim speech changes", () => {
    const s = setup();
    s.recognition.result("show", false);
    s.recognition.result("show roots", false);
    s.recognition.result("show rootstocks", true);
    s.recognition.onend?.();
    expect(s.onFinish).toHaveBeenCalledExactlyOnceWith("show rootstocks");
  });
  it("manual stop waits for the final result before sending", () => {
    const s = setup();
    s.session.stop();
    s.session.stop();
    expect(s.recognition.stop).toHaveBeenCalledTimes(1);
    expect(s.onFinish).not.toHaveBeenCalled();
    s.recognition.result("M9", true);
    s.recognition.onend?.();
    expect(s.onFinish).toHaveBeenCalledExactlyOnceWith("M9");
  });
  it("cancels without sending even if late recognition callbacks arrive", () => {
    const s = setup();
    const lateEnd = s.recognition.onend!,
      lateResult = s.recognition.onresult!;
    s.recognition.result("M9", true);
    s.session.cancel();
    s.session.cancel();
    lateEnd();
    lateResult({ results: [{ isFinal: true, 0: { transcript: "late" } }] });
    expect(s.recognition.abort).toHaveBeenCalledTimes(1);
    expect(s.onFinish).not.toHaveBeenCalled();
    expect(s.onText).toHaveBeenCalledTimes(1);
  });
  it.each(["not-allowed", "network", "audio-capture", "no-speech"])(
    "does not send after %s",
    (error) => {
      const s = setup("draft");
      const end = s.recognition.onend!;
      s.recognition.result("M9", true);
      s.recognition.onerror?.({ error });
      end();
      expect(s.onFinish).not.toHaveBeenCalled();
      expect(s.onError).toHaveBeenCalledTimes(1);
      expect(s.onEnd).toHaveBeenCalledTimes(1);
    },
  );
  it("does not auto-send a draft or unfinalized speech after silence", () => {
    const s = setup("draft");
    s.recognition.result("uncertain", false);
    s.recognition.onend?.();
    expect(s.onFinish).not.toHaveBeenCalled();
    expect(s.onError).toHaveBeenCalledTimes(1);
  });
  it("keeps overlength text for editing rather than sending a truncated question", () => {
    const s = setup();
    const end = s.recognition.onend!;
    s.recognition.result("a".repeat(601), true);
    end();
    expect(s.onText).toHaveBeenCalledWith("a".repeat(601));
    expect(s.onFinish).not.toHaveBeenCalled();
    expect(s.onError).toHaveBeenCalledWith(expect.stringContaining("600"));
  });
  it("falls back to typing without requiring a recognition constructor", () => {
    const s = setup();
    expect(startVoiceInput({ draft: "", language: "en-IN", ...s })).toBeNull();
    expect(s.onError).toHaveBeenCalledWith(expect.stringContaining("unavailable"));
  });
});
