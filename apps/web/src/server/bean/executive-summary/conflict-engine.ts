import type {
  ClaimConflict,
  ExecutiveClaimSummaryInput,
} from "./executive-summary.types";

const accountEvents = new Set([
  "EMPLOYER_RESPONSE_RECEIVED",
  "WORKER_RESPONSE_RECEIVED",
]);

export function identifyConflicts(input: ExecutiveClaimSummaryInput): ClaimConflict[] {
  const workerDocuments = input.documents.filter((document) => document.category === "WORKER");
  const employerDocuments = input.documents.filter((document) => document.category === "EMPLOYER");
  const responseEvents = input.events.filter((event) => accountEvents.has(event.type));

  if (workerDocuments.length === 0 || employerDocuments.length === 0) return [];

  return [
    {
      id: "worker-employer-accounts",
      issue: "Worker and employer accounts require comparison",
      workerPosition: `${workerDocuments.length} worker evidence item(s) are recorded.`,
      employerPosition: `${employerDocuments.length} employer evidence item(s) are recorded.`,
      recommendedEvidence: ["Relevant witness evidence", "Contemporaneous communications", "Objective employment records"],
      sourceIds: [
        ...workerDocuments.map((document) => document.id),
        ...employerDocuments.map((document) => document.id),
        ...responseEvents.map((event) => event.id),
      ],
    },
  ];
}
