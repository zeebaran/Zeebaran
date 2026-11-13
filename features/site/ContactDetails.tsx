"use client";
import { useSiteSettings } from "./SettingsProvider";
import { useContentStrings } from "@/features/cms/Content";
import { phoneDigits, type ContactChannel } from "./model";

export function useContactDetails() {
  const { settings, configured } = useSiteSettings();
  const copy = useContentStrings();
  // Retain old page-specific edits until the shared settings are first saved.
  return configured
    ? settings
    : {
        ...settings,
        email: copy(settings.email),
        phone: copy(settings.phone),
        channels: Object.fromEntries(
          Object.entries(settings.channels).map(([key, email]) => [key, copy(email)]),
        ) as typeof settings.channels,
        addresses: settings.addresses.map((item) => ({
          ...item,
          label: copy(item.label),
          address: copy(item.address),
          note: copy(item.note),
        })),
      };
}
export function SiteEmailLink({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const settings = useContactDetails();
  return (
    <a className={className} href={"mailto:" + settings.email}>
      {children || settings.email}
    </a>
  );
}
export function SitePhoneLink({ className }: { className?: string }) {
  const settings = useContactDetails();
  return (
    <a className={className} href={"tel:+" + phoneDigits(settings.phone)}>
      {settings.phone}
    </a>
  );
}
export function DeskEmailLink({ channel, className }: { channel: string; className?: string }) {
  const settings = useContactDetails();
  const email = settings.channels[channel as ContactChannel] || settings.email;
  return (
    <a className={className} href={"mailto:" + email}>
      {email}
    </a>
  );
}
export function OfficeAddresses() {
  const settings = useContactDetails();
  return (
    <>
      {settings.addresses.map((address) => (
        <div className="kv" key={address.id}>
          <dt>{address.label}</dt>
          <dd>
            <span className="block font-medium text-forest">{address.address}</span>
            {address.note && (
              <span className="mt-0.5 block text-[0.75rem] text-forest/75">{address.note}</span>
            )}
          </dd>
        </div>
      ))}
    </>
  );
}
