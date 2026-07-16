import { createHash } from "node:crypto";

import type { AddressObject, Attachment, ParsedMail } from "mailparser";

import { documentStorage } from "@/lib/storage/local-document-storage";
import { db } from "@/lib/db";
import {
  createInboundCommunicationRecord,
  findCommunicationByMessageId,
  linkDocumentToCommunication,
} from "@/server/repositories/communication-repository";
import {
  createDocumentAndEventRecord,
  findDuplicateDocumentRecord,
} from "@/server/repositories/document-repository";

const CLAIM_NUMBER_PATTERN = /\b[A-Z]\d{2}[A-Z]{2}\d{6}\b/i;
const MAX_EMAIL_ATTACHMENT_BYTES =
  Number(process.env.MAX_UPLOAD_SIZE_MB ?? "50") * 1024 * 1024;
const DEVELOPMENT_ORGANISATION_SLUG = "coffeehq-development";

function addressList(value?: AddressObject | AddressObject[] | null) {
  const items = !value ? [] : Array.isArray(value) ? value : [value];
  return items.flatMap((item) =>
    item.value.map((address) => ({
      name: address.name || null,
      address: address.address || "",
    })),
  );
}

function firstSender(mail: ParsedMail) {
  return addressList(mail.from)[0]?.address || "unknown";
}

function findClaimNumber(subject: string, bodyText: string) {
  const subjectMatch = subject.match(CLAIM_NUMBER_PATTERN)?.[0];
  if (subjectMatch) {
    return {
      claimNumber: subjectMatch.toUpperCase(),
      matchMethod: "CLAIM_NUMBER_SUBJECT" as const,
      confidence: 100,
    };
  }

  const bodyMatch = bodyText.match(CLAIM_NUMBER_PATTERN)?.[0];
  if (bodyMatch) {
    return {
      claimNumber: bodyMatch.toUpperCase(),
      matchMethod: "CLAIM_NUMBER_BODY" as const,
      confidence: 95,
    };
  }

  return null;
}

function inferCategory(attachment: Attachment) {
  const name = attachment.filename?.toLowerCase() ?? "";
  if (name.includes("payroll") || name.includes("timesheet")) return "PAYROLL" as const;
  if (name.includes("medical") || name.includes("certificate") || name.includes("doctor")) return "MEDICAL" as const;
  if (name.includes("employer")) return "EMPLOYER" as const;
  if (name.includes("worker") || name.includes("claimant")) return "WORKER" as const;
  if (name.includes("witness")) return "WITNESS" as const;
  return "OTHER" as const;
}

export async function ingestIncomingEmail(input: {
  rawSource: Buffer;
  mail: ParsedMail;
}) {
  const internetMessageId = input.mail.messageId?.trim();
  if (internetMessageId) {
    const existing = await findCommunicationByMessageId(internetMessageId);
    if (existing) return { status: "duplicate" as const, communication: existing };
  }

  const organisation = await db.organisation.findUnique({
    where: { slug: DEVELOPMENT_ORGANISATION_SLUG },
    select: { id: true },
  });
  if (!organisation) throw new Error("Development organisation is missing.");

  const subject = input.mail.subject?.trim() || "(No subject)";
  const bodyText = input.mail.text?.trim() || "";
  const match = findClaimNumber(subject, bodyText);
  const claim = match
    ? await db.claim.findFirst({
        where: {
          organisationId: organisation.id,
          claimNumber: match.claimNumber,
        },
        select: { id: true, claimNumber: true },
      })
    : null;

  const rawStored = await documentStorage.save({
    claimId: claim?.id ?? "unmatched-email",
    originalName: `${internetMessageId || crypto.randomUUID()}.eml`,
    bytes: input.rawSource,
  });

  const communication = await createInboundCommunicationRecord({
    organisationId: organisation.id,
    claimId: claim?.id,
    status: claim ? "FILED" : "NEEDS_REVIEW",
    matchMethod: claim ? match!.matchMethod : "UNMATCHED",
    matchConfidence: claim ? match!.confidence : 0,
    sender: firstSender(input.mail),
    recipients: addressList(input.mail.to),
    ccRecipients: addressList(input.mail.cc),
    subject,
    bodyText,
    bodyHtml:
      typeof input.mail.html === "string" ? input.mail.html : undefined,
    internetMessageId,
    threadId: input.mail.references?.at(-1) || input.mail.inReplyTo || undefined,
    rawStorageKey: rawStored.storageKey,
    receivedAt: input.mail.date ?? new Date(),
  });

  if (!claim) {
    return { status: "needs-review" as const, communication };
  }

  for (const attachment of input.mail.attachments) {
    if (!attachment.filename || attachment.content.length === 0) continue;
    if (attachment.content.length > MAX_EMAIL_ATTACHMENT_BYTES) continue;

    const bytes = new Uint8Array(attachment.content);
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    const duplicate = await findDuplicateDocumentRecord({
      claimId: claim.id,
      sha256,
    });
    if (duplicate) continue;

    const stored = await documentStorage.save({
      claimId: claim.id,
      originalName: attachment.filename,
      bytes,
    });

    try {
      const document = await createDocumentAndEventRecord({
        claimId: claim.id,
        originalName: attachment.filename,
        storageKey: stored.storageKey,
        mimeType: attachment.contentType || "application/octet-stream",
        sizeBytes: attachment.content.length,
        sha256,
        source: "INCOMING_EMAIL",
        category: inferCategory(attachment),
      });
      await linkDocumentToCommunication({
        documentId: document.id,
        communicationId: communication.id,
      });
    } catch (error) {
      await documentStorage.delete(stored.storageKey);
      throw error;
    }
  }

  return { status: "filed" as const, communication };
}
