import { SITE } from "@/lib/site";

export const contactChannels = [
  ["research", "Research & institutions", "research@zeebaran.com"],
  ["investment", "Investment & capital", "capital@zeebaran.com"],
  ["collaboration", "Strategic collaboration", "partnerships@zeebaran.com"],
  ["careers", "Careers", "careers@zeebaran.com"],
  ["general", "General enquiries", "hello@zeebaran.com"],
] as const;
export type ContactChannel = (typeof contactChannels)[number][0];
export const defaultFooterVisibility = () => ({
  email: true,
  phone: true,
  addresses: true,
  socials: true,
  facebook: true,
  instagram: true,
  youtube: true,
  whatsapp: true,
});
export type SiteSettings = {
  email: string;
  phone: string;
  whatsapp: string;
  channels: Record<ContactChannel, string>;
  socials: { facebook: string; instagram: string; youtube: string };
  footer: ReturnType<typeof defaultFooterVisibility>;
  addresses: { id: string; label: string; address: string; note: string; showInFooter: boolean }[];
};
export type SettingsRecord = { settings: SiteSettings; revision: number; updatedAt: string | null };
export const phoneDigits = (value: string) => value.replace(/[\s()+.-]/g, "");
export const hasWhatsApp = (value: string) => /^[1-9]\d{7,14}$/.test(phoneDigits(value));
export function defaultSettings(copy: (value: string) => string = (value) => value): SiteSettings {
  return {
    email: copy(SITE.email),
    phone: copy(SITE.phone),
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
    channels: Object.fromEntries(
      contactChannels.map(([id, , email]) => [id, copy(email)]),
    ) as SiteSettings["channels"],
    socials: {
      facebook: "https://www.facebook.com/zeebaran",
      instagram: "https://www.instagram.com/zeebaran",
      youtube: "https://www.youtube.com/@zeebaran",
    },
    footer: defaultFooterVisibility(),
    addresses: SITE.addresses.map((address, index) => ({
      id: index === 0 ? "headquarters" : "liaison",
      label: copy(address.label),
      address: copy(address.lines.join(", ")),
      note: copy(address.note),
      showInFooter: true,
    })),
  };
}
export function whatsappLink(number: string, message?: string) {
  return hasWhatsApp(number)
    ? "https://wa.me/" +
        phoneDigits(number) +
        (message ? "?text=" + encodeURIComponent(message) : "")
    : "";
}
