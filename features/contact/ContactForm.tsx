"use client";
import { SiteEmailLink, useContactDetails } from "@/features/site/ContactDetails";
import { Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, useWatch, type FieldErrors, type Resolver } from "react-hook-form";
import { ArrowRight, FilePlus2, LoaderCircle, X } from "lucide-react";
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
import { ContentText, useContentPage, useContentStrings } from "@/features/cms/Content";
import { textKey } from "@/features/cms/model";
import { sendWeb3Forms, web3formsEnabled } from "./web3forms";

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
const defaults: FormFields = {
  name: "",
  organisation: "",
  email: "",
  phone: "",
  place: "",
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
  const body = await response.json().catch(() => null);
  if (!response.ok)
    throw new DeliveryError(response.status, body?.error || "Delivery failed. Please try again.");
  if (!body || typeof body !== "object")
    throw new Error("The desk returned an unreadable response. Please retry.");
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
  const contact = useContactDetails();
  const copy = useContentStrings(),
    contentPage = useContentPage(),
    useWeb3Forms = web3formsEnabled();
  const marker = (value: string) => ({
    "data-cms-field": textKey(value),
    "data-cms-default": value,
    "data-cms-page": contentPage,
  });
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
  const selectedChannel = useWatch({ control, name: "channel" });
  const selectedReason = useWatch({ control, name: "reason" });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmationHeight, setConfirmationHeight] = useState(0);
  const [workingFile, setWorkingFile] = useState(false);
  const selection = useRef(0);

  const attempt = useRef<{ key: string; id: string; attachment: Submission["attachment"] } | null>(
    null,
  );
  const fileInput = useRef<HTMLInputElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const submitting = useRef(false);
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
      if (useWeb3Forms) {
        await sendWeb3Forms(values, website, current.id);
        setConfirmationHeight(form.current?.getBoundingClientRect().height || 0);
        reset({ ...defaults, reason: routedReason.current });
        attempt.current = null;
        setSuccess("Your message has been sent to the Zeebaran team.");
        return;
      }
      if (file && !current.attachment) current.attachment = await upload(file, current.id);
      const result = await postJson<{ delivery: "local" | "desk" }>("/api/enquiries", {
        ...values,
        requestId: current.id,
        attachment: current.attachment,
        website,
      });
      if (result.delivery !== "local" && result.delivery !== "desk")
        throw new Error("The desk did not confirm delivery. Please retry using the same message.");
      setConfirmationHeight(form.current?.getBoundingClientRect().height || 0);
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
      contact.email +
      "?subject=" +
      encodeURIComponent(
        "Zeebaran · " + (directory.find((d) => d.id === values.reason)?.title || "Enquiry"),
      ) +
      "&body=" +
      encodeURIComponent(
        [
          "Name: " + values.name,
          values.organisation && "Organisation: " + values.organisation,
          "Email: " + values.email,
          "Contact number: " + values.phone,
          "Place: " + values.place,
          "",
          values.message,
        ]
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
        <div
          className="enquiry-success"
          role="status"
          style={{ minHeight: confirmationHeight || undefined }}
        >
          <div className="enquiry-receipt-mark" aria-hidden="true">
            <svg viewBox="0 0 100 100" fill="none">
              <circle className="receipt-orbit" cx="50" cy="50" r="44" pathLength="1" />
              <circle className="receipt-disc" cx="50" cy="50" r="34" />
              <path className="receipt-check" d="m35 50 10 10 21-22" pathLength="1" />
            </svg>
          </div>
          <span className="enquiry-receipt-label">
            {useWeb3Forms ? "Message sent" : "Enquiry received"}
          </span>
          <h3 tabIndex={-1} ref={successHeading}>
            Thank <em>you.</em>
          </h3>
          <p className="enquiry-receipt-copy">{success}</p>
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
            Write another enquiry <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <form
          ref={form}
          method="post"
          action="/api/enquiries"
          onSubmit={(event) => {
            if (!hydrated || submitting.current || isSubmitting || fileError || workingFile) {
              event.preventDefault();
              return;
            }
            const website = String(new FormData(event.currentTarget).get("website") || "");
            submitting.current = true;
            void handleSubmit((values) => send(values, website))(event).finally(() => {
              submitting.current = false;
            });
          }}
          noValidate
          aria-label="Zeebaran enquiry"
        >
          <noscript>
            To send an enquiry without JavaScript,{" "}
            <SiteEmailLink>email the Zeebaran team</SiteEmailLink>.
          </noscript>
          <fieldset disabled={!hydrated || isSubmitting} className="form-fields">
            {!simple && (
              <>
                <div className="desk-heading">
                  <span className="eyebrow">
                    <ContentText>Institutional desk</ContentText>
                  </span>
                  <h3>
                    <ContentText>Secure Inquiry Console</ContentText>
                  </h3>
                </div>
                <fieldset className="focus-topics">
                  <legend>
                    <ContentText>Primary focus</ContentText>
                  </legend>
                  <div>
                    {topics.map((t) => (
                      <button
                        type="button"
                        key={t}
                        aria-pressed={topic === t}
                        onClick={() => setValue("topic", topic === t ? null : t)}
                      >
                        <ContentText>{t}</ContentText>
                      </button>
                    ))}
                  </div>
                </fieldset>
              </>
            )}
            <div className="field-pair">
              <label htmlFor="full-name">
                <ContentText>Name</ContentText>
                <input
                  id="full-name"
                  autoComplete="name"
                  required
                  maxLength={100}
                  placeholder={copy("Your name")}
                  {...marker("Your name")}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  {...register("name")}
                />
                {errorHint("name")}
              </label>
              <label htmlFor="organisation">
                <ContentText>Organisation</ContentText>{" "}
                <small>
                  <ContentText>(optional)</ContentText>
                </small>
                <input
                  id="organisation"
                  autoComplete="organization"
                  maxLength={160}
                  placeholder={copy("Institution or company")}
                  {...marker("Institution or company")}
                  {...register("organisation")}
                />
              </label>
            </div>
            <div className={simple ? "" : "field-pair"}>
              <label htmlFor="email">
                <ContentText>Email</ContentText>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  placeholder={copy("you@organisation.org")}
                  {...marker("you@organisation.org")}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  {...register("email")}
                />
                {errorHint("email")}
              </label>
              {!simple && (
                <label htmlFor="channel">
                  <ContentText>Preferred channel</ContentText>
                  <select
                    id="channel"
                    {...register("channel")}
                    {...marker(channels[selectedChannel])}
                  >
                    {Object.entries(channels).map(([k, v]) => (
                      <option value={k} key={k} {...marker(v)}>
                        {copy(v)}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            <div className="field-pair">
              <label htmlFor="phone">
                <ContentText>Contact number</ContentText>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  maxLength={30}
                  placeholder={copy("+91 98765 43210")}
                  {...marker("+91 98765 43210")}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                  {...register("phone")}
                />
                {errorHint("phone")}
              </label>
              <label htmlFor="place">
                <ContentText>Place</ContentText>
                <input
                  id="place"
                  autoComplete="address-level2"
                  required
                  maxLength={160}
                  placeholder={copy("Town, village or city")}
                  {...marker("Town, village or city")}
                  aria-invalid={!!errors.place}
                  aria-describedby={errors.place ? "place-error" : undefined}
                  {...register("place")}
                />
                {errorHint("place")}
              </label>
            </div>
            <label htmlFor="reason">
              <ContentText>Reason for writing</ContentText>
              <select
                id="reason"
                {...register("reason")}
                {...marker(
                  directory.find((item) => item.id === selectedReason)?.title || "General enquiry",
                )}
              >
                {directory.map((d) => (
                  <option key={d.id} value={d.id} {...marker(d.title)}>
                    {copy(d.title)}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor="message">
              <ContentText>What are you working on?</ContentText>
              <textarea
                id="message"
                rows={5}
                required
                maxLength={5000}
                placeholder={copy("Tell us about your work or question…")}
                {...marker("Tell us about your work or question…")}
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
            {!simple && !useWeb3Forms && (
              <div className="attachment-field">
                <span>
                  <ContentText>Attachment or proposal</ContentText>{" "}
                  <small>
                    <ContentText>(optional)</ContentText>
                  </small>
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
                    {file ? file.name : <ContentText>Select a PDF</ContentText>}
                    <small>
                      {file ? (
                        "Change attachment"
                      ) : (
                        <ContentText>Proposal, deck or research brief · up to 25 MB</ContentText>
                      )}
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
              aria-busy={isSubmitting}
              disabled={!hydrated || isSubmitting || workingFile || !!fileError}
            >
              <span className="send-enquiry-label">
                {isSubmitting ? "Sending…" : <ContentText>Send message</ContentText>}
              </span>
              <span className="send-enquiry-icon" aria-hidden="true">
                {isSubmitting ? (
                  <LoaderCircle className="loader" size={17} />
                ) : (
                  <ArrowRight size={17} />
                )}
              </span>
            </button>
          </fieldset>
        </form>
      )}
    </div>
  );
}
