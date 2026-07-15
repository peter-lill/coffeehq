"use client";

import { useActionState } from "react";

import { uploadDocumentAction } from "@/app/claims/[claimNumber]/documents/actions";
import type { UploadDocumentResult } from "@/server/documents/types";

const initialState: UploadDocumentResult = { status: "idle", message: "" };

export function DocumentUploadForm({ claimNumber }: { claimNumber: string }) {
  const [state, action, pending] = useActionState(
    uploadDocumentAction.bind(null, claimNumber),
    initialState,
  );

  return (
    <form action={action} className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
      <div className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end">
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Choose document</span>
          <input
            required
            type="file"
            name="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.txt"
            className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-amber-100 file:px-3 file:py-2 file:font-semibold file:text-amber-900"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Category</span>
          <select
            name="category"
            defaultValue="OTHER"
            className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
          >
            <option value="MEDICAL">Medical</option>
            <option value="EMPLOYMENT">Employment</option>
            <option value="WORKER">Worker</option>
            <option value="EMPLOYER">Employer</option>
            <option value="WITNESS">Witness</option>
            <option value="PAYROLL">Payroll</option>
            <option value="COMMUNICATION">Communication</option>
            <option value="PHOTO">Photo</option>
            <option value="VIDEO">Video</option>
            <option value="OTHER">Other</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Uploading…" : "Upload document"}
        </button>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        PDF, Word, Excel, image and text files up to 50 MB. Originals are preserved unchanged.
      </p>

      {state.status !== "idle" ? (
        <p
          role="status"
          className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${
            state.status === "success"
              ? "bg-emerald-100 text-emerald-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
