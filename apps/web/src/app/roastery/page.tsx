import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { stageConversationExportAction } from "@/app/roastery/actions";
import { listImportBatches } from "@/server/roastery/import-service";
import { listConversationExportInbox } from "@/server/roastery/inbox-service";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) { value /= 1024; index += 1; }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
}

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  dateStyle: "medium", timeStyle: "short", timeZone: "Australia/Brisbane",
});

export default async function RoasteryPage() {
  const [batches, inboxArchives] = await Promise.all([
    listImportBatches(), listConversationExportInbox(),
  ]);
  return (
    <AppShell activeItem="The Roastery">
      <section className="space-y-6">
        <header>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">Conversation import</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">The Roastery</h1>
          <p className="mt-2 max-w-3xl text-slate-600">Review ChatGPT exports placed in the import inbox, stage the archive, approve suggested claim matches, and import only the conversations you choose.</p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">Import inbox</h2>
              <p className="mt-2 text-sm text-slate-600">ZIP files placed in <code>imports/chatgpt</code> appear here automatically. CoffeeHQ reads the selected archive directly from disk.</p>
            </div>
            <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">{inboxArchives.length} {inboxArchives.length === 1 ? "archive" : "archives"}</span>
          </div>

          {inboxArchives.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <p className="font-medium text-slate-900">The import inbox is empty.</p>
              <p className="mt-1 text-sm text-slate-600">Copy a ChatGPT export ZIP into <code className="ml-1">imports/chatgpt</code>, then refresh this page.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {inboxArchives.map((archive) => (
                <form key={archive.filename} action={stageConversationExportAction} className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <input type="hidden" name="filename" value={archive.filename} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-950">{archive.filename}</p>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                      <span>{formatBytes(archive.sizeBytes)}</span>
                      <span>Modified {dateFormatter.format(archive.modifiedAt)}</span>
                      <span className="font-medium text-emerald-700">Ready to stage</span>
                    </div>
                  </div>
                  <button className="shrink-0 rounded-xl bg-amber-400 px-5 py-2.5 font-semibold text-slate-950 hover:bg-amber-300">Stage import</button>
                </form>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Import history</h2>
          {batches.length === 0 ? <p className="mt-3 text-slate-600">No conversation exports have been staged.</p> : (
            <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm">
              <thead className="border-b text-slate-500"><tr><th className="py-3 pr-4">Export</th><th className="py-3 pr-4">Status</th><th className="py-3 pr-4">Conversations</th><th className="py-3">Uploaded</th></tr></thead>
              <tbody>{batches.map((batch) => (
                <tr key={batch.id} className="border-b last:border-0">
                  <td className="py-4 pr-4"><Link className="font-semibold text-amber-800 hover:underline" href={`/roastery/${batch.id}`}>{batch.originalFilename}</Link></td>
                  <td className="py-4 pr-4">{batch.status.replaceAll("_", " ")}</td>
                  <td className="py-4 pr-4">{batch.importedConversations}/{batch.totalConversations} imported</td>
                  <td className="py-4">{dateFormatter.format(batch.uploadedAt)}</td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
        </section>
      </section>
    </AppShell>
  );
}
