"use client";

import { useActionState, useMemo, useState } from "react";

import { moveDocumentAction } from "@/app/claims/[claimNumber]/documents/actions";
import type { ClaimListItem } from "@/server/claims/types";
import type { MoveDocumentResult } from "@/server/documents/types";

const initialState: MoveDocumentResult = {
  status: "idle",
  message: "",
};

type MoveDocumentFormProps = {
  documentId: string;
  documentName: string;
  sourceClaimId: string;
  sourceClaimNumber: string;
  sourceClaimantName: string;
  claims: ClaimListItem[];
};

export function MoveDocumentForm({
  documentId,
  documentName,
  sourceClaimId,
  sourceClaimNumber,
  sourceClaimantName,
  claims,
}: MoveDocumentFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [destinationClaimId, setDestinationClaimId] = useState("");

  const availableClaims = useMemo(
    () => claims.filter((claim) => claim.id !== sourceClaimId),
    [claims, sourceClaimId],
  );

  const selectedClaim = availableClaims.find(
    (claim) => claim.id === destinationClaimId,
  );

  const claimantNamesDiffer =
    selectedClaim !== undefined &&
    selectedClaim.name.trim().toLowerCase() !==
      sourceClaimantName.trim().toLowerCase();

  const [state, action, pending] = useActionState(
    moveDocumentAction.bind(
      null,
      documentId,
      sourceClaimId,
      sourceClaimNumber,
    ),
    initialState,
  );

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="font-semibold text-slate-600 hover:text-slate-950"
      >
        Move to claim
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`move-document-${documentId}`}
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <h2
            id={`move-document-${documentId}`}
            className="text-xl font-bold text-slate-950"
          >
            Move document
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Correct a document that was filed against the wrong claim.
          </p>
        </div>

        <form action={action} className="space-y-5 p-6">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Document
            </p>
            <p className="mt-1 break-words font-semibold text-slate-950">
              {documentName}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              Current claim
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {sourceClaimNumber} — {sourceClaimantName}
            </p>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">
              Destination claim
            </span>

            <select
              required
              name="destinationClaimId"
              value={destinationClaimId}
              onChange={(event) =>
                setDestinationClaimId(event.target.value)
              }
              className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
            >
              <option value="">Select a claim</option>

              {availableClaims.map((claim) => (
                <option key={claim.id} value={claim.id}>
                  {claim.claimNumber} — {claim.name}
                </option>
              ))}
            </select>
          </label>

          {claimantNamesDiffer && selectedClaim ? (
            <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="font-semibold">
                The claimant names are different.
              </p>
              <p className="mt-1">
                You are moving this document from{" "}
                <strong>{sourceClaimantName}</strong> to{" "}
                <strong>{selectedClaim.name}</strong>. Confirm that the
                destination claim is correct.
              </p>
            </div>
          ) : null}

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">
              Reason for move
            </span>

            <textarea
              required
              name="reason"
              minLength={5}
              rows={3}
              placeholder="For example: Uploaded to the incorrect claim."
              className="mt-2 block w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
            />
          </label>

          {state.status === "error" ? (
            <p
              role="alert"
              className="rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-800"
            >
              {state.message}
            </p>
          ) : null}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setIsOpen(false);
                setDestinationClaimId("");
              }}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={pending || destinationClaimId.length === 0}
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Moving…" : "Move document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
