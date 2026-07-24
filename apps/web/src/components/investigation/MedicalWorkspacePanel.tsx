import {
  createMedicalRecordAction,
  updateMedicalRecordAction,
} from "@/app/claims/[claimNumber]/investigation/actions";
import {
  MEDICAL_RECORD_STATUSES,
  PRACTITIONER_TYPES,
  type MedicalWorkspaceRecord,
} from "@/server/services/medical-workspace-service";

function dateValue(value: Date | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

function label(value: string) {
  return value.toLowerCase().replaceAll("_", " ");
}

export function MedicalWorkspacePanel({
  claimNumber,
  records,
}: {
  claimNumber: string;
  records: MedicalWorkspaceRecord[];
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-amber-700">Medical workspace</p>
      <h2 className="mt-1 text-2xl font-bold">Medical evidence and causation</h2>
      <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
        Record practitioner opinions, diagnosis, capacity, treatment, causative factors and clarification needs. Medical opinions remain the practitioner&apos;s evidence and are not replaced by CoffeeHQ.
      </p>

      <form action={createMedicalRecordAction.bind(null, claimNumber)} className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-5 md:grid-cols-2">
        <select name="practitionerType" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" defaultValue="GP">
          {PRACTITIONER_TYPES.map((type) => <option key={type} value={type}>{label(type)}</option>)}
        </select>
        <input name="practitionerName" required placeholder="Practitioner name" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input type="date" name="reportDate" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="diagnosis" placeholder="Diagnosis" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="capacity" placeholder="Capacity for work" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="workContributionOpinion" placeholder="Opinion about work contribution" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <textarea name="causativeFactors" placeholder="Causative factors, one per line" className="min-h-28 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <textarea name="clarificationQuestions" placeholder="Clarification questions, one per line" className="min-h-28 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="treatment" placeholder="Treatment" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="restrictions" placeholder="Restrictions" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <textarea name="notes" placeholder="Medical evidence notes" className="min-h-24 rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2" />
        <button className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white md:col-span-2">Add medical evidence</button>
      </form>

      <div className="mt-6 space-y-4">
        {records.length ? records.map((record) => (
          <article key={record.id} className="rounded-xl border border-slate-200 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-950">{record.practitionerName}</h3>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{label(record.practitionerType)} · {record.reportDate ? dateValue(record.reportDate) : "No report date"}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{label(record.status)}</span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-bold uppercase text-slate-500">Diagnosis</p><p className="mt-1 text-sm">{record.diagnosis || "Not recorded"}</p></div>
              <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-bold uppercase text-slate-500">Capacity</p><p className="mt-1 text-sm">{record.capacity || "Not recorded"}</p></div>
              <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-bold uppercase text-slate-500">Treatment</p><p className="mt-1 text-sm">{record.treatment || "Not recorded"}</p></div>
              <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-bold uppercase text-slate-500">Restrictions</p><p className="mt-1 text-sm">{record.restrictions || "Not recorded"}</p></div>
            </div>

            <form action={updateMedicalRecordAction.bind(null, claimNumber, record.id)} className="mt-4 grid gap-3 md:grid-cols-2">
              <select name="status" defaultValue={record.status} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                {MEDICAL_RECORD_STATUSES.map((status) => <option key={status} value={status}>{label(status)}</option>)}
              </select>
              <input name="workContributionOpinion" defaultValue={record.workContributionOpinion} placeholder="Opinion about work contribution" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <textarea name="causativeFactors" defaultValue={record.causativeFactors.join("\n")} placeholder="Causative factors" className="min-h-24 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <textarea name="clarificationQuestions" defaultValue={record.clarificationQuestions.join("\n")} placeholder="Clarification questions" className="min-h-24 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <textarea name="notes" defaultValue={record.notes} placeholder="Notes" className="min-h-20 rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2" />
              <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold md:col-span-2">Update medical record</button>
            </form>
          </article>
        )) : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No structured medical evidence has been recorded.</p>}
      </div>
    </section>
  );
}
