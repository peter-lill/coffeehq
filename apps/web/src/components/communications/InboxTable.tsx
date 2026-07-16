import type { InboxCommunication } from "@/server/communications/types";

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

export function InboxTable({
  communications,
}: {
  communications: InboxCommunication[];
}) {
  if (communications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <h2 className="text-xl font-semibold text-slate-950">Inbox is empty</h2>
        <p className="mt-2 text-slate-600">
          Messages received by incoming-claims will appear here after the mail sync runs.
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
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {communications.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-5 py-4">{date(item.receivedAt)}</td>
                <td className="max-w-52 truncate px-5 py-4" title={item.sender}>{item.sender}</td>
                <td className="max-w-md px-5 py-4 font-semibold text-slate-950">{item.subject}</td>
                <td className="px-5 py-4">
                  {item.claimNumber ? (
                    <a
                      href={`/claims/${encodeURIComponent(item.claimNumber)}`}
                      className="font-semibold text-amber-700 hover:text-amber-900"
                    >
                      {item.claimNumber} — {item.claimantName}
                    </a>
                  ) : (
                    <span className="font-semibold text-red-700">Unmatched</span>
                  )}
                </td>
                <td className="px-5 py-4">{item.attachmentCount}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {label(item.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
