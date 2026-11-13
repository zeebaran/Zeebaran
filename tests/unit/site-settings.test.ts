import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const memory = vi.hoisted(() => ({
  docs: new Map<string, Record<string, unknown>>(),
  reads: 0,
  writes: [] as string[],
}));
vi.mock("@/lib/firebase-admin", () => ({ firebase: () => ({}) }));
vi.mock("@/features/admin/server/security", () => ({
  AdminError: class extends Error {
    constructor(
      public status: number,
      message: string,
    ) {
      super(message);
    }
  },
}));
vi.mock("firebase-admin/firestore", async (original) => {
  const actual = await original<typeof import("firebase-admin/firestore")>();
  const snapshot = (path: string) => ({
    data: () => memory.docs.get(path),
    get: (key: string) =>
      key
        .split(".")
        .reduce<unknown>(
          (value, part) =>
            value && typeof value === "object"
              ? (value as Record<string, unknown>)[part]
              : undefined,
          memory.docs.get(path),
        ),
  });
  const ref = (path: string) => ({
    path,
    get: async () => {
      memory.reads++;
      return snapshot(path);
    },
  });
  return {
    ...actual,
    getFirestore: () => ({
      collection: (name: string) => ({ doc: (id: string) => ref(name + "/" + id) }),
      runTransaction: async (callback: (tx: unknown) => unknown) =>
        callback({
          get: async (r: { path: string }) => {
            memory.reads++;
            return snapshot(r.path);
          },
          set: (
            r: { path: string },
            data: Record<string, unknown>,
            options: { mergeFields: string[] },
          ) => {
            expect(options.mergeFields).toEqual([
              "publicSettings",
              "settingsRevision",
              "settingsUpdatedAt",
              "settingsUpdatedBy",
            ]);
            memory.docs.set(r.path, { ...memory.docs.get(r.path), ...data });
            memory.writes.push(r.path);
          },
          create: (r: { path: string }, data: Record<string, unknown>) => {
            memory.docs.set(r.path, data);
            memory.writes.push(r.path);
          },
        }),
    }),
  };
});
import { defaultSettings, whatsappLink } from "@/features/site/model";
import { siteSettingsSchema } from "@/features/site/schema";
import { readSettings, resolveSettings, saveSettings } from "@/features/site/server";
import { textKey } from "@/features/cms/model";
import { nurseryEnquiry } from "@/lib/nursery-enquiry";
beforeEach(() => {
  memory.docs.clear();
  memory.reads = 0;
  memory.writes = [];
});
describe("shared public contact settings", () => {
  it("retains old published contact edits on first setup without touching private drafts", async () => {
    memory.docs.set("cmsPages/site", {
      published: { text: { [textKey("contact@zeebaran.com")]: "office@example.org" } },
      draft: { text: { private: "Keep this unpublished" } },
    });
    memory.docs.set("cmsPages/contact", {
      published: { text: { [textKey("research@zeebaran.com")]: "research@example.org" } },
    });
    const record = await readSettings();
    expect(record.settings.email).toBe("office@example.org");
    expect(record.settings.channels.research).toBe("research@example.org");
    expect(memory.reads).toBe(2);
    expect(memory.writes).toEqual([]);
  });
  it("reads one document once settings have been configured", async () => {
    const settings = defaultSettings();
    memory.docs.set("cmsPages/site", { publicSettings: settings, settingsRevision: 3 });
    expect((await readSettings()).settings).toEqual(settings);
    expect(memory.reads).toBe(1);
  });
  it("writes settings and an audit event while preserving page revisions, publications and drafts", async () => {
    const original = {
      revision: 19,
      draft: { text: { manual: "PRIVATE" } },
      published: { text: { manual: "LIVE" } },
      settingsRevision: 2,
    };
    memory.docs.set("cmsPages/site", original);
    const settings = { ...defaultSettings(), email: "changed@example.org" };
    expect((await saveSettings(settings, 2, "fixture-admin")).revision).toBe(3);
    expect(memory.docs.get("cmsPages/site")).toMatchObject({
      revision: 19,
      draft: original.draft,
      published: original.published,
      publicSettings: settings,
    });
    expect(memory.reads).toBe(1);
    expect(memory.writes).toHaveLength(2);
    expect(memory.writes[1]).toMatch(/^cmsAudit\//);
    await expect(saveSettings(settings, 2, "stale-admin")).rejects.toMatchObject({ status: 409 });
    expect(memory.writes).toHaveLength(2);
  });
  it.each([
    "javascript:alert(1)",
    "https://facebook.com.evil.test/zeebaran",
    "https://evil.test/zeebaran",
    "https://name:password@facebook.com/zeebaran",
    "http://facebook.com/zeebaran",
  ])("rejects unsafe social link %s before database access", async (url) => {
    const settings = defaultSettings();
    settings.socials.facebook = url;
    await expect(saveSettings(settings, 0, "admin")).rejects.toMatchObject({ status: 422 });
    expect(memory.reads).toBe(0);
    expect(memory.writes).toEqual([]);
  });
  it("validates platforms, phone numbers, email addresses and unique office ids", () => {
    expect(siteSettingsSchema.safeParse(defaultSettings()).success).toBe(true);
    for (const extra of [
      { email: "bad\r\nBcc: x@example.org" },
      { phone: "call me" },
      { whatsapp: "https://evil.test" },
    ])
      expect(siteSettingsSchema.safeParse({ ...defaultSettings(), ...extra }).success).toBe(false);
    const settings = defaultSettings();
    settings.addresses.push(settings.addresses[0]);
    expect(siteSettingsSchema.safeParse(settings).success).toBe(false);
    expect(
      siteSettingsSchema.safeParse({ ...defaultSettings(), unexpected: "secret" }).success,
    ).toBe(false);
  });
  it("allows icons and WhatsApp to be disabled without leaving broken links", () => {
    const settings = defaultSettings();
    settings.whatsapp = "";
    settings.socials.facebook = "";
    expect(siteSettingsSchema.safeParse(settings).success).toBe(true);
    expect(whatsappLink("")).toBe("");
    expect(nurseryEnquiry("Gala", undefined, "")).toMatch(/^\/contact\?/);
  });
  it("normalizes saved settings from before footer switches without losing customized details", () => {
    const old = { ...defaultSettings(), email: "manual@example.org", phone: "+91 98765 43210" };
    const { footer: _footer, ...legacy } = old;
    void _footer;
    const legacyAddresses = legacy.addresses.map(({ showInFooter: _visible, ...address }) => {
      void _visible;
      return address;
    });
    const normalized = resolveSettings({ ...legacy, addresses: legacyAddresses });
    expect(normalized.email).toBe("manual@example.org");
    expect(normalized.phone).toBe(old.phone);
    expect(Object.values(normalized.footer).every(Boolean)).toBe(true);
    expect(normalized.addresses.every((address) => address.showInFooter)).toBe(true);
  });
  it("persists hidden footer details and restores visibility independently of global links", async () => {
    const settings = defaultSettings();
    settings.whatsapp = "+91 98765 43210";
    settings.footer = Object.fromEntries(
      Object.keys(settings.footer).map((key) => [key, false]),
    ) as typeof settings.footer;
    settings.addresses[0].showInFooter = false;
    await saveSettings(settings, 0, "admin");
    const hidden = await readSettings();
    expect(hidden.settings).toEqual(settings);
    expect(nurseryEnquiry("Gala", undefined, hidden.settings.whatsapp)).toMatch(
      /^https:\/\/wa.me\/919876543210/,
    );
    const restored = { ...hidden.settings, footer: defaultSettings().footer };
    await saveSettings(restored, 1, "admin");
    expect((await readSettings()).settings).toEqual(restored);
    expect(memory.docs.get("cmsPages/site")).toMatchObject({
      publicSettings: { email: settings.email },
    });
  });
  it("rejects malformed visibility values and unknown switches", () => {
    for (const footer of [{ email: "false" }, { phone: null }, { admin: true }])
      expect(siteSettingsSchema.safeParse({ ...defaultSettings(), footer }).success).toBe(false);
    const settings = defaultSettings();
    expect(
      siteSettingsSchema.safeParse({
        ...settings,
        addresses: [{ ...settings.addresses[0], showInFooter: "false" }],
      }).success,
    ).toBe(false);
  });
  it("normalizes the shared WhatsApp number and preserves the product enquiry message", () => {
    const link = nurseryEnquiry("Gala", "M9", "+91 98765-43210");
    expect(link).toMatch(/^https:\/\/wa.me\/919876543210\?/);
    expect(new URL(link).searchParams.get("text")).toContain(
      "Gala apple planting material on M9 rootstock",
    );
  });
  it("never delivers an unsafe persisted social URL to public components", () => {
    expect(
      resolveSettings({ ...defaultSettings(), socials: { facebook: "javascript:alert(1)" } })
        .socials.facebook,
    ).toBe("https://www.facebook.com/zeebaran");
  });
});
