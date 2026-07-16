import type { CommunicationStatus, Prisma } from "@prisma/client";

import { db } from "@/lib/db";

export class CommunicationAlreadyFiledError extends Error {
  constructor() {
    super("This email has already been filed or is no longer awaiting review.");
    this.name = "CommunicationAlreadyFiledError";
  }
}

export async function findCommunicationByMessageId(
  internetMessageId: string,
) {
  return db.communication.findUnique({
    where: { internetMessageId },
  });
}

export async function findCommunicationForManualFiling(
  communicationId: string,
) {
  return db.communication.findUnique({
    where: { id: communicationId },
    select: {
      id: true,
      organisationId: true,
      claimId: true,
      status: true,
      sender: true,
      subject: true,
      rawStorageKey: true,
      receivedAt: true,
    },
  });
}

export async function findClaimForManualFiling(input: {
  claimId: string;
  organisationId: string;
}) {
  return db.claim.findFirst({
    where: {
      id: input.claimId,
      organisationId: input.organisationId,
    },
    select: {
      id: true,
      claimNumber: true,
      claimantName: true,
    },
  });
}

export async function listInboxRecords(input: {
  organisationId: string;
  status?: CommunicationStatus;
  search?: string;
}) {
  const search = input.search?.trim();
  const where: Prisma.CommunicationWhereInput = {
    organisationId: input.organisationId,
    ...(input.status ? { status: input.status } : {}),
    ...(search
      ? {
          OR: [
            {
              sender: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              subject: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              claim: {
                is: {
                  claimNumber: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            },
            {
              claim: {
                is: {
                  claimantName: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            },
          ],
        }
      : {}),
  };

  return db.communication.findMany({
    where,
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
    take: 200,
  });
}

export async function countInboxRecords(organisationId: string) {
  return db.communication.groupBy({
    by: ["status"],
    where: { organisationId },
    _count: { _all: true },
  });
}

export async function findCommunicationDetail(input: {
  communicationId: string;
  organisationId: string;
}) {
  return db.communication.findFirst({
    where: {
      id: input.communicationId,
      organisationId: input.organisationId,
    },
    include: {
      claim: {
        select: {
          claimNumber: true,
          claimantName: true,
        },
      },
      documents: {
        select: {
          id: true,
          originalName: true,
          mimeType: true,
          sizeBytes: true,
          category: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
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

export type ManualFilingAttachmentRecord = {
  originalName: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  category:
    | "MEDICAL"
    | "EMPLOYMENT"
    | "WORKER"
    | "EMPLOYER"
    | "WITNESS"
    | "PAYROLL"
    | "COMMUNICATION"
    | "PHOTO"
    | "VIDEO"
    | "OTHER";
};

export async function fileCommunicationToClaimRecord(input: {
  communicationId: string;
  organisationId: string;
  claimId: string;
  filedBy: string;
  reason: string;
  attachments: ManualFilingAttachmentRecord[];
  skippedAttachmentCount: number;
}) {
  return db.$transaction(
    async (transaction) => {
      const communication = await transaction.communication.findUnique({
        where: { id: input.communicationId },
        select: {
          id: true,
          organisationId: true,
          claimId: true,
          status: true,
          sender: true,
          subject: true,
          receivedAt: true,
        },
      });

      if (
        !communication ||
        communication.organisationId !== input.organisationId ||
        communication.status !== "NEEDS_REVIEW" ||
        communication.claimId
      ) {
        throw new CommunicationAlreadyFiledError();
      }

      const claim = await transaction.claim.findFirst({
        where: {
          id: input.claimId,
          organisationId: input.organisationId,
        },
        select: {
          id: true,
          claimNumber: true,
          claimantName: true,
        },
      });

      if (!claim) {
        throw new Error("The selected claim could not be found.");
      }

      const emailEvent = await transaction.claimEvent.create({
        data: {
          claimId: claim.id,
          type: "EMAIL_RECEIVED",
          title: "Incoming email manually filed",
          description: communication.subject || "No subject",
          occurredAt: communication.receivedAt,
          metadata: {
            sender: communication.sender,
            subject: communication.subject,
            matchMethod: "MANUAL",
            matchConfidence: 100,
            filedBy: input.filedBy,
            filingReason: input.reason,
            attachmentCount: input.attachments.length,
            skippedAttachmentCount: input.skippedAttachmentCount,
          },
        },
      });

      for (const attachment of input.attachments) {
        const documentEvent = await transaction.claimEvent.create({
          data: {
            claimId: claim.id,
            type: "DOCUMENT_UPLOADED",
            title: "Email attachment filed",
            description: attachment.originalName,
            occurredAt: communication.receivedAt,
            metadata: {
              originalName: attachment.originalName,
              mimeType: attachment.mimeType,
              sizeBytes: attachment.sizeBytes,
              source: "INCOMING_EMAIL",
              category: attachment.category,
              communicationId: communication.id,
              manuallyFiledBy: input.filedBy,
            },
          },
        });

        await transaction.document.create({
          data: {
            claimId: claim.id,
            eventId: documentEvent.id,
            communicationId: communication.id,
            originalName: attachment.originalName,
            storageKey: attachment.storageKey,
            mimeType: attachment.mimeType,
            sizeBytes: attachment.sizeBytes,
            sha256: attachment.sha256,
            source: "INCOMING_EMAIL",
            category: attachment.category,
          },
        });
      }

      const updated = await transaction.communication.updateMany({
        where: {
          id: communication.id,
          organisationId: input.organisationId,
          claimId: null,
          status: "NEEDS_REVIEW",
        },
        data: {
          claimId: claim.id,
          eventId: emailEvent.id,
          status: "FILED",
          matchMethod: "MANUAL",
          matchConfidence: 100,
          manuallyFiledAt: new Date(),
          manuallyFiledBy: input.filedBy,
          manualFilingReason: input.reason,
        },
      });

      if (updated.count !== 1) {
        throw new CommunicationAlreadyFiledError();
      }

      return {
        communicationId: communication.id,
        claim,
        attachmentCount: input.attachments.length,
        skippedAttachmentCount: input.skippedAttachmentCount,
      };
    },
    {
      isolationLevel: "Serializable",
    },
  );
}
