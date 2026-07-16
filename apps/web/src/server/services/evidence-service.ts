import type {
  DocumentCategory,
  EvidenceRequirementStatus,
} from "@prisma/client";

import {
  evidenceCategoryLabels,
  evidenceCategoryOrder,
  type EvidenceDashboardItem,
  type EvidenceRegister,
} from "@/server/evidence/types";
import {
  createEvidenceRequirementRecord,
  listEvidenceCommunicationRecords,
  listEvidenceDashboardRecords,
  listEvidenceDocumentRecords,
  listEvidenceRequirementRecords,
  updateEvidenceRequirementStatusRecord,
} from "@/server/repositories/evidence-repository";

const claimStatusLabels: Record<string, string> = {
  OPEN: "Open",
  AWAITING_EVIDENCE: "Awaiting evidence",
  UNDER_REVIEW: "Under review",
  MEDICAL_REVIEW: "Medical review",
  DECISION_DRAFTING: "Decision drafting",
  READY_FOR_DETERMINATION: "Ready for determination",
  CLOSED: "Closed",
};

export async function getEvidenceRegister(
  claimId: string,
): Promise<EvidenceRegister> {
  const [documents, communicationRecords, requirements] = await Promise.all([
    listEvidenceDocumentRecords(claimId),
    listEvidenceCommunicationRecords(claimId),
    listEvidenceRequirementRecords(claimId),
  ]);

  const communications = communicationRecords.map((record) => ({
    id: record.id,
    subject: record.subject,
    sender: record.sender,
    receivedAt: record.receivedAt,
    status: record.status,
    attachmentCount: record._count.documents,
  }));

  const groups = evidenceCategoryOrder.map((category) => {
    const categoryDocuments = documents.filter(
      (document) => document.category === category,
    );
    const categoryCommunications =
      category === "COMMUNICATION" ? communications : [];

    return {
      category,
      label: evidenceCategoryLabels[category],
      documents: categoryDocuments,
      communications: categoryCommunications,
      itemCount: categoryDocuments.length + categoryCommunications.length,
    };
  });

  return {
    groups,
    requirements,
    totals: {
      documents: documents.length,
      communications: communications.length,
      outstanding: requirements.filter(
        (requirement) => requirement.status === "OUTSTANDING",
      ).length,
      requested: requirements.filter(
        (requirement) => requirement.status === "REQUESTED",
      ).length,
      received: requirements.filter(
        (requirement) => requirement.status === "RECEIVED",
      ).length,
    },
  };
}

export async function getEvidenceDashboard(): Promise<EvidenceDashboardItem[]> {
  const records = await listEvidenceDashboardRecords();

  return records.map((record) => ({
    claimId: record.id,
    claimNumber: record.claimNumber,
    claimantName: record.claimantName,
    status: claimStatusLabels[record.status] ?? record.status,
    documentCount: record._count.documents,
    communicationCount: record._count.communications,
    outstandingCount: record.evidenceRequirements.filter(
      (requirement) => requirement.status === "OUTSTANDING",
    ).length,
    requestedCount: record.evidenceRequirements.filter(
      (requirement) => requirement.status === "REQUESTED",
    ).length,
  }));
}

export async function addEvidenceRequirement(input: {
  claimId: string;
  category: DocumentCategory;
  title: string;
  description?: string;
  requestedFrom?: string;
  dueDate?: Date;
  operatorName?: string;
}) {
  const title = input.title.trim();
  if (title.length < 3) {
    throw new Error("Enter a clear description of the required evidence.");
  }

  return createEvidenceRequirementRecord({
    ...input,
    title,
    description: input.description?.trim() || undefined,
    requestedFrom: input.requestedFrom?.trim() || undefined,
  });
}

export async function changeEvidenceRequirementStatus(input: {
  claimId: string;
  requirementId: string;
  status: EvidenceRequirementStatus;
  operatorName?: string;
}) {
  return updateEvidenceRequirementStatusRecord(input);
}
