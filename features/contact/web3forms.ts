import { channels, formSchema, type FormFields } from "./schema";
import { directory } from "./directory";

export const web3formsEndpoint = "https://api.web3forms.com/submit";

// Web3Forms access keys are public form identifiers, designed for browser submissions.
export function web3formsEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY?.trim());
}

export async function sendWeb3Forms(values: FormFields, website: string, reference: string) {
  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY?.trim();
  if (!accessKey || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(accessKey))
    throw new Error("Online delivery is unavailable. Please use the email option below.");
  if (website)
    throw new Error("Your message could not be sent. Please use the email option below.");
  const data = formSchema.parse(values),
    reason = directory.find((item) => item.id === data.reason)!.title,
    body = new FormData();
  for (const [key, value] of Object.entries({
    access_key: accessKey,
    from_name: "Zeebaran · Enquiry Desk",
    subject: "Zeebaran | " + reason + " | " + data.name.replace(/[\r\n]/g, " "),
    name: data.name,
    email: data.email,
    contact_number: data.phone,
    place: data.place,
    organisation: data.organisation,
    reason,
    preferred_channel: channels[data.channel],
    topic: data.topic || "",
    message: data.message,
    reference,
  }))
    if (value) body.append(key, value);

  let response: Response;
  try {
    response = await fetch(web3formsEndpoint, {
      method: "POST",
      headers: { Accept: "application/json" },
      body,
      credentials: "omit",
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(30000),
    });
  } catch (error) {
    if (error instanceof DOMException && ["AbortError", "TimeoutError"].includes(error.name))
      throw new Error(
        "Delivery was not confirmed before the connection timed out. Your message is still here. Please wait before retrying or use email.",
      );
    throw new Error(
      "The connection failed. Your message is still here. Please retry or use email.",
    );
  }
  const result: unknown = await response.json().catch(() => null);
  if (response.status === 429)
    throw new Error("Too many messages. Please wait a few minutes before trying again.");
  if (
    !response.ok ||
    !result ||
    typeof result !== "object" ||
    !("success" in result) ||
    result.success !== true
  )
    throw new Error(
      "Delivery could not be confirmed. Your message is still here. Please retry or use email.",
    );
}
