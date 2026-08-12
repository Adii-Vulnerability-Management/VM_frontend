import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo } from "react";
import Cookies from "js-cookie";
import {
  getEffectivePermissionKeys,
  normalizeModuleKey,
  resolveModuleKeysFromAccessEntry,
} from "@/auth/accessModules";

const items = [
  { href: "/admin/dataFlow/assets", label: "Data Inventory" },
  { href: "/admin/dataFlow/jobs", label: "Jobs" },
  { href: "/admin/dataFlow/scanner", label: "Scanner Config" },
  { href: "/admin/dataFlow/scanner/rulebook", label: "Rulebook" },
  { href: "/admin/dataFlow/mapping", label: "Mapping" },
];

// for scanner access
function normalizeRole(v) {
  return String(v || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

function DataFlowNavInner() {
  const { pathname, push } = useRouter();

  // for scanner only access
  const canShowNav = useMemo(() => {
    try {
      const rawUser = Cookies.get("user_data");
      const user = rawUser ? JSON.parse(rawUser) : null;
      const modules = Array.isArray(user?.modules) ? user.modules : [];
      const roles = Array.isArray(user?.roles) ? user.roles : [];

      const normalizedModules = modules.flatMap((entry) =>
        resolveModuleKeysFromAccessEntry(entry).map(normalizeModuleKey),
      );
      const normalizedPerms = getEffectivePermissionKeys(user);
      const normalizedRoles = roles.map(normalizeRole);

      const isFullAccess =
        normalizedRoles.includes("ADMIN") ||
        normalizedRoles.includes("SUPER_ADMIN");

      if (isFullAccess) return true;

      const hasPrivacyModule = normalizedModules.includes("privacy");
      const hasScannerModule = normalizedModules.includes("scanner");

      const hasPrivacyPerm = normalizedPerms.some((p) =>
        p.startsWith("privacy."),
      );
      const hasScannerPerm = normalizedPerms.some((p) =>
        p.startsWith("scanner."),
      );

      const isScannerOnly =
        hasScannerModule && !hasPrivacyModule && !hasPrivacyPerm;

      if (isScannerOnly) return false;

      return hasPrivacyModule || hasPrivacyPerm;
    } catch (err) {
      console.error("Failed to read access in DataFlowNav", err);
      return false;
    }
  }, []);

  // DEBUG: mount/unmount logs for the nav
  useEffect(() => {
    console.log("[Nav] mounted");
    return () => console.log("[Nav] unmounted");
  }, []);

  const isActive = (href) => {
    // highlight if current path starts with href
    return pathname === href || pathname.startsWith(href + "/");
  };

  // NEW: avoid navigating to the same page (prevents scroll + focus loss) + logs
  const handleNavClick = (e, href) => {
    // const active = isActive(href)
    // console.log('[Nav] click', { href, active, pathname })
    // if (active) {
    //   e.preventDefault()
    //   console.warn('[Nav] prevented same-route navigation', href)
    //   return
    // }
    e.preventDefault();
    // for scanner only access
    if (isActive(href)) return;

    console.log("[Nav] pushing route (scroll:false)", href);
    push(href, undefined, { scroll: false });
  };

  // for scanner only access
  if (!canShowNav) return null;

  return (
    <div className="border-b bg-[#2B245C] shadow-md backdrop-blur-sm">
      <div className="mx-20">
        <div className="flex items-center justify-between py-3">
          <div className="text-2xl font-semibold text-white tracking-tight">
            Data Flow Admin
          </div>
          <nav className="flex gap-4">
            {items.map((it) => (
              <Link key={it.href} href={it.href} legacyBehavior>
                <a
                  onClick={(e) => handleNavClick(e, it.href)}
                  className={[
                    "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ease-in-out",
                    isActive(it.href)
                      ? "bg-[#3d3288] border border-white text-white shadow-lg transform scale-105"
                      : "text-gray-200 hover:bg-[#3d318a] hover:text-white hover:scale-105",
                  ].join(" ")}
                >
                  {it.label}
                </a>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

// NEW: memoize the nav so typing elsewhere doesn’t rerender it
const DataFlowNav = React.memo(DataFlowNavInner);
export default DataFlowNav;
