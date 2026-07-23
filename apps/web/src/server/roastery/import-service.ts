import "server-only";

import { createHash } from "node:crypto";

import type { Prisma } from "@prisma/client";
import * as unzipper from "unzipper";

import { db } from "@/lib/db";
import { documentStorage } from "@/lib/storage/local-document-storage";
import { requireRole } from "@/server/auth/current-user";
import { validateArchiveEntries } from "@/server/roastery/archive-security";
import { parseChatGptExport } from "@/server/roastery/chatgpt-export-parser";
import { suggestClaimMatch } from "@/server/roastery/claim-matcher";
import { ROASTERY_LIMITS } from "@/server/roastery/config";
import { saveRoasteryArchive } from "@/server/roastery/storage";
import type { ChatGptConversation, ParsedConversation } from "@/server/roastery/types";

function safeTitle(value: string | null) {
  return (value || "ChatGPT conversation")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

function transcript(conversation: ParsedConversation) {
  const lines = [
    conversation.title || "ChatGPT conversation",
    "",
    `Source conversation ID: ${conversation.sourceConversationId}`,
    `Created: ${conversation.createdAt?.toISOString() ?? "Not recorded"}`,
    `Updated: ${conversation.updatedAt?.toISOString() ?? "Not recorded"}`,
    "",
  ];

  for (const message of conversation.messages) {
    const author = message.authorName || message.role || "Unknown";
    const time = message.createdAt?.toISOString() ?? "Time not recorded";
    lines.push(`[${time}] ${author}`, message.text, "");
  }

  return lines.join("\n").trimEnd() + "\n";
}

async function extractConversationsJson(bytes: Buffer) {
  const archive = await unzipper.Open.buffer(bytes);
  validateArchiveEntries(
    archive.files.map((entry) => ({
      path: entry.path,
      compressedSize: entry.compressedSize,
      uncompressedSize: entry.uncompressedSize,
      isDirectory: entry.type === "Directory",
    })),
  );

  const entries = archive.files
    .filter((file) => {
      if (file.type === "Directory") return false;
      const normalised = file.path.replaceAll("\\", "/");
      return /(^|\/)conversations(?:-\d+)?\.json$/i.test(normalised);
    })
    .sort((left, right) =>
      left.path.localeCompare(right.path, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );

  if (entries.length === 0) {
    throw new Error(
      "The ZIP does not contain conversations.json or conversations-###.json files.",
    );
  }

  const totalUncompressedBytes = entries.reduce(
    (total, entry) => total + entry.uncompressedSize,
    0,
  );

  if (totalUncompressedBytes > ROASTERY_LIMITS.maximumConversationJsonBytes) {
    throw new Error("The combined conversation JSON files exceed the processing limit.");
  }

  const conversations: unknown[] = [];

  for (const entry of entries) {
    const content = await entry.buffer();
    const parsed = JSON.parse(content.toString("utf8")) as unknown;

    if (!Array.isArray(parsed)) {
      throw new Error(`${entry.path} does not contain a conversation array.`);
    }

    conversations.push(...parsed);
  }

  return conversations;
}

export async function createImportBatch(file: File) {
  const actor = await requireRole(["ADMIN", "MANAGER"]);
  if (!file.name.toLowerCase().endsWith(".zip")) throw new Error("Select a ChatGPT export ZIP.");
  if (file.size === 0) throw new Error("The selected ZIP is empty.");
  if (file.size > ROASTERY_LIMITS.maximumArchiveBytes) throw new Error("The export exceeds the upload limit.");

  const bytes = Buffer.from(await file.arrayBuffer());
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const duplicate = await db.roasteryImportBatch.findUnique({
    where: { organisationId_sha256: { organisationId: actor.organisationId, sha256 } },
  });
  if (duplicate) return duplicate;

  const raw = await extractConversationsJson(bytes);
  const conversations = parseChatGptExport(raw);
  const storageKey = await saveRoasteryArchive(file.name, bytes);
  const candidates = await db.claim.findMany({
    where: { organisationId: actor.organisationId, deletedAt: null },
    select: { id: true, claimNumber: true, claimantName: true },
  });

  return db.$transaction(async (transaction) => {
    const batch = await transaction.roasteryImportBatch.create({
      data: {
        organisationId: actor.organisationId,
        uploadedById: actor.id,
        originalFilename: file.name,
        storageKey,
        sha256,
        status: "AWAITING_REVIEW",
        totalConversations: conversations.length,
        stagedConversations: conversations.length,
        parsingStartedAt: new Date(),
        parsingCompletedAt: new Date(),
      },
    });

    for (const conversation of conversations) {
      const match = suggestClaimMatch({
        detectedClaimNumbers: conversation.detectedClaimNumbers,
        searchText: conversation.searchText,
        candidates,
      });
      await transaction.roasteryConversation.create({
        data: {
          batchId: batch.id,
          sourceConversationId: conversation.sourceConversationId,
          sourceTitle: conversation.title,
          sourceCreatedAt: conversation.createdAt,
          sourceUpdatedAt: conversation.updatedAt,
          status: match.claimId ? "MATCH_SUGGESTED" : "STAGED",
          messageCount: conversation.messages.length,
          participantNames: conversation.participantNames,
          detectedClaimNumbers: conversation.detectedClaimNumbers,
          searchText: conversation.searchText,
          rawJson: conversation.raw as Prisma.InputJsonValue,
          suggestedClaimId: match.claimId,
          matchMethod: match.method,
          matchConfidence: match.confidence,
          importedEventIds: [],
          importedDocumentIds: [],
        },
      });
    }

    await transaction.roasteryAuditEvent.create({
      data: {
        batchId: batch.id,
        actorId: actor.id,
        action: "CONVERSATION_EXPORT_STAGED",
        metadata: { filename: file.name, conversations: conversations.length, sha256 },
      },
    });
    return batch;
  });
}

export async function listImportBatches() {
  const actor = await requireRole(["ADMIN", "MANAGER"]);
  return db.roasteryImportBatch.findMany({
    where: { organisationId: actor.organisationId },
    orderBy: { uploadedAt: "desc" },
    take: 30,
  });
}

export async function getImportBatch(batchId: string) {
  const actor = await requireRole(["ADMIN", "MANAGER"]);
  const batch = await db.roasteryImportBatch.findFirst({
    where: { id: batchId, organisationId: actor.organisationId },
    include: { conversations: { orderBy: [{ sourceUpdatedAt: "desc" }, { sourceTitle: "asc" }] } },
  });
  if (!batch) throw new Error("Import batch not found.");
  const claims = await db.claim.findMany({
    where: { organisationId: actor.organisationId, deletedAt: null },
    select: { id: true, claimNumber: true, claimantName: true },
    orderBy: { claimNumber: "asc" },
  });
  return { batch, claims };
}

export async function reviewConversation(input: {
  batchId: string;
  conversationId: string;
  decision: "assign" | "exclude";
  claimId?: string;
  reviewNotes?: string;
}) {
  const actor = await requireRole(["ADMIN", "MANAGER"]);
  const conversation = await db.roasteryConversation.findFirst({
    where: { id: input.conversationId, batchId: input.batchId, batch: { organisationId: actor.organisationId } },
  });
  if (!conversation) throw new Error("Conversation not found.");

  if (input.decision === "assign") {
    if (!input.claimId) throw new Error("Choose a claim before assigning the conversation.");
    const claim = await db.claim.findFirst({ where: { id: input.claimId, organisationId: actor.organisationId, deletedAt: null } });
    if (!claim) throw new Error("The selected claim is unavailable.");
  }

  await db.$transaction([
    db.roasteryConversation.update({
      where: { id: conversation.id },
      data: input.decision === "exclude"
        ? { status: "EXCLUDED", approvedClaimId: null, reviewNotes: input.reviewNotes || null }
        : { status: "READY", approvedClaimId: input.claimId!, matchMethod: "MANUAL", matchConfidence: 1, reviewNotes: input.reviewNotes || null },
    }),
    db.roasteryAuditEvent.create({
      data: {
        batchId: input.batchId,
        actorId: actor.id,
        action: input.decision === "exclude" ? "CONVERSATION_EXCLUDED" : "CONVERSATION_ASSIGNED",
        metadata: { conversationId: conversation.id, claimId: input.claimId ?? null, notes: input.reviewNotes ?? null },
      },
    }),
  ]);
}

export async function importApprovedBatch(batchId: string) {
  const actor = await requireRole(["ADMIN", "MANAGER"]);
  const batch = await db.roasteryImportBatch.findFirst({
    where: { id: batchId, organisationId: actor.organisationId },
    include: { conversations: { where: { status: "READY" } } },
  });
  if (!batch) throw new Error("Import batch not found.");
  const unresolved = await db.roasteryConversation.count({
    where: { batchId, status: { notIn: ["READY", "EXCLUDED", "IMPORTED"] } },
  });
  if (unresolved) throw new Error("Assign or exclude every conversation before importing.");
  if (!batch.conversations.length) throw new Error("There are no approved conversations to import.");

  let imported = 0;
  for (const item of batch.conversations) {
    if (!item.approvedClaimId) continue;
    const parsed = parseChatGptExport([item.rawJson as unknown as ChatGptConversation])[0];
    const content = Buffer.from(transcript(parsed), "utf8");
    const sha256 = createHash("sha256").update(content).digest("hex");
    const existing = await db.document.findUnique({
      where: { claimId_sha256: { claimId: item.approvedClaimId, sha256 } },
    });
    if (existing?.deletedAt) {
      throw new Error(`A matching transcript for ${item.sourceTitle || "this conversation"} is in Deleted Items.`);
    }
    if (existing) {
      await db.roasteryConversation.update({
        where: { id: item.id },
        data: { status: "IMPORTED", importedDocumentIds: [existing.id], importedAt: new Date() },
      });
      imported += 1;
      continue;
    }

    const filename = `${safeTitle(item.sourceTitle)}.txt`;
    const stored = await documentStorage.save({ claimId: item.approvedClaimId, originalName: filename, bytes: content });
    try {
      const result = await db.$transaction(async (transaction) => {
        const event = await transaction.claimEvent.create({
          data: {
            claimId: item.approvedClaimId!,
            createdById: actor.id,
            type: "IMPORT_COMPLETED",
            title: "Conversation imported",
            description: item.sourceTitle || "ChatGPT conversation",
            occurredAt: item.sourceUpdatedAt || item.sourceCreatedAt || new Date(),
            metadata: { source: "ChatGPT export", batchId, sourceConversationId: item.sourceConversationId, messageCount: item.messageCount },
          },
        });
        const document = await transaction.document.create({
          data: {
            claimId: item.approvedClaimId!,
            eventId: event.id,
            originalName: filename,
            storageKey: stored.storageKey,
            mimeType: "text/plain",
            sizeBytes: content.byteLength,
            sha256,
            source: "HISTORICAL_IMPORT",
            category: "COMMUNICATION",
          },
        });
        await transaction.roasteryConversation.update({
          where: { id: item.id },
          data: { status: "IMPORTED", importedEventIds: [event.id], importedDocumentIds: [document.id], importedAt: new Date() },
        });
        return { event, document };
      });
      void result;
      imported += 1;
    } catch (error) {
      await documentStorage.delete(stored.storageKey);
      await db.roasteryConversation.update({ where: { id: item.id }, data: { status: "FAILED" } });
      throw error;
    }
  }

  await db.$transaction([
    db.roasteryImportBatch.update({
      where: { id: batchId },
      data: { status: "IMPORTED", approvedById: actor.id, approvedAt: new Date(), importedAt: new Date(), importedConversations: imported },
    }),
    db.roasteryAuditEvent.create({
      data: { batchId, actorId: actor.id, action: "APPROVED_CONVERSATIONS_IMPORTED", metadata: { imported } },
    }),
  ]);
  return imported;
}
