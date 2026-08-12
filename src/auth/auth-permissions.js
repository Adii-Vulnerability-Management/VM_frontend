import Cookies from "js-cookie";
import { getEffectivePermissionKeys } from "./accessModules";

let PERMS = new Set();
let ROLES = new Set();

const normalize = (v) =>
  String(v || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

const FULL_ACCESS_ROLES = new Set([
  "SUPER_ADMIN",
  "ADMIN",
  "MODULE_ADMIN",
  "MODULE_ADMINISTRATOR",
]);

function readJsonCookie(name, fallback = []) {
  try {
    const raw = Cookies.get(name);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function hydrateFromCookies() {
  const user = readJsonCookie("user_data", null);
  const userPermissions = user ? getEffectivePermissionKeys(user) : [];
  const cookiePermissions = [...readJsonCookie("permissions")];
  const effectivePermissions = [...userPermissions, ...cookiePermissions]
    .map((permission) =>
      String(permission || "")
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean);

  const userRoles = Array.isArray(user?.roles)
    ? user.roles
    : user?.roles
      ? [user.roles]
      : [];
  const cookieRoles = readJsonCookie("roles");
  const effectiveRoles = [...userRoles, ...cookieRoles]
    .map(normalize)
    .filter(Boolean);

  // Read the current browser session on every check. This prevents a page's
  // first render from getting stuck with the empty module-level Sets while the
  // sidebar is still refreshing permissions in the background.
  PERMS = new Set(effectivePermissions);
  ROLES = new Set(effectiveRoles);
}

export function setPerms(permissionKeys = [], roles = []) {
  const normalizedPermissions = (permissionKeys || []).map((p) =>
    String(p).trim().toLowerCase(),
  );

  PERMS = new Set(normalizedPermissions);

  const roleArr = Array.isArray(roles) ? roles : [roles];
  ROLES = new Set(roleArr.map(normalize));

  // Legacy cookie kept commented for reference while we fully rely on modules[].permissions.
  // Cookies.set("permission_keys", JSON.stringify(normalizedPermissions));
  Cookies.set("permissions", JSON.stringify(normalizedPermissions));
  Cookies.set("roles", JSON.stringify(roleArr));
}

/**
 * can("security.read") -> boolean
 * can(["security.update","security.assign"]) -> boolean (ANY by default)
 * can(["a","b"], { mode: "all" }) -> boolean (ALL required)
 */
export function can(keys, options = {}) {
  hydrateFromCookies();

  // Full access roles
  const hasFullAccess = [...ROLES].some((r) => FULL_ACCESS_ROLES.has(r));
  if (hasFullAccess) return true;

  const mode = options.mode === "all" ? "all" : "any";
  const hasMandateFullAccess =
    ROLES.has("MANDATE_ADMIN") || ROLES.has("MANDATE_MODULE_ADMIN");
  const isMandatePermission = (key) =>
    String(key || "")
      .trim()
      .toLowerCase()
      .startsWith("mandate.");

  if (!Array.isArray(keys)) {
    const normalizedKey = String(keys).trim().toLowerCase();
    return (
      PERMS.has(normalizedKey) ||
      (hasMandateFullAccess && isMandatePermission(normalizedKey))
    );
  }

  const normalized = keys.map((k) => String(k).trim().toLowerCase());

  if (mode === "all") {
    return normalized.every(
      (k) => PERMS.has(k) || (hasMandateFullAccess && isMandatePermission(k)),
    );
  }

  return normalized.some(
    (k) => PERMS.has(k) || (hasMandateFullAccess && isMandatePermission(k)),
  );
}

// Utility function to deny access and redirect

export function deny(navigate, path = "/contact") {
  // Works with Next.js router object (has .push)
  if (navigate?.push) return navigate.push(path);

  // Works if you pass a function like (path) => router.push(path)
  if (typeof navigate === "function") return navigate(path);

  // Fallback
  window.location.href = path;
}

/**
 * guard(true, router, () => doSomething())
 * guard(false, router, () => doSomething()) -> redirects to denied page
 */
export function guard(hasPermission, navigate, onAllowed, deniedPath) {
  if (hasPermission) return onAllowed?.();
  return deny(navigate, deniedPath);
}
