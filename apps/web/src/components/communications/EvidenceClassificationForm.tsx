"use client";

import type { DocumentCategory } from "@prisma/client";
import { useActionState } from "react";
import { useRouter } from "next/navigation";

import { classifyCommunicationEvidenceAction } from "@/app/inbox/actions";
import type {
  EvidenceClassificationActionResult,
  EvidenceRequirementOption,
} from "@/server/communications/types";

const initialState: EvidenceClassificationActionResult = {
  status: "idle",
  message: "",
};

const categories: Array<{ value: DocumentCategory; label: string }> = [
  { value: "MEDICAL", label: "Medical evidence" },
  { value: "WORKER", label: "Worker submission" },
  { value: "EMPLOYER", label: "Employer submission" },
  { value: "WITNESS", label: "Witness evidence" },
  { value: "EMPLOYMENT", label: "Employment record" },
  { value: "PAYROLL", label: "Payroll or roster" },
  { value: "COMMUNICATION", label: "Communication" },
  { value: "PHOTO", label: "Photograph" },
  { value: "VIDEO", label: "Video" },
  { value: "OTHER", label: "Other evidence" },
];

export function EvidenceClassificationForm({
  communicationId,
  operatorName,
  requirements,
  defaultCategory,
  defaultTitle,
  defaultDescription,
  defaultRelevance,
  attachmentCount,
}: {
  communicationId: string;
  operatorName: string;
  requirements: EvidenceRequirementOption[];
  defaultCategory: DocumentCategory | null;
  defaultTitle: string | null;
  defaultDescription: string | null;
  defaultRelevance: string | null;
  attachmentCount: number;
}) {
  const router = useRouter();
  const action = classifyCommunicationEvidenceAction.bind(
    null,
    communicationId,
  );
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-5 space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor={`evidence-category-${communicationId}`}
            className="block text-sm font-semibold text-slate-800"
          >
            Evidence type
          </label>
          <select
            id={`evidence-category-${communicationId}`}
            name="category"
            required
            defaultValue={defaultCategory ?? ""}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
          >
            <option value="" disabled>
              Select evidence type
            </option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor={`evidence-reviewer-${communicationId}`}
            className="block text-sm font-semibold text-slate-800"
          >
            Reviewed by
          </label>
          <input
            id={`evidence-reviewer-${communicationId}`}
            name="reviewedByName"
            required
            minLength={2}
            defaultValue={operatorName}
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor={`evidence-title-${communicationId}`}
          className="block text-sm font-semibold text-slate-800"
        >
          What is the evidence?
        </label>
        <input
          id={`evidence-title-${communicationId}`}
          name="title"
          required
          minLength={3}
          defaultValue={defaultTitle ?? ""}
          placeholder="For example: GP medical certificate dated 15/07/26"
          className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
        />
      </div>

      <div>
        <label
          htmlFor={`evidence-description-${communicationId}`}
          className="block text-sm font-semibold text-slate-800"
        >
          Evidence description
        </label>
        <textarea
          id={`evidence-description-${communicationId}`}
          name="description"
          required
          minLength={5}
          rows={4}
          defaultValue={defaultDescription ?? ""}
          placeholder="Describe what was received, the date or period it covers, and who supplied it."
          className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
        />
      </div>

      <div>
        <label
          htmlFor={`evidence-relevance-${communicationId}`}
          className="block text-sm font-semibold text-slate-800"
        >
          What does it address? <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <textarea
          id={`evidence-relevance-${communicationId}`}
          name="relevance"
          rows={3}
          defaultValue={defaultRelevance ?? ""}
          placeholder="For example: Responds to the request for medical causation and confirms the stated workplace factors."
          className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
        />
      </div>

      <div>
        <label
          htmlFor={`evidence-requirement-${communicationId}`}
          className="block text-sm font-semibold text-slate-800"
        >
          Outstanding evidence request satisfied <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <select
          id={`evidence-requirement-${communicationId}`}
          name="requirementId"
          defaultValue=""
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
        >
          <option value="">Do not link to an outstanding request</option>
          {requirements.map((requirement) => (
            <option key={requirement.id} value={requirement.id}>
              {requirement.title}
            </option>
          ))}
        </select>
        {requirements.length === 0 ? (
          <p className="mt-2 text-xs text-slate-500">
            This claim has no outstanding or requested evidence items.
          </p>
        ) : null}
      </div>

      {attachmentCount > 0 ? (
        <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <input
            type="checkbox"
            name="applyCategoryToAttachments"
            defaultChecked
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-700 focus:ring-amber-600"
          />
          <span>
            <strong className="text-slate-950">Apply this evidence type to all {attachmentCount} attachment(s).</strong>
            <span className="mt-1 block text-xs text-slate-500">
              You can still move or recategorise individual documents later.
            </span>
          </span>
        </label>
      ) : null}

      {state.status !== "idle" ? (
        <div
          className={`rounded-xl border p-4 text-sm font-semibold ${
            state.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <div className="flex flex-wrap justify-end gap-3">
        {state.status === "success" ? (
          <button
            type="button"
            onClick={() => router.refresh()}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Refresh details
          </button>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending
            ? "Saving…"
            : defaultTitle
              ? "Update evidence description"
              : "Save evidence description"}
        </button>
      </div>
    </form>
  );
}
