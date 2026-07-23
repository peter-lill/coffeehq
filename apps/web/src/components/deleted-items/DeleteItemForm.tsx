import { softDeleteItemAction } from "@/app/deleted-items/actions";
import type { DeletableItemType } from "@/server/deleted-items/types";

export function DeleteItemForm({
  type,
  id,
  label = "Delete",
}: {
  type: DeletableItemType;
  id: string;
  label?: string;
}) {
  return (
    <details className="relative inline-block text-left">
      <summary className="cursor-pointer list-none font-semibold text-rose-700 hover:text-rose-900">
        {label}
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-xl">
        <form action={softDeleteItemAction.bind(null, type, id)} className="space-y-3">
          <p className="text-sm font-semibold text-slate-950">Move to Deleted Items?</p>
          <textarea
            required
            minLength={3}
            name="reason"
            rows={2}
            placeholder="Reason for deletion"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button className="w-full rounded-lg bg-rose-700 px-3 py-2 text-sm font-bold text-white hover:bg-rose-600">
            Confirm delete
          </button>
        </form>
      </div>
    </details>
  );
}
