import "server-only";

import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

import { ingestIncomingEmail } from "@/server/services/incoming-email-service";

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

export type MailSyncResult = {
  found: number;
  filed: number;
  needsReview: number;
  duplicates: number;
  failed: number;
};

export async function syncIncomingClaimsMailbox(): Promise<MailSyncResult> {
  const client = new ImapFlow({
    host: required("MAIL_IMAP_HOST"),
    port: Number(process.env.MAIL_IMAP_PORT ?? "993"),
    secure: process.env.MAIL_IMAP_SECURE !== "false",
    auth: {
      user: required("MAIL_IMAP_USER"),
      pass: required("MAIL_IMAP_PASSWORD"),
    },
    logger: false,
  });

  const result: MailSyncResult = {
    found: 0,
    filed: 0,
    needsReview: 0,
    duplicates: 0,
    failed: 0,
  };

  await client.connect();
  const mailbox = process.env.MAIL_IMAP_MAILBOX?.trim() || "INBOX";
  const lock = await client.getMailboxLock(mailbox);

  try {
    const configuredLookback = Number(process.env.MAIL_SYNC_LOOKBACK_DAYS ?? "14");
    const lookbackDays = Number.isFinite(configuredLookback)
      ? Math.min(Math.max(Math.trunc(configuredLookback), 1), 90)
      : 14;
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - lookbackDays);

    // Search recent mail rather than unread mail only. Opening a message in
    // The mail server can mark it seen before CoffeeHQ has collected it. Duplicate
    // internet message ids make this recovery scan safe to repeat.
    const searchResult = await client.search({ since });
    const messageIds = Array.isArray(searchResult) ? searchResult : [];
    result.found = messageIds.length;

    if (messageIds.length === 0) return result;

    const messages = await client.fetchAll(messageIds, {
      uid: true,
      source: true,
      envelope: true,
    });

    for (const message of messages) {
      if (!message.source) {
        result.failed += 1;
        continue;
      }

      try {
        const mail = await simpleParser(message.source);
        const ingestion = await ingestIncomingEmail({
          rawSource: message.source,
          mail,
        });

        if (ingestion.status === "filed") result.filed += 1;
        if (ingestion.status === "needs-review") result.needsReview += 1;
        if (ingestion.status === "duplicate") result.duplicates += 1;

        await client.messageFlagsAdd(message.uid, ["\\Seen"], { uid: true });
      } catch (error) {
        result.failed += 1;
        console.error(`Mail UID ${message.uid} failed`, error);
      }
    }

    return result;
  } finally {
    lock.release();
    await client.logout();
  }
}
