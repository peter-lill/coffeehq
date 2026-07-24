import { db } from "@/lib/db";
import { requireCurrentUser } from "@/server/auth/current-user";
import { normaliseEvidenceClassificationInput } from "@/server/communications/evidence-classification";

export async function classifyIncomingEmailEvidence(input: {
  communicationId: string;
  category: string;
  title: string;
  description: string;
  relevance?: string;
  reviewedByName: string;
  requirementId?: string;
  applyCategoryToAttachments: boolean;
}) {
  const user = await requireCurrentUser();
  const normalised = normaliseEvidenceClassificationInput({
    ...input,
    reviewedByName: user.name,
  });

  return db.$transaction(async (transaction) => {
    const communication = await transaction.communication.findFirst({
      where: {
        id: input.communicationId,
        deletedAt: null,
        claim: {
          OR: [
            { ownerId: user.id },
            { accessGrants: { some: { userId: user.id, revokedAt: null } } },
          ],
        },
      },
      include: { claim: true, documents: true },
    });

    if (!communication?.claim) {
      throw new Error("This email is not filed to an accessible claim.");
    }

    if (normalised.applyCategoryToAttachments) {
      await transaction.document.updateMany({
        where: { communicationId: communication.id, deletedAt: null },
        data: { category: normalised.category },
      });
    }

    await transaction.claimEvent.create({
      data: {
        claimId: communication.claim.id,
        createdById: user.id,
        type: "EVIDENCE_RECEIVED_LINKED",
        title: normalised.title,
        description: normalised.description,
        metadata: {
          communicationId: communication.id,
          category: normalised.category,
          relevance: normalised.relevance,
          reviewedByName: user.name,
        },
      },
    });

    if (normalised.requirementId) {
      const requirement = await transaction.evidenceRequirement.findFirst({
        where: {
          id: normalised.requirementId,
          claimId: communication.claim.id,
          deletedAt: null,
        },
      });
      if (!requirement) throw new Error("The selected evidence request could not be found.");

      await transaction.evidenceRequirement.update({
        where: { id: requirement.id },
        data: { status: "RECEIVED", completedAt: new Date(), updatedByName: user.name },
      });
      await transaction.evidenceRequirementLink.upsert({
        where: {
          requirementId_communicationId: {
            requirementId: requirement.id,
            communicationId: communication.id,
          },
        },
        create: {
          requirementId: requirement.id,
          communicationId: communication.id,
          linkedByName: user.name,
          note: normalised.relevance,
        },
        update: {
          linkedByName: user.name,
          note: normalised.relevance,
          linkedAt: new Date(),
        },
      });
    }

    return { communicationId: communication.id, claimId: communication.claim.id };
  });
}
