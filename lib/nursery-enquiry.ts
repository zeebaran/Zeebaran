import { whatsappLink } from "@/features/site/model";

export function nurseryEnquiry(
  variety?: string,
  rootstock?: string,
  number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
) {
  const message = variety
    ? `Hello Zeebaran team, I would like to enquire about ${variety} apple planting material${rootstock ? " on " + rootstock + " rootstock" : ""}. Please share availability and pricing.`
    : `Hello Zeebaran team, I would like guidance on ${rootstock ? rootstock + " rootstock" : "rootstock selection"} for my orchard.`;
  return (
    whatsappLink(number, message) ||
    "/contact?" + new URLSearchParams({ reason: "collaboration", message }) + "#write"
  );
}
