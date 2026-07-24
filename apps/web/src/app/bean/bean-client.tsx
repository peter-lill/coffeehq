"use client";

import { useRef, useState, useTransition, type ChangeEvent, type DragEvent } from "react";

import { brewFileNoteAction, importDocumentAction, type ImportedDocument } from "./actions";

type Result = Awaited<ReturnType<typeof brewFileNoteAction>>;

const ACCEPTED_FILES = ".txt,.docx,.pdf,.rtf";

export function BeanClient() {
  const [source, setSource] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [importedDocument, setImportedDocument] = useState<ImportedDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = source.trim() ? source.trim().split(/\s+/).length : 0;

  function brew() {
    if (!source.trim()) return;
    setError(null);
    setCopiedMessage(null);

    startTransition(async () => {
      try {
        setResult(await brewFileNoteAction(source));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Unable to brew the file note.");
      }
    });
  }

  async function importFile(file: File) {
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.set("document", file);

    startTransition(async () => {
      try {
        const imported = await importDocumentAction(formData);
        setImportedDocument(imported);
        setSource(imported.text);
      } catch (cause) {
        setImportedDocument(null);
        setError(cause instanceof Error ? cause.message : "Unable to add the selected document.");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
  }

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void importFile(file);
  }

  function dropFile(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void importFile(file);
  }

  function clear() {
    setSource("");
    setResult(null);
    setImportedDocument(null);
    setError(null);
    setCopiedMessage(null);
  }

  async function copy(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessage(message);
      window.setTimeout(() => setCopiedMessage(null), 2500);
    } catch {
      setError("Unable to copy the file note to the clipboard.");
    }
  }

  function copyAll() {
    if (!result?.notes.length) return;
    void copy(result.notes.join("\n\n--------------------\n\n"), "All file notes copied.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-2xl border border-slate-300 bg-white p-5 text-slate-950 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Add ingredients</p>
            <h2 className="mt-1 text-xl font-bold">Source material</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Paste a full Genesys transcript, drop in a document, or choose a TXT, DOCX, PDF or RTF file.
            </p>
          </div>
          <div className="text-right text-xs font-semibold text-slate-500">
            <p>{source.length.toLocaleString("en-AU")} characters</p>
            <p>{wordCount.toLocaleString("en-AU")} words</p>
          </div>
        </div>

        <div
          onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setIsDragging(false)}
          onDrop={dropFile}
          className={`mt-5 rounded-2xl border-2 border-dashed p-4 transition ${
            isDragging ? "border-amber-500 bg-amber-50" : "border-slate-300 bg-slate-50"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-bold text-slate-900">Drop source material here</p>
              <p className="mt-1 text-sm text-slate-600">Maximum file size 25 MB.</p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FILES}
                onChange={selectFile}
                className="sr-only"
                id="bean-document-upload"
                disabled={isPending}
              />
              <label
                htmlFor="bean-document-upload"
                className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-slate-400 bg-white px-4 py-2 text-sm font-bold text-slate-900 hover:bg-slate-100"
              >
                {isPending ? "Adding..." : "Choose file"}
              </label>
            </div>
          </div>
        </div>

        {importedDocument ? (
          <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-950">
            <p className="font-bold">Added to the brew: {importedDocument.filename}</p>
            <p className="mt-1">
              {importedDocument.extension.toUpperCase()} · {(importedDocument.size / 1024).toLocaleString("en-AU", { maximumFractionDigits: 1 })} KB
              {importedDocument.pageCount ? ` · ${importedDocument.pageCount} pages` : ""}
              {` · ${importedDocument.characters.toLocaleString("en-AU")} characters`}
            </p>
            {importedDocument.warning ? <p className="mt-2 font-medium">{importedDocument.warning}</p> : null}
          </div>
        ) : null}

        <label htmlFor="bean-source" className="mt-5 block text-sm font-bold text-slate-800">
          Review source material
        </label>
        <textarea
          id="bean-source"
          className="mt-2 min-h-[700px] w-full resize-y rounded-xl border border-slate-400 bg-white p-4 font-mono text-sm leading-6 text-slate-950 shadow-inner outline-none placeholder:text-slate-500 focus:border-amber-600 focus:ring-4 focus:ring-amber-100 disabled:cursor-wait disabled:bg-slate-100"
          value={source}
          onChange={(event) => { setSource(event.target.value); setImportedDocument(null); }}
          placeholder="Paste the complete Genesys transcript or other source material here..."
          spellCheck={false}
          disabled={isPending}
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={brew}
            disabled={isPending || !source.trim()}
            className="min-h-12 rounded-xl bg-slate-950 px-6 py-3 text-base font-bold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Brewing..." : "Brew File Note"}
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={isPending || (!source && !result)}
            className="min-h-12 rounded-xl border border-slate-400 bg-white px-5 py-3 text-base font-semibold text-slate-900 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear brew
          </button>
        </div>

        {error ? <div role="alert" className="mt-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-900">{error}</div> : null}
      </section>

      <section className="rounded-2xl border border-slate-300 bg-white p-5 text-slate-950 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Magical Beans</p>
            <h2 className="mt-1 text-xl font-bold">Brew result</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {result ? `${result.metadata.source} · ${result.turns.length} transcript turns` : "Your CPIS-ready file notes will appear here."}
            </p>
          </div>
          {result?.notes.length ? <button type="button" onClick={copyAll} className="min-h-11 shrink-0 rounded-xl border border-slate-400 bg-white px-4 py-2 text-sm font-bold hover:bg-slate-100">Copy all</button> : null}
        </div>

        {copiedMessage ? <div role="status" className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">{copiedMessage}</div> : null}

        {result?.warnings.length ? (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            <p className="font-bold">Review before copying</p>
            <div className="mt-2 space-y-1">{result.warnings.map((warning, index) => <p key={`${warning.code}-${index}`}>• {warning.message}</p>)}</div>
          </div>
        ) : null}

        {!result ? (
          <div className="mt-5 flex min-h-[700px] items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <div>
              <p className="text-lg font-bold text-slate-800">Nothing brewed yet</p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">Add the complete source material, review the text, then brew the file note.</p>
            </div>
          </div>
        ) : null}

        <div className="mt-5 space-y-5">
          {result?.notes.map((note, index) => (
            <article key={index} className="overflow-hidden rounded-xl border border-slate-300 bg-white">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-100 px-4 py-3">
                <h3 className="font-bold">File Note {index + 1} of {result.notes.length}</h3>
                <button type="button" onClick={() => void copy(note, `File Note ${index + 1} copied.`)} className="rounded-lg px-3 py-2 text-sm font-bold underline decoration-slate-400 underline-offset-4 hover:bg-white">Copy</button>
              </div>
              <pre className="max-h-[900px] overflow-auto whitespace-pre-wrap break-words bg-white p-4 font-sans text-base leading-7">{note}</pre>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
