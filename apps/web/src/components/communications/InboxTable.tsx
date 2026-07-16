import Link from "next/link";

import type { ClaimListItem } from "@/server/claims/types";
import type { InboxCommunication } from "@/server/communications/types";

import { ReviewCommunicationForm } from "@/components/communications/ReviewCommunicationForm";

function label(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function date(value: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Australia/Brisbane",
  }).format(value);
}

function statusClass(status: InboxCommunication["status"]) {
  if (status === "NEEDS_REVIEW") {
    return "bg-amber-100 text-amber-900";
  }
  if (status === "FILED") {
    return "bg-emerald-100 text-emerald-900";
  }
  if (status === "FAILED" || status === "QUARANTINED") {
    return "bg-red-100 text-red-900";
  }
  return "bg-slate-100 text-slate-700";
}

export function InboxTable({
  communications,
  claims,
  operatorName,
}: {
  communications: InboxCommunication[];
  claims: ClaimListItem[];
  operatorName: string;
}) {
  if (communications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <h2 className="text-xl font-semibold text-slate-950">No messages found</h2>
        <p className="mt-2 text-slate-600">
          No incoming emails match the selected filter or search.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Received</th>
              <th className="px-5 py-3">From</th>
              <th className="px-5 py-3">Subject</th>
              <th className="px-5 py-3">Claim</th>
              <th className="px-5 py-3">Attachments</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {communications.map((item) => (
              <tr key={item.id} className="align-top hover:bg-slate-50">
                <td className="whitespace-nowrap px-5 py-4">
                  {date(item.receivedAt)}
                </td>
                <td
                  className="max-w-52 truncate px-5 py-4"
                  title={item.sender}
                >
                  {item.sender}
                </td>
                <td className="max-w-md px-5 py-4 font-semibold text-slate-950">
                  <Link
                    href={`/inbox/${encodeURIComponent(item.id)}`}
                    className="hover:text-amber-800"
                  >
                    {item.subject}
                  </Link>
                </td>
                <td className="px-5 py-4">
                  {item.claimNumber ? (
                    <Link
                      href={`/claims/${encodeURIComponent(item.claimNumber)}`}
                      className="font-semibold text-amber-700 hover:text-amber-900"
                    >
                      {item.claimNumber} — {item.claimantName}
                    </Link>
                  ) : (
                    <span className="font-semibold text-red-700">Unmatched</span>
                  )}
                </td>
                <td className="px-5 py-4">{item.attachmentCount}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(item.status)}`}
                  >
                    {label(item.status)}
                  </span>
                  {item.manuallyFiledBy && item.manuallyFiledAt ? (
                    <div className="mt-2 max-w-64 text-xs text-slate-500">
                      Filed by {item.manuallyFiledBy} on {date(item.manuallyFiledAt)}
                      {item.manualFilingReason ? (
                        <span title={item.manualFilingReason}> — manual review</span>
                      ) : null}
                    </div>
                  ) : null}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link
                      href={`/inbox/${encodeURIComponent(item.id)}`}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      View
                    </Link>
                    {item.status === "NEEDS_REVIEW" ? (
                      <ReviewCommunicationForm
                        communicationId={item.id}
                        subject={item.subject}
                        sender={item.sender}
                        claims={claims}
                        operatorName={operatorName}
                      />
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
