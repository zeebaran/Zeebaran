import { z } from "zod";
import type { TeamMember } from "./model";
const portrait = z
  .object({
    src: z.string().max(2000),
    alt: z.string().max(300),
    publicId: z.string().min(1).max(300),
    resourceType: z.literal("image"),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
  })
  .strict();
export const teamSchema: z.ZodType<TeamMember[]> = z
  .array(
    z
      .object({
        id: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,79}$/),
        name: z.string().trim().max(120),
        role: z.string().trim().max(160),
        organisation: z.string().trim().max(160),
        summary: z.string().trim().max(600),
        biography: z.string().trim().max(12000),
        specialisations: z.array(z.string().trim().max(200)).max(20),
        philosophy: z.string().trim().max(500),
        vision: z.string().trim().max(500),
        phone: z
          .string()
          .trim()
          .max(40)
          .refine(
            (v) =>
              !v ||
              (/^[+\d][\d\s().-]*$/.test(v) && /^[1-9]\d{7,14}$/.test(v.replace(/[\s()+.-]/g, ""))),
            "Use a phone number with its country code, or leave it empty.",
          ),
        enabled: z.boolean(),
        image: portrait.optional(),
      })
      .strict(),
  )
  .max(30)
  .refine(
    (members) => new Set(members.map((m) => m.id)).size === members.length,
    "Each member needs a unique identifier.",
  );
export function teamIssue(members: TeamMember[]) {
  const parsed = teamSchema.safeParse(members);
  if (!parsed.success) return "Check team details, phone numbers and portrait files.";
  for (const [index, member] of parsed.data.entries()) {
    if (!member.name) return `Member ${index + 1}: enter a name.`;
    if (!member.role) return `${member.name}: enter a designation.`;
    if (!member.summary) return `${member.name}: add a short introduction.`;
    if (!member.biography) return `${member.name}: add the full biography.`;
  }
}
export function isTeamMembers(value: unknown, allowIncomplete = false): value is TeamMember[] {
  const result = teamSchema.safeParse(value);
  return result.success && (allowIncomplete || !teamIssue(result.data));
}
