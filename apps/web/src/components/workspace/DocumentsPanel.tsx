import type { DocumentListItem } from "@/server/documents/types";
import { DocumentUploadForm } from "@/components/workspace/DocumentUploadForm";
import type { ClaimListItem } from "@/server/claims/types";
import { MoveDocumentForm } from "@/components/workspace/MoveDocumentForm";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Australia/Brisbane",
  }).format(date);
}

export function DocumentsPanel({
  claimId,
  claimNumber,
  claimantName,
  documents,
  claims,
}: {
  claimId: string;
  claimNumber: string;
  claimantName: string;
  documents: DocumentListItem[];
  claims: ClaimListItem[];
}) {
return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <p className="text-sm font-medium text-amber-700">Documents</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Claim documents</h2>
            <p className="mt-1 text-sm text-slate-500">
              {documents.length === 0
                ? "No documents have been uploaded."
                : `${documents.length} document${documents.length === 1 ? "" : "s"} stored on this claim.`}
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
            {documents.length}
          </span>
        </div>
      </div>

      <div className="p-6">
        <DocumentUploadForm claimNumber={claimNumber} />

        {documents.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 px-6 py-12 text-center">
            <p className="font-semibold text-slate-800">The claim file is empty</p>
            <p className="mt-2 text-sm text-slate-500">
              Upload the first source document. Readiness will remain uncalculated until real information is recorded.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Document</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Source</th>
                    <th className="px-5 py-3">Uploaded</th>
                    <th className="px-5 py-3">Size</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {documents.map((document) => (
                    <tr key={document.id} className="hover:bg-slate-50">
                      <td className="max-w-sm px-5 py-4">
                        <p className="truncate font-semibold text-slate-950" title={document.originalName}>
                          {document.originalName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">{document.mimeType}</p>
                      </td>
                      <td className="px-5 py-4">{formatLabel(document.category)}</td>
                      <td className="px-5 py-4">{formatLabel(document.source)}</td>
                      <td className="whitespace-nowrap px-5 py-4">{formatDate(document.createdAt)}</td>
                      <td className="whitespace-nowrap px-5 py-4">{formatBytes(document.sizeBytes)}</td>
                <td className="px-5 py-4">
  <div className="flex justify-end gap-4">
    <a
      href={`/api/documents/${document.id}`}
      target="_blank"
      rel="noreferrer"
      className="font-semibold text-amber-700 hover:text-amber-900"
    >
      Open
    </a>

    <MoveDocumentForm
      documentId={document.id}
      documentName={document.originalName}
      sourceClaimId={claimId}
      sourceClaimNumber={claimNumber}
      sourceClaimantName={claimantName}
      claims={claims}
    />
  </div>
</td>    
</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
