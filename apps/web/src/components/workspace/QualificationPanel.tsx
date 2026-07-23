import { saveQualificationAction } from "@/app/claims/[claimNumber]/qualification/actions";
import type { QualificationAlert } from "@/server/qualification/rules";

function isoDate(value?: Date | null) { return value ? value.toISOString().slice(0, 10) : ""; }

type QualificationData = {
  consentProvided: boolean; privacyAgreed: boolean; medicalCertificate: boolean;
  injuryDate?: Date | null; dateFirstSeen?: Date | null; certificateIssueDate?: Date | null; claimLodgementDate?: Date | null;
  diagnosis?: string | null; capacity?: string | null; treatingPractitioner?: string | null; medicalFactors?: string | null;
  firstSeenConsideration?: string | null; issueDateConsideration?: string | null; sixMonthConsideration?: string | null;
};

type QualificationRecord = QualificationData | null;
type RequirementKey = "consentProvided" | "privacyAgreed" | "medicalCertificate";
type DateKey = "injuryDate" | "dateFirstSeen" | "certificateIssueDate" | "claimLodgementDate";

const applicationRequirements: ReadonlyArray<readonly [RequirementKey, string]> = [
  ["consentProvided", "Consent provided"],
  ["privacyAgreed", "Privacy agreed"],
  ["medicalCertificate", "Medical certificate"],
];

const certificateDates: ReadonlyArray<readonly [DateKey, string]> = [
  ["injuryDate", "Date of injury"],
  ["dateFirstSeen", "Date first seen"],
  ["certificateIssueDate", "Certificate issue date"],
  ["claimLodgementDate", "Claim lodgement date"],
];

export function QualificationPanel({ claimId, claimNumber, record, alerts }: { claimId: string; claimNumber: string; record: QualificationRecord; alerts: QualificationAlert[] }) {
  const valid = Boolean(record?.consentProvided && record?.privacyAgreed && record?.medicalCertificate);
  const action = saveQualificationAction.bind(null, claimId, claimNumber);
  return <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="text-sm font-semibold uppercase tracking-wide text-amber-700">Initial review</p><h2 className="text-2xl font-bold">Qualification</h2><p className="mt-1 text-sm text-slate-600">Confirm application requirements, review the initial medical certificate and record section 131 considerations.</p></div>
      <span className={`rounded-full px-4 py-2 text-sm font-bold ${valid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>{valid ? "Valid application" : "Application incomplete"}</span>
    </div>
    <form action={action} className="mt-6 space-y-6">
      <fieldset><legend className="font-bold">Application requirements</legend><div className="mt-3 grid gap-3 sm:grid-cols-3">{applicationRequirements.map(([n,l])=><label key={n} className="flex items-center gap-3 rounded-xl border p-3"><input type="checkbox" name={n} defaultChecked={Boolean(record?.[n])}/><span>{l}</span></label>)}</div></fieldset>
      <fieldset><legend className="font-bold">Initial medical certificate dates</legend><div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{certificateDates.map(([n,l])=><label key={n} className="text-sm font-medium">{l}<input className="mt-1 w-full rounded-lg border px-3 py-2" type="date" name={n} defaultValue={isoDate(record?.[n])}/></label>)}</div><p className="mt-2 text-xs text-slate-500">Business-day alerts currently count Monday to Friday. The Claims Representative remains responsible for confirming any applicable public holidays.</p></fieldset>
      <fieldset><legend className="font-bold">Medical summary</legend><div className="mt-3 grid gap-4 sm:grid-cols-3"><label className="text-sm font-medium">Diagnosis<input className="mt-1 w-full rounded-lg border px-3 py-2" name="diagnosis" defaultValue={record?.diagnosis ?? ""}/></label><label className="text-sm font-medium">Capacity<input className="mt-1 w-full rounded-lg border px-3 py-2" name="capacity" defaultValue={record?.capacity ?? ""}/></label><label className="text-sm font-medium">Treating practitioner<input className="mt-1 w-full rounded-lg border px-3 py-2" name="treatingPractitioner" defaultValue={record?.treatingPractitioner ?? ""}/></label></div><label className="mt-4 block text-sm font-medium">Medical causative factors<textarea className="mt-1 min-h-24 w-full rounded-lg border px-3 py-2" name="medicalFactors" defaultValue={record?.medicalFactors ?? ""}/></label></fieldset>
      <fieldset><legend className="font-bold">Legislative considerations</legend><div className="mt-3 space-y-3">{alerts.length===0?<div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">No section 131 date alert is presently identified from the dates recorded.</div>:alerts.map((a)=><div key={a.code} className="rounded-xl border border-amber-300 bg-amber-50 p-4"><p className="font-bold text-amber-950">⚠ {a.label}</p><p className="mt-1 text-sm text-amber-900">{a.detail}</p></div>)}</div><div className="mt-4 grid gap-4"><label className="text-sm font-medium">First-seen consideration<textarea className="mt-1 min-h-20 w-full rounded-lg border px-3 py-2" name="firstSeenConsideration" defaultValue={record?.firstSeenConsideration ?? ""}/></label><label className="text-sm font-medium">Certificate issue-date consideration<textarea className="mt-1 min-h-20 w-full rounded-lg border px-3 py-2" name="issueDateConsideration" defaultValue={record?.issueDateConsideration ?? ""}/></label><label className="text-sm font-medium">Six-month consideration<textarea className="mt-1 min-h-20 w-full rounded-lg border px-3 py-2" name="sixMonthConsideration" defaultValue={record?.sixMonthConsideration ?? ""}/></label></div></fieldset>
      <button className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white hover:bg-slate-800">Save qualification</button>
    </form>
  </section>;
}
