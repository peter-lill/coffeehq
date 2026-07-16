import "dotenv/config";

import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

import { ingestIncomingEmail } from "../src/server/services/incoming-email-service";

function required(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

async function main() {
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

  await client.connect();

  const mailbox = process.env.MAIL_IMAP_MAILBOX ?? "INBOX";
  const lock = await client.getMailboxLock(mailbox);

  try {
    const searchResult = await client.search({ seen: false });
    const unseen = Array.isArray(searchResult) ? searchResult : [];

    console.log(`Found ${unseen.length} unread message(s) in ${mailbox}.`);

    if (unseen.length === 0) {
      return;
    }

    /*
     * Fetch every matching message before processing.
     *
     * ImapFlow does not permit other IMAP commands, such as flag updates,
     * while a fetch() iterator is still active.
     */
    const messages = await client.fetchAll(unseen, {
      uid: true,
      source: true,
      envelope: true,
    });

    for (const message of messages) {
      if (!message.source) {
        console.error(`UID ${message.uid}: message source was unavailable`);
        continue;
      }

      try {
        const mail = await simpleParser(message.source);

        const result = await ingestIncomingEmail({
          rawSource: message.source,
          mail,
        });

        console.log(
          `UID ${message.uid}: ${result.status} — ${
            mail.subject || "(No subject)"
          }`,
        );

        await client.messageFlagsAdd(
          message.uid,
          ["\\Seen"],
          { uid: true },
        );
      } catch (error) {
        console.error(`UID ${message.uid} failed`, error);
      }
    }
  } finally {
    lock.release();
    await client.logout();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
