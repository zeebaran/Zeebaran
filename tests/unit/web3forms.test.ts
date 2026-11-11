import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  sendWeb3Forms,
  web3formsEnabled,
  web3formsEndpoint,
} from "../../features/contact/web3forms";

const accessKey = "11111111-1111-4111-8111-111111111111";
const values = {
  name: " Orchard Team ",
  organisation: "Himalayan Nursery",
  email: "grower@example.test",
  phone: "+91 98765 43210",
  place: "Srinagar",
  channel: "video" as const,
  reason: "research" as const,
  topic: "R&D Field Trial" as const,
  message: "We would like to discuss rootstock field trials.",
};
const fetchMock = vi.fn<typeof fetch>();
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY", accessKey);
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("Web3Forms delivery", () => {
  it("forwards validated form details to the provider without a Firebase request", async () => {
    fetchMock.mockResolvedValue(Response.json({ success: true }));
    await sendWeb3Forms(values, "", "fixture-reference");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(web3formsEndpoint);
    expect(options?.method).toBe("POST");
    expect(options?.credentials).toBe("omit");
    expect(options?.headers).toEqual({ Accept: "application/json" });
    expect(Object.fromEntries((options?.body as FormData).entries())).toEqual({
      access_key: accessKey,
      from_name: "Zeebaran · Enquiry Desk",
      subject: "Zeebaran | Research & Institutions | Orchard Team",
      name: "Orchard Team",
      email: values.email,
      contact_number: values.phone,
      place: values.place,
      organisation: values.organisation,
      reason: "Research & Institutions",
      preferred_channel: "Virtual video call",
      topic: "R&D Field Trial",
      message: values.message,
      reference: "fixture-reference",
    });
  });
  it("omits empty optional values and never includes attachment data on Free", async () => {
    fetchMock.mockResolvedValue(Response.json({ success: true }));
    await sendWeb3Forms({ ...values, organisation: "", topic: null }, "", "reference");
    const body = fetchMock.mock.calls[0][1]?.body as FormData;
    expect(body.has("organisation")).toBe(false);
    expect(body.has("topic")).toBe(false);
    expect(body.has("attachment")).toBe(false);
  });
  it("rejects invalid form data or a filled honeypot before sending", async () => {
    await expect(sendWeb3Forms({ ...values, email: "invalid" }, "", "reference")).rejects.toThrow();
    await expect(sendWeb3Forms(values, "spam", "reference")).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each(["", "<WEB3FORMS_API_KEY"])("does not send an absent or placeholder key", async (key) => {
    vi.stubEnv("NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY", key);
    expect(web3formsEnabled()).toBe(Boolean(key));
    await expect(sendWeb3Forms(values, "", "reference")).rejects.toThrow("unavailable");
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([
    [200, { success: false }],
    [400, { success: false, message: "Invalid submission" }],
    [500, { success: true }],
    [200, { message: "No acknowledgement" }],
  ])("does not report success on HTTP %s without confirmed delivery", async (status, body) => {
    fetchMock.mockResolvedValue(Response.json(body, { status }));
    await expect(sendWeb3Forms(values, "", "reference")).rejects.toThrow("could not be confirmed");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("handles malformed responses and provider rate limits", async () => {
    fetchMock.mockResolvedValueOnce(new Response("<html>Gateway error</html>"));
    await expect(sendWeb3Forms(values, "", "reference")).rejects.toThrow("could not be confirmed");
    fetchMock.mockResolvedValueOnce(Response.json({ success: false }, { status: 429 }));
    await expect(sendWeb3Forms(values, "", "reference")).rejects.toThrow("wait a few minutes");
  });
  it("reports uncertain timeout delivery without automatically retrying", async () => {
    fetchMock.mockRejectedValue(new DOMException("Expired", "TimeoutError"));
    await expect(sendWeb3Forms(values, "", "reference")).rejects.toThrow("wait before retrying");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("handles network failures without exposing the key or losing the message", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch: " + accessKey));
    await expect(sendWeb3Forms(values, "", "reference")).rejects.toThrow("message is still here");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
