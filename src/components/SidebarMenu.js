import Cookies from "js-cookie";
import Link from "next/link";
import { ROLES_PERMISSIONS } from "@/auth/roles-permissions";
import {
  hasAnyPermission,
  normalizePermissions,
} from "@/auth/permission.helper";

export default function SidebarMenu() {
  const rawPerms = Cookies.get("permissions");
  const rawUser = Cookies.get("user_data");
  const user = rawUser ? JSON.parse(rawUser) : null;
  const perms = rawPerms ? normalizePermissions(JSON.parse(rawPerms)) : [];

  const visibleModules =
    user && perms.length === 0
      ? ROLES_PERMISSIONS.modules
      : ROLES_PERMISSIONS.modules.filter((m) => {
          // if user has ANY permission that belongs to this module => show module
          const allModulePerms = Object.values(m.roles).flat();
          return hasAnyPermission(perms, allModulePerms);
        });

  return (
    <div className="p-4 space-y-3">
      {visibleModules.map((m) => (
        <div key={m.key} className="border rounded-lg p-3">
          <div className="font-semibold text-gray-800">{m.label}</div>

          {/* Example links — you map these to your real routes */}
          <div className="mt-2 space-y-1 text-sm">
            {m.key === "access" && hasAnyPermission(perms, ["users.view"]) && (
              <Link
                href="/access/users"
                className="block text-indigo-700 hover:underline"
              >
                Users
              </Link>
            )}
            {m.key === "privacy" && hasAnyPermission(perms, ["dsar.view"]) && (
              <Link
                href="/privacy/dsar"
                className="block text-indigo-700 hover:underline"
              >
                DPRM
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
