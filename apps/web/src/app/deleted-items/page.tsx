import { AppShell } from "@/components/layout/AppShell";
import {
  permanentlyDeleteItemAction,
  restoreDeletedItemAction,
} from "@/app/deleted-items/actions";
import { requireCurrentUser } from "@/server/auth/current-user";
import { getDeletedItems } from "@/server/services/deleted-items-service";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Australia/Brisbane",
  }).format(value);
}

function label(value: string) {
  return value.toLowerCase().split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export default async function DeletedItemsPage() {
  const [items, user] = await Promise.all([getDeletedItems(), requireCurrentUser()]);

  return (
    <AppShell activeItem="Deleted Items">
      <section className="space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-rose-700">Administration</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Deleted Items</h1>
          <p className="mt-2 max-w-3xl text-slate-600">
            Restore items removed by mistake. Permanent deletion cannot be undone and also removes stored source files where applicable.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
            <h2 className="text-xl font-semibold">Deleted Items is empty</h2>
            <p className="mt-2 text-slate-600">Items moved out of the active workspace will appear here.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Item</th>
                    <th className="px-5 py-3">Claim</th>
                    <th className="px-5 py-3">Deleted</th>
                    <th className="px-5 py-3">Reason</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item) => (
                    <tr key={`${item.type}:${item.id}`} className="align-top">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-950">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{label(item.type)} · {item.detail}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {item.claimNumber ? `${item.claimNumber} — ${item.claimantName}` : "Unmatched"}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(item.deletedAt)}
                        {item.deletedByName ? <p className="text-xs">by {item.deletedByName}</p> : null}
                      </td>
                      <td className="max-w-sm px-5 py-4 text-slate-600">{item.deletionReason ?? "—"}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          <form action={restoreDeletedItemAction.bind(null, item.type, item.id)}>
                            <button className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-600">Restore</button>
                          </form>
                          {user.role === "ADMIN" ? (
                            <details className="relative">
                              <summary className="cursor-pointer list-none rounded-lg border border-rose-300 px-3 py-2 text-xs font-bold text-rose-700">Permanent delete</summary>
                              <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                                <form action={permanentlyDeleteItemAction.bind(null, item.type, item.id)} className="space-y-3">
                                  <p className="text-sm text-slate-700">Type <strong>DELETE</strong> to confirm.</p>
                                  <input required name="confirm" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                                  <button className="w-full rounded-lg bg-rose-700 px-3 py-2 text-sm font-bold text-white">Permanently delete</button>
                                </form>
                              </div>
                            </details>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
