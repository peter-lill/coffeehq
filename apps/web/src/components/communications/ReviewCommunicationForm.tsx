"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";

import { fileCommunicationAction } from "@/app/inbox/actions";
import type { ClaimListItem } from "@/server/claims/types";
import type { ManualFileCommunicationResult } from "@/server/communications/types";

const initialState: ManualFileCommunicationResult = {
  status: "idle",
  message: "",
  claimNumber: null,
};

export function ReviewCommunicationForm({
  communicationId,
  subject,
  sender,
  claims,
  operatorName,
}: {
  communicationId: string;
  subject: string;
  sender: string;
  claims: ClaimListItem[];
  operatorName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const action = fileCommunicationAction.bind(null, communicationId);
  const [state, formAction, pending] = useActionState(action, initialState);

  function closeAndRefresh() {
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-amber-700 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-800"
      >
        Review
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-4 py-8 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`review-email-${communicationId}`}
        >
          <div className="max-h-[calc(100vh-4rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-amber-700">
                  Needs review
                </p>
                <h2
                  id={`review-email-${communicationId}`}
                  className="mt-2 text-2xl font-bold text-slate-950"
                >
                  File incoming email
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm">
              <p className="font-semibold text-slate-950">{subject}</p>
              <p className="mt-1 text-slate-600">From: {sender}</p>
            </div>

            {state.status === "success" ? (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="font-semibold text-emerald-900">{state.message}</p>
                <div className="mt-4 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeAndRefresh}
                    className="rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
                  >
                    Done
                  </button>
                  {state.claimNumber ? (
                    <a
                      href={`/claims/${encodeURIComponent(state.claimNumber)}`}
                      className="inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                    >
                      Open claim
                    </a>
                  ) : null}
                </div>
              </div>
            ) : (
              <form action={formAction} className="mt-5 space-y-5">
                <div>
                  <label
                    htmlFor={`destination-${communicationId}`}
                    className="block text-sm font-semibold text-slate-800"
                  >
                    Destination claim
                  </label>
                  <select
                    id={`destination-${communicationId}`}
                    name="destinationClaimId"
                    required
                    defaultValue=""
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
                  >
                    <option value="" disabled>
                      Select a claim
                    </option>
                    {claims.map((claim) => (
                      <option key={claim.id} value={claim.id}>
                        {claim.claimNumber} — {claim.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor={`filed-by-${communicationId}`}
                    className="block text-sm font-semibold text-slate-800"
                  >
                    Filed by
                  </label>
                  <input
                    id={`filed-by-${communicationId}`}
                    name="filedBy"
                    required
                    minLength={2}
                    defaultValue={operatorName}
                    placeholder="Your name"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`reason-${communicationId}`}
                    className="block text-sm font-semibold text-slate-800"
                  >
                    Reason for manual filing
                  </label>
                  <textarea
                    id={`reason-${communicationId}`}
                    name="reason"
                    required
                    minLength={5}
                    rows={4}
                    placeholder="For example: The claim number was omitted from the subject, but the sender and email content confirm the correct claim."
                    className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
                  />
                </div>

                {state.status === "error" ? (
                  <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">
                    {state.message}
                  </p>
                ) : null}

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={pending || claims.length === 0}
                    className="rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {pending ? "Filing…" : "File to claim"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
