import type { CommunicationStatus, Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { documentStorage } from "@/lib/storage/local-document-storage";
import type {
  CommunicationDetail,
  InboxCommunication,
  InboxCounts,
  InboxQuery,
} from "@/server/communications/types";
import {
  countInboxRecords,
  findCommunicationDetail,
  listInboxRecords,
} from "@/server/repositories/communication-repository";

const DEVELOPMENT_ORGANISATION_SLUG = "coffeehq-development";

async function getDevelopmentOrganisationId() {
  const organisation = await db.organisation.findUnique({
    where: { slug: DEVELOPMENT_ORGANISATION_SLUG },
    select: { id: true },
  });

  if (!organisation) {
    throw new Error(
      "Development organisation is missing. Run the database seed.",
    );
  }

  return organisation.id;
}

function isCommunicationStatus(value: string | undefined): value is CommunicationStatus {
  return [
    "RECEIVED",
    "PROCESSING",
    "FILED",
    "NEEDS_REVIEW",
    "FAILED",
    "QUARANTINED",
  ].includes(value ?? "");
}

function formatAddressList(value: Prisma.JsonValue | null): string[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return [];
    }

    const address = "address" in entry ? entry.address : null;
    const name = "name" in entry ? entry.name : null;

    if (typeof address !== "string" || !address.trim()) return [];
    if (typeof name === "string" && name.trim()) {
      return [`${name.trim()} <${address.trim()}>`];
    }

    return [address.trim()];
  });
}

function toInboxCommunication(record: Awaited<ReturnType<typeof listInboxRecords>>[number]): InboxCommunication {
  return {
    id: record.id,
    claimNumber: record.claim?.claimNumber ?? null,
    claimantName: record.claim?.claimantName ?? null,
    sender: record.sender,
    subject: record.subject,
    status: record.status,
    matchMethod: record.matchMethod,
    matchConfidence: record.matchConfidence,
    receivedAt: record.receivedAt,
    attachmentCount: record._count.documents,
    manuallyFiledAt: record.manuallyFiledAt,
    manuallyFiledBy: record.manuallyFiledBy,
    manualFilingReason: record.manualFilingReason,
  };
}

export async function getInbox(query: InboxQuery = {}): Promise<InboxCommunication[]> {
  const organisationId = await getDevelopmentOrganisationId();
  const status =
    query.status && query.status !== "ALL" && isCommunicationStatus(query.status)
      ? query.status
      : undefined;
  const records = await listInboxRecords({
    organisationId,
    status,
    search: query.search,
  });

  return records.map(toInboxCommunication);
}

export async function getInboxCounts(): Promise<InboxCounts> {
  const organisationId = await getDevelopmentOrganisationId();
  const grouped = await countInboxRecords(organisationId);
  const counts = new Map(grouped.map((item) => [item.status, item._count._all]));

  return {
    all: grouped.reduce((total, item) => total + item._count._all, 0),
    needsReview: counts.get("NEEDS_REVIEW") ?? 0,
    filed: counts.get("FILED") ?? 0,
    failed: counts.get("FAILED") ?? 0,
    quarantined: counts.get("QUARANTINED") ?? 0,
  };
}

export async function getCommunicationDetail(
  communicationId: string,
): Promise<CommunicationDetail | null> {
  const organisationId = await getDevelopmentOrganisationId();
  const record = await findCommunicationDetail({
    communicationId,
    organisationId,
  });

  if (!record) return null;

  return {
    id: record.id,
    claimNumber: record.claim?.claimNumber ?? null,
    claimantName: record.claim?.claimantName ?? null,
    sender: record.sender,
    subject: record.subject,
    status: record.status,
    matchMethod: record.matchMethod,
    matchConfidence: record.matchConfidence,
    receivedAt: record.receivedAt,
    attachmentCount: record.documents.length,
    manuallyFiledAt: record.manuallyFiledAt,
    manuallyFiledBy: record.manuallyFiledBy,
    manualFilingReason: record.manualFilingReason,
    recipients: formatAddressList(record.recipients),
    ccRecipients: formatAddressList(record.ccRecipients),
    bodyText: record.bodyText?.trim() || "(No plain-text email body was available.)",
    internetMessageId: record.internetMessageId,
    rawAvailable: Boolean(record.rawStorageKey),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    attachments: record.documents,
  };
}

export async function getRawCommunication(input: {
  communicationId: string;
}) {
  const organisationId = await getDevelopmentOrganisationId();
  const record = await findCommunicationDetail({
    communicationId: input.communicationId,
    organisationId,
  });

  if (!record?.rawStorageKey) return null;

  return {
    bytes: await documentStorage.read(record.rawStorageKey),
    filename: `${record.subject || "incoming-email"}.eml`,
  };
}
