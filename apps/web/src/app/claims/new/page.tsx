import Link from "next/link";
import { NewClaimForm } from "@/components/claims/NewClaimForm";

export default function NewClaimPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <Link href="/claims" className="text-sm font-semibold text-amber-700 hover:text-amber-800">
          ← Back to claims
        </Link>
        <div className="mb-6 mt-5">
          <p className="text-sm font-medium text-amber-700">CoffeeHQ</p>
          <h1 className="text-3xl font-bold tracking-tight">Create a claim</h1>
          <p className="mt-2 text-slate-600">Create the core claim record and open its workspace.</p>
        </div>
        <NewClaimForm />
      </div>
    </main>
  );
}
