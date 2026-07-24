import Link from "next/link";

const items = [
  { label: "Dashboard", href: "/" },
  { label: "Claims", href: "/claims" },
  { label: "Tasks", href: "/tasks" },
  { label: "Evidence", href: "/evidence" },
  { label: "Reports", href: "/reports" },
  { label: "The Roastery", href: "/roastery" },
  { label: "Deleted Items", href: "/deleted-items" },
] as const;

type SidebarProps = {
  activeItem: string;
};

export function Sidebar({ activeItem }: SidebarProps) {
  return (
    <aside className="rounded-2xl bg-slate-900 p-4 text-slate-200 shadow-sm">
      <nav className="space-y-2">
        {items.map((item) => {
          const isActive = item.label === activeItem;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`block rounded-xl px-4 py-3 transition ${
                isActive
                  ? "bg-amber-400 font-semibold text-slate-950"
                  : "hover:bg-slate-800"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
