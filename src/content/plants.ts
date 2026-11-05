export interface PlantSelection {
  slug: string;
  name: string;
  number: string;
  description: string;
  note: string;
}
// Names published on the existing Zeebaran website. Availability and specifications
// deliberately remain enquiry-based until approved catalogue records are supplied.
export const plants: readonly PlantSelection[] = [
  {
    slug: "gala",
    name: "Gala",
    number: "01",
    description:
      "Start a conversation about Gala planting material for your orchard.",
    note: "Ask about the available selection, rootstock and planting size.",
  },
  {
    slug: "red-delicious",
    name: "Red Delicious",
    number: "02",
    description:
      "Explore Red Delicious planting options with the Zeebaran team.",
    note: "Confirm this season’s availability and your site requirements.",
  },
];
export const installationSteps = [
  {
    title: "Understand your land",
    detail:
      "We begin with the site: its soil, drainage and local growing conditions.",
    label: "Site assessment",
  },
  {
    title: "Plan the orchard",
    detail:
      "Bring the planting layout, variety selection and support requirements into one considered plan.",
    label: "Design & planning",
  },
  {
    title: "Prepare the ground",
    detail:
      "Coordinate ground preparation, irrigation and the structures that support the orchard.",
    label: "Ground preparation",
  },
  {
    title: "Plant with purpose",
    detail:
      "Establish the selected trees with attention to spacing, orientation and the next steps in their care.",
    label: "Tree installation",
  },
] as const;
