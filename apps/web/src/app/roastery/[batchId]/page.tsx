import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { importBatchAction, reviewConversationAction } from "@/app/roastery/actions";
import { getImportBatch } from "@/server/roastery/import-service";

export default async function ReviewRoomPage({ params }: { params: Promise<{ batchId: string }> }) {
  const { batchId } = await params;
  const { batch, claims } = await getImportBatch(batchId);
  const unresolved = batch.conversations.filter((item) => !["READY", "EXCLUDED", "IMPORTED"].includes(item.status)).length;
  const ready = batch.conversations.filter((item) => item.status === "READY").length;

  return (
    <AppShell activeItem="The Roastery">
      <section className="space-y-6">
        <header>
          <Link className="text-sm font-semibold text-amber-800 hover:underline" href="/roastery">← Import history</Link>
          <h1 className="mt-3 text-3xl font-bold">Review Room</h1>
          <p className="mt-2 text-slate-600">{batch.originalFilename} · {batch.totalConversations} conversations</p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Requires review</p><p className="mt-1 text-3xl font-bold">{unresolved}</p></div>
          <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Approved</p><p className="mt-1 text-3xl font-bold">{ready}</p></div>
          <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Status</p><p className="mt-2 font-bold">{batch.status.replaceAll("_", " ")}</p></div>
        </section>

        {batch.status !== "IMPORTED" && (
          <form action={importBatchAction} className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <input type="hidden" name="batchId" value={batch.id} />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="font-bold text-amber-950">Import approved conversations</p><p className="text-sm text-amber-900">Every conversation must be assigned or excluded first.</p></div>
              <button disabled={unresolved > 0 || ready === 0} className="rounded-xl bg-amber-400 px-5 py-2.5 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">Import {ready} approved</button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {batch.conversations.map((conversation) => {
            const suggested = claims.find((claim) => claim.id === conversation.suggestedClaimId);
            const approved = claims.find((claim) => claim.id === conversation.approvedClaimId);
            const preview = conversation.searchText.slice(0, 600);
            return (
              <article key={conversation.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold">{conversation.sourceTitle || "Untitled conversation"}</h2><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">{conversation.status.replaceAll("_", " ")}</span></div>
                    <p className="mt-1 text-sm text-slate-500">{conversation.messageCount} messages{conversation.detectedClaimNumbers.length ? ` · ${conversation.detectedClaimNumbers.join(", ")}` : ""}</p>
                    {suggested && <p className="mt-2 text-sm font-medium text-emerald-700">Suggested: {suggested.claimNumber} · {suggested.claimantName}</p>}
                    {approved && <p className="mt-2 text-sm font-medium text-blue-700">Assigned: {approved.claimNumber} · {approved.claimantName}</p>}
                  </div>
                </div>
                <details className="mt-4 rounded-xl bg-slate-50 p-4"><summary className="cursor-pointer font-semibold">Preview conversation</summary><pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-slate-700">{preview}{conversation.searchText.length > preview.length ? "…" : ""}</pre></details>
                {conversation.status !== "IMPORTED" && (
                  <form action={reviewConversationAction} className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto_auto] lg:items-end">
                    <input type="hidden" name="batchId" value={batch.id} />
                    <input type="hidden" name="conversationId" value={conversation.id} />
                    <label className="text-sm font-medium">Claim<select className="mt-1 w-full rounded-xl border px-3 py-2" name="claimId" defaultValue={conversation.approvedClaimId || conversation.suggestedClaimId || ""}><option value="">Choose claim</option>{claims.map((claim) => <option key={claim.id} value={claim.id}>{claim.claimNumber} · {claim.claimantName}</option>)}</select></label>
                    <label className="text-sm font-medium">Review notes<input className="mt-1 w-full rounded-xl border px-3 py-2" name="reviewNotes" defaultValue={conversation.reviewNotes || ""} placeholder="Optional reason or context" /></label>
                    <button name="decision" value="assign" className="rounded-xl bg-slate-900 px-4 py-2.5 font-semibold text-white">Assign</button>
                    <button name="decision" value="exclude" className="rounded-xl border border-slate-300 px-4 py-2.5 font-semibold">Exclude</button>
                  </form>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
