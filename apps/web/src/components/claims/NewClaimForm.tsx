"use client";

import { useActionState } from "react";
import { createClaimAction, type CreateClaimState } from "@/app/claims/actions";

const initialState: CreateClaimState = {};

export function NewClaimForm() {
  const [state, formAction, pending] = useActionState(createClaimAction, initialState);

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <Field label="Claim number" name="claimNumber" placeholder="S26AB123456" />
      <Field label="Claimant name" name="claimantName" placeholder="Jane Smith" />
      <Field label="Injury" name="injury" placeholder="Psychological injury" />

      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Status</span>
        <select
          name="status"
          defaultValue="OPEN"
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        >
          <option value="OPEN">Open</option>
          <option value="AWAITING_EVIDENCE">Awaiting evidence</option>
          <option value="UNDER_REVIEW">Under review</option>
          <option value="MEDICAL_REVIEW">Medical review</option>
          <option value="DECISION_DRAFTING">Decision drafting</option>
          <option value="READY_FOR_DETERMINATION">Ready for determination</option>
        </select>
      </label>

      <Field label="Next action" name="nextAction" placeholder="Request employer response" />

      {state.error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creating claim…" : "Create claim"}
      </button>
    </form>
  );
}

function Field({ label, name, placeholder }: { label: string; name: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        required
        name={name}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
      />
    </label>
  );
}
