"use client";

import { useActionState } from "react";

import {
  syncMailboxAction,
  type SyncMailboxState,
} from "@/app/inbox/actions";

const initialState: SyncMailboxState = { status: "idle" };

export function MailSyncButton() {
  const [state, action, pending] = useActionState(
    syncMailboxAction,
    initialState,
  );

  return (
    <div className="flex max-w-xl flex-col items-end gap-2">
      <form action={action}>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-amber-400 px-5 py-3 font-bold text-slate-950 shadow-sm hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Checking inbox…" : "Sync inbox"}
        </button>
      </form>
      {state.message ? (
        <p
          role="status"
          className={`text-right text-sm font-medium ${
            state.status === "error" ? "text-rose-700" : "text-emerald-700"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
