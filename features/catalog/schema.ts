import { z } from "zod";
const text = (max = 500) => z.string().trim().max(max);
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .min(1)
  .max(80)
  .refine(
    (s) => !["compare", "rootstocks", "new", "api", "assets"].includes(s),
    "This URL is reserved.",
  );
export const catalogSchema = z
  .object({
    slug: slugSchema,
    kind: z.enum(["variety", "rootstock"]),
    name: text(120).min(1),
    localName: text(120),
    eyebrow: text(160),
    headline: text(240),
    intro: text(12000),
    origin: text(),
    season: text(80),
    seasonMonths: text(120),
    colour: text(),
    flavour: text(),
    brix: text(120),
    firmness: text(120),
    shelfLife: text(160),
    storageLife: text(160),
    marketClass: text(),
    code: text(60),
    system: text(),
    spacing: text(160),
    yield: text(160),
    bestFor: text(1500),
    note: text(4000),
    highlights: z.array(text(1500).min(1)).max(20),
    agronomyNotes: text(12000),
    rootstockIds: z
      .array(slugSchema)
      .max(24)
      .refine((a) => new Set(a).size === a.length, "Choose each rootstock once."),
    images: z
      .array(
        z
          .object({
            src: text(2000).min(1),
            alt: text(300).min(1),
            publicId: text(300).optional(),
            width: z.number().positive().optional(),
            height: z.number().positive().optional(),
          })
          .strict(),
      )
      .max(12),
    specifications: z
      .array(
        z
          .object({ group: text(100).min(1), label: text(100).min(1), value: text(2000).min(1) })
          .strict(),
      )
      .max(80)
      .refine(
        (a) => new Set(a.map((s) => (s.group + "/" + s.label).toLowerCase())).size === a.length,
        "Specification names must be unique within their group.",
      ),
    badge: text(100),
    sortOrder: z.number().int().min(-100000).max(100000),
  })
  .strict()
  .superRefine((d, c) => {
    if (d.kind === "rootstock" && d.rootstockIds.length)
      c.addIssue({
        code: "custom",
        path: ["rootstockIds"],
        message: "Rootstocks cannot link to other rootstocks.",
      });
  });
export function publicationProblems(d: z.infer<typeof catalogSchema>) {
  return [
    !d.intro && "Add a description.",
    !d.headline && "Add a headline.",
    !d.images.length && "Choose at least one image.",
    d.kind === "rootstock" && !d.code && "Add the rootstock code.",
  ].filter(Boolean) as string[];
}
export const normalizeSearch = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
