import {
  closeClaimAction,
  deleteClaimAction,
  reopenClaimAction,
} from "@/app/claims/[claimNumber]/actions";

export function ClaimLifecyclePanel({
  claimId,
  claimNumber,
  isClosed,
  decisionOutcome,
}: {
  claimId: string;
  claimNumber: string;
  isClosed: boolean;
  decisionOutcome: "ACCEPTED" | "REJECTED" | null;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-amber-700">Claim controls</p>
      <h2 className="mt-1 text-xl font-bold text-slate-950">
        {isClosed ? "Inactive claim" : "Close claim"}
      </h2>

      {isClosed ? (
        <div className="mt-4">
          <p className="text-sm text-slate-600">
            This claim was {decisionOutcome === "ACCEPTED" ? "accepted" : "rejected"} and moved to the inactive list.
          </p>
          <form action={reopenClaimAction.bind(null, claimNumber)} className="mt-4">
            <button className="w-full rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950 hover:bg-amber-300">
              Reopen claim
            </button>
          </form>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <form action={closeClaimAction.bind(null, claimNumber)}>
            <input type="hidden" name="outcome" value="ACCEPTED" />
            <button className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white hover:bg-emerald-600">
              Accept and close
            </button>
          </form>
          <form action={closeClaimAction.bind(null, claimNumber)}>
            <input type="hidden" name="outcome" value="REJECTED" />
            <button className="w-full rounded-xl bg-rose-700 px-4 py-3 font-bold text-white hover:bg-rose-600">
              Reject and close
            </button>
          </form>
        </div>
      )}

      <details className="mt-5 border-t border-slate-200 pt-4">
        <summary className="cursor-pointer text-sm font-semibold text-rose-700">
          Move claim to Deleted Items
        </summary>
        <form action={deleteClaimAction.bind(null, claimId)} className="mt-3 space-y-3">
          <textarea
            required
            minLength={3}
            name="reason"
            rows={2}
            placeholder="Reason for deletion"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <button className="rounded-xl bg-rose-700 px-4 py-2 text-sm font-bold text-white hover:bg-rose-600">
            Delete claim
          </button>
        </form>
      </details>
    </section>
  );
}
