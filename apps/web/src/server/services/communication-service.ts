import { db } from "@/lib/db";
import {
  listInboxRecords,
} from "@/server/repositories/communication-repository";
import type { InboxCommunication } from "@/server/communications/types";

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

export async function getInbox(): Promise<InboxCommunication[]> {
  const organisationId = await getDevelopmentOrganisationId();
  const records = await listInboxRecords(organisationId);

  return records.map((record) => ({
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
  }));
}
