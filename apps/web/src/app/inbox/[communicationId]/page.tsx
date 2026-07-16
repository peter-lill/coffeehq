import Link from "next/link";
import { notFound } from "next/navigation";

import { ReviewCommunicationForm } from "@/components/communications/ReviewCommunicationForm";
import { getClaims } from "@/server/services/claim-service";
import { getCommunicationDetail } from "@/server/services/communication-service";

export const dynamic = "force-dynamic";

function label(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function date(value: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Australia/Brisbane",
  }).format(value);
}

function bytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function CommunicationPage({
  params,
}: {
  params: Promise<{ communicationId: string }>;
}) {
  const { communicationId } = await params;
  const communication = await getCommunicationDetail(communicationId);

  if (!communication) notFound();

  const claims =
    communication.status === "NEEDS_REVIEW" ? await getClaims() : [];
  const operatorName = process.env.COFFEEHQ_OPERATOR_NAME?.trim() ?? "";

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href="/inbox"
          className="inline-flex text-sm font-semibold text-amber-700 hover:text-amber-900"
        >
          ← Back to inbox
        </Link>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-amber-700">
                Incoming email
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                {communication.subject}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Received {date(communication.receivedAt)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                {label(communication.status)}
              </span>
              {communication.status === "NEEDS_REVIEW" ? (
                <ReviewCommunicationForm
                  communicationId={communication.id}
                  subject={communication.subject}
                  sender={communication.sender}
                  claims={claims}
                  operatorName={operatorName}
                />
              ) : null}
            </div>
          </div>

          <dl className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-slate-500">From</dt>
              <dd className="mt-1 text-slate-950">{communication.sender}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">To</dt>
              <dd className="mt-1 text-slate-950">
                {communication.recipients.join(", ") || "Not recorded"}
              </dd>
            </div>
            {communication.ccRecipients.length > 0 ? (
              <div>
                <dt className="font-semibold text-slate-500">CC</dt>
                <dd className="mt-1 text-slate-950">
                  {communication.ccRecipients.join(", ")}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="font-semibold text-slate-500">Claim match</dt>
              <dd className="mt-1 text-slate-950">
                {label(communication.matchMethod)} ({communication.matchConfidence}%)
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Claim</dt>
              <dd className="mt-1">
                {communication.claimNumber ? (
                  <Link
                    href={`/claims/${encodeURIComponent(communication.claimNumber)}`}
                    className="font-semibold text-amber-700 hover:text-amber-900"
                  >
                    {communication.claimNumber} — {communication.claimantName}
                  </Link>
                ) : (
                  <span className="font-semibold text-red-700">Unmatched</span>
                )}
              </dd>
            </div>
            {communication.internetMessageId ? (
              <div className="sm:col-span-2">
                <dt className="font-semibold text-slate-500">Message ID</dt>
                <dd className="mt-1 break-all font-mono text-xs text-slate-700">
                  {communication.internetMessageId}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-950">Message</h2>
            {communication.rawAvailable ? (
              <a
                href={`/api/communications/${encodeURIComponent(communication.id)}/raw`}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Open original .eml
              </a>
            ) : null}
          </div>
          <pre className="mt-4 whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-5 font-sans text-sm leading-6 text-slate-800">
            {communication.bodyText}
          </pre>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            Attachments ({communication.attachments.length})
          </h2>
          {communication.attachments.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No filed attachments.</p>
          ) : (
            <div className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200">
              {communication.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-950">
                      {attachment.originalName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {label(attachment.category)} · {bytes(attachment.sizeBytes)} · {attachment.mimeType}
                    </p>
                  </div>
                  <a
                    href={`/api/documents/${encodeURIComponent(attachment.id)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Open
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>

        {communication.manuallyFiledAt ? (
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <h2 className="text-lg font-bold text-emerald-950">Manual filing audit</h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-emerald-800">Filed by</dt>
                <dd className="mt-1 text-emerald-950">
                  {communication.manuallyFiledBy || "Not recorded"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-emerald-800">Filed at</dt>
                <dd className="mt-1 text-emerald-950">
                  {date(communication.manuallyFiledAt)}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-semibold text-emerald-800">Reason</dt>
                <dd className="mt-1 whitespace-pre-wrap text-emerald-950">
                  {communication.manualFilingReason || "Not recorded"}
                </dd>
              </div>
            </dl>
          </section>
        ) : null}
      </div>
    </main>
  );
}
