export type BeanClaimBriefInput = {
  claim: {
    claimNumber: string;
    name: string;
    injury: string;
    status: string;
    nextAction: string | null;
    determinationReadiness: number;
  };
  documents: Array<{
    id: string;
    category: string;
    originalName: string;
    createdAt: Date;
  }>;
  events: Array<{
    id: string;
    type: string;
    title: string;
    description: string | null;
    occurredAt: Date;
  }>;
};

export type BeanClaimBrief = {
  summary: string;
  sourceCounts: {
    documents: number;
    events: number;
  };
  evidenceCoverage: Array<{
    category: string;
    count: number;
  }>;
  recentChronology: Array<{
    id: string;
    title: string;
    description: string | null;
    occurredAt: Date;
    sourceLabel: string;
  }>;
  gaps: string[];
  boundaryNotice: string;
};

const expectedEvidenceCategories = ["MEDICAL", "WORKER", "EMPLOYER"] as const;

export function buildBeanClaimBrief(input: BeanClaimBriefInput): BeanClaimBrief {
  const evidenceCounts = input.documents.reduce<Record<string, number>>(
    (counts, document) => {
      counts[document.category] = (counts[document.category] ?? 0) + 1;
      return counts;
    },
    {},
  );

  const evidenceCoverage = Object.entries(evidenceCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((left, right) => left.category.localeCompare(right.category));

  const recentChronology = [...input.events]
    .sort(
      (left, right) =>
        new Date(right.occurredAt).getTime() -
        new Date(left.occurredAt).getTime(),
    )
    .slice(0, 5)
    .map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      occurredAt: event.occurredAt,
      sourceLabel: `Timeline event · ${event.type.replaceAll("_", " ").toLowerCase()}`,
    }));

  const gaps: string[] = [];

  for (const category of expectedEvidenceCategories) {
    if (!evidenceCounts[category]) {
      gaps.push(`No ${category.toLowerCase()} evidence is currently recorded.`);
    }
  }

  if (input.events.length === 0) {
    gaps.push("No claim chronology events are currently recorded.");
  }

  if (!input.claim.nextAction?.trim()) {
    gaps.push("No next action is currently recorded for the claim.");
  }

  if (input.claim.determinationReadiness < 50) {
    gaps.push("Determination readiness is below 50%; further evidence review is likely required.");
  }

  const nextAction =
    input.claim.nextAction?.trim() || "review the available material and record the next action";

  return {
    summary: `${input.claim.claimNumber} concerns ${input.claim.name}'s ${input.claim.injury}. The claim is ${input.claim.status.toLowerCase()} with ${input.documents.length} document(s), ${input.events.length} timeline event(s), and ${input.claim.determinationReadiness}% determination readiness. The current operational priority is to ${nextAction}.`,
    sourceCounts: {
      documents: input.documents.length,
      events: input.events.length,
    },
    evidenceCoverage,
    recentChronology,
    gaps,
    boundaryNotice:
      "Bean organises recorded claim information only. It does not determine liability, replace medical opinion or make a statutory decision.",
  };
}
