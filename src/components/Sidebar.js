"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  ShieldCheck,
  LayoutGrid,
  Crosshair,
  ScanSearch,
  AlertTriangle,
  Archive,
  FileCheck2,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/targets", label: "Scan Targets", icon: Crosshair },
  { href: "/scans", label: "Scans", icon: ScanSearch },
  { href: "/findings", label: "Findings", icon: AlertTriangle },
  { href: "/exceptions", label: "Exceptions", icon: Archive },
  { href: "/evidence", label: "Evidence", icon: FileCheck2 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-ink-950 text-white">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-cyan-400">
          <ShieldCheck size={16} />
        </div>
        <span className="font-semibold tracking-wide">VM Console</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
