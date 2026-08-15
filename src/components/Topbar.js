"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";

function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Topbar({ title, subtitle, actions }) {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {subtitle ? <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p> : null}
      </div>

      <div className="flex items-center gap-4">
        {actions}

        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {initials(user?.user_name)}
          </div>
          <div className="hidden text-sm sm:block">
            <p className="font-medium text-slate-800">{user?.user_name || "—"}</p>
            <p className="text-xs text-slate-500">{(user?.roles || [])[0] || ""}</p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
