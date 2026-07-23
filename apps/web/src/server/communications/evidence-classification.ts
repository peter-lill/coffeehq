import type { DocumentCategory } from "@prisma/client";

const categories: DocumentCategory[] = [
  "MEDICAL",
  "EMPLOYMENT",
  "WORKER",
  "EMPLOYER",
  "WITNESS",
  "PAYROLL",
  "COMMUNICATION",
  "PHOTO",
  "VIDEO",
  "OTHER",
];

function requiredText(value: string, label: string, minimum: number) {
  const trimmed = value.trim();
  if (trimmed.length < minimum) {
    throw new Error(`${label} must contain at least ${minimum} characters.`);
  }
  return trimmed;
}

function optionalText(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed || undefined;
}

export function normaliseEvidenceClassificationInput(input: {
  category: string;
  title: string;
  description: string;
  relevance?: string;
  reviewedByName: string;
  requirementId?: string;
  applyCategoryToAttachments: boolean;
}) {
  if (!categories.includes(input.category as DocumentCategory)) {
    throw new Error("Select a valid evidence type.");
  }

  return {
    category: input.category as DocumentCategory,
    title: requiredText(input.title, "Evidence title", 3),
    description: requiredText(
      input.description,
      "Evidence description",
      5,
    ),
    relevance: optionalText(input.relevance),
    reviewedByName: requiredText(input.reviewedByName, "Reviewed by", 2),
    requirementId: optionalText(input.requirementId),
    applyCategoryToAttachments: input.applyCategoryToAttachments,
  };
}
