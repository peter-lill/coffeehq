import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

export async function findCommunicationByMessageId(
  internetMessageId: string,
) {
  return db.communication.findUnique({
    where: { internetMessageId },
  });
}

export async function listInboxRecords(organisationId: string) {
  return db.communication.findMany({
    where: { organisationId },
    include: {
      claim: {
        select: {
          claimNumber: true,
          claimantName: true,
        },
      },
      _count: {
        select: { documents: true },
      },
    },
    orderBy: [{ receivedAt: "desc" }, { createdAt: "desc" }],
    take: 100,
  });
}

export async function createInboundCommunicationRecord(input: {
  organisationId: string;
  claimId?: string;
  status: "FILED" | "NEEDS_REVIEW";
  matchMethod:
    | "CLAIM_NUMBER_SUBJECT"
    | "CLAIM_NUMBER_BODY"
    | "UNMATCHED";
  matchConfidence: number;
  sender: string;
  recipients: Prisma.InputJsonValue;
  ccRecipients?: Prisma.InputJsonValue;
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  internetMessageId?: string;
  threadId?: string;
  rawStorageKey: string;
  receivedAt: Date;
}) {
  return db.$transaction(async (transaction) => {
    const event = input.claimId
      ? await transaction.claimEvent.create({
          data: {
            claimId: input.claimId,
            type: "EMAIL_RECEIVED",
            title: "Incoming email received",
            description: input.subject || "No subject",
            occurredAt: input.receivedAt,
            metadata: {
              sender: input.sender,
              subject: input.subject,
              matchMethod: input.matchMethod,
              matchConfidence: input.matchConfidence,
            },
          },
        })
      : null;

    return transaction.communication.create({
      data: {
        organisationId: input.organisationId,
        claimId: input.claimId,
        eventId: event?.id,
        direction: "INCOMING",
        channel: "EMAIL",
        status: input.status,
        matchMethod: input.matchMethod,
        matchConfidence: input.matchConfidence,
        sender: input.sender,
        recipients: input.recipients,
        ccRecipients: input.ccRecipients,
        subject: input.subject,
        bodyText: input.bodyText,
        bodyHtml: input.bodyHtml,
        internetMessageId: input.internetMessageId,
        threadId: input.threadId,
        rawStorageKey: input.rawStorageKey,
        receivedAt: input.receivedAt,
      },
    });
  });
}

export async function linkDocumentToCommunication(input: {
  documentId: string;
  communicationId: string;
}) {
  return db.document.update({
    where: { id: input.documentId },
    data: { communicationId: input.communicationId },
  });
}
