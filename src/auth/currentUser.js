const parseJson = (raw) => {
  if (!raw || typeof raw !== "string") return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const readCookie = (name) => {
  if (typeof document === "undefined") return "";

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  if (!match) return "";

  try {
    return decodeURIComponent(match.split("=").slice(1).join("="));
  } catch {
    return match.split("=").slice(1).join("=");
  }
};

const getStorageValue = (storage, key) => {
  try {
    return storage?.getItem(key) || "";
  } catch {
    return "";
  }
};

const normalizeEmail = (email) =>
  email ? String(email).trim().toLowerCase() : "";

const pickEmail = (user) =>
  normalizeEmail(
    user?.email ||
      user?.user?.email ||
      user?.body?.email ||
      user?.data?.email ||
      user?.profile?.email ||
      user?.user_data?.email,
  );

const decodeJwtPayload = (token) => {
  if (!token || typeof token !== "string" || token.split(".").length < 2) {
    return null;
  }

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const getStoredAuthUser = () => {
  if (typeof window === "undefined") return null;

  // Prefer sessionStorage (full RBAC payload); cookie may be compact/missing.
  const candidates = [
    getStorageValue(window.sessionStorage, "user_data"),
    getStorageValue(window.sessionStorage, "authUser"),
    getStorageValue(window.localStorage, "user_data"),
    getStorageValue(window.localStorage, "authUser"),
    readCookie("user_data"),
    readCookie("authUser"),
  ];

  for (const raw of candidates) {
    const parsed = parseJson(raw);
    if (parsed) return parsed;
  }

  return null;
};

export const setStoredAuthUser = (user) => {
  if (typeof window === "undefined" || user == null) return;
  try {
    const raw = typeof user === "string" ? user : JSON.stringify(user);
    window.sessionStorage.setItem("user_data", raw);
  } catch (_) {}
};

export const clearStoredAuthUser = () => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem("user_data");
    window.sessionStorage.removeItem("authUser");
    window.localStorage.removeItem("user_data");
    window.localStorage.removeItem("authUser");
  } catch (_) {}
};

export const getCurrentUserEmail = () => {
  if (typeof window === "undefined") return "";

  const storedEmail = pickEmail(getStoredAuthUser());
  if (storedEmail) return storedEmail;

  const token =
    getStorageValue(window.localStorage, "token") ||
    getStorageValue(window.localStorage, "authToken") ||
    getStorageValue(window.localStorage, "access_token") ||
    readCookie("AUTH_COOKIE") ||
    readCookie("authToken") ||
    readCookie("access_token");

  const payload = decodeJwtPayload(token);
  const tokenEmail = normalizeEmail(
    payload?.email ||
      payload?.preferred_username ||
      payload?.upn ||
      payload?.sub,
  );

  return tokenEmail.includes("@") ? tokenEmail : "";
};

const collectRoles = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return value.split(",");
  return [];
};

export const getCurrentUserRoles = () => {
  const user = getStoredAuthUser();

  const roles = [
    ...collectRoles(user?.roles),
    ...collectRoles(user?.role),
    ...collectRoles(user?.assignedRoles),
    ...collectRoles(user?.assigned_roles),
    ...collectRoles(user?.user?.roles),
    ...collectRoles(user?.user?.role),
    ...collectRoles(user?.body?.roles),
    ...collectRoles(user?.body?.role),
    ...collectRoles(user?.data?.roles),
    ...collectRoles(user?.data?.role),
  ];

  return roles
    .map((role) =>
      String(role || "")
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, "_"),
    )
    .filter(Boolean);
};
