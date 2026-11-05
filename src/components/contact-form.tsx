"use client";
import { useRef, useState, type FormEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { contactSchema, emailBody, topics } from "@/lib/contact-schema";
import { site } from "@/lib/site";
import { track } from "./analytics";
export function ContactForm({
  deliveryAvailable,
  initialTopic,
  plant,
}: {
  deliveryAvailable: boolean;
  initialTopic?: string;
  plant?: string;
}) {
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
      {},
    ),
    [status, setStatus] = useState(""),
    [pending, setPending] = useState(false);
  const id = useRef(""),
    fingerprint = useRef("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const form = e.currentTarget,
      values = Object.fromEntries(new FormData(form)),
      key = JSON.stringify(values);
    if (key !== fingerprint.current || !id.current) {
      id.current = crypto.randomUUID();
      fingerprint.current = key;
    }
    const parsed = contactSchema.safeParse({
      ...values,
      submissionId: id.current,
    });
    setStatus("");
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      setErrors(fields);
      setStatus("Please check the highlighted fields.");
      form
        .querySelector<HTMLElement>(`[name="${Object.keys(fields)[0]}"]`)
        ?.focus();
      return;
    }
    setErrors({});
    if (!deliveryAvailable) {
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(`Website enquiry: ${parsed.data.topic}`)}&body=${encodeURIComponent(emailBody(parsed.data))}`;
      setStatus(
        "Your email app has been requested. Review and send the draft there. If it didn’t open, email contact@zeebaran.com directly.",
      );
      track("email_draft_opened", { enquiry_type: parsed.data.topic });
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await response.json();
      if (!response.ok) {
        setErrors(result.fieldErrors || {});
        setStatus(
          result.error || "We couldn’t send your enquiry. Please retry.",
        );
        return;
      }
      setStatus(
        "Your enquiry has been accepted for delivery. Thank you for contacting Zeebaran.",
      );
      track("generate_lead", { enquiry_type: parsed.data.topic });
      form.reset();
      id.current = "";
      fingerprint.current = "";
    } catch {
      setStatus(
        "The connection was interrupted. Your details are still here. Please retry or email us.",
      );
    } finally {
      setPending(false);
    }
  }
  const error = (name: string) => errors[name]?.[0];
  return (
    <form
      className="contact-form"
      onSubmit={submit}
      noValidate
      aria-busy={pending}
    >
      <div className="form-intro">
        <h2>Tell us what’s growing.</h2>
        <p>
          {deliveryAvailable
            ? "Share a few details and send your enquiry to our team."
            : "Prepare an enquiry here, then review and send it from your email app."}
        </p>
      </div>
      <div className="form-grid">
        {[
          {
            name: "name",
            label: "Your name",
            type: "text",
            autoComplete: "name",
            max: 100,
          },
          {
            name: "email",
            label: "Email address",
            type: "email",
            autoComplete: "email",
            max: 254,
          },
          {
            name: "phone",
            label: "Phone",
            type: "tel",
            autoComplete: "tel",
            max: 30,
          },
        ].map((f) => (
          <div className="form-field" key={f.name}>
            <label htmlFor={f.name}>
              {f.label}{" "}
              <span>({f.name === "phone" ? "optional" : "required"})</span>
            </label>
            <input
              id={f.name}
              name={f.name}
              type={f.type}
              autoComplete={f.autoComplete}
              required={f.name !== "phone"}
              maxLength={f.max}
              aria-invalid={!!error(f.name)}
              aria-describedby={error(f.name) ? `${f.name}-error` : undefined}
            />
            {error(f.name) && (
              <p className="field-error" id={`${f.name}-error`}>
                {error(f.name)}
              </p>
            )}
          </div>
        ))}
        <div className="form-field">
          <label htmlFor="topic">I’m interested in</label>
          <select
            id="topic"
            name="topic"
            defaultValue={
              topics.includes(initialTopic as (typeof topics)[number])
                ? initialTopic
                : topics[0]
            }
          >
            {topics.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="form-field full">
          <label htmlFor="message">
            Your enquiry <span>(required)</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            minLength={20}
            maxLength={3000}
            defaultValue={
              plant
                ? `I’d like to enquire about ${plant} apple planting material. `
                : ""
            }
            placeholder="Tell us your location, planting plans and how we can help."
            aria-invalid={!!error("message")}
            aria-describedby={
              error("message") ? "message-error" : "message-hint"
            }
          />
          <p id="message-hint" className="form-note">
            20–3,000 characters. Please avoid sensitive personal information.
          </p>
          {error("message") && (
            <p className="field-error" id="message-error">
              {error("message")}
            </p>
          )}
        </div>
        <div className="honeypot" aria-hidden="true">
          <label htmlFor="website">Leave blank</label>
          <input id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
      </div>
      <p className="form-note">
        We use your details to respond to your enquiry. Read our{" "}
        <a href="/privacy">privacy notice</a>.
      </p>
      <button className="button" type="submit" disabled={pending}>
        {pending
          ? "Sending…"
          : deliveryAvailable
            ? "Send enquiry"
            : "Open email draft"}
        <ArrowUpRight size={18} aria-hidden="true" />
      </button>
      <div role="status" aria-live="polite">
        {status && <p className="form-status">{status}</p>}
      </div>
    </form>
  );
}
