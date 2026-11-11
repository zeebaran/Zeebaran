const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/^\+/, "");
export const whatsappAvailable = /^[1-9]\d{7,14}$/.test(number);

export function nurseryEnquiry(variety?: string, rootstock?: string) {
  const message = variety
    ? `Hello Zeebaran team, I would like to enquire about ${variety} apple planting material${rootstock ? " on " + rootstock + " rootstock" : ""}. Please share availability and pricing.`
    : `Hello Zeebaran team, I would like guidance on ${rootstock ? rootstock + " rootstock" : "rootstock selection"} for my orchard.`;
  return whatsappAvailable
    ? "https://wa.me/" + number + "?text=" + encodeURIComponent(message)
    : "/contact?" + new URLSearchParams({ reason: "collaboration", message }) + "#write";
}
