import type { MembershipRole } from "@prisma/client";

import {
  createUserAction,
  resetUserPasswordAction,
  setUserActiveAction,
  updateUserRoleAction,
} from "@/app/admin/users/actions";
import { AppShell } from "@/components/layout/AppShell";
import { membershipRoleLabels } from "@/server/auth/role-labels";
import { listOrganisationUsers } from "@/server/auth/user-admin-service";

export const dynamic = "force-dynamic";

const roleOptions: MembershipRole[] = [
  "CLAIMS_REPRESENTATIVE",
  "MANAGER",
  "REVIEWER",
  "VIEWER",
  "ADMIN",
];

type OrganisationUserMembership = {
  id: string;
  role: MembershipRole;
  user: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    mustChangePassword: boolean;
  };
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const [membershipRecords, params] = await Promise.all([
    listOrganisationUsers(),
    searchParams,
  ]);
  const memberships = membershipRecords as OrganisationUserMembership[];

  return (
    <AppShell activeItem="Users">
      <section className="space-y-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-700">
            Administration
          </p>
          <h1 className="mt-2 text-3xl font-bold">Users and access</h1>
          <p className="mt-2 text-slate-600">
            Create login accounts and assign roles. Claim visibility remains
            limited to owned or explicitly shared claims.
          </p>
        </div>

        {params.message ? (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            {params.message}
          </p>
        ) : null}
        {params.error ? (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
            {params.error}
          </p>
        ) : null}

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Create user</h2>
          <form
            action={createUserAction}
            className="mt-5 grid gap-4 md:grid-cols-2"
          >
            <label>
              <span className="text-sm font-semibold">Full name</span>
              <input
                required
                name="name"
                className="mt-2 w-full rounded-xl border px-4 py-3"
              />
            </label>
            <label>
              <span className="text-sm font-semibold">Email</span>
              <input
                required
                type="email"
                name="email"
                className="mt-2 w-full rounded-xl border px-4 py-3"
              />
            </label>
            <label>
              <span className="text-sm font-semibold">
                Temporary password
              </span>
              <input
                required
                minLength={12}
                type="password"
                name="password"
                className="mt-2 w-full rounded-xl border px-4 py-3"
              />
            </label>
            <label>
              <span className="text-sm font-semibold">Role</span>
              <select
                name="role"
                defaultValue="CLAIMS_REPRESENTATIVE"
                className="mt-2 w-full rounded-xl border px-4 py-3"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {membershipRoleLabels[role]}
                  </option>
                ))}
              </select>
            </label>
            <button className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white md:col-span-2">
              Create login
            </button>
          </form>
        </section>

        <div className="space-y-4">
          {memberships.map((membership) => (
            <article
              key={membership.id}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold">
                    {membership.user.name}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {membership.user.email}
                  </p>
                  <p className="mt-2 text-xs font-bold uppercase text-slate-500">
                    {membership.user.isActive ? "Active" : "Inactive"}
                    {membership.user.mustChangePassword
                      ? " · Password change required"
                      : ""}
                  </p>
                </div>
                <form
                  action={setUserActiveAction.bind(
                    null,
                    membership.user.id,
                    !membership.user.isActive,
                  )}
                >
                  <button className="rounded-lg border px-3 py-2 text-sm font-bold">
                    {membership.user.isActive ? "Deactivate" : "Activate"}
                  </button>
                </form>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <form
                  action={updateUserRoleAction.bind(null, membership.user.id)}
                  className="flex items-end gap-3 rounded-xl bg-slate-50 p-4"
                >
                  <label className="flex-1">
                    <span className="text-xs font-bold uppercase text-slate-500">
                      Role
                    </span>
                    <select
                      name="role"
                      defaultValue={membership.role}
                      className="mt-2 w-full rounded-lg border px-3 py-2"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {membershipRoleLabels[role]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="rounded-lg bg-slate-800 px-4 py-2 font-bold text-white">
                    Save
                  </button>
                </form>

                <form
                  action={resetUserPasswordAction.bind(
                    null,
                    membership.user.id,
                  )}
                  className="flex items-end gap-3 rounded-xl bg-slate-50 p-4"
                >
                  <label className="flex-1">
                    <span className="text-xs font-bold uppercase text-slate-500">
                      Reset password
                    </span>
                    <input
                      required
                      minLength={12}
                      type="password"
                      name="password"
                      className="mt-2 w-full rounded-lg border px-3 py-2"
                    />
                  </label>
                  <button className="rounded-lg bg-amber-400 px-4 py-2 font-bold">
                    Reset
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
