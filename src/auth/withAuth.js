import Cookies from "js-cookie";
import { getUserData } from "@/utils/userDataStorage";
import { hasAnyPermission, normalizePermissions } from "./permission.helper";

export function withAuth(Component, options = {}) {
  const { requireAny = [] } = options;

  return function GuardedPage(props) {
    if (typeof window === "undefined") return null;

    const user = getUserData();
    const rawPerms = Cookies.get("permissions");

    const perms = rawPerms ? normalizePermissions(JSON.parse(rawPerms)) : [];

    // Server-side middleware is the source of truth for auth.
    // Keep client-side checks as a soft guard only.
    if (!user) return null;
    if (requireAny.length > 0 && !hasAnyPermission(perms, requireAny)) {
      return null;
    }

    return <Component {...props} />;
  };
}
