import { requireCurrentUser } from "@/server/auth/current-user";
import { normaliseEvidenceClassificationInput } from "@/server/communications/evidence-classification";
import { classifyCommunicationEvidenceRecord } from "@/server/repositories/communication-repository";

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
  return classifyCommunicationEvidenceRecord({ communicationId: input.communicationId, userId: user.id, ...normaliseEvidenceClassificationInput({ ...input, reviewedByName: user.name }) });
}
