import Link from "next/link";

import type { EvidenceCategoryGroup } from "@/server/evidence/types";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Australia/Brisbane",
  }).format(date);
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function EvidenceCategorySection({
  group,
}: {
  group: EvidenceCategoryGroup;
}) {
  return (
    <section
      id={group.category === "MEDICAL" ? "medical-evidence" : undefined}
      className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-lg font-bold text-slate-950">{group.label}</h2>
          <p className="text-sm text-slate-500">
            {group.itemCount} registered item{group.itemCount === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {group.itemCount === 0 ? (
        <p className="px-5 py-6 text-sm text-slate-500">
          No material is currently registered in this category.
        </p>
      ) : (
        <div className="divide-y divide-slate-100">
          {group.communications.map((communication) => (
            <div
              key={`communication-${communication.id}`}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-slate-950">
                  {communication.subject || "No subject"}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Email from {communication.sender} · {formatDate(communication.receivedAt)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {communication.attachmentCount} attachment{communication.attachmentCount === 1 ? "" : "s"} · {formatLabel(communication.status)}
                </p>
              </div>
              <Link
                href={`/inbox/${communication.id}`}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                View email
              </Link>
            </div>
          ))}

          {group.documents.map((document) => (
            <div
              key={`document-${document.id}`}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="break-words font-semibold text-slate-950">
                  {document.originalName}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {formatLabel(document.source)} · {formatBytes(document.sizeBytes)} · {formatDate(document.createdAt)}
                </p>
                {document.communication ? (
                  <Link
                    href={`/inbox/${document.communication.id}`}
                    className="mt-1 inline-block text-xs font-semibold text-amber-700 hover:text-amber-800"
                  >
                    Source email: {document.communication.subject || "No subject"}
                  </Link>
                ) : null}
              </div>
              <a
                href={`/api/documents/${document.id}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Open document
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
