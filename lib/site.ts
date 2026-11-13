export const SITE = {
  name: "Zeebaran",
  legalName: "Zeebaran Agri Technologies Pvt. Ltd.",
  email: "contact@zeebaran.com",
  tagline: "Strong roots. Lasting harvests.",
  description:
    "Zeebaran builds the knowledge, inputs and market links that turn smallholder farms into resilient, productive businesses.",
  phone: "+91 194 245 8011",
  addresses: [
    {
      label: "Corporate HQ",
      lines: ["64, Jawahar Nagar, Srinagar, J&K - 190 008"],
      note: "Operational command & central cold chain dispatch",
    },
    {
      label: "Liaison Office",
      lines: ["Vasant Arcade, Vasant Kunj, New Delhi - 110 070"],
      note: "Investor relations & national distribution coordination",
    },
  ],
};

export const NAV = [
  { href: "/platform", label: "The Platform" },
  { href: "/products", label: "Varieties" },
  { href: "/zeebaran-hub", label: "Zeebaran Hub" },
  { href: "/innovation", label: "Innovation" },
  { href: "/mission", label: "Our Mission" },
  { href: "/partnerships", label: "Partnerships" },
  { href: "/podcast", label: "Podcast" },
  { href: "/about", label: "About" },
] as const;

export const ABOUT_LINKS = [
  { href: "/governance", label: "Governance" },
  { href: "/impact", label: "Impact" },
] as const;
export const FOOTER = {
  explore: [
    { href: "/platform", label: "The Platform" },
    { href: "/products", label: "Varieties & Plant Material" },
    { href: "/zeebaran-hub", label: "Zeebaran Hub" },
    { href: "/innovation", label: "Innovation" },
    { href: "/impact", label: "Impact & Numbers" },
    { href: "/podcast", label: "Bazm-e-Khayal · Podcast" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/partnerships", label: "Partnerships" },
    { href: "/governance", label: "Governance" },
    { href: "/contact", label: "Careers & Contact" },
  ],
};
