"use client";
import { Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, useWatch, type FieldErrors, type Resolver } from "react-hook-form";
import { ArrowRight, Check, FilePlus2, LoaderCircle, X } from "lucide-react";
import { directory } from "./directory";
import {
  channels,
  formSchema,
  hasPdfHeader,
  pdfSchema,
  reasons,
  topics,
  type FormFields,
  type Submission,
} from "./schema";
import { SITE } from "@/lib/site";

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
const defaults: FormFields = {
  name: "",
  organisation: "",
  email: "",
  reason: "general",
  message: "",
  topic: null,
  channel: "email",
};
const validate: Resolver<FormFields> = (values) => {
  const result = formSchema.safeParse(values);
  if (result.success) return { values: result.data, errors: {} };
  const errors: FieldErrors<FormFields> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof FormFields;
    if (!errors[key]) errors[key] = { type: "validate", message: issue.message };
  }
  return { values: {}, errors };
};
function RouteReason({
  select,
  prefill,
}: {
  select: (reason: FormFields["reason"]) => void;
  prefill: (message: string) => void;
}) {
  const search = useSearchParams();
  useEffect(() => {
    const value = search.get("reason");
    if (reasons.some((r) => r === value)) select(value as FormFields["reason"]);
    const note = search.get("message");
    if (note) prefill(note.slice(0, 5000));
  }, [search, select, prefill]);
  return null;
}
async function request(url: string, init: RequestInit, timeout = 30000) {
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(timeout) });
  } catch (err) {
    if (err instanceof DOMException && ["AbortError", "TimeoutError"].includes(err.name))
      throw new Error("The connection timed out. Your message is still here. Please retry.");
    throw err;
  }
}
class DeliveryError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
async function postJson<T>(path: string, data: unknown): Promise<T> {
  const response = await request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await response.json();
  if (!response.ok)
    throw new DeliveryError(response.status, body.error || "Delivery failed. Please try again.");
  return body as T;
}
async function upload(file: File, id: string) {
  const { ticket, url, fields } = await postJson<{
    ticket: string;
    url: string;
    fields: Record<string, string> | null;
  }>("/api/enquiries/attachments", { requestId: id, name: file.name, size: file.size });
  let response: Response;
  if (fields) {
    const body = new FormData();
    Object.entries(fields).forEach(([key, value]) => body.append(key, value));
    body.append("file", file);
    response = await request(url, { method: "POST", body }, 120000);
  } else {
    response = await request(
      url,
      {
        method: "PUT",
        body: file,
        headers: { "Content-Type": "application/pdf" },
      },
      120000,
    );
  }
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error(detail?.error || "The PDF upload failed. Retry, replace or remove the file.");
  }
  return { name: file.name, size: file.size, ticket };
}
export function ContactForm({ simple = false }: { simple?: boolean }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    control,
    reset,
    getValues,
  } = useForm<FormFields>({ defaultValues: defaults, resolver: validate });
  const hydrated = useSyncExternalStore(subscribe, clientReady, serverReady);
  const routedReason = useRef<FormFields["reason"]>("general");
  const topic = useWatch({ control, name: "topic" });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [workingFile, setWorkingFile] = useState(false);
  const selection = useRef(0);

  const attempt = useRef<{ key: string; id: string; attachment: Submission["attachment"] } | null>(
    null,
  );
  const fileInput = useRef<HTMLInputElement>(null);
  const successHeading = useRef<HTMLHeadingElement>(null);
  const selectReason = useCallback(
    (reason: FormFields["reason"]) => {
      routedReason.current = reason;
      setValue("reason", reason);
    },
    [setValue],
  );
  const prefill = useCallback(
    (message: string) => {
      if (!getValues("message")) setValue("message", message);
    },
    [setValue, getValues],
  );
  useEffect(() => {
    if (success) successHeading.current?.focus();
  }, [success]);
  async function chooseFile(next: File | null) {
    const version = ++selection.current;
    setFileError("");
    setFile(null);
    setWorkingFile(!!next);
    attempt.current = null;
    if (!next) return;
    let problem = "";
    try {
      const parsed = pdfSchema.safeParse({ name: next.name, size: next.size });
      if (!parsed.success) problem = "Choose a PDF up to 25 MB.";
      else if (!hasPdfHeader(new Uint8Array(await next.slice(0, 5).arrayBuffer())))
        problem = "Choose a file that contains a PDF.";
    } catch {
      problem = "This file could not be read. Please select it again.";
    }
    if (version !== selection.current) return;
    setFileError(problem);
    setWorkingFile(false);
    if (!problem) setFile(next);
    if (fileInput.current) fileInput.current.value = "";
  }
  async function send(values: FormFields, website: string) {
    setError("");
    const key = JSON.stringify([values, file?.name, file?.size, file?.lastModified]);
    if (!attempt.current || attempt.current.key !== key)
      attempt.current = { key, id: crypto.randomUUID(), attachment: null };
    const current = attempt.current;
    try {
      if (file && !current.attachment) current.attachment = await upload(file, current.id);
      const result = await postJson<{ delivery: "local" | "desk" }>("/api/enquiries", {
        ...values,
        requestId: current.id,
        attachment: current.attachment,
        website,
      });
      setSuccess(
        result.delivery === "local"
          ? "Your enquiry was saved in this project’s local inbox."
          : "Your enquiry has reached the Zeebaran desk.",
      );
    } catch (reason) {
      const message =
        reason instanceof Error ? reason.message : "Delivery failed. Please try again.";
      if (reason instanceof DeliveryError && reason.status === 422) attempt.current = null;
      setError(message);
    }
  }
  function errorHint(key: keyof FormFields) {
    return (
      errors[key] && (
        <span className="field-error" id={key + "-error"}>
          {errors[key]?.message}
        </span>
      )
    );
  }
  function emailLink() {
    const values = getValues();
    return (
      "mailto:" +
      SITE.email +
      "?subject=" +
      encodeURIComponent(
        "Zeebaran · " + (directory.find((d) => d.id === values.reason)?.title || "Enquiry"),
      ) +
      "&body=" +
      encodeURIComponent(
        [values.name, values.organisation, values.email, "", values.message]
          .filter(Boolean)
          .join("\n"),
      )
    );
  }
  return (
    <div className="enquiry-desk">
      <Suspense fallback={null}>
        <RouteReason select={selectReason} prefill={prefill} />
      </Suspense>
      {success ? (
        <div className="enquiry-success" role="status">
          <Check size={24} />
          <h3 tabIndex={-1} ref={successHeading}>
            Thank you.
          </h3>
          <p>{success}</p>
          <button
            className="action secondary"
            type="button"
            onClick={() => {
              setSuccess("");
              setError("");
              setFile(null);
              attempt.current = null;
              setFileError("");
              setWorkingFile(false);
              selection.current++;
              reset({ ...defaults, reason: routedReason.current });
            }}
          >
            Write another enquiry
          </button>
        </div>
      ) : (
        <form
          method="post"
          action="/api/enquiries"
          onSubmit={(event) => {
            if (!hydrated || fileError || workingFile) {
              event.preventDefault();
              return;
            }
            const website = String(new FormData(event.currentTarget).get("website") || "");
            void handleSubmit((values) => send(values, website))(event);
          }}
          noValidate
          aria-label="Zeebaran enquiry"
        >
          <noscript>
            To send an enquiry without JavaScript,{" "}
            <a href={"mailto:" + SITE.email}>email the Zeebaran team</a>.
          </noscript>
          <fieldset disabled={!hydrated || isSubmitting} className="form-fields">
            {!simple && (
              <>
                <div className="desk-heading">
                  <span className="eyebrow">Institutional desk</span>
                  <h3>Secure Inquiry Console</h3>
                </div>
                <fieldset className="focus-topics">
                  <legend>Primary focus</legend>
                  <div>
                    {topics.map((t) => (
                      <button
                        type="button"
                        key={t}
                        aria-pressed={topic === t}
                        onClick={() => setValue("topic", topic === t ? null : t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </>
            )}
            <div className="field-pair">
              <label htmlFor="full-name">
                Name
                <input
                  id="full-name"
                  autoComplete="name"
                  required
                  maxLength={100}
                  placeholder="Your name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  {...register("name")}
                />
                {errorHint("name")}
              </label>
              <label htmlFor="organisation">
                Organisation <small>(optional)</small>
                <input
                  id="organisation"
                  autoComplete="organization"
                  maxLength={160}
                  placeholder="Institution or company"
                  {...register("organisation")}
                />
              </label>
            </div>
            <div className={simple ? "" : "field-pair"}>
              <label htmlFor="email">
                Email
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  placeholder="you@organisation.org"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  {...register("email")}
                />
                {errorHint("email")}
              </label>
              {!simple && (
                <label htmlFor="channel">
                  Preferred channel
                  <select id="channel" {...register("channel")}>
                    {Object.entries(channels).map(([k, v]) => (
                      <option value={k} key={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            <label htmlFor="reason">
              Reason for writing
              <select id="reason" {...register("reason")}>
                {directory.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor="message">
              What are you working on?
              <textarea
                id="message"
                rows={5}
                required
                maxLength={5000}
                placeholder="Tell us about your work or question…"
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "message-error" : undefined}
                {...register("message")}
              />
              {errorHint("message")}
            </label>
            <div hidden>
              <label htmlFor="website">Website</label>
              <input id="website" name="website" autoComplete="off" tabIndex={-1} />
            </div>
            {!simple && (
              <div className="attachment-field">
                <span>
                  Attachment or proposal <small>(optional)</small>
                </span>
                <input
                  id="proposal"
                  type="file"
                  className="sr-only"
                  accept="application/pdf,.pdf"
                  ref={fileInput}
                  onChange={(e) => void chooseFile(e.target.files?.[0] || null)}
                />
                <label className="upload-target" htmlFor="proposal">
                  <FilePlus2 size={18} />
                  <span>
                    {file ? file.name : "Select a PDF"}
                    <small>
                      {file
                        ? "Change attachment"
                        : "Proposal, deck or research brief · up to 25 MB"}
                    </small>
                  </span>
                </label>
                {(file || fileError) && (
                  <button
                    type="button"
                    className="remove-file"
                    onClick={() => void chooseFile(null)}
                  >
                    <X size={12} /> Remove attachment
                  </button>
                )}
                {fileError && (
                  <span role="alert" className="field-error">
                    {fileError}
                  </span>
                )}
              </div>
            )}
            {error && (
              <div className="delivery-error" role="alert">
                {error} <a href={emailLink()}>Open email draft</a>
                {file && <small>Attach the PDF in your email app.</small>}
              </div>
            )}
            <button
              className="action primary send-enquiry"
              type="submit"
              disabled={!hydrated || isSubmitting || workingFile || !!fileError}
            >
              {isSubmitting ? "Sending…" : "Send message"}{" "}
              {isSubmitting ? (
                <LoaderCircle className="loader" size={15} />
              ) : (
                <ArrowRight size={15} />
              )}
            </button>
          </fieldset>
        </form>
      )}
    </div>
  );
}
