export const flow = [
  {
    n: "01",
    t: "Orchard Record",
    b: "A living record of each orchard - what is planted, where it is located, the rootstock and variety, and the history of management decisions.",
    c: "Context.",
  },
  {
    n: "02",
    t: "Field Observation",
    b: "Images, symptoms, measurements, and observations captured by growers and field teams throughout the season.",
    c: "Evidence.",
  },
  {
    n: "03",
    t: "Weather & Season",
    b: "Local weather, seasonal conditions, and orchard context that determine whether an intervention should happen now, later, or not at all.",
    c: "Timing.",
  },
  {
    n: "04",
    t: "Decision Support",
    b: "The platform combines records, observations, weather, and technical knowledge to support timely, practical guidance that field teams can recommend and growers can confidently act upon.",
    c: "Better decisions.",
  },
];

export type Status = "Under Validation" | "In Field" | "In Development";

export const priorityCards: { n: string; t: string; b: string; s: Status }[] = [
  {
    n: "01",
    t: "Rootstock Validation",
    b: "Evaluating rootstocks for performance, resilience, and suitability under Himalayan growing conditions.",
    s: "Under Validation",
  },
  {
    n: "02",
    t: "Germplasm Characterisation",
    b: "Understanding the traits, performance and potential of fruit varieties relevant to Himalayan horticulture.",
    s: "Under Validation",
  },
  {
    n: "03",
    t: "Biological Crop Protection",
    b: "Developing and validating biological approaches that reduce avoidable dependence on synthetic crop protection while maintaining orchard performance.",
    s: "In Field",
  },
  {
    n: "04",
    t: "Digital Extension",
    b: "Improving how orchard records, diagnostics, weather intelligence, and practical guidance reach dispersed growers through field teams.",
    s: "In Development",
  },
  {
    n: "05",
    t: "Post-Harvest Quality",
    b: "Improving quality preservation across harvesting, grading, storage, processing, and distribution.",
    s: "In Field",
  },
  {
    n: "06",
    t: "Soil & Plant Health",
    b: "Understanding local soil and plant conditions to support more precise, evidence-based orchard management.",
    s: "In Field",
  },
];
