"use client";

import { useState, useTransition } from "react";

import { brewFileNoteAction } from "./actions";

type Result = Awaited<ReturnType<typeof brewFileNoteAction>>;

export function BeanClient() {
  const [source, setSource] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function brew() {
    if (!source.trim()) return;

    setError(null);
    setCopiedMessage(null);

    startTransition(async () => {
      try {
        const brewedResult = await brewFileNoteAction(source);
        setResult(brewedResult);
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Unable to brew the transcript.",
        );
      }
    });
  }

  function clear() {
    setSource("");
    setResult(null);
    setError(null);
    setCopiedMessage(null);
  }

  async function copy(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessage(message);

      window.setTimeout(() => {
        setCopiedMessage(null);
      }, 2500);
    } catch {
      setError("Unable to copy the file note to the clipboard.");
    }
  }

  function copyAll() {
    if (!result?.notes.length) return;

    const combinedNotes = result.notes.join("\n\n--------------------\n\n");
    void copy(combinedNotes, "All file notes copied.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-300 bg-white p-5 text-slate-950 shadow-sm sm:p-6">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Source</h2>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            Paste a Genesys transcript or rough notes below.
          </p>
        </div>

        <label htmlFor="bean-source" className="sr-only">
          Transcript or rough notes
        </label>

        <textarea
          id="bean-source"
          className="
            mt-5 min-h-[360px] w-full resize-y rounded-xl
            border border-slate-400 bg-white p-4
            font-mono text-base leading-7 text-slate-950
            caret-slate-950 shadow-inner outline-none
            placeholder:text-slate-500
            focus:border-amber-600 focus:ring-4 focus:ring-amber-100
            disabled:cursor-wait disabled:bg-slate-100
            sm:min-h-[520px] sm:text-sm sm:leading-6
          "
          value={source}
          onChange={(event) => setSource(event.target.value)}
          placeholder="Paste transcript here..."
          spellCheck={false}
          disabled={isPending}
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={brew}
            disabled={isPending || !source.trim()}
            className="
              min-h-12 rounded-xl bg-slate-950 px-6 py-3
              text-base font-bold text-white shadow-sm
              hover:bg-slate-800
              focus:outline-none focus:ring-4 focus:ring-slate-300
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            {isPending ? "Brewing..." : "Brew"}
          </button>

          <button
            type="button"
            onClick={clear}
            disabled={isPending || (!source && !result)}
            className="
              min-h-12 rounded-xl border border-slate-400 bg-white px-5 py-3
              text-base font-semibold text-slate-900
              hover:bg-slate-100
              focus:outline-none focus:ring-4 focus:ring-slate-200
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            Clear
          </button>
        </div>

        {error ? (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-900"
          >
            {error}
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-300 bg-white p-5 text-slate-950 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Brew result</h2>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              {result
                ? `${result.metadata.source} · ${result.turns.length} transcript turns`
                : "Your generated file notes will appear here."}
            </p>
          </div>

          {result?.notes.length ? (
            <button
              type="button"
              onClick={copyAll}
              className="
                min-h-11 shrink-0 rounded-xl border border-slate-400
                bg-white px-4 py-2 text-sm font-bold text-slate-900
                hover:bg-slate-100
                focus:outline-none focus:ring-4 focus:ring-slate-200
              "
            >
              Copy all
            </button>
          ) : null}
        </div>

        {copiedMessage ? (
          <div
            role="status"
            className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900"
          >
            {copiedMessage}
          </div>
        ) : null}

        {result?.warnings.length ? (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            <p className="font-bold">Review before copying</p>

            <div className="mt-2 space-y-1">
              {result.warnings.map((warning, index) => (
                <p key={`${warning.code}-${index}`}>
                  • {warning.message}
                </p>
              ))}
            </div>
          </div>
        ) : null}

        {!result ? (
          <div className="mt-5 flex min-h-[360px] items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center sm:min-h-[520px]">
            <div>
              <p className="text-lg font-bold text-slate-800">
                Nothing brewed yet
              </p>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
                Paste your source material and select Brew to generate the file
                note.
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-5 space-y-5">
          {result?.notes.map((note, index) => (
            <article
              key={index}
              className="overflow-hidden rounded-xl border border-slate-300 bg-white"
            >
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-100 px-4 py-3">
                <h3 className="font-bold text-slate-950">
                  File Note {index + 1} of {result.notes.length}
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    void copy(note, `File Note ${index + 1} copied.`)
                  }
                  className="
                    rounded-lg px-3 py-2 text-sm font-bold text-slate-900
                    underline decoration-slate-400 underline-offset-4
                    hover:bg-white
                    focus:outline-none focus:ring-4 focus:ring-slate-300
                  "
                >
                  Copy
                </button>
              </div>

              <pre
                className="
                  max-h-[700px] overflow-auto whitespace-pre-wrap
                  break-words bg-white p-4 font-sans
                  text-base leading-7 text-slate-950
                "
              >
                {note}
              </pre>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
