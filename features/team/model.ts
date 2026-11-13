import type { ContentValue, MediaValue } from "@/features/cms/model";
import authored from "./members.json";
export type TeamMember = {
  id: string;
  name: string;
  role: string;
  organisation: string;
  summary: string;
  biography: string;
  specialisations: string[];
  philosophy: string;
  vision: string;
  phone: string;
  enabled: boolean;
  image?: MediaValue & { publicId: string; resourceType: "image" };
};
export const defaultTeam = authored as TeamMember[];
export function teamMembers(content: ContentValue): TeamMember[] {
  return content.team ?? defaultTeam;
}
export const newMember = (id: string): TeamMember => ({
  id,
  name: "New team member",
  role: "",
  organisation: "Zeebaran Services Private Limited",
  summary: "",
  biography: "",
  specialisations: [],
  philosophy: "",
  vision: "",
  phone: "",
  enabled: true,
});
