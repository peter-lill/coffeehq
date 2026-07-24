"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ClaimTabs() {
  const pathname = usePathname();
  const claimMatch = pathname.match(/^\/claims\/([^/]+)/);
  const claimBase = claimMatch ? `/claims/${claimMatch[1]}` : "/claims";
  const investigationActive = pathname.endsWith("/investigation");
  const evidenceActive = pathname.endsWith("/evidence");
  const overviewActive = !investigationActive && !evidenceActive;

  const tabs = [
    { label: "Overview", href: claimBase, active: overviewActive },
    { label: "Investigation", href: `${claimBase}/investigation`, active: investigationActive },
    { label: "Events", href: `${claimBase}#timeline`, active: false },
    { label: "Evidence", href: `${claimBase}/evidence`, active: evidenceActive },
    { label: "Medical", href: `${claimBase}/evidence#medical-evidence`, active: false },
    { label: "Tasks", href: "#", active: false },
    { label: "Decision", href: "#", active: false },
  ];

  return (
    <nav className="mb-6 flex gap-2 overflow-x-auto">
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          href={tab.href}
          className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold ${
            tab.active
              ? "bg-amber-400 text-slate-950"
              : "bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
