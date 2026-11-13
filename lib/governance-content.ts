/** Shared editorial copy for prospective colleagues and the existing page editor. */
export const governanceCopy = {
  hero: {
    title: "Good people. {Shared purpose.}",
    body: "Zeebaran brings people together to strengthen horticulture across the Himalayas. Our work connects orchard development, scientific practice, field operations, technology, and trade with the people who grow our food.",
    note: "For anyone considering joining our team, these are the responsibilities, working principles, and shared purpose behind the work.",
    peopleLink: "Meet the people behind the work",
    careersLink: "Introduce yourself",
  },
  working: {
    eyebrow: "Working at Zeebaran",
    title: "Different responsibilities. {One connected team.}",
    cards: [
      {
        eyebrow: "People doing the work",
        title: "Practical knowledge. Careful execution.",
        body: "From orchard and farm teams to research, operations, trade, and administration, every contribution supports a connected horticultural system. We value people who understand their work, keep learning, and take responsibility for the details that others depend on.",
      },
      {
        eyebrow: "People leading the work",
        title: "Leadership means taking responsibility for others.",
        body: "The CEO, division heads, and team leaders connect the company’s purpose with everyday decisions. Leadership means setting clear priorities, supporting colleagues, listening to field experience, and being accountable for how the work is carried out.",
      },
    ],
  },
  responsibilities: {
    eyebrow: "How we work together",
    title: "Clear ownership. {Room to contribute.}",
    body: "Good teamwork starts with understanding what you are responsible for, how your work connects with others, and when to ask for support. We look for sound judgement, honest communication, and the willingness to follow through.",
    emphasis: "Responsibility belongs to every role, from the field team to the leadership team.",
    link: "Understand the work we do",
    listTitle: "What we ask of one another",
    items: [
      "Take ownership of your work and communicate progress clearly.",
      "Work respectfully with colleagues, growers, and partners.",
      "Use evidence, ask questions, and learn from the field.",
      "Raise risks and concerns early, rather than leave them for someone else.",
      "Protect the quality of the work and the trust placed in the team.",
    ],
  },
  principles: {
    eyebrow: "Our working principles",
    title: "The way we work {matters as much as the result.}",
    body: "These principles guide how Zeebaran approaches opportunity, responsibility, and long-term decisions. For prospective colleagues and leaders, they offer a starting point for understanding the institution you would be contributing to.",
  },
  concerns: {
    eyebrow: "Raising Concerns",
    title: "Good institutions need a way {to hear difficult things.}",
    body: "Every institution benefits from feedback it would not otherwise receive. Zeebaran provides clear and accessible channels for growers, employees, partners, and other stakeholders to raise concerns, ask difficult questions, and report issues in good faith.",
    note: "The purpose is not to eliminate disagreement. It is to ensure that important concerns are heard, considered, and responded to - and that they cannot simply disappear within the institution.",
    link: "Raise a concern",
  },
  invitation: {
    title: "Bring your experience. {Build with us.}",
    body: "Tell us about your experience, the work you want to contribute to, and why Zeebaran’s purpose matters to you. Whether your background is technical, operational, commercial, or in leading teams, a useful conversation starts with understanding one another.",
    note: "Include your area of interest, relevant experience, and the best way to reach you. A clear introduction helps the team understand where your contribution could fit.",
    peopleLink: "Meet our leadership & team",
    careersLink: "Start a careers conversation",
  },
} as const;
export const governanceEditableCopy = [
  ...Object.values(governanceCopy.hero),
  governanceCopy.working.eyebrow,
  governanceCopy.working.title,
  ...governanceCopy.working.cards.flatMap((card) => Object.values(card)),
  ...Object.entries(governanceCopy.responsibilities).flatMap(([, value]) =>
    typeof value === "string" ? [value] : [...value],
  ),
  ...Object.values(governanceCopy.principles),
  ...Object.values(governanceCopy.concerns),
  ...Object.values(governanceCopy.invitation),
];
