import { BeanClient } from "./bean-client";

export default function BeanPage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto w-full max-w-[1800px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:mb-8 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
            Project BEAN
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Quick File Note
          </h1>

          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-700 sm:text-base">
            Paste a complete transcript or add a TXT, DOCX, PDF or RTF document, then brew a CPIS-ready file note through the Magical Beans.
          </p>
        </header>

        <BeanClient />
      </div>
    </main>
  );
}
