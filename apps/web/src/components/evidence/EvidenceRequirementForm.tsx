"use client";

import { useActionState, useEffect, useRef } from "react";

import { createEvidenceRequirementAction } from "@/app/claims/[claimNumber]/evidence/actions";
import {
  evidenceCategoryLabels,
  evidenceCategoryOrder,
  type EvidenceRequirementActionResult,
} from "@/server/evidence/types";

const initialState: EvidenceRequirementActionResult = {
  status: "idle",
  message: "",
};

export function EvidenceRequirementForm({
  claimNumber,
}: {
  claimNumber: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const action = createEvidenceRequirementAction.bind(null, claimNumber);
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
          Outstanding evidence
        </p>
        <h2 className="mt-1 text-xl font-bold text-slate-950">
          Add evidence requirement
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Record what is still required without making any finding about the evidence.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Evidence category
          <select
            name="category"
            defaultValue="MEDICAL"
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-950"
          >
            {evidenceCategoryOrder.map((category) => (
              <option key={category} value={category}>
                {evidenceCategoryLabels[category]}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Requested from
          <input
            name="requestedFrom"
            placeholder="Worker, employer, GP or witness"
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-950"
          />
        </label>
      </div>

      <label className="mt-4 block text-sm font-medium text-slate-700">
        Required evidence
        <input
          name="title"
          required
          placeholder="For example: GP clarification addressing medical causation"
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-950"
        />
      </label>

      <label className="mt-4 block text-sm font-medium text-slate-700">
        Notes
        <textarea
          name="description"
          rows={3}
          placeholder="Optional context, scope or questions to be addressed"
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-950"
        />
      </label>

      <label className="mt-4 block max-w-xs text-sm font-medium text-slate-700">
        Due date
        <input
          name="dueDate"
          type="date"
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-950"
        />
      </label>

      {state.message ? (
        <p
          className={`mt-4 rounded-xl px-3 py-2 text-sm font-medium ${
            state.status === "success"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-rose-50 text-rose-800"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add requirement"}
      </button>
    </form>
  );
}
