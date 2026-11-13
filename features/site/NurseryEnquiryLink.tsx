"use client";
import type { ComponentProps } from "react";
import { nurseryEnquiry } from "@/lib/nursery-enquiry";
import { useSiteSettings } from "./SettingsProvider";
import { hasWhatsApp } from "./model";
export function NurseryEnquiryLink({
  variety,
  rootstock,
  ...props
}: Omit<ComponentProps<"a">, "href" | "target" | "rel"> & {
  variety?: string;
  rootstock?: string;
}) {
  const { settings } = useSiteSettings();
  const available = hasWhatsApp(settings.whatsapp);
  return (
    <a
      {...props}
      className={["action-motion", props.className].filter(Boolean).join(" ")}
      href={nurseryEnquiry(variety, rootstock, settings.whatsapp)}
      target={available ? "_blank" : undefined}
      rel={available ? "noopener noreferrer" : undefined}
    />
  );
}
