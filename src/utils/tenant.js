import Cookies from "js-cookie";
import { getUserData } from "./userDataStorage";

function readStorageTenantId(storage) {
  try {
    return storage?.getItem("tenant_id") || storage?.getItem("tenantId") || "";
  } catch {
    return "";
  }
}

function normalizeTenantId(id) {
  const s = id != null ? String(id).trim() : "";
  return s || null;
}

export function getStandaloneTenantId() {
  if (typeof window === "undefined") return null;

  return (
    normalizeTenantId(Cookies.get("tenant_id")) ||
    normalizeTenantId(Cookies.get("tenantId")) ||
    normalizeTenantId(readStorageTenantId(window.localStorage)) ||
    normalizeTenantId(readStorageTenantId(window.sessionStorage))
  );
}

/**
 * Tenant id stored on Mongo users as `tenant_id` (snake_case).
 * Reads logged-in user from sessionStorage (full) or compact cookie.
 * Optional build-time default: NEXT_PUBLIC_DEFAULT_TENANT_ID (e.g. single-tenant dev).
 */
export function getTenantIdFromUserDataCookie() {
  if (typeof window === "undefined") return null;
  try {
    const u = getUserData();
    if (!u) return null;
    const id = u?.tenant_id || u?.tenantId || u?.company_id;
    return normalizeTenantId(id);
  } catch {
    return null;
  }
}

function decodeJwtPayload(token) {
  try {
    const parts = String(token || "").split(".");
    if (parts.length < 2 || !parts[1]) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Fallback for cases where cookie user_data is stale/missing tenant,
 * but access token already carries tenant claims.
 */
export function getTenantIdFromAccessToken() {
  if (typeof window === "undefined") return null;
  const token =
    window.sessionStorage.getItem("access_token") ||
    Cookies.get("access_token") ||
    Cookies.get("access");
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  const id = payload?.tenant_id || payload?.tenantId || payload?.company_id;
  const s = id != null ? String(id).trim() : "";
  return s || null;
}

export function getDefaultTenantFromEnv() {
  const v = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID;
  return normalizeTenantId(v);
}

/** Value to send as `x-tenant-id` when the API expects a tenant. */
export function resolveTenantId() {
  return (
    getTenantIdFromUserDataCookie() ||
    getStandaloneTenantId() ||
    getTenantIdFromAccessToken() ||
    getDefaultTenantFromEnv()
  );
}
