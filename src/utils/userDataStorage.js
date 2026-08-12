import Cookies from "js-cookie";

const USER_DATA_KEY = "user_data";
/** Browser cookies silently drop values near/over ~4KB. Stay under that. */
const COOKIE_SAFE_LIMIT = 3500;

function isBrowser() {
  return typeof window !== "undefined";
}

/** Bound to real js-cookie methods (not the bridged ones). */
let writeCookie = (name, value, options) => Cookies.set(name, value, options);
let readCookie = (name) => Cookies.get(name);
let removeCookie = (name, options) => Cookies.remove(name, options);

function compactUserData(user) {
  if (!user || typeof user !== "object") return null;
  return {
    id: user.id ?? user.user_id ?? null,
    user_id: user.user_id ?? user.id ?? null,
    email: user.email ?? user.user_email ?? "",
    user_name: user.user_name ?? "",
    first_name: user.first_name ?? "",
    last_name: user.last_name ?? "",
    roles: Array.isArray(user.roles) ? user.roles : [],
    tenant_id: user.tenant_id ?? user.tenantId ?? null,
    mfaEnabled: !!user.mfaEnabled,
    isPasswordChanged:
      typeof user.isPasswordChanged === "boolean"
        ? user.isPasswordChanged
        : null,
    afterLoginMfaVerified: user.afterLoginMfaVerified ?? null,
  };
}

/** Full user payload (sessionStorage first, cookie fallback). */
export function getUserDataRaw() {
  if (!isBrowser()) return "";
  try {
    const fromSession = window.sessionStorage.getItem(USER_DATA_KEY);
    if (fromSession) return fromSession;
  } catch (_) {}
  try {
    return readCookie(USER_DATA_KEY) || "";
  } catch (_) {
    return "";
  }
}

export function getUserData() {
  const raw = getUserDataRaw();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

/**
 * Store full user_data in sessionStorage (no 4KB limit).
 * Optionally keeps a compact cookie for legacy readers if it fits.
 */
export function setUserData(userOrJson, cookieOptions = { expires: 1 }) {
  if (!isBrowser()) return;

  const raw =
    typeof userOrJson === "string"
      ? userOrJson
      : JSON.stringify(userOrJson ?? {});

  try {
    window.sessionStorage.setItem(USER_DATA_KEY, raw);
  } catch (err) {
    console.error("Failed to store user_data in sessionStorage", err);
  }

  if (raw.length <= COOKIE_SAFE_LIMIT) {
    writeCookie(USER_DATA_KEY, raw, cookieOptions);
    return;
  }

  try {
    const parsed =
      typeof userOrJson === "string" ? JSON.parse(raw) : userOrJson;
    const compact = JSON.stringify(compactUserData(parsed) || {});
    if (compact.length <= COOKIE_SAFE_LIMIT) {
      writeCookie(USER_DATA_KEY, compact, cookieOptions);
      return;
    }
  } catch (_) {}

  removeCookie(USER_DATA_KEY);
}

export function clearUserData() {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.removeItem(USER_DATA_KEY);
  } catch (_) {}
  removeCookie(USER_DATA_KEY);
}

/**
 * Bridge js-cookie so existing Cookies.get/set/remove("user_data")
 * use sessionStorage as the source of truth for the full payload.
 */
export function installUserDataCookieBridge() {
  if (!isBrowser() || Cookies.__USER_DATA_BRIDGE__) return;
  Cookies.__USER_DATA_BRIDGE__ = true;

  const origGet = Cookies.get.bind(Cookies);
  const origSet = Cookies.set.bind(Cookies);
  const origRemove = Cookies.remove.bind(Cookies);

  writeCookie = origSet;
  readCookie = origGet;
  removeCookie = origRemove;

  Cookies.get = (...args) => {
    if (args.length === 0) {
      const all = origGet() || {};
      try {
        const fromSession = window.sessionStorage.getItem(USER_DATA_KEY);
        if (fromSession) all[USER_DATA_KEY] = fromSession;
      } catch (_) {}
      return all;
    }

    const [name] = args;
    if (name === USER_DATA_KEY) {
      try {
        const fromSession = window.sessionStorage.getItem(USER_DATA_KEY);
        if (fromSession) return fromSession;
      } catch (_) {}
    }
    return origGet(...args);
  };

  Cookies.set = (name, value, options) => {
    if (name === USER_DATA_KEY) {
      setUserData(value, options || { expires: 1 });
      return value;
    }
    return origSet(name, value, options);
  };

  Cookies.remove = (name, options) => {
    if (name === USER_DATA_KEY) {
      try {
        window.sessionStorage.removeItem(USER_DATA_KEY);
      } catch (_) {}
    }
    return origRemove(name, options);
  };
}

if (isBrowser()) {
  installUserDataCookieBridge();
}
